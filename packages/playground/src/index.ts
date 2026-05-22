import { kv, Storage, KvField } from "@aromix/core";

const schema = {
   id: kv.bigint(),

   name: kv.string().default("test"),

   age: kv.number().default(18),

   active: kv.boolean().default(true),

   createdAt: kv.date().default(new Date()),

   avatar: kv.buffer(),

   metadata: kv.object().default({
      theme: "dark",
      language: "en",
   }),

   tags: kv.array().default([]),

   anything: kv.any(),
};



function resolve() {


   const resolvedMeta: any = {}

   for (const key in schema) {
      //@ts-ignore
      resolvedMeta[key] = schema[key][KvField.$def]
   }

   console.log(resolvedMeta);



}


resolve()