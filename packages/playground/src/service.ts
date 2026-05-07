//@ts-nocheck




const MailService = provide((ctx) => {
   let client: SMTPClient
   const sent: string[] = []

   ctx.onReady(async () => {

      client = await SMTP.connect(ctx.config('mail'))
   })

   ctx.onClose(async () => {
      await client.disconnect()
   })

   async function send(to: string, subject: string, body: string) {
      const logger = ctx.use(LoggerService)

      try {
         await client.send({ to, subject, body })
         sent.push(to)
         logger.info(`mail sent to ${to}`)
      } catch (err) {
         logger.error(`failed to send to ${to}`, err)
         throw err
      }
   }


   function formatBody(body: string) {
      return body.trim().replace(/\n{3,}/g, '\n\n')
   }

   function sentHistory() {
      return [...sent]
   }

   ctx.expose({ send, sentHistory })
})



const UserService = provide((ctx) => {


   const mail = ctx.use(MailService)
   const users = ctx.use(UserModel)

   async function create(data: CreateUserData) {
      const existing = await users.findByEmail(data.email)
      if (existing) throw new ConflictError('email taken')

      const user = await users.insert(data)

      await mail.send(
         user.email,
         'Welcome to the app',
         `Hi ${user.name}, your account is ready.`
      )

      return user
   }

   async function deactivate(id: string) {
      const user = await users.findById(id)
      if (!user) throw new NotFoundError()

      await users.update(id, { status: 'inactive' })
      await mail.send(user.email, 'Account deactivated', 'Your account has been deactivated.')
   }


   function validateAge(dob: Date) {
      return Date.now() - dob.getTime() > 18 * 365 * 24 * 60 * 60 * 1000
   }

   ctx.expose({ create, deactivate })
})