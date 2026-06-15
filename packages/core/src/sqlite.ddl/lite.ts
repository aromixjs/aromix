import { ax } from '@aromix/validator'
import { Column } from './column'
import { ColumnState } from './column.types'
import { TableColumns, TableInput, TableState } from './table.types'

export const lite = {
    int() {
        return Column.create('int')
    },
    real() {
        return Column.create('real')
    },
    text() {
        return Column.create('text')
    },
    blob() {
        return Column.create('blob')
    },

    table<Cols extends TableColumns>(input: TableInput<Cols>) {
        const columns: Record<string, ColumnState> = {}
        for (const key of Object.keys(input.columns)) {
            columns[key] = input.columns[key].state
        }

        const state: TableState = {
            columns,
            unique: [],
            primaryKey: [],
            index: [],
            uniqueIndex: [],
            checks: [],
            withoutRowId: false,
        }

        if (input.options !== undefined) {
            input.options({
                unique(options) {
                    state.unique.push(options)
                },
                primaryKey(cols) {
                    state.primaryKey.push({ cols })
                },
                index(options) {
                    state.index.push(options)
                },
                uniqueIndex(options) {
                    state.uniqueIndex.push(options)
                },
                checks(exprs) {
                    state.checks.push(...exprs)
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
        }

        return state
    },
}



const table =lite.table({
    columns: {
        id: lite.int().autoIncrement().primaryKey(),
        name: lite.text().refine((value) => {
            const schema = ax.union([ax.literal('admin'), ax.literal('modarator'), ax.literal('user')])
            return schema.parse(value)
        })
    },

    options(ctx){
    }
})


