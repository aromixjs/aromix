import { KvField } from "./kv/field"


export namespace Model {



   interface KvInput {
      base: Record<string, KvField.Any>
   }

   export function kv(input: KvInput) { }


}

