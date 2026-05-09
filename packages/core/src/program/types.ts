import { CommandCtx } from "../context";
import { Hook } from "../hook";




export type CommandHandler = (ctx: CommandCtx) => any | Promise<any>

export interface Program {
   /** @internal */
   meta: {
      programConfig: {
         name: string;
         hooks?: Hook[];
      };
      commands: Array<{
         name: string;
         hooks: Hook[];
         handler: CommandHandler
      }>;
   };

   command(name: string, handler: CommandHandler): void;
   command(name: string, hooks: Hook[], handler: CommandHandler): void;
}