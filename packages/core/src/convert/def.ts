
import { ax } from '@aromix/validator'
import { ColumnState } from '../lite'
import type { LiteToAx } from './types'

// ─── Runtime: ColumnState -> Schema instance ────────────────────────────────────
// Branch structure mirrors LiteToAxOutput in types.ts — keep them in sync.

export function liteToAx<S extends ColumnState>(state: S): LiteToAx<S> {
    let schema: any

    switch (state.colType) {
        case 'text':
            schema = ax.string()
            break
        case 'int':
        case 'real':
            schema = ax.number()
            break
        case 'blob':
            schema = ax.instance(Uint8Array)
            break
    }

    for (const check of state.checks) {
        switch (check.op) {
            case 'gt':
                schema = schema.pipe(ax.operator((v: number) => {
                    if (!(v > check.val)) throw new Error(`must be > ${check.val}`)
                    return v
                }))
                break
            case 'gte':
                schema = schema.pipe(ax.operator((v: number) => {
                    if (!(v >= check.val)) throw new Error(`must be >= ${check.val}`)
                    return v
                }))
                break
            case 'lt':
                schema = schema.pipe(ax.operator((v: number) => {
                    if (!(v < check.val)) throw new Error(`must be < ${check.val}`)
                    return v
                }))
                break
            case 'lte':
                schema = schema.pipe(ax.operator((v: number) => {
                    if (!(v <= check.val)) throw new Error(`must be <= ${check.val}`)
                    return v
                }))
                break
            case 'minLength':
                schema = schema.pipe(ax.operator((v: string) => {
                    if (v.length < check.val) throw new Error(`must have length >= ${check.val}`)
                    return v
                }))
                break
            case 'maxLength':
                schema = schema.pipe(ax.operator((v: string) => {
                    if (v.length > check.val) throw new Error(`must have length <= ${check.val}`)
                    return v
                }))
                break
        }
    }

    // Apply user-defined pipes (transformations / validations)
    for (const op of state.pipes) {
        schema = schema.pipe(op)
    }

    if (!state.notNull) {
        schema = ax.union([schema, ax.null()])
    }

    if (state.default !== undefined) {
        schema = schema.default(state.default)
    } else if (state.defaultFn) {
        schema = schema.defaultFn(state.defaultFn)
    }

    return schema as LiteToAx<S>
}