import { ColType, DdlInput, DdlState, OnConflict, Collation, ReferenceTrigger } from './types'

export class Ddl<Type extends ColType = ColType> {
  readonly state: DdlState

  constructor(input: DdlInput) {
    this.state = {
      type: input.type,
      dateFormat: input.dateFormat,
      primaryKey: false,
      autoIncrement: false,
      notNull: false,
      unique: false,
    }
  }

  primaryKey() {
    this.state.primaryKey = true
    return this
  }

  autoIncrement() {
    this.state.autoIncrement = true
    return this
  }

  notNull() {
    this.state.notNull = true
    return this
  }

  unique(onConflict?: OnConflict) {
    this.state.unique = true
    this.state.onConflict = onConflict
    return this
  }

  default(value: unknown) {
    this.state.default = value
    return this
  }

  collate(collation: Collation) {
    this.state.collate = collation
    return this
  }

  references(table: string, column: string, actions?: ReferenceTrigger[]) {
    this.state.references = { table, column, actions: actions ?? [] }
    return this
  }

  primaryKeyWith(cols: string[]) {
    this.state.primaryKeyWith = cols
    return this
  }

  uniqueWith(cols: string[]) {
    this.state.uniqueWith = cols
    return this
  }

  indexWith(cols: string[]) {
    this.state.indexWith = cols
    return this
  }

  uniqueIndexWith(cols: string[]) {
    this.state.uniqueIndexWith = cols
    return this
  }
}
