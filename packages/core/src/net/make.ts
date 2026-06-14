import { KvEntityOutput } from "../kv/entity"
import { SqliteEntityOutput } from "../sqlite/entity.types"
import { ComposeOutput } from "./compose"

export interface RouteEntry {
    entityName: string
    entityType: 'kv' | 'sqlite'
    method: string
}

export interface RouteMap {
    [routeId: string]: RouteEntry
}

export interface NamedRoutes {
    [name: string]: string
}

export interface NetState {
    routes: RouteMap
    namedRoutes: NamedRoutes
    entityNames: string[]
    entities: Record<string, SqliteEntityOutput<any> | KvEntityOutput<any>>
}

export interface NetDescriptor {
    state: NetState
    provide(): {
        with(ctx: { _aromix?: { routes: RouteMap; namedRoutes: NamedRoutes } }): void
    }
}

function generateRouteId(): string {
    return crypto.randomUUID()
}

const sqliteMethods = [
    'findById', 'findOne', 'findMany',
    'count', 'exist', 'insert', 'update', 'upsert',
    'delete', 'deleteById', 'paginate',
] as const

const kvMethods = [
    'get', 'set', 'delete', 'has',
] as const

export function make(input: ComposeOutput): NetDescriptor {
    const routes: RouteMap = {}
    const namedRoutes: NamedRoutes = {}
    const entities: Record<string, SqliteEntityOutput<any> | KvEntityOutput<any>> = {}

    for (const entity of input.sqlite) {
        entities[entity.state.name] = entity
        for (const method of sqliteMethods) {
            const id = generateRouteId()
            routes[id] = { entityName: entity.state.name, entityType: 'sqlite', method }
            namedRoutes[`${entity.state.name}.${method}`] = id
        }
    }

    for (const entity of input.kv) {
        entities[entity.state.name] = entity
        for (const method of kvMethods) {
            const id = generateRouteId()
            routes[id] = { entityName: entity.state.name, entityType: 'kv', method }
            namedRoutes[`${entity.state.name}.${method}`] = id
        }
    }

    const entityNames = Object.keys(entities)

    const state: NetState = { routes, namedRoutes, entityNames, entities }

    return {
        state,
        provide() {
            return {
                with(ctx) {
                    ctx._aromix = { routes, namedRoutes }
                },
            }
        },
    }
}
