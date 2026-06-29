import { AnySchema } from "@aromix/validator";
import { Builder } from "../server/builder";
import { loadEnvFile } from "node:process";

export interface ValidateEnvConfig<Schema extends AnySchema> {
   path: string
   schema: Record<string, Schema>
   onError?(err: unknown): void
}

export function ValidateEnv<const Schema extends AnySchema>(config: ValidateEnvConfig<Schema>) {
   const builder = Builder({
      name: 'validate.env',
      setup(state) {
         loadEnvFile(config.path)
         state.port = process.env.PORT ?? 3000
      },
      async launch(server) {
         console.log(process.env);
      },
   })

   function env<Key extends string & keyof typeof config.schema>(key: Key, fallback?: Schema['$base']): Schema['$base'] {
      return (process.env[key as string] ?? fallback) as Schema['$base']
   }

   return [builder, env] as const
}