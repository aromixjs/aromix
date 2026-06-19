import { AnySchema, ax } from "@aromix/validator"

export interface DdlTypeMap {
   Text: string,
   Int: number,
   Real: number,
   Blob: Uint8Array
}
export type DdlType = keyof DdlTypeMap


export type GroupInput = {
   [Key in DdlType]?: (...args: any[]) => Partial<{
      all: AnySchema,
      select: AnySchema
      insert: AnySchema,
      update: AnySchema
   }>
}

export function ColumnOperator<const Type extends GroupInput>(input: Type) {
   return input
}