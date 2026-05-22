import { KvField } from "./field";

class KV {
   string() {
      return new KvField.Builder("string");
   }
   number() {
      return new KvField.Builder("number");
   }
   bigint() {
      return new KvField.Builder("bigint");
   }
   boolean() {
      return new KvField.Builder("boolean");
   }
   date() {
      return new KvField.Builder("date");
   }
   buffer() {
      return new KvField.Builder("buffer");
   }

   object(shape?: Record<string, KvField.Any>) {
      if (shape) {

         const entries = Object.entries(shape).map(([key, value]) => [
            key,
            value[KvField.$meta],
         ]);

         const metaShape = Object.fromEntries(entries);
         return new KvField.Builder("object", metaShape);
      }

      return new KvField.Builder("object");
   }

   array(shape?: KvField.Any) {
      const builder = new KvField.Builder("array", shape?.[KvField.$meta]);
      return builder;
   }

   any() {
      return new KvField.Builder("any");
   }
}

export const kv = new KV();
