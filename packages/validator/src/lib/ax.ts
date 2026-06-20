import { Schema } from './schema'
import { AnySchema, LiteralValue, Operator } from './types'

export const ax = {
	string() {
		return new Schema<string>({ type: 'string' })
	},
	number() {
		return new Schema<number>({ type: 'number' })
	},
	boolean() {
		return new Schema<boolean>({ type: 'boolean' })
	},
	bigint() {
		return new Schema<bigint>({ type: 'bigint' })
	},
	symbol() {
		return new Schema<symbol>({ type: 'symbol' })
	},
	null() {
		return new Schema<null>({ type: 'null' })
	},
	undefined() {
		return new Schema<undefined>({ type: 'undefined' })
	},
	unknown() {
		return new Schema<unknown>({ type: 'unknown' })
	},
	never() {
		return new Schema<never>({ type: 'never' })
	},
	instance<T extends new (...args: any[]) => any>(cls: T) {
		return new Schema<InstanceType<T>>({ type: 'instance', instance: { class: cls } })
	},

	literal<Value extends LiteralValue>(value: Value) {
		return new Schema<Value>({ type: 'literal', literal: { value } })
	},

	object<Shape extends Record<string, AnySchema>>(shape: Shape) {
		return new Schema<{ [Key in keyof Shape]: Shape[Key]['$infer'] }>({ type: 'object', object: { shape } })
	},

	array<Element extends AnySchema>(element: Element) {
		return new Schema<Element['$infer'][]>({ type: 'array', array: { element } })
	},

	tuple<Elements extends AnySchema[]>(elements: [...Elements]) {
		return new Schema<{ [Key in keyof Elements]: Elements[Key]['$infer'] }>({ type: 'tuple', tuple: { elements } })
	},

	record<Value extends AnySchema>(value: Value) {
		return new Schema<Record<string, Value['$infer']>>({ type: 'record', record: { value } })
	},

	union<Schemas extends AnySchema[]>(schemas: [...Schemas]) {
		return new Schema<Schemas[number]['$infer']>({ type: 'union', union: { schemas } })
	},

	operator<Input, Output>(run: (value: Input) => Output): Operator<Input, Output> {
		return { run }
	},
}
