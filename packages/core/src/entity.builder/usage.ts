

// ---------------------------------------------------------------------------
// These are NOT built into the library. This is what "all the native stuff
// goes through the same process" means — text/integer are just operators,
// defined the same way any custom operator would be.
// ---------------------------------------------------------------------------

import { op, SqliteEntityBuilder } from "./ddl.chain"

const text = op('text', <N extends string>(name: N) => {

  return {
    name,
    ddl: 'TEXT',
    $select: '' as string,
    $insert: '' as string,
    $update: undefined as string | undefined,
  }
})

const integer = op('integer', <N extends string>(name: N) => {

  return {
    name,
    ddl: 'INTEGER',
    $select: 0 as number,
    $insert: 0 as number,
    $update: undefined as number | undefined,
  }
})

// ---------------------------------------------------------------------------
// Wire it up
// ---------------------------------------------------------------------------

const db = SqliteEntityBuilder({
  async adapter(sql) {

    return sql
  },
  operators: [text, integer],
})

const userEntity = db.entity({
  name: 'user',
  model: (b) => [
    b.integer('id'),
    b.text('email'),
    b.text('name'),
  ],
})

// ---------------------------------------------------------------------------
// Type-level assertions. These only compile if the inference is correct.
// ---------------------------------------------------------------------------

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type Expect<T extends true> = T

type SelectShape = typeof userEntity.$select
type InsertShape = typeof userEntity.$insert
type UpdateShape = typeof userEntity.$update

type _checkSelect = Expect<Equal<SelectShape, { id: number; email: string; name: string }>>
type _checkInsert = Expect<Equal<InsertShape, { id: number; email: string; name: string }>>
type _checkUpdate = Expect<Equal<UpdateShape, { id: number | undefined; email: string | undefined; name: string | undefined }>>

// Runtime sanity: real values should satisfy the inferred shapes.
const selectSample: SelectShape = { id: 1, email: 'a@b.com', name: 'Istiuak' }
const insertSample: InsertShape = { id: 1, email: 'a@b.com', name: 'Istiuak' }
const updateSample: UpdateShape = { id: undefined, email: 'a@b.com', name: undefined }

console.log(selectSample, insertSample, updateSample)