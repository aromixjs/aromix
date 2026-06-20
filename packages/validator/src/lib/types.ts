export type AxType = 'string' | 'number' | 'boolean' | 'bigint' | 'symbol' | 'null' | 'undefined' | 'unknown' | 'never' | 'instance' | 'object' | 'array' | 'tuple' | 'literal' | 'record' | 'union'

export type LiteralValue = string | number | boolean | bigint | null

export type ParseResult<T> = { success: true; data: T; errors: null } | { success: false; data: null; errors: string[] }

export interface Operator<Input, Output> {
	run: (value: Input) => Output
}

export interface AnySchema<Output = unknown> {
	readonly $infer: Output
	parse(value: unknown): Output
	safeParse(value: unknown): ParseResult<Output>
}

export interface SchemaState {
	type: AxType
	object?: { shape: Record<string, AnySchema> }
	array?: { element: AnySchema }
	tuple?: { elements: AnySchema[] }
	literal?: { value: LiteralValue }
	record?: { value: AnySchema }
	union?: { schemas: AnySchema[] }
	instance?: { class: new (...args: any[]) => any }
	operators?: Operator<any, any>[]
	// modifiers
	default?: { value: any }
	defaultFn?: { fn: () => unknown }
}
