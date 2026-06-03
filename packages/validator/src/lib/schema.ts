import type { AnySchema, Chain, FailSignal, Issue, Operator, ParseResult, SchemaState } from './../types'
import { ValidationError } from './error'
import { Validator } from './validate'

// OperatorOutcome:: discriminated union describing one operator's result

type OperatorOutcome = { failed: true; issue: Issue } | { failed: false; transformed: true; value: unknown } | { failed: false; transformed: false }

/**
 *  Schema :: the runtime class powering every ax schema instance.
 *  The public surface is always typed as Chain<Output> via the static create() method.
 *  Callers never hold a Schema<Output> reference directly, only a Chain<Output>
 *  which enforces call-once method scoping via the Used phantom.
 */
export class Schema<Output> implements AnySchema<Output> {
      declare readonly $infer: Output

      private constructor(private readonly state: SchemaState) {}

      static create<Output>(state: SchemaState): Chain<Output> {
            return new Schema<Output>(state)
      }

      // chain methods :: All return any the Chain type enforces constraints at the call site.

      default(value: Output) {
            const updated: SchemaState = { ...this.state, default: { value }, defaultFn: undefined }
            return new Schema<NonNullable<Output>>(updated)
      }

      defaultFn(factory: () => Output) {
            const updated: SchemaState = { ...this.state, defaultFn: { fn: factory }, default: undefined }
            return new Schema<NonNullable<Output>>(updated)
      }

      pipe(operators: Operator<any, any>[]) {
            const previous = this.state.pipe?.operators ?? []
            const combined = [...previous, ...operators]
            const updated: SchemaState = { ...this.state, pipe: { operators: combined } }
            return new Schema<any>(updated)
      }

      meta(): Readonly<SchemaState> {
            return structuredClone(this.state)
      }

      parse(value: unknown): Output {
            const result = this.safeParse(value)
            if (!result.ok) {
                  throw result.error
            }
            return result.value
      }

      safeParse(value: unknown): ParseResult<Output> {
            const resolved = this.resolveDefault(value)
            const typeIssues = new Validator(this.state).run(resolved)

            if (typeIssues.length > 0) {
                  return this.buildFailure(typeIssues)
            }

            if (this.state.pipe) {
                  return this.runPipe(resolved)
            }

            return { ok: true, value: resolved as Output }
      }

      private resolveDefault(value: unknown): unknown {
            if (value !== undefined) {
                  return value
            }

            if (this.state.default !== undefined) {
                  return this.state.default.value
            }

            if (this.state.defaultFn !== undefined) {
                  return this.state.defaultFn.fn()
            }

            return value
      }

      private runPipe(value: unknown): ParseResult<Output> {
            let current = value

            for (const operator of this.state.pipe!.operators) {
                  const outcome = this.runSingleOperator(operator, current)

                  if (outcome.failed) {
                        return this.buildFailure([outcome.issue])
                  }

                  if (outcome.transformed) {
                        current = outcome.value
                  }
            }

            return { ok: true, value: current as Output }
      }

      private runSingleOperator(operator: Operator<any, any>, value: unknown): OperatorOutcome {
            let result: unknown

            try {
                  result = operator.definition.validate(value)
            } catch (thrown) {
                  const issue: Issue = {
                        path: [],
                        code: 'custom',
                        message: this.thrownToMessage(thrown),
                        received: value,
                  }
                  return { failed: true, issue }
            }

            if (this.isFailSignal(result)) {
                  const issue: Issue = {
                        path: result.path ?? [],
                        code: 'custom',
                        message: result.message,
                        received: value,
                  }
                  return { failed: true, issue }
            }

            if (result !== undefined) {
                  return { failed: false, transformed: true, value: result }
            }

            return { failed: false, transformed: false }
      }

      private buildFailure(issues: Issue[]): ParseResult<Output> {
            return { ok: false, error: new ValidationError(issues), issues }
      }

      private isFailSignal(value: unknown): value is FailSignal {
            return typeof value === 'object' && value !== null && (value as FailSignal)._tag === 'ax.fail'
      }

      private thrownToMessage(thrown: unknown): string {
            if (typeof thrown === 'string') {
                  return thrown
            }
            if (thrown instanceof Error) {
                  return thrown.message
            }
            return 'Operator failed'
      }
}
