## Provider

A self-contained unit of logic with optional lifecycle, private internals, and a defined public surface. The definition has no opinion on how it gets instantiated — that is purely a caller concern.

### Definition

```ts
const MailProvider = provide((ctx) => {
  let client: SMTPClient

  ctx.onReady(async () => {
    client = await SMTP.connect(ctx.config('mail'))
  })

  ctx.onClose(async () => {
    await client.disconnect()
  })

  async function send(to: string, subject: string, body: string) {
    await client.send({ to, subject, body })
  }

  function history() {
    return [...sent]
  }

  ctx.expose({ send, history })
})
```

- everything defined inside is private by default
- `ctx.expose()` is the only public surface — one call, explicit
- `ctx.onReady()` — async init, runs before app accepts requests
- `ctx.onClose()` — teardown, runs on app shutdown
- no return, no self, no class

### Cross-communication

```ts
const UserProvider = provide((ctx) => {
  const mail = MailProvider        // singleton — just import and call
  const db = ctx.use(DbProvider)   // when scope inheritance matters

  async function create(data: CreateUserData) {
    const user = await UserModel.insert(data)
    await mail.send(user.email, 'Welcome', '...')
    return user
  }

  ctx.expose({ create })
})
```

- singleton providers are just imported and called directly
- `ctx.use()` only needed when the caller's scope must propagate down

### Instantiation modes

Defined at call site, never at definition time.

```ts
// singleton — lazy by default, initialized on first call
MailProvider.send(to, subject, body)

// eager singleton — initialized at app start
app.eagerLoad(MailProvider)

// transient — fresh instance every call
const builder = ctx.transient(ReportProvider)

// scoped — one instance per key
const tenant = ctx.scoped(TenantProvider, tenantId)
const request = ctx.scoped(RequestProvider, ctx.requestId)
```

### Lifecycle rules

| has `onReady`? | instantiation |
|---|---|
| yes | use `app.eagerLoad()` — otherwise first caller blocks on init |
| no | lazy is free, no penalty |

Framework warns at startup if a provider has `onReady` but is not eager loaded.

### Usage in programs

No registration in program config. Import and call directly.

```ts
userProgram.command('Register', async (ctx) => {
  const user = await UserProvider.create(ctx.args(CreateUserData))
  return user
})

userProgram.command('TenantReport', async (ctx) => {
  const report = ctx.scoped(ReportProvider, ctx.args(Args).tenantId)
  return report.generate()
})
```

### Plugin ownership

Agents do not need to be registered in plugins. Plugin registration only needed for eager loading:

```ts
export const mailPlugin = plugin((app) => {
  app.eagerLoad(MailProvider)   // has onReady — must be eager
  app.program(mailProgram)
})

export const userPlugin = plugin((app) => {
  app.program(userProgram)
  // UserProvider not mentioned — lazy, no init cost
})
```

### Type safety

Return type of `ctx.expose()` becomes the public interface. Calling any non-exposed property or method is a type error.

```ts
MailProvider.send(to, subject, body)   // ✅
MailProvider.client                    // ❌ type error — not exposed
MailProvider.history()                 // ✅
```

`ctx.transient()` and `ctx.scoped()` return the same type as the direct call — inferred from `ctx.expose()`.
