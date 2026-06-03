import { ax, ValidationError } from './../src'

// Test helpers
let passed = 0
let failed = 0

function test(name: string, fn: () => boolean | boolean[]) {
      const results = [fn()].flat()
      const allPassed = results.every(Boolean)
      if (allPassed) {
            passed++
            console.log(`  ✓  ${name}`)
      } else {
            failed++
            console.log(`  ✗  ${name}`)
      }
}

function expectPass<Output>(schema: { parse: (v: unknown) => Output }, value: unknown, expected: Output): boolean {
      const result = schema.parse(value)
      const match = JSON.stringify(result) === JSON.stringify(expected)
      if (!match) {
            console.error(`       expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`)
      }
      return match
}

function expectFail(schema: { safeParse: (v: unknown) => any }, value: unknown, code?: string): boolean {
      const result = schema.safeParse(value)
      if (result.ok) {
            console.error(`       expected failure for ${JSON.stringify(value)}, got ok`)
            return false
      }
      if (code !== undefined) {
            const hasCode = result.issues.some((issue: any) => issue.code === code)
            if (!hasCode) {
                  const found = result.issues.map((issue: any) => issue.code).join(', ')
                  console.error(`       expected code '${code}', got [${found}]`)
                  return false
            }
      }
      return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nprimitives')

test('string — valid', () => expectPass(ax.string(), 'hello', 'hello'))
test('string — invalid', () => expectFail(ax.string(), 42, 'invalid_type'))
test('number — valid', () => expectPass(ax.number(), 42, 42))
test('number — NaN rejected', () => expectFail(ax.number(), NaN, 'invalid_type'))
test('boolean — valid', () => expectPass(ax.boolean(), true, true))
test('null — valid', () => expectPass(ax.null(), null, null))
test('null — undefined invalid', () => expectFail(ax.null(), undefined, 'invalid_type'))
test('undefined — valid', () => expectPass(ax.undefined(), undefined, undefined))
test('unknown — passes any', () => expectPass(ax.unknown(), { anything: 1 }, { anything: 1 }))
test('never — always fails', () => expectFail(ax.never(), 'anything', 'invalid_type'))
test('date — valid', () => expectPass(ax.date(), new Date('2024-01-01'), new Date('2024-01-01')))
test('date — invalid date', () => expectFail(ax.date(), new Date('invalid'), 'invalid_type'))

// ─────────────────────────────────────────────────────────────────────────────
// Literal
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nliteral')

test('string literal — match', () => expectPass(ax.literal('admin'), 'admin', 'admin'))
test('number literal — match', () => expectPass(ax.literal(42), 42, 42))
test('boolean literal — match', () => expectPass(ax.literal(true), true, true))
test('null literal — match', () => expectPass(ax.literal(null), null, null))
test('literal — mismatch', () => expectFail(ax.literal('admin'), 'user', 'invalid_literal'))

// ─────────────────────────────────────────────────────────────────────────────
// Default
// ─────────────────────────────────────────────────────────────────────────────

console.log('\ndefault')

test('default — used on undefined', () => expectPass(ax.string().default('guest'), undefined, 'guest'))
test('default — not used when value set', () => expectPass(ax.string().default('guest'), 'rifat', 'rifat'))
test('defaultFn — called on undefined', () =>
      expectPass(
            ax.string().defaultFn(() => 'guest'),
            undefined,
            'guest',
      ))
test('defaultFn — fresh call each time', () => {
      const schema = ax.array(ax.string()).defaultFn(() => [])
      const first = schema.parse(undefined)
      const second = schema.parse(undefined)
      return first !== second
})

// ─────────────────────────────────────────────────────────────────────────────
// Chain scoping — call-once enforcement (type-level, verified by tsc)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nchain scoping')

test('default used once compiles', () => {
      ax.string().default('x')
      return true
})
test('defaultFn used once compiles', () => {
      ax.string().defaultFn(() => 'x')
      return true
})
test('default then pipe compiles', () => {
      ax.string().default('x').pipe([])
      return true
})

// ─────────────────────────────────────────────────────────────────────────────
// Object
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nobject')

const UserSchema = ax.object({ name: ax.string(), age: ax.number() })

test('object — valid', () => expectPass(UserSchema, { name: 'Rifat', age: 25 }, { name: 'Rifat', age: 25 }))
test('object — wrong field type', () => expectFail(UserSchema, { name: 'Rifat', age: 'old' }, 'invalid_type'))
test('object — collects all errors', () => {
      const result = UserSchema.safeParse({ name: 42, age: 'old' })
      return !result.ok && result.issues.length === 2
})

// ─────────────────────────────────────────────────────────────────────────────
// Array
// ─────────────────────────────────────────────────────────────────────────────

console.log('\narray')

test('array — valid', () => expectPass(ax.array(ax.string()), ['a', 'b'], ['a', 'b']))
test('array — wrong element', () => expectFail(ax.array(ax.string()), ['a', 1], 'invalid_type'))
test('array — not an array', () => expectFail(ax.array(ax.string()), 'not an array', 'invalid_type'))

// ─────────────────────────────────────────────────────────────────────────────
// Tuple
// ─────────────────────────────────────────────────────────────────────────────

console.log('\ntuple')

test('tuple — valid', () => expectPass(ax.tuple([ax.string(), ax.number()]), ['hello', 42], ['hello', 42]))
test('tuple — wrong position', () => expectFail(ax.tuple([ax.string(), ax.number()]), [42, 'hello'], 'invalid_type'))

// ─────────────────────────────────────────────────────────────────────────────
// Record
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nrecord')

test('record — valid', () => expectPass(ax.record(ax.number()), { a: 1, b: 2 }, { a: 1, b: 2 }))
test('record — wrong value', () => expectFail(ax.record(ax.number()), { a: 'oops' }, 'invalid_type'))

// ─────────────────────────────────────────────────────────────────────────────
// Union
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nunion')

const StringOrNumber = ax.union([ax.string(), ax.number()])

test('union — first branch', () => expectPass(StringOrNumber, 'hello', 'hello'))
test('union — second branch', () => expectPass(StringOrNumber, 42, 42))
test('union — no match', () => expectFail(StringOrNumber, true, 'invalid_union'))

// ─────────────────────────────────────────────────────────────────────────────
// Pipe — validation operators
// ─────────────────────────────────────────────────────────────────────────────

console.log('\npipe — validation')

const minLen = (n: number) =>
      ax.operator({
            validate(value: string) {
                  if (value.length < n) {
                        return ax.fail(`Min ${n} chars`)
                  }
            },
      })

const isInteger = ax.operator({
      validate(value: number) {
            if (!Number.isInteger(value)) {
                  return ax.fail('Must be an integer')
            }
      },
})

test('pipe — validate passes', () => expectPass(ax.string().pipe([minLen(3)]), 'hello', 'hello'))
test('pipe — validate fails', () => expectFail(ax.string().pipe([minLen(3)]), 'hi', 'custom'))
test('pipe — number validation', () => expectPass(ax.number().pipe([isInteger]), 5, 5))
test('pipe — number validation fail', () => expectFail(ax.number().pipe([isInteger]), 5.5, 'custom'))
test('pipe — multiple validators', () => {
      const schema = ax.string().pipe([minLen(3), minLen(2)])
      return [expectPass(schema, 'hello', 'hello'), expectFail(ax.string().pipe([minLen(10)]), 'hi', 'custom')]
})

// ─────────────────────────────────────────────────────────────────────────────
// Pipe — transform operators
// ─────────────────────────────────────────────────────────────────────────────

console.log('\npipe — transform')

const trim = ax.operator({
      validate(value: string) {
            return value.trim()
      },
})

const toUpperCase = ax.operator({
      validate(value: string) {
            return value.toUpperCase()
      },
})

const splitOnComma = ax.operator({
      validate(value: string) {
            return value
                  .split(',')
                  .map((part) => part.trim())
                  .filter(Boolean)
      },
})

test('transform — trim', () => expectPass(ax.string().pipe([trim]), '  hello  ', 'hello'))
test('transform — multiple in array', () => expectPass(ax.string().pipe([trim, toUpperCase]), '  hello  ', 'HELLO'))
test('transform — type change', () => expectPass(ax.string().pipe([splitOnComma]), 'a, b, c', ['a', 'b', 'c']))
test('transform — validate then transform', () => {
      const schema = ax.string().pipe([trim, minLen(3), toUpperCase])
      return [expectPass(schema, '  hello  ', 'HELLO'), expectFail(schema, '  hi  ', 'custom')]
})

// ─────────────────────────────────────────────────────────────────────────────
// Pipe — more than 5 operators
// ─────────────────────────────────────────────────────────────────────────────

console.log('\npipe — unbounded length')

const addBang = ax.operator({
      validate(value: string) {
            return value + '!'
      },
})
const addStar = ax.operator({
      validate(value: string) {
            return value + '*'
      },
})

test('pipe — 7 operators in array', () => {
      const schema = ax.string().pipe([trim, toUpperCase, addBang, addStar, addBang, addStar, addBang])
      return expectPass(schema, '  hello  ', 'HELLO!*!*!')
})

// ─────────────────────────────────────────────────────────────────────────────
// Pipe — thrown errors
// ─────────────────────────────────────────────────────────────────────────────

console.log('\npipe — thrown errors')

test('pipe — thrown string becomes issue', () => {
      const throwString = ax.operator({
            validate(_value: string) {
                  throw 'thrown error'
            },
      })
      const result = ax.string().pipe([throwString]).safeParse('hello')
      return !result.ok && result.issues[0].message === 'thrown error'
})

test('pipe — thrown Error becomes issue', () => {
      const throwError = ax.operator({
            validate(_value: string) {
                  throw new Error('error object')
            },
      })
      const result = ax.string().pipe([throwError]).safeParse('hello')
      return !result.ok && result.issues[0].message === 'error object'
})

// ─────────────────────────────────────────────────────────────────────────────
// Cross-field validation
// ─────────────────────────────────────────────────────────────────────────────

console.log('\ncross-field')

const passwordsMatch = ax.operator({
      validate(data: { password: string; confirm: string }) {
            if (data.password !== data.confirm) {
                  return ax.fail('Passwords do not match', { path: ['confirm'] })
            }
      },
})

const SignupSchema = ax
      .object({
            password: ax.string(),
            confirm: ax.string(),
      })
      .pipe([passwordsMatch])

test('cross-field — passwords match', () => expectPass(SignupSchema, { password: 'abc', confirm: 'abc' }, { password: 'abc', confirm: 'abc' }))
test('cross-field — passwords mismatch', () => {
      const result = SignupSchema.safeParse({ password: 'abc', confirm: 'xyz' })
      return !result.ok && result.issues[0].path[0] === 'confirm'
})

// ─────────────────────────────────────────────────────────────────────────────
// safeParse result shapes
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nsafeParse')

test('safeParse — ok shape', () => {
      const result = ax.string().safeParse('hi')
      return result.ok === true && result.value === 'hi'
})
test('safeParse — fail shape', () => {
      const result = ax.string().safeParse(42)
      return result.ok === false && result.issues.length > 0 && result.error instanceof ValidationError
})
