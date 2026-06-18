import { AnySchema, ax } from "@aromix/validator"

export namespace DdlChain {

   export interface DdlTypeMap {
      text: string,
      int: number,
      real: number,
      blob: Uint8Array
   }

   export type DdlType = keyof DdlTypeMap




   export type GroupInput = Record<string, {
      [Key in DdlType]?: (...args: any[]) => Partial<{
         all: AnySchema,
         select: AnySchema
         insert: AnySchema,
         update: AnySchema
      }>
   }>



   export function Group<const Type extends GroupInput>(input: Type) {
      // note:: do some processing here if needed
      return input
   }


}

const basicOperators = DdlChain.Group({
   onUpdate: {
      text(users: string) {
         return {
            select: ax.union([ax.literal('admin')])
         }
      },
   },

   role: {
      text(role: 'user') {
         return {
            all: ax.literal(role)
         }
      }
   }
})


