
//@ts-nocheck


/// checking new possible api patterns

const app = make({


   programs: [],
   hooks: [],
   services: []
})




app.install({


   name: 'queue',



})




const demoSchema = schema('users', (builder) => {
   builder.increments('id')
   builder.string('title').notNullable()
   builder.string('status').defaultTo('draft')
   builder.integer('author_id').unsigned().references(authorSchema.id)
   builder.timestamps(true, true)
})



export const DemoModel = model(demoSchema, (ctx) => {
   
   const post = inject(Post)
   const history = inject(History)

   ctx.method("deleteCascade", async (id: string) => {
      await post.deleteMany({ userId: id })
      await history.deleteMany({ userId: id })
      await ctx.deleteById(id)
   })


   ctx.method("findActive", async () => {
      return m.find({ status: "active" })
   })


   ctx.hook("beforeInsert", (doc) => {
      doc.createdAt = Date.now()
   })



   ctx.hook("afterDelete", (doc) => {
      console.log("deleted:", doc.id)
   })


})

