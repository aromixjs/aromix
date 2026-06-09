import { describe, it, expect, expectTypeOf } from 'vitest'
import { ax, ValidationError } from '@aromix/validator'

describe('literal', () => {
    it('parses matching literal values', () => {
        expect(ax.literal('admin').parse('admin')).toBe('admin')
        expect(ax.literal(42).parse(42)).toBe(42)
        expect(ax.literal(true).parse(true)).toBe(true)
        expect(ax.literal(null).parse(null)).toBe(null)
        expect(ax.literal(1n).parse(1n)).toBe(1n)
    })

    it('rejects non-matching values', () => {
        expect(() => ax.literal('admin').parse('user')).toThrow(ValidationError)
        expect(() => ax.literal(42).parse(0)).toThrow(ValidationError)
        expect(() => ax.literal(true).parse(false)).toThrow(ValidationError)
    })

    it('error message shows expected and received values', () => {
        try {
            ax.literal('admin').parse('user')
        } catch (e) {
            const err = e as ValidationError
            expect(err.issues[0].code).toBe('invalidLiteral')
            expect(err.issues[0].message).toContain('"admin"')
            expect(err.issues[0].message).toContain('"user"')
        }
    })

    it('safeParse returns failure with correct error', () => {
        const r = ax.literal(42).safeParse(0)
        expect(r.success).toBe(false)
        if (!r.success) expect(r.errors[0]).toContain('42')
    })

    it('infers Output type', () => {
        const sa = ax.literal('admin')
        const sn = ax.literal(42)
        const sb = ax.literal(true)
        const snull = ax.literal(null)
        type S = typeof sa.$infer
        type N = typeof sn.$infer
        type B = typeof sb.$infer
        type Null = typeof snull.$infer
        expectTypeOf<S>().toEqualTypeOf<'admin'>()
        expectTypeOf<N>().toEqualTypeOf<42>()
        expectTypeOf<B>().toEqualTypeOf<true>()
        expectTypeOf<Null>().toEqualTypeOf<null>()
    })
})

describe('instance', () => {
    class CustomClass {
        constructor(public x: number) {}
    }

    it('accepts matching instance values', () => {
        expect(ax.instance(Date).parse(new Date('2024-01-01'))).toBeInstanceOf(Date)
        expect(ax.instance(CustomClass).parse(new CustomClass(5)).x).toBe(5)
    })

    it('rejects non-matching values', () => {
        expect(() => ax.instance(Date).parse('2024-01-01')).toThrow(ValidationError)
        expect(() => ax.instance(Date).parse(42)).toThrow(ValidationError)
        expect(() => ax.instance(Date).parse(null)).toThrow(ValidationError)
        expect(() => ax.instance(Date).parse(undefined)).toThrow(ValidationError)
    })

    it('rejects instances of the wrong class', () => {
        expect(() => ax.instance(CustomClass).parse(new Date())).toThrow(ValidationError)
    })

    it('safeParse works for instance', () => {
        const ok = ax.instance(Date).safeParse(new Date())
        expect(ok.success).toBe(true)
        if (ok.success) expect(ok.data).toBeInstanceOf(Date)

        const fail = ax.instance(Date).safeParse('nope')
        expect(fail.success).toBe(false)
    })

    it('rejects plain objects', () => {
        expect(() => ax.instance(Date).parse({})).toThrow(ValidationError)
    })

    it('infers Output type', () => {
        const s = ax.instance(Date)
        const c = ax.instance(CustomClass)
        type T = typeof s.$infer
        type U = typeof c.$infer
        expectTypeOf<T>().toEqualTypeOf<Date>()
        expectTypeOf<U>().toEqualTypeOf<CustomClass>()
    })
})
