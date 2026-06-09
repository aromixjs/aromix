import { describe, it, expect, expectTypeOf } from 'vitest'
import { ax, ValidationError } from '@aromix/validator'

const minLen = (n: number) =>
    ax.operator((v: string) => {
        if (v.length < n) throw `Min ${n} chars`
        return v
    })

const toArray = ax.operator((v: string) => v.split(',').map((s) => s.trim()))
const first = ax.operator((v: string[]) => {
    if (v.length === 0) throw 'Array is empty'
    return v[0]
})
const upper = ax.operator((v: string) => v.toUpperCase())
const double = ax.operator((v: number) => v * 2)

describe('pipe — validation', () => {
    it('validates and passes if operators succeed', () => {
        const s = ax.string().pipe(minLen(2))
        expect(s.parse('hello')).toBe('hello')
    })

    it('throws when an operator fails', () => {
        const s = ax.string().pipe(minLen(5))
        expect(() => s.parse('hi')).toThrow()
    })

    it('operator errors are wrapped in ValidationError', () => {
        const s = ax.string().pipe(minLen(5))
        try {
            s.parse('hi')
        } catch (e) {
            expect(e).toBeInstanceOf(ValidationError)
            expect((e as ValidationError).issues[0].code).toBe('custom')
        }
    })

    it('safeParse returns error messages from operators', () => {
        const s = ax.string().pipe(minLen(5))
        const r = s.safeParse('hi')
        expect(r.success).toBe(false)
        if (!r.success) expect(r.errors[0]).toContain('Min')
    })
})

describe('pipe — type transformation', () => {
    it('transforms string to string[]', () => {
        const s = ax.string().pipe(toArray)
        expect(s.parse('a,b,c')).toEqual(['a', 'b', 'c'])
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<string[]>()
    })

    it('transforms string[] to string', () => {
        const s = ax.string().pipe(toArray).pipe(first)
        expect(s.parse('a,b,c')).toBe('a')
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<string>()
    })

    it('chains multiple transformations', () => {
        const s = ax.string().pipe(minLen(2)).pipe(upper).pipe(toArray).pipe(first)
        expect(s.parse('john,bob')).toBe('JOHN')
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<string>()
    })

    it('operator can transform between primitive types', () => {
        const s = ax
            .string()
            .pipe(ax.operator((v: string) => v.length))
            .pipe(double)
        expect(s.parse('hello')).toBe(10)
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<number>()
    })
})

describe('pipe — compile-time type safety', () => {
    it('rejects operator with wrong input type at compile time', () => {
        const s = ax.string()
        // @ts-expect-error — number operator not assignable to string schema
        s.pipe(ax.operator((v: number) => v * 2))
    })
})

describe('pipe — edge cases', () => {
    it('handles zero operators (identity-like)', () => {
        const s = ax.string()
        expect(s.parse('x')).toBe('x')
    })

    it('operator that throws custom Error', () => {
        const s = ax.string().pipe(
            ax.operator((v: string) => {
                throw new Error('custom error')
            }),
        )
        const r = s.safeParse('x')
        expect(r.success).toBe(false)
        if (!r.success) expect(r.errors[0]).toBe('custom error')
    })

    it('operator that throws a string', () => {
        const s = ax.string().pipe(
            ax.operator((v: string) => {
                throw 'plain string error'
            }),
        )
        const r = s.safeParse('x')
        expect(r.success).toBe(false)
        if (!r.success) expect(r.errors[0]).toBe('plain string error')
    })

    it('operator that returns undefined', () => {
        const s = ax.string().pipe(ax.operator((v: string) => undefined))
        expect(s.parse('x')).toBeUndefined()
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<undefined>()
    })

    it('first operator fails in chain, validates accordingly', () => {
        const s = ax.string().pipe(minLen(5)).pipe(upper)
        const r = s.safeParse('hi')
        expect(r.success).toBe(false)
    })

    it('safeParse never throws with pipes', () => {
        const s = ax.string().pipe(minLen(5)).pipe(upper)
        expect(() => s.safeParse('hi')).not.toThrow()
    })
})

describe('pipe — type inference', () => {
    it('infers string after string pipe', () => {
        const s = ax.string().pipe(minLen(2))
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<string>()
    })

    it('infers string[] after toArray pipe', () => {
        const s = ax.string().pipe(toArray)
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<string[]>()
    })

    it('infers string after toArray+first', () => {
        const s = ax.string().pipe(toArray).pipe(first)
        type T = typeof s.$infer
        expectTypeOf<T>().toEqualTypeOf<string>()
    })
})
