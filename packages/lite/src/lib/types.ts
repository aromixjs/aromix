export type ColType = 'int' | 'real' | 'text' | 'blob' | 'boolean' | 'bigint' | 'date'

export type DateFormat = 'iso' | 'unix-ms'

export interface ColTypeMap {
  int: number
  real: number
  text: string
  blob: Uint8Array
  boolean: boolean
  bigint: bigint
  date: Date
}

export interface DdlInput {
  type: ColType
  dateFormat?: DateFormat
}

export type OnConflict = 'rollback' | 'abort' | 'fail' | 'ignore' | 'replace'

export type Collation = 'binary' | 'nocase' | 'rtrim'

export type ReferenceAction =
  | 'no-action'
  | 'restrict'
  | 'cascade'
  | 'set-null'
  | 'set-default'

export type ReferenceTrigger = `on-delete:${ReferenceAction}` | `on-update:${ReferenceAction}`

export interface DdlState {
  type: ColType
  dateFormat?: DateFormat
  primaryKey: boolean
  autoIncrement: boolean
  notNull: boolean
  unique: boolean
  onConflict?: OnConflict
  default?: unknown
  collate?: Collation
  references?: {
    table: string
    column: string
    actions: ReferenceTrigger[]
  }
  uniqueWith?: string[]
  indexWith?: string[]
  uniqueIndexWith?: string[]
  primaryKeyWith?: string[]
}
