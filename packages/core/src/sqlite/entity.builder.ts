import { Builder } from "./column.builder"
import { AnyOperatorRecord, BlobOperatorRecord, IntOperatorRecord, RealOperatorRecord, TextOperatorRecord } from "./operators"
export interface EntityInput {
   name: string
   model: (builder: Builder) => Array<any>
}




export function EntityBuilder<const Operators extends AnyOperatorRecord>(input: {
   adapter: (sql: string) => Promise<unknown>
   operators: Operators
}) {

   const Text: TextOperatorRecord = {}
   const Blob: BlobOperatorRecord = {}
   const Int: IntOperatorRecord = {}
   const Real: RealOperatorRecord = {}

   for (const [key, value] of Object.entries(input.operators)) {
      if (value.Int) {
         Int[key] = value.Int
      }

      if (value.Blob) {
         Blob[key] = value.Blob
      }


      if (value.Real) {
         Real[key] = value.Real
      }

      if (value.Text) {
         Text[key] = value.Text
      }
   }

   const builder = new Builder({
      Text, Int, Blob, Real
   })



   return {
      entity(options: EntityInput) {
         options.model(builder)
      }
   }
}
