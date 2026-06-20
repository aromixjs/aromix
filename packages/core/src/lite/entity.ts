import { BlobModifier } from '../lite.column/blob'
import { IntModifier } from '../lite.column/int'
import { RealModifier } from '../lite.column/real'
import { TextModifier } from '../lite.column/text'
import { Builder } from '../lite.types/builder'
import { LiteAdapter } from './adapter'


export interface LiteEntityInput {
	name: string
	adapter: LiteAdapter
	fields: (builder: Builder) => Array<any>
}

export function LiteEntity(input: LiteEntityInput) {
	const builder: Builder = {
		text(col) {
			return new TextModifier(col)
		},
		int(col) {
			return new IntModifier(col)
		},

		real(col) {
			return new RealModifier(col)
		},
		blob(col) {
			return new BlobModifier(col)
		},
	}

	input.fields(builder)

	return {
		col(colName: string) {
			return {
				colName,
				tableName: input.name,
				tableState: input.fields(builder).map((m) => m.state),
			}
		},
	}
}
