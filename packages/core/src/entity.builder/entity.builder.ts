import { ax } from "@aromix/validator"
import { ColumnOperator, GroupInput } from "./ddl.chain"

export interface SqliteEntityBuilderInput<Type extends Record<string, GroupInput>> {
   adapter: (sql: string) => Promise<unknown>
   operators?: Type
}


class Builder {
   text<const Col extends string>(col: Col) {
   }

   int<const Col extends string>(col: Col) {
   }

   real<const Col extends string>(col: Col) {
   }

   blob<const Col extends string>(col: Col) {

   }
}


interface EntityInput {
   name: string
   model: (builder: Builder) => any[]
}


export function SqliteEntityBuilder<const Type extends Record<string, GroupInput>>(input: SqliteEntityBuilderInput<Type>) {



   return {
      input,
      entity(input: EntityInput) { }
   }
}





const sqlite = SqliteEntityBuilder({
   async adapter(sql) {
      return sql
   },

   operators: {
      roles: ColumnOperator({
         Text() {
            return {
               all: ax.literal('admin')
            }
         }
      })

   }


})







sqlite.entity({

   name: 'users',
   model: (builder) => [
      builder.int('id')
   ],


})