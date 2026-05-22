import { object } from "../utils";

export namespace KvField {


   /**
    * Type of data that a kvField is allowed to store
    * This mimics typescript type to give good type inference
    */
   export type Type =
      | "string"
      | "number"
      | "bigint"
      | "boolean"
      | "date"
      | "buffer"
      | "object"
      | "array"
      | "any";


   /**
    * A 1:1 Type mapping between the type of value a kvField allowed to store and there type representation in typescript
    */
   export interface TypeMap {
      string: string;
      number: number;
      bigint: bigint;
      boolean: boolean;
      date: Date;
      buffer: Buffer;
      object: Record<string, unknown>;
      array: unknown[];
      any: any;
   }



   /// this is the type of the underlying meta data that will be used to derive all the stuff later
   export interface Meta<FieldType extends Type = Type> {
      type: FieldType;
      default: KvField.TypeMap[FieldType] | undefined;
      shape: Record<string, Meta> | Meta | undefined
   }



   /**
    * Represents Any Type of Field
    * This Broader Type Used For getting the field meta only 
    */
   export type Any = { [$meta]: Meta }




   export const $meta = Symbol("Kv Field Meta");



   export class Builder<FieldType extends Type> {
      [$meta]: Meta<FieldType>;

      constructor(type: FieldType, shape?: Meta['shape']) {
         this[$meta] = {
            type,
            default: undefined,
            shape
         };
      }

      default(data: TypeMap[FieldType]) {
         this[$meta].default = data;
         return object<Builder<FieldType>>(this).omit(["default"]);
      }
   }
}
