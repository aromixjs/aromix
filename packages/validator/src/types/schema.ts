import type { Issue } from './issue'
import type { AxType, LiteralValue } from './ax'
import type { Operator } from './operator'
import { ValidationError } from '../lib/error'

// ─────────────────────────────────────────────────────────────────────────────
// SchemaState — the internal runtime shape carried inside every schema instance
// ─────────────────────────────────────────────────────────────────────────────

export interface SchemaState {
      type: AxType
      object?: { shape: Record<string, AnySchema> }
      array?: { element: AnySchema }
      tuple?: { elements: AnySchema[] }
      literal?: { value: LiteralValue }
      record?: { value: AnySchema }
      union?: { schemas: AnySchema[] }
      default?: { value: unknown }
      defaultFn?: { fn: () => unknown }
      pipe?: { operators: Operator<any, any>[] }
}

// ─────────────────────────────────────────────────────────────────────────────
// ParseResult — the shape returned by safeParse()
// ─────────────────────────────────────────────────────────────────────────────

export type ParseResult<Output> = { ok: true; value: Output } | { ok: false; error: ValidationError; issues: Issue[] }

// ─────────────────────────────────────────────────────────────────────────────
// AnySchema — the minimal public interface every schema satisfies.
// Used as a constraint when schemas are passed as arguments (e.g. ax.array).
// ─────────────────────────────────────────────────────────────────────────────

export interface AnySchema<Output = unknown> {
      readonly $infer: Output
      parse(value: unknown): Output
      safeParse(value: unknown): ParseResult<Output>
      meta(): Readonly<SchemaState>
}

// ─────────────────────────────────────────────────────────────────────────────
// Chain — the fluent public interface returned by every ax entry point.
//
// The Used phantom generic accumulates every method key that has been called.
// Omit<{ all methods }, Used> permanently removes those keys from the surface,
// enforcing call-once constraints across any chain depth.
//
// pipe() takes an array of operators. Since the array length is not known
// at compile time, the output type is Chain<unknown> — callers who need
// precise output types after a transform should assign to a typed variable.
// ─────────────────────────────────────────────────────────────────────────────

export type Chain<Output, Used extends string = never> = Omit<
      {
            readonly $infer: Output

            // Provide a static fallback value for undefined input. Call once.
            default(value: Output): Chain<NonNullable<Output>, Used | 'default' | 'defaultFn'>

            // Provide a lazy factory fallback for undefined input. Call once.
            defaultFn(factory: () => Output): Chain<NonNullable<Output>, Used | 'default' | 'defaultFn'>

            // Sequence operators left to right inside an array.
            // The output type becomes Chain<unknown> since the array length is
            // not statically known — type inference across arbitrary arrays
            // is not possible in TypeScript without fixed-length overloads.
            pipe(operators: Operator<any, any>[]): Chain<unknown>

            parse(value: unknown): Output
            safeParse(value: unknown): ParseResult<Output>
            meta(): Readonly<SchemaState>
      },
      Used
>
