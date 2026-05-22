import { kv, Model, Storage } from "@aromix/core";

const redis = Storage.kv({
   async get(key) {
      return "datya";
   },
   async set(key, value) { },

   async has(k) {
      return true;
   },
   async delete(key) { },
});




Model.kv({
   base: {
      user: kv.string(),
      address: kv.boolean(),
      verified: kv.boolean().default(false),
      group: kv.object({
         name: kv.string().default('test')
      }),
      permissions: kv.array(kv.string())
   },


})