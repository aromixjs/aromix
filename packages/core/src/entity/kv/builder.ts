import * as v from "valibot";
import { $computed, $internal, $schema, AllEntries, AnyComputed, AnyField, AnySchema, ClientSchema, ComputedPublicKeys, ComputedValues, Prettify, PubEntries } from "./types";

function field<S extends AnySchema>(schema: S) {
   return {
      [$schema]: schema,
      [$internal]: false as const,
      internal() {
         return { [$schema]: schema, [$internal]: true as const };
      },
   };
}


export const kv = {
   string() {
      return field(v.string());
   },
   number() {
      return field(v.number());
   },
   boolean() {
      return field(v.boolean());
   },
   binary() {
      return field(v.instance(Uint8Array));
   },

   object<S extends Record<string, AnyField>>(shape: S) {
      const entries: Record<string, AnySchema> = {};
      for (const key in shape) entries[key] = shape[key][$schema];
      return field(v.object(entries));
   },

   array<I extends AnyField>(item: I) {
      return field(v.array(item[$schema]));
   },

   computed<T>(value: T) {
      return {
         [$computed]: value,
         [$internal]: false as const,
         internal() {
            return { [$computed]: value, [$internal]: true as const };
         },
      };
   },
};



export function kvSchema<S extends Record<string, AnyField>>(shape: S) {
   type SIn = Prettify<v.InferOutput<v.ObjectSchema<AllEntries<S>, undefined>>>;
   type CIn = Prettify<v.InferOutput<v.ObjectSchema<PubEntries<S>, undefined>>>;

   const allEntries: Record<string, AnySchema> = {};
   const pubEntries: Record<string, AnySchema> = {};

   for (const key in shape) {
      allEntries[key] = shape[key][$schema];
      if (!shape[key][$internal]) {
         pubEntries[key] = shape[key][$schema];
      }
   }

   const serverInputSchema = v.object(allEntries);
   const clientInputSchema = v.object(pubEntries);
   const serverOutputSchema = serverInputSchema;
   const clientOutputSchema = clientInputSchema;

   const base = {
      _serverInput: undefined as unknown as SIn,
      _serverOutput: undefined as unknown as SIn,
      _clientInput: undefined as unknown as CIn,
      _clientOutput: undefined as unknown as CIn,
      serverInputSchema,
      serverOutputSchema,
      clientInputSchema,
      clientOutputSchema,
      extendFn: undefined as ((t: Record<string, unknown>) => Record<string, AnyComputed>) | undefined,

      clientSchema(): ClientSchema {
         return {
            input: clientInputSchema,
            output: clientOutputSchema,
         };
      },
   };

   return {
      ...base,

      extend<E extends Record<string, AnyComputed>>(fn: (t: SIn) => E) {
         type SOut = Prettify<SIn & ComputedValues<E>>;
         type COut = Prettify<CIn & Pick<ComputedValues<E>, ComputedPublicKeys<E>>>;

         // build client output schema — public computed fields added as v.unknown()
         // actual values are runtime-derived, schema just needs the keys present
         const extPubEntries: Record<string, AnySchema> = { ...pubEntries };
         const extAllEntries: Record<string, AnySchema> = { ...allEntries };

         const extendedServerOutputSchema = v.object(extAllEntries);
         const extendedClientOutputSchema = v.object(extPubEntries);

         return {
            _serverInput: undefined as unknown as SIn,
            _serverOutput: undefined as unknown as SOut,
            _clientInput: undefined as unknown as CIn,
            _clientOutput: undefined as unknown as COut,
            serverInputSchema,
            serverOutputSchema: extendedServerOutputSchema,
            clientInputSchema,
            clientOutputSchema: extendedClientOutputSchema,
            extendFn: fn as (t: Record<string, unknown>) => Record<string, AnyComputed>,

            clientSchema(): ClientSchema {
               return {
                  input: clientInputSchema,
                  output: extendedClientOutputSchema,
               };
            },
         };
      },
   };
}

const test = kvSchema({
   user: kv.string().internal()
}).extend((t) => ({
   meta: kv.computed(t.user.toUpperCase())
}))

