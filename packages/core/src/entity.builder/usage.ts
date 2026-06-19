import { ax } from '@aromix/validator'
import { SqliteEntityBuilder } from './entity.builder'
import { Operator } from './ddl.chain'

const sqlite = SqliteEntityBuilder({
  async adapter(sql) {
    return sql
  },


  Text: {
    roles: Operator.Text(() => {
      return {
        all: ax.literal('creator')

      }
    })
  },

  Int: {
    min: Operator.Int(() => {
      return {
        select: ax.never()
      }
    })
  }
})

