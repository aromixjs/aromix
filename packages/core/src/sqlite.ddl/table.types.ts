import { AnyColumn } from './chain.types'
import { ColumnState, UniqueConflict } from './column.types'

export interface CheckExpression {
    left: string
    op: 'gt' | 'gte' | 'lt' | 'lte'
    right: string
}

export type TableColumns = Record<string, AnyColumn>

export type ColumnKey<Cols extends TableColumns> = keyof Cols & string

export interface TableOptionsCtx<Cols extends TableColumns> {
    unique(options: { name: string; cols: ColumnKey<Cols>[]; conflict: UniqueConflict }): void
    primaryKey(cols: ColumnKey<Cols>[]): void
    index(options: { name: string; cols: ColumnKey<Cols>[] }): void
    uniqueIndex(options: { name: string; cols: ColumnKey<Cols>[] }): void
    checks(exprs: CheckExpression[]): void
    gt(left: ColumnKey<Cols>, right: ColumnKey<Cols>): CheckExpression
    gte(left: ColumnKey<Cols>, right: ColumnKey<Cols>): CheckExpression
    lt(left: ColumnKey<Cols>, right: ColumnKey<Cols>): CheckExpression
    lte(left: ColumnKey<Cols>, right: ColumnKey<Cols>): CheckExpression
    withoutRowId(): void
}

export interface TableInput<Cols extends TableColumns> {
    columns: Cols
    options?(ctx: TableOptionsCtx<Cols>): void
}

export interface TableState {
    columns: Record<string, ColumnState>
    unique: { name: string; cols: string[]; conflict: UniqueConflict }[]
    primaryKey: { cols: string[] }[]
    index: { name: string; cols: string[] }[]
    uniqueIndex: { name: string; cols: string[] }[]
    checks: CheckExpression[]
    withoutRowId: boolean
}
