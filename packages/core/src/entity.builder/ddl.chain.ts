import { AnySchema } from '@aromix/validator'

export interface DdlTypeMap {
    Text: string
    Int: number
    Real: number
    Blob: Uint8Array
}
export type DdlType = keyof DdlTypeMap

export type OperatorDef = (...args: any[]) => Partial<{
    all: AnySchema
    select: AnySchema
    insert: AnySchema
    update: AnySchema
}>

export const Operator = {
    Text(fn: OperatorDef) {
        return fn
    },
    Int(fn: OperatorDef) {
        return fn
    },
    Real(fn: OperatorDef) {
        return fn
    },
    Blob(fn: OperatorDef) {
        return fn
    },
}
