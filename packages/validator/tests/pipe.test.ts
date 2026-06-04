import { ax } from '../src'

// Operators
const minLen = (n: number) =>
   ax.operator((v: string) => {
      if (v.length < n) throw `Min ${n} chars`
      return v
   })

const toArray = ax.operator((v: string) => v.split(',').map(s => s.trim()))
const first = ax.operator((v: string[]) => v[0])
const upper = ax.operator((v: string) => v.toUpperCase())

// ── Type tests ─────────────────────────────────────────────

// Single validator — stays string
const s1 = ax.string().pipe(minLen(3))
type T1 = typeof s1.$infer // string

// Transform: string → string[]
const s2 = ax.string().pipe(toArray)
type T2 = typeof s2.$infer // string[]

// Chain: string → string[] → string
const s3 = ax.string().pipe(toArray).pipe(first)
type T3 = typeof s3.$infer // string

// Chain: string → string[] → string → string
const s4 = ax.string().pipe(toArray).pipe(first).pipe(upper)
type T4 = typeof s4.$infer // string

// ── Runtime tests ──────────────────────────────────────────

console.log('\npipe — type inference')

// Single validator
const r1 = s1.parse('hello')
console.assert(r1 === 'hello', 'minLen passes')
console.log('  ✓ minLen passes')

try {
   s1.parse('hi')
   console.assert(false, 'should have thrown')
} catch {
   console.log('  ✓ minLen throws on short')
}

// Transform to array
const r2 = s2.parse('a, b, c')
console.assert(Array.isArray(r2) && r2[0] === 'a', 'toArray works')
console.log('  ✓ toArray:', r2)

// Chained transform
const r3 = s3.parse('a, b, c')
console.assert(r3 === 'a', 'chain toArray+first works')
console.log('  ✓ chain:', r3)

// Three-step chain
const r4 = s4.parse('a, b, c')
console.assert(r4 === 'A', 'three-step chain works')
console.log('  ✓ three-step:', r4)

console.log('\npipes done')
