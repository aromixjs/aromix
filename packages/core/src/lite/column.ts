import { Collate, ColumnState, Reference, ReferenceRule, UniqueConflict } from './column.state'

export class BaseModifier{
	readonly state!: ColumnState

	primaryKey() {
		this.state.primaryKey = true
		return this
	}

	unique(conflict: UniqueConflict = 'conflict:error') {
		this.state.unique = true
		this.state.uniqueConflict = conflict
		return this
	}

	collate(option: Collate) {
		this.state.collate = option
		return this
	}
	index() {
		this.state.index = true
		return this
	}

	references(ref: Reference, rules: ReferenceRule[] = []) {
		this.state.references = {
			entityName: ref.entityName,
			columnName: ref.columnName,
			tableState: ref.tableState,
			rules: rules,
		}
		return this
	}
}

export class IntModifier<Col extends string> extends BaseModifier {
	readonly state: ColumnState<Col>

	constructor(col: Col) {
		super()
		this.state = {
			colName: col,
			colType: 'INT',
			unique: false,
			index: false,
			primaryKey: false,
			autoIncrement: false,
		}
	}

	autoIncrement() {
		this.state.autoIncrement = true
		return this
	}
}

export class BlobModifier<Col extends string> extends BaseModifier {
	readonly state: ColumnState<Col>

	constructor(col: Col) {
		super()
		this.state = {
			colName: col,
			colType: 'BLOB',
			unique: false,
			index: false,
			primaryKey: false,
			autoIncrement: false,
		}
	}
}

export class RealModifier<Col extends string> extends BaseModifier {
	readonly state: ColumnState<Col>

	constructor(col: Col) {
		super()
		this.state = {
			colName: col,
			colType: 'REAL',
			unique: false,
			index: false,
			primaryKey: false,
			autoIncrement: false,
		}
	}
}

export class TextModifier<Col extends string> extends BaseModifier {
	readonly state: ColumnState<Col>

	constructor(col: Col) {
		super()
		this.state = {
			colName: col,
			colType: 'TEXT',
			unique: false,
			index: false,
			primaryKey: false,
			autoIncrement: false,
		}
	}
}

export class ColumnBuilder {
	text<Col extends string>(col: Col) {
		return new TextModifier(col)
	}

	int<Col extends string>(col: Col) {
		return new IntModifier(col)
	}
	real<Col extends string>(col: Col) {
		return new RealModifier(col)
	}
	blob<Col extends string>(col: Col) {
		return new BlobModifier(col)
	}
}
