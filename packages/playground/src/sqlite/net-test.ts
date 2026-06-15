import { Database } from 'bun:sqlite'
import { createSqliteAdapter, lite, SqliteEntity, compose, make } from '@aromix/core'
import { serve } from '@aromix/bun'
import { encode, decode } from '@msgpack/msgpack'

const bunDb = Database.open(':memory:')

const adapter = createSqliteAdapter({
    async query(sql: string) {
        const rows = bunDb.query(sql).all()
        return rows
    },
})

const UserEntity = SqliteEntity({
    name: 'users',
    adapter,
    columns: {
        id: lite.int().primaryKey().autoIncrement(),
        name: lite.text().notNull(),
        email: lite.text().notNull().unique('conflict:error'),
        age: lite.int().notNull().gte(0),
    },
    options() {},
})

// Create table + seed data
bunDb.run(UserEntity.toSql())
await UserEntity.insert({ name: 'Alice', email: 'alice@test.com', age: 30 })
await UserEntity.insert({ name: 'Bob', email: 'bob@test.com', age: 25 })

// Build the network descriptor
const composed = compose({ entities: [UserEntity] })
const descriptor = make(composed)

console.log('=== Routes ===')
for (const [id, entry] of Object.entries(descriptor.state.routes)) {
    console.log(`  ${id}  →  ${entry.entityName}.${entry.method} (${entry.entityType})`)
}

// Start the WS server
const server = await serve({ descriptor, port: 3010 })
console.log(`\nWS server running on ws://localhost:3010`)

// Connect a WS client and test
const ws = new WebSocket('ws://localhost:3010')

ws.binaryType = 'arraybuffer'

await new Promise<void>((resolve) => {
    ws.onopen = () => {
        console.log('\n=== Client connected ===')
        resolve()
    }
})

async function sendRoute(routeName: string, data?: unknown): Promise<unknown> {
    const routeId = descriptor.state.namedRoutes[routeName]
    if (!routeId) throw new Error(`Unknown route: ${routeName}`)

    ws.send(encode({ route: routeId, data }))

    return await new Promise((resolve, reject) => {
        const handler = (event: MessageEvent) => {
            ws.removeEventListener('message', handler)
            const response = decode(new Uint8Array(event.data as ArrayBuffer)) as any
            if (response.error) reject(new Error(response.error))
            else resolve(response.data)
        }
        ws.addEventListener('message', handler)
        setTimeout(() => reject(new Error('Timeout')), 3000)
    })
}

// Test all major operations
try {
    console.log('\n--- findMany ---')
    const all = await sendRoute('users.findMany')
    console.log('All users:', JSON.stringify(all))

    console.log('\n--- findById ---')
    const user = await sendRoute('users.findById', 1)
    console.log('User 1:', JSON.stringify(user))

    console.log('\n--- findOne ---')
    const bob = await sendRoute('users.findOne', { name: 'Bob' })
    console.log('Bob:', JSON.stringify(bob))

    console.log('\n--- count ---')
    const count = await sendRoute('users.count')
    console.log('Count:', count)

    console.log('\n--- exist ---')
    const exists = await sendRoute('users.exist', { email: 'alice@test.com' })
    console.log('Alice exists:', exists)

    console.log('\n--- insert ---')
    const inserted = await sendRoute('users.insert', { name: 'Charlie', email: 'charlie@test.com', age: 35 })
    console.log('Inserted:', JSON.stringify(inserted))

    console.log('\n--- update ---')
    const updated = await sendRoute('users.update', [{ id: 1 }, { name: 'Alice Updated' }])
    console.log('Updated:', JSON.stringify(updated))

    console.log('\n--- paginate ---')
    const page = await sendRoute('users.paginate', [undefined, { page: 1, pageSize: 10 }])
    console.log('Page:', JSON.stringify(page))

    console.log('\n--- deleteById ---')
    const deleted = await sendRoute('users.deleteById', 2)
    console.log('Deleted:', JSON.stringify(deleted))

    console.log('\n=== All net tests passed! ===')
} catch (err) {
    console.error('Test failed:', err)
} finally {
    ws.close()
    server.stop()
    bunDb.close()
}
