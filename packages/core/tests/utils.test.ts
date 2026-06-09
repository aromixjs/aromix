import { describe, expect, it, expectTypeOf } from 'vitest'
import { Kit } from '../src/global/kit'
import { Type } from '../src/global/type'

describe('Kit.crushKeys()', () => {
    it('returns top-level keys for a flat object', () => {
        const result = Kit.crushKeys({ a: 1, b: 2, c: 3 })
        expect(result.sort()).toEqual(['a', 'b', 'c'].sort())
    })

    it('returns nested dot-joined keys', () => {
        const result = Kit.crushKeys({ a: { b: 1, c: 2 }, d: 3 })
        expect(result.sort()).toEqual(['a', 'a.b', 'a.c', 'd'].sort())
    })

    it('handles deeply nested objects', () => {
        const result = Kit.crushKeys({ a: { b: { c: { d: 1 } } } })
        expect(result.sort()).toEqual(['a', 'a.b', 'a.b.c', 'a.b.c.d'].sort())
    })

    it('does not recurse into arrays', () => {
        const result = Kit.crushKeys({ a: [1, 2], b: { c: 3 } })
        expect(result.sort()).toEqual(['a', 'b', 'b.c'].sort())
    })

    it('handles empty object', () => {
        const result = Kit.crushKeys({})
        expect(result).toEqual([])
    })
})

describe('Type.CrushKeys type inference', () => {
    it('infers union of top-level keys', () => {
        type Result = Type.CrushKeys<{ a: number; b: string }>
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'b'>()
    })

    it('infers nested dot-joined keys', () => {
        type Result = Type.CrushKeys<{ a: { b: number; c: string }; d: boolean }>
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'a.b' | 'a.c' | 'd'>()
    })

    it('infers deeply nested keys', () => {
        type Result = Type.CrushKeys<{ a: { b: { c: { d: number } } } }>
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'a.b' | 'a.b.c' | 'a.b.c.d'>()
    })

    it('does not recurse into arrays', () => {
        type Result = Type.CrushKeys<{ a: number[]; b: { c: string } }>
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'b' | 'b.c'>()
    })

    it('Kit.crushKeys() returns Type.CrushKeys<T>[]', () => {
        const result = Kit.crushKeys({ a: { b: 1 }, c: 2 })
        expectTypeOf(result).toEqualTypeOf<('a' | 'a.b' | 'c')[]>()
    })
})
