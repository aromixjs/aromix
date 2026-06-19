import { AnySchema } from "@aromix/validator"
import { ColumnState, ColumnType } from "./states"


export interface OperatorCtx<Type extends ColumnType> {
    readonly state: ColumnState & {
        colType: Type
    },
    set(meta: Record<string, unknown>): void
}


export interface SchemaShape {
    select?: AnySchema
    insert?: AnySchema,
    update?: AnySchema
}

export type OperatorFn<Type extends ColumnType, Args extends any[], Schema extends SchemaShape | void> = (ctx: OperatorCtx<Type>, ...args: Args) => Schema

export type TextOperator = OperatorFn<'Text', any[], any>
export interface TextOperatorRecord {
    [key: string]: TextOperator
}

export type IntOperator = OperatorFn<'Int', any[], any>
export interface IntOperatorRecord {
    [key: string]: IntOperator
}

export type BlobOperator = OperatorFn<'Blob', any[], any>
export interface BlobOperatorRecord {
    [key: string]: BlobOperator
}

export type RealOperator = OperatorFn<'Real', any[], any>
export interface RealOperatorRecord {
    [key: string]: RealOperator
}


export type AnyOperator = Partial<{
    Text: TextOperator
    Int: IntOperator
    Real: RealOperator
    Blob: BlobOperator

}>
export interface AnyOperatorRecord {
    [key: string]: AnyOperator
}

export function Operator<const Type extends AnyOperator>(def: Type): Type {
    return def
}






