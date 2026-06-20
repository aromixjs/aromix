export type Collate = 'binary' | 'nocase' | 'rtrim'
export type ReferenceRule =
   | 'delete:noAction' | 'update:noAction'
   | 'delete:restrict' | 'update:restrict'
   | 'delete:cascade' | 'update:cascade'
   | 'delete:setNull' | 'update:setNull'
   | 'delete:setDefault' | 'update:setDefault'


export type UniqueConflict = 'conflict:error' | 'conflict:replace' | 'conflict:ignore'


export interface Reference {
   entityName: string
   columnName: string
   tableState: TextState
   rules: ReferenceRule[]
}
export interface TextState {
   colName: string
   colType: 'TEXT'
   primaryKey: boolean
   unique: boolean
   uniqueConflict?: UniqueConflict
   index: boolean
   collate?: Collate
   references?: Reference
}


