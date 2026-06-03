import type { AnySchema, Chain, FailSignal, LiteralValue, Operator, OperatorDefinition } from './../types'
import { Schema } from './schema'

// ax :: the public API namespace
export const ax = {
      // Primitive Entry Points
      string(): Chain<string> {
            return Schema.create({ type: 'string' })
      },
      number(): Chain<number> {
            return Schema.create({ type: 'number' })
      },
      boolean(): Chain<boolean> {
            return Schema.create({ type: 'boolean' })
      },
      bigint(): Chain<bigint> {
            return Schema.create({ type: 'bigint' })
      },
      symbol(): Chain<symbol> {
            return Schema.create({ type: 'symbol' })
      },
      null(): Chain<null> {
            return Schema.create({ type: 'null' })
      },
      undefined(): Chain<undefined> {
            return Schema.create({ type: 'undefined' })
      },
      unknown(): Chain<unknown> {
            return Schema.create({ type: 'unknown' })
      },
      never(): Chain<never> {
            return Schema.create({ type: 'never' })
      },
      date(): Chain<Date> {
            return Schema.create({ type: 'date' })
      },

      // Composite Entry Points
      literal<Value extends LiteralValue>(value: Value): Chain<Value> {
            return Schema.create({ type: 'literal', literal: { value } })
      },

      object<Shape extends Record<string, AnySchema>>(shape: Shape): Chain<{ [Key in keyof Shape]: Shape[Key]['$infer'] }> {
            return Schema.create({ type: 'object', object: { shape } })
      },

      array<Element extends AnySchema>(element: Element): Chain<Element['$infer'][]> {
            return Schema.create({ type: 'array', array: { element } })
      },

      tuple<Elements extends AnySchema[]>(elements: [...Elements]): Chain<{ [Key in keyof Elements]: Elements[Key]['$infer'] }> {
            return Schema.create({ type: 'tuple', tuple: { elements } })
      },

      record<Value extends AnySchema>(value: Value): Chain<Record<string, Value['$infer']>> {
            return Schema.create({ type: 'record', record: { value } })
      },

      union<Schemas extends AnySchema[]>(schemas: [...Schemas]): Chain<Schemas[number]['$infer']> {
            return Schema.create({ type: 'union', union: { schemas } })
      },

      // operator factory :: The Input type is inferred from the validate function signature, ensuring operators are only usable in pipes with a matching input type.
      operator<Input, Output = Input>(definition: OperatorDefinition<Input, Output>): Operator<Input, Output> {
            return {
                  _tag: 'ax.operator',
                  _input: undefined as any,
                  _output: undefined as any,
                  definition,
            }
      },

      // Fail Factory :: Call inside an operator's validate() to reject the current value.
      fail(message: string, options?: { path?: (string | number)[] }): FailSignal {
            return {
                  _tag: 'ax.fail',
                  message,
                  path: options?.path,
            }
      },
}
