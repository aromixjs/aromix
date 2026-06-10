import { CheckExpression, ColumnKey, ColumnReference, ColumnState, TableOptionsCtx, TableState, UniqueConflict } from '../lite'

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
        columns: { [Key in keyof State]: ColumnState }
        unique: { cols: string[]; conflict?: UniqueConflict }[]
        primaryKey: { cols: string[] }[]
        index: { cols: string[] }[]
        uniqueIndex: { cols: string[] }[]
        checks: CheckExpression[]
        withoutRowId: boolean
    }
    export interface EntityOutput<State extends TableState> {
        state: Sqlite.EntityState<State>
        col(columnName: ColumnKey<State>): ColumnReference
    }

    export function entity<State extends TableState>(input: Sqlite.EntityInput<State>): Sqlite.EntityOutput<State> {
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






        return {
            state,
            col(columnName) {
                return {
                    entityName: input.name,
                    columnName,
                    tableState: columns,
                }
            },
        }
    }
}
