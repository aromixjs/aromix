import { AnySchema, Operator, SchemaState } from './types'
import { Parser } from './parser'

export class Schema<Output> extends Parser<Output> implements AnySchema<Output> {
	declare readonly $infer: Output

	constructor(input: SchemaState) {
		super()
		this.state = input
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
}
