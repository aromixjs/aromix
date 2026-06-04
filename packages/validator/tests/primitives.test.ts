import { describe, it, expect, expectTypeOf } from 'vitest'
import { ax, ValidationError, Parser } from '@aromix/validator'

describe('string', () => {
      it('parses valid strings', () => {
            const s = ax.string()
            expect(s.parse('hello')).toBe('hello')
            expect(s.parse('')).toBe('')
            expect(s.parse(String('world'))).toBe('world')
      })

      it('rejects non-strings', () => {
            const s = ax.string()
            for (const val of [42, true, null, undefined, {}, []]) {
                  expect(() => s.parse(val)).toThrow(ValidationError)
            }
      })

      it('safeParse returns correct result', () => {
            const ok = ax.string().safeParse('hi')
            expect(ok.success).toBe(true)
            if (ok.success) expect(ok.data).toBe('hi')

            const fail = ax.string().safeParse(42)
            expect(fail.success).toBe(false)
            if (!fail.success) expect(fail.errors[0]).toContain('string')
      })

      it('infers Output type', () => {
            const s = ax.string()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<string>()
      })
})

describe('number', () => {
      it('parses valid numbers', () => {
            const s = ax.number()
            expect(s.parse(42)).toBe(42)
            expect(s.parse(0)).toBe(0)
            expect(s.parse(-1.5)).toBe(-1.5)
            expect(s.parse(Infinity)).toBe(Infinity)
            expect(s.parse(-Infinity)).toBe(-Infinity)
      })

      it('accepts NaN (typeof is number)', () => {
            const r = ax.number().safeParse(NaN)
            expect(r.success).toBe(true)
      })

      it('rejects non-numbers', () => {
            for (const val of ['x', true, null, undefined, {}, []]) {
                  expect(() => ax.number().parse(val)).toThrow(ValidationError)
            }
      })

      it('safeParse returns correct result on failure', () => {
            const r = ax.number().safeParse('x')
            expect(r.success).toBe(false)
            if (!r.success) expect(r.errors[0]).toContain('number')
      })

      it('infers Output type', () => {
            const s = ax.number()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<number>()
      })
})

describe('boolean', () => {
      it('parses true and false', () => {
            expect(ax.boolean().parse(true)).toBe(true)
            expect(ax.boolean().parse(false)).toBe(false)
      })

      it('rejects non-booleans', () => {
            for (const val of [1, 0, 'true', 'false', null, undefined, {}, []]) {
                  expect(() => ax.boolean().parse(val)).toThrow(ValidationError)
            }
      })

      it('infers Output type', () => {
            const s = ax.boolean()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<boolean>()
      })
})

describe('bigint', () => {
      it('parses bigints', () => {
            expect(ax.bigint().parse(1n)).toBe(1n)
            expect(ax.bigint().parse(BigInt(42))).toBe(42n)
      })

      it('rejects non-bigints', () => {
            for (const val of [1, '1', true, null, undefined]) {
                  expect(() => ax.bigint().parse(val)).toThrow(ValidationError)
            }
      })

      it('infers Output type', () => {
            const s = ax.bigint()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<bigint>()
      })
})

describe('symbol', () => {
      it('parses symbols', () => {
            const sym = Symbol('test')
            expect(ax.symbol().parse(sym)).toBe(sym)
            expect(typeof ax.symbol().parse(Symbol())).toBe('symbol')
      })

      it('rejects non-symbols', () => {
            for (const val of ['sym', 1, true, null, undefined, {}]) {
                  expect(() => ax.symbol().parse(val)).toThrow(ValidationError)
            }
      })

      it('infers Output type', () => {
            const s = ax.symbol()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<symbol>()
      })
})

describe('null', () => {
      it('parses null', () => {
            expect(ax.null().parse(null)).toBe(null)
      })

      it('rejects non-null', () => {
            for (const val of [undefined, 0, false, '', []]) {
                  expect(() => ax.null().parse(val)).toThrow(ValidationError)
            }
      })

      it('infers Output type', () => {
            const s = ax.null()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<null>()
      })
})

describe('undefined', () => {
      it('parses undefined', () => {
            expect(ax.undefined().parse(undefined)).toBe(undefined)
      })

      it('rejects non-undefined', () => {
            for (const val of [null, 0, false, '', []]) {
                  expect(() => ax.undefined().parse(val)).toThrow(ValidationError)
            }
      })

      it('infers Output type', () => {
            const s = ax.undefined()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<undefined>()
      })
})

describe('unknown', () => {
      it('accepts any value', () => {
            const s = ax.unknown()
            expect(s.parse('str')).toBe('str')
            expect(s.parse(42)).toBe(42)
            expect(s.parse(null)).toBe(null)
            expect(s.parse({ key: 'val' })).toEqual({ key: 'val' })
            expect(s.parse([1, 2])).toEqual([1, 2])
      })

      it('infers Output type', () => {
            const s = ax.unknown()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<unknown>()
      })
})

describe('never', () => {
      it('rejects every value', () => {
            for (const val of ['x', 1, true, null, undefined, {}, [], Symbol(), 1n]) {
                  expect(() => ax.never().parse(val)).toThrow(ValidationError)
            }
      })

      it('safeParse always fails', () => {
            const r = ax.never().safeParse('anything')
            expect(r.success).toBe(false)
      })

      it('infers Output type', () => {
            const s = ax.never()
            type T = typeof s.$infer
            expectTypeOf<T>().toEqualTypeOf<never>()
      })
})

describe('Schema extends Parser', () => {
      it('is instanceof Parser', () => {
            expect(ax.string()).toBeInstanceOf(Parser)
            expect(ax.number()).toBeInstanceOf(Parser)
      })
})
