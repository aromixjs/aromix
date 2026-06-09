import { describe, it, expect, expectTypeOf } from 'vitest'
import { ax, ValidationError } from '@aromix/validator'

describe('object', () => {
    const User = ax.object({
        name: ax.string(),
        age: ax.number(),
    })

    it('parses valid objects', () => {
        const r = User.parse({ name: 'Alex', age: 30 })
        expect(r.name).toBe('Alex')
        expect(r.age).toBe(30)
    })

    it('rejects non-objects', () => {
        for (const val of ['str', 42, true, null, undefined, []] as const) {
            expect(() => User.parse(val)).toThrow(ValidationError)
        }
    })

    it('rejects objects with wrong field types', () => {
        expect(() => User.parse({ name: 'Alex', age: 'old' })).toThrow(ValidationError)
        expect(() => User.parse({ name: 123, age: 30 })).toThrow(ValidationError)
    })

    it('rejects missing fields', () => {
        expect(() => User.parse({ name: 'Alex' })).toThrow(ValidationError)
    })

    it('ignores extra fields', () => {
        const r = User.parse({ name: 'Alex', age: 30, extra: true })
        expect(r).not.toHaveProperty('extra')
    })

    it('supports nested objects', () => {
        const Nested = ax.object({
            inner: ax.object({ value: ax.number() }),
        })
        const r = Nested.parse({ inner: { value: 99 } })
        expect(r.inner.value).toBe(99)

        expect(() => Nested.parse({ inner: { value: 'x' } })).toThrow(ValidationError)
    })

    it('infers Output type', () => {
        type T = typeof User.$infer
        expectTypeOf<T>().toEqualTypeOf<{ name: string; age: number }>()
    })
})

describe('array', () => {
    const StringArr = ax.array(ax.string())
    const NumArr = ax.array(ax.number())

    it('parses valid arrays', () => {
        expect(StringArr.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
        expect(StringArr.parse([])).toEqual([])
        expect(NumArr.parse([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('rejects non-arrays', () => {
        for (const val of ['str', 42, true, null, undefined, {}] as const) {
            expect(() => StringArr.parse(val)).toThrow(ValidationError)
        }
    })

    it('rejects arrays with wrong element types', () => {
        expect(() => StringArr.parse([1, 2])).toThrow(ValidationError)
        expect(() => NumArr.parse(['a', 'b'])).toThrow(ValidationError)
    })

    it('handles mixed valid/invalid arrays', () => {
        expect(() => StringArr.parse(['a', 2, 'c'])).toThrow(ValidationError)
    })

    it('supports nested arrays', () => {
        const Nested = ax.array(ax.array(ax.number()))
        expect(Nested.parse([[1, 2], [3]])).toEqual([[1, 2], [3]])
        expect(() => Nested.parse([['x']])).toThrow(ValidationError)
    })

    it('infers Output type', () => {
        type T1 = typeof StringArr.$infer
        type T2 = typeof NumArr.$infer
        expectTypeOf<T1>().toEqualTypeOf<string[]>()
        expectTypeOf<T2>().toEqualTypeOf<number[]>()
    })
})

describe('tuple', () => {
    const Coord = ax.tuple([ax.number(), ax.number()])
    const Mixed = ax.tuple([ax.string(), ax.number(), ax.boolean()])

    it('parses valid tuples', () => {
        expect(Coord.parse([10, 20])).toEqual([10, 20])
        expect(Mixed.parse(['hello', 42, true])).toEqual(['hello', 42, true])
    })

    it('rejects non-arrays', () => {
        expect(() => Coord.parse('x')).toThrow(ValidationError)
        expect(() => Coord.parse({})).toThrow(ValidationError)
    })

    it('rejects wrong length', () => {
        expect(() => Coord.parse([1])).toThrow(ValidationError)
        expect(() => Coord.parse([1, 2, 3])).toThrow(ValidationError)
    })

    it('rejects wrong element types at position', () => {
        expect(() => Mixed.parse([42, 42, true])).toThrow(ValidationError)
        expect(() => Mixed.parse(['x', 'y', true])).toThrow(ValidationError)
        expect(() => Mixed.parse(['x', 1, 2])).toThrow(ValidationError)
    })

    it('infers Output type', () => {
        type T1 = typeof Coord.$infer
        type T2 = typeof Mixed.$infer
        expectTypeOf<T1>().toEqualTypeOf<[number, number]>()
        expectTypeOf<T2>().toEqualTypeOf<[string, number, boolean]>()
    })
})

describe('union', () => {
    const StrOrNum = ax.union([ax.string(), ax.number()])

    it('parses values matching any member', () => {
        expect(StrOrNum.parse('hello')).toBe('hello')
        expect(StrOrNum.parse(42)).toBe(42)
    })

    it('rejects values matching no member', () => {
        for (const val of [true, null, undefined, {}, []] as const) {
            expect(() => StrOrNum.parse(val)).toThrow(ValidationError)
        }
    })

    it('tries members in order, returns first match', () => {
        const First = ax.union([ax.literal('admin'), ax.string()])
        expect(First.parse('admin')).toBe('admin')
        expect(First.parse('user')).toBe('user')
    })

    it('handles union of complex types', () => {
        const Complex = ax.union([ax.object({ type: ax.literal('a'), val: ax.number() }), ax.object({ type: ax.literal('b'), label: ax.string() })])
        const ra = Complex.parse({ type: 'a', val: 1 })
        expect(ra).toEqual({ type: 'a', val: 1 })
        const rb = Complex.parse({ type: 'b', label: 'x' })
        expect(rb).toEqual({ type: 'b', label: 'x' })
        expect(() => Complex.parse({ type: 'c' })).toThrow(ValidationError)
    })

    it('infers Output type', () => {
        type T = typeof StrOrNum.$infer
        expectTypeOf<T>().toEqualTypeOf<string | number>()
    })
})

describe('record', () => {
    const BoolRec = ax.record(ax.boolean())

    it('parses valid records', () => {
        expect(BoolRec.parse({ a: true, b: false })).toEqual({ a: true, b: false })
        expect(BoolRec.parse({})).toEqual({})
    })

    it('rejects non-objects', () => {
        for (const val of ['str', 42, true, null, undefined, []] as const) {
            expect(() => BoolRec.parse(val)).toThrow(ValidationError)
        }
    })

    it('rejects records with wrong value types', () => {
        expect(() => BoolRec.parse({ a: 1 })).toThrow(ValidationError)
        expect(() => BoolRec.parse({ a: 'x' })).toThrow(ValidationError)
    })

    it('infers Output type', () => {
        type T = typeof BoolRec.$infer
        expectTypeOf<T>().toEqualTypeOf<Record<string, boolean>>()
    })
})
