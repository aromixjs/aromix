import { describe, it, expect, expectTypeOf } from 'vitest'
import { ax, ValidationError } from '@aromix/validator'

describe('parse', () => {
	it('returns the validated value on success', () => {
		expect(ax.string().parse('hello')).toBe('hello')
		expect(ax.number().parse(42)).toBe(42)
	})

	it('throws ValidationError on type mismatch', () => {
		try {
			ax.string().parse(42)
		} catch (e) {
			expect(e).toBeInstanceOf(ValidationError)
			expect((e as ValidationError).issues[0].code).toBe('invalidType')
		}
	})

	it('throws ValidationError on missing field', () => {
		const User = ax.object({ name: ax.string(), age: ax.number() })
		try {
			User.parse({ name: 'Alex' })
		} catch (e) {
			expect(e).toBeInstanceOf(ValidationError)
		}
	})

	it('errors have correct structure for SDK consumption', () => {
		try {
			ax.number().parse('hello')
		} catch (e) {
			const err = e as ValidationError
			expect(err.name).toBe('ValidationError')
			expect(err.issues).toHaveLength(1)
			expect(err.issues[0]).toMatchObject({
				code: 'invalidType',
				path: [],
				message: expect.stringContaining('number'),
			})
		}
	})

	it('throw can be caught with instanceof', () => {
		try {
			ax.string().parse(42)
		} catch (e) {
			expect(e instanceof ValidationError).toBe(true)
			expect((e as ValidationError).message).toBeTruthy()
		}
	})
})

describe('safeParse', () => {
	it('returns success with data on valid input', () => {
		const r = ax.string().safeParse('hello')
		expect(r.success).toBe(true)
		if (r.success) {
			expect(r.data).toBe('hello')
			expect(r.errors).toBeNull()
		}
	})

	it('returns failure with errors on invalid input', () => {
		const r = ax.number().safeParse('x')
		expect(r.success).toBe(false)
		if (!r.success) {
			expect(r.data).toBeNull()
			expect(r.errors).toBeInstanceOf(Array)
			expect(r.errors[0]).toContain('number')
		}
	})

	it('type narrows correctly based on success', () => {
		const r = ax.string().safeParse('hi')
		if (r.success) {
			expectTypeOf(r.data).toEqualTypeOf<string>()
			expectTypeOf(r.errors).toEqualTypeOf<null>()
		}
	})

	it('type narrows correctly on failure', () => {
		const r = ax.string().safeParse(42)
		if (!r.success) {
			expectTypeOf(r.data).toEqualTypeOf<null>()
			expectTypeOf(r.errors).toEqualTypeOf<string[]>()
		}
	})

	it('never throws regardless of input', () => {
		const crazyInputs = [undefined, null, NaN, Symbol(), {}, [], '', 0]
		for (const input of crazyInputs) {
			expect(() => ax.string().safeParse(input)).not.toThrow()
		}
	})
})

describe('default', () => {
	it('uses default value when input is undefined', () => {
		const s = ax.string().default('fallback')
		expect(s.parse(undefined)).toBe('fallback')
	})

	it('parses normally when input is provided despite default', () => {
		const s = ax.string().default('fallback')
		expect(s.parse('real')).toBe('real')
	})

	it('type infers string even without default', () => {
		const s = ax.string().default('x')
		expectTypeOf<typeof s.$infer>().toEqualTypeOf<string>()
	})

	it('default with pipe uses default before pipe operator', () => {
		const s = ax
			.string()
			.pipe(ax.operator((v: string) => v.toUpperCase()))
			.default('anon')
		expect(s.parse(undefined)).toBe('ANON')
	})

	it('defaultFn provides lazy default', () => {
		let counter = 0
		const s = ax.number().defaultFn(() => ++counter)
		expect(s.parse(undefined)).toBe(1)
		expect(s.parse(undefined)).toBe(2)
	})

	it('default is not used when value is null', () => {
		const s = ax.string().default('fallback')
		expect(() => s.parse(null)).toThrow(ValidationError)
	})

	it('safeParse works with defaults', () => {
		const s = ax.string().default('anon')
		const r = s.safeParse(undefined)
		expect(r.success).toBe(true)
		if (r.success) expect(r.data).toBe('anon')
	})
})
