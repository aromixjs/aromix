

// ─── Type-level: ColumnState -> Schema<Output> ──────────────────────────────────
// Mirrors drizzle's GetZodType — pure conditional mapping, no engine involved.

import { Schema } from "@aromix/validator"
import { ColumnState } from "../lite"
import { ColumnTypeMap } from "../lite/types/column"

// The base output type for a column's SQL type.
// ColumnState's Out generic tracks the type through pipe transformations.
// Without pipes: Out = ColumnTypeMap[ColType] (the SQL type).
// With pipes: Out = the pipe chain's final output type.
type BaseOutput<S extends ColumnState> =
    S extends ColumnState<any, any, any, infer O> ? O : ColumnTypeMap[S['colType']]

// notNull -> required, otherwise -> nullable (accepts null, since DB columns can be NULL).
type WithNullability<S extends ColumnState, Out> = S['notNull'] extends true ? Out : Out | null

// Final output type for a given column state.
export type LiteToAxOutput<S extends ColumnState> = WithNullability<S, BaseOutput<S>>

// The full Schema type produced for a given column state.
export type LiteToAx<S extends ColumnState> = Schema<LiteToAxOutput<S>>

// ─── Entity-level schema types (select / insert / update) ──────────────────────

// Select: every column, nullable if !notNull
export type EntitySelectOutput<T extends Record<string, ColumnState>> = {
    [K in keyof T]: LiteToAxOutput<T[K]>
}

// Insert: exclude autoIncrement columns, optional if nullable or hasDefault
export type EntityInsertOutput<T extends Record<string, ColumnState>> = {
    [K in keyof T as T[K]['autoIncrement'] extends true ? never : K]: T[K]['notNull'] extends true
        ? LiteToAxOutput<T[K]>
        : LiteToAxOutput<T[K]> | undefined
}

// Update: every column optional, preserve nullability
export type EntityUpdateOutput<T extends Record<string, ColumnState>> = {
    [K in keyof T]: LiteToAxOutput<T[K]> | undefined
}