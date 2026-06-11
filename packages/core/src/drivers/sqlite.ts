import { CheckExpression, ColumnKey, ColumnReference, ColumnState, TableOptionsCtx, TableState, UniqueConflict } from '../lite'
import { ax, Schema, AnySchema } from '@aromix/validator'
import { liteToAx } from '../convert/def'
import type { EntitySelectOutput, EntityInsertOutput, EntityUpdateOutput } from '../convert/types'

export namespace Sqlite {
    // Data Adapters
    export interface Adapter {
        query(sql: string): Promise<unknown>
    }

    export function adapter(adapter: Sqlite.Adapter) {
        return adapter
    }

    // Data Definition Entity
    export interface EntityInput<State extends TableState> {
        name: string
        adapter: Sqlite.Adapter
        columns: State
        options(ctx: TableOptionsCtx<State>): void
    }

    export interface EntityState<State extends TableState> {
        name: string
        columns: { [Key in keyof State]: State[Key]['state'] }
        unique: { cols: string[]; conflict?: UniqueConflict }[]
        primaryKey: { cols: string[] }[]
        index: { cols: string[] }[]
        uniqueIndex: { cols: string[] }[]
        checks: CheckExpression[]
        withoutRowId: boolean
    }
    type ColumnsOf<T extends TableState> = { [K in keyof T]: T[K]['state'] }

    export interface EntityOutput<State extends TableState> {
        state: Sqlite.EntityState<State>
        col(columnName: ColumnKey<State>): ColumnReference
        toSelectSchema(): Schema<EntitySelectOutput<ColumnsOf<State>>>
        toInsertSchema(): Schema<EntityInsertOutput<ColumnsOf<State>>>
        toUpdateSchema(): Schema<EntityUpdateOutput<ColumnsOf<State>>>
    }

    // ── Schema builder helpers ──────────────────────────────────────────────────

    function buildSelectSchema(cols: Record<string, ColumnState>): any {
        const shape: Record<string, AnySchema> = {}
        for (const [key, col] of Object.entries(cols)) {
            shape[key] = liteToAx(col)
        }
        return ax.object(shape)
    }

    function buildInsertSchema(cols: Record<string, ColumnState>): any {
        const shape: Record<string, AnySchema> = {}
        for (const [key, col] of Object.entries(cols)) {
            if (col.autoIncrement) continue

            let schema: any = liteToAx(col)
            if (!col.notNull || col.default !== undefined || col.defaultFn) {
                schema = ax.union([schema, ax.undefined()])
            }
            shape[key] = schema
        }
        return ax.object(shape)
    }

    function buildUpdateSchema(cols: Record<string, ColumnState>): any {
        const shape: Record<string, AnySchema> = {}
        for (const [key, col] of Object.entries(cols)) {
            shape[key] = ax.union([liteToAx(col), ax.undefined()])
        }
        return ax.object(shape)
    }

    // ── Entity builder ─────────────────────────────────────────────────────────

    export function entity<State extends TableState>(input: Sqlite.EntityInput<State>): Sqlite.EntityOutput<State> & {
        readonly $inferSelect: EntitySelectOutput<ColumnsOf<State>>
        readonly $inferInsert: EntityInsertOutput<ColumnsOf<State>>
        readonly $inferUpdate: EntityUpdateOutput<ColumnsOf<State>>
    } {
        const columns: any = {}

        for (const key of Object.keys(input.columns)) {
            columns[key] = input.columns[key].state
        }

        const state: Sqlite.EntityState<State> = {
            name: input.name,
            columns,
            unique: [],
            primaryKey: [],
            index: [],
            uniqueIndex: [],
            checks: [],
            withoutRowId: false,
        }

        input.options({
            unique(cols, conflict) {
                state.unique.push({ cols, conflict })
            },
            primaryKey(cols) {
                state.primaryKey.push({ cols })
            },
            index(cols) {
                state.index.push({ cols })
            },
            uniqueIndex(cols) {
                state.uniqueIndex.push({ cols })
            },
            checks(exprs) {
                state.checks = exprs
            },
            gt(left, right) {
                return { left, op: 'gt', right }
            },
            gte(left, right) {
                return { left, op: 'gte', right }
            },
            lt(left, right) {
                return { left, op: 'lt', right }
            },
            lte(left, right) {
                return { left, op: 'lte', right }
            },
            withoutRowId() {
                state.withoutRowId = true
            },
        })






        const selectSchema = buildSelectSchema(columns)
        const insertSchema = buildInsertSchema(columns)
        const updateSchema = buildUpdateSchema(columns)

        const result: Sqlite.EntityOutput<State> = {
            state,
            col(columnName) {
                return {
                    entityName: input.name,
                    columnName,
                    tableState: columns,
                }
            },
            toSelectSchema() {
                return selectSchema
            },
            toInsertSchema() {
                return insertSchema
            },
            toUpdateSchema() {
                return updateSchema
            },
        }
        return result as any
    }
}
