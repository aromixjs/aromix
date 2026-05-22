import { KvField } from "./field";

export namespace kv {

   export function string() {
      return KvField.modifier("string");
   }

   export function number() {
      return KvField.modifier("number");
   }

   export function bigint() {
      return KvField.modifier("bigint");
   }

   export function boolean() {
      return KvField.modifier("boolean");
   }

   export function date() {
      return KvField.modifier("date");
   }

   export function buffer() {
      return KvField.modifier("buffer");
   }

   export function object() {
      return KvField.modifier('object')

   }

   export function array() {
      return KvField.modifier("array");
   }

   export function any() {
      return KvField.modifier("any");
   }
}


