import { Hook } from "./hooks";
import { Program } from "./program";
import { Service } from "./service";

interface StaticConfig {
   path: string;
   prefix?: string;
   cache?: {
      maxAge?: number;
      immutable?: boolean;
   };
}


export interface AppMeta {
   programs: Program[];
   hooks: Hook[];
   services: Record<PropertyKey, Service>;
   statics: StaticConfig[];
   plugins: Array<{ plugin: Plugin<any>; options: unknown }>;
}

export interface Plugin<TOptions = unknown> {
   name: string;
   install(ctx: AppMeta, options?: TOptions): void | Promise<void>;
}

interface MakeConfig {
   programs?: Array<Program>,
   hooks?: Array<Hook>,
   services?: Record<PropertyKey, Service>
}

export interface App {
   /** @internal */
   meta: AppMeta;
   install<TOptions>(plugin: Plugin<TOptions>, options?: TOptions): void;
   static(config: StaticConfig): void;
}


export function make(config: MakeConfig): App {
   const meta: AppMeta = {
      programs: config.programs ?? [],
      hooks: config.hooks ?? [],
      services: config.services ?? {},
      statics: [],
      plugins: [],
   };

   return {
      meta,
      install(plugin, options) {
         meta.plugins.push({ plugin, options });
      },

      static(config) {
         meta.statics.push(config);
      },
   };
}