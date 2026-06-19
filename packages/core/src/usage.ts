import { EntityBuilder, Operator } from "./sqlite";

const notNull = Operator({

   Text(ctx) {
      ctx.set({ notNull: true })
   },
})


const db = EntityBuilder({
   async adapter(sql) {
      return sql
   },
   operators: {

   }
})


db.entity({


name:'users',
model:(builder)=>[
builder.text(),

],


})