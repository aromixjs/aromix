import { Adapter } from '../adapter'
import type { Ddl } from '@aromix/lite'
import { Kit } from '../global/kit'

export interface SQLiteEntityInput {
      name: string
      storage: Adapter.SQLite
      model: Record<string, Ddl>
}

export interface SQLiteEntityOutput {
      [Kit.$meta]: {
            name: string
            adapter: Adapter.SQLite
            model: Record<string, Ddl>
      }
}

export function sqlite(configuration: SQLiteEntityInput): SQLiteEntityOutput {
      return {
            [Kit.$meta]: {
                  name: configuration.name,
                  model: configuration.model,
                  adapter: configuration.storage,
            },
      }
}
