// FailSignal :: returned by ax.fail() inside an operator to signal rejection

/**
 * Operator validate() return contract:
 *   void / undefined  →  pass, value unchanged
 *   any other value   →  pass, value replaced (transform)
 *   FailSignal        →  fail with message, stop the pipe
 */
export interface FailSignal {
      readonly _tag: 'ax.fail'
      readonly message: string
      readonly path?: (string | number)[]
}

/**
 * Operator :: a typed unit of validation or transformation
 * Input and Output are phantom type parameters.
 *  They exist only at the type level to enforce that operators are wired
 * to schemas with compatible types. They are never assigned at runtime.
 */
export interface OperatorDefinition<Input, Output = Input> {
      validate(value: Input): Output | void | FailSignal
}

export interface Operator<Input, Output = Input> {
      readonly _tag: 'ax.operator'
      readonly _input: Input // phantom type never assigned at runtime
      readonly _output: Output // phantom type never assigned at runtime
      readonly definition: OperatorDefinition<Input, Output>
}
