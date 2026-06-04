import { AnySchema, Operator, SchemaState } from './types'

export class Schema<Output> implements AnySchema<Output> {
      declare readonly $infer: Output
      state: SchemaState

      constructor(input: SchemaState) {
            this.state = { ...input }
      }

      default(value: Output) {
            this.state.default = { value }
            return this
      }

      defaultFn(fn: () => Output) {
            this.state.defaultFn = { fn }
            return this
      }

      pipe<Next>(op: Operator<Output, Next>): Schema<Next> {
            if (!this.state.operators) this.state.operators = []
            this.state.operators.push(op)
            return this as any
      }

      parse(value: unknown): Output {
            let current = value
            if (current === undefined) {
                  if (this.state.default) {
                        current = this.state.default.value
                  } else if (this.state.defaultFn) {
                        current = this.state.defaultFn.fn()
                  }
            }
            if (this.state.operators) {
                  for (const op of this.state.operators) {
                        current = op.run(current)
                  }
            }
            return current as Output
      }

      meta(): Readonly<SchemaState> {
            return structuredClone(this.state)
      }
}
