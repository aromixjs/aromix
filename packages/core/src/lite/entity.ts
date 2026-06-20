import { AnyColumn } from './column.state'
import { LiteAdapter } from './adapter'
import { ColumnBuilder } from './column'

export interface LiteEntityInput<Fields extends AnyColumn[]> {
	name: string
	adapter: LiteAdapter
	fields: (builder: ColumnBuilder) => Fields
}

export function LiteEntity<const Fields extends AnyColumn[]>(input: LiteEntityInput<Fields>) {
	const builder = new ColumnBuilder()
	input.fields(builder)

	return input
}

declare const db: LiteAdapter
const userEntity = LiteEntity({
	name: '',
	adapter: db,
	fields: (builder) => [
		builder.text('user').collate('rtrim').index(),
		 builder.real('id').primaryKey(),

	builder.blob('image').index()


	],
})
