import { ax } from '@aromix/validator'

// ── Defining operators ─────────────────────────────────────
// An operator is just a function that receives a value and
// either returns a new value or throws to signal failure.

const minLen = (n: number) =>
   ax.operator((v: string) => {
      if (v.length < n) throw `Min ${n} chars`
      return v
   })

const toArray = ax.operator((v: string) => v.split(',').map(s => s.trim()))
const first = ax.operator((v: string[]) => {
   if (v.length === 0) throw 'Array is empty'
   return v[0]
})
const upper = ax.operator((v: string) => v.toUpperCase())

// ── Validation (same type throughout) ──────────────────────
// Each .pipe() validates, returns the same type.

const Name = ax.string().pipe(minLen(2)).pipe(minLen(5))

type Name = typeof Name.$infer // string

console.log('\n── Validation ──')
console.log(Name.parse('Rifat'))       // 'Rifat'
// Name.parse('X')                     // throws 'Min 2 chars'

// ── Type transformation ────────────────────────────────────
// Each .pipe() can change the type. TypeScript tracks it.

const CsvFirst = ax.string()
   .pipe(toArray)   // Schema<string[]>
   .pipe(first)     // Schema<string>

type CsvFirst = typeof CsvFirst.$infer // string

console.log('\n── Transformation ──')
console.log(CsvFirst.parse('a, b, c')) // 'a'

// ── Long chain ─────────────────────────────────────────────

const Processed = ax.string()
   .pipe(minLen(2))
   .pipe(upper)     // string → string
   .pipe(toArray)   // string → string[]
   .pipe(first)     // string[] → string

type Processed = typeof Processed.$infer // string

console.log('\n── Long chain ──')
console.log(Processed.parse('john, bob')) // 'JOHN'

// ── Nested in objects ──────────────────────────────────────

const User = ax.object({
   name: ax.string().pipe(minLen(2)),
   tags: ax.string().pipe(toArray),
})

type User = typeof User.$infer
// { name: string; tags: string[] }

console.log('\n── Object with pipes ──')
console.log(User.parse({
   name: 'Alex',
   tags: 'admin, editor',
}))
// { name: 'Alex', tags: ['admin', 'editor'] }

// ── Combined with default ──────────────────────────────────

const WithDefault = ax.string()
   .pipe(minLen(2))
   .default('guest')

console.log('\n── With default ──')
console.log(WithDefault.parse(undefined)) // 'guest'
console.log(WithDefault.parse('alex'))    // 'alex'

// ── Type-safety: wrong input type errors at compile time ──
//
// ax.string().pipe(ax.operator((v: number) => v * 2))
//          ~~~~  'Operator<number, number>' is not assignable
//                to 'Operator<string, string>'. Type 'number'
//                is not assignable to type 'string'.
