import { Builder } from './col.builder'
import { OperatorDef } from './ddl.chain'

export type OperatorRecord = Record<string, OperatorDef>


export function SqliteEntityBuilder<TextOperator extends OperatorRecord, IntOperator extends OperatorRecord, RealOperator extends OperatorRecord, BlobOperator extends OperatorRecord>(input: {
   adapter: (sql: string) => Promise<unknown>
   Text?: TextOperator
   Blob?: BlobOperator
   Int?: IntOperator
   Real?: RealOperator
}) {



   return {
      input,
   }
}
