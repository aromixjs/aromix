import type { Operator } from '@aromix/validator'

export interface ColumnTypeMap {
    int: number
    real: number
    text: string
    blob: Uint8Array
}

export type ColumnType = keyof ColumnTypeMap

export type UniqueConflict = 'conflict:error' | 'conflict:replace' | 'conflict:ignore'
export type Collation = 'binary' | 'nocase' | 'rtrim'

export type ReferenceAction =
    | 'delete:noAction'
    | 'update:noAction'
    | 'delete:restrict'
    | 'update:restrict'
    | 'delete:cascade'
    | 'update:cascade'
    | 'delete:setNull'
    | 'update:setNull'
    | 'delete:setDefault'
    | 'update:setDefault'

export interface CheckEntry {
    op: 'gt' | 'gte' | 'lt' | 'lte' | 'minLength' | 'maxLength'
    val: number
}

export interface ColumnReference {
    entityName: string
    columnName: string
    tableState: Record<string, ColumnState>
}
export interface ColumnState<ColType extends ColumnType = ColumnType, NotNull extends boolean = boolean, AutoInc extends boolean = boolean, Out = ColumnTypeMap[ColType]> {
    colType: ColType
    primaryKey: boolean
    autoIncrement: boolean
    notNull: NotNull
    unique: boolean
    uniqueConflict: UniqueConflict
    index: boolean
    checks: CheckEntry[]
    in: string[]
    collate?: Collation
    references?: { col: ColumnReference; actions: ReferenceAction[] }
    default?: unknown
    defaultFn?: () => unknown
    onUpdate?: () => unknown
    pipes: Operator<any, any>[]
}
