import { CommandCtx, SocketCtx, StreamCtx } from "./context";
import { Hook } from "./hooks";
import { Service } from "./service";

export interface ProgramConfig {
  name: string;
  services?: Record<PropertyKey, Service>;
  hooks?: Hook[];
}

interface RouteEntry {
  name: string;
  hooks: Hook[];
  handler: (ctx: any) => unknown;
}

interface ProgramMeta {
  config: ProgramConfig;
  commands: RouteEntry[];
  streams: RouteEntry[];
  sockets: RouteEntry[];
}


export interface Program {
  command(name: string, handler: (ctx: CommandCtx) => unknown): void;
  command(
    name: string,
    hooks: Hook[],
    handler: (ctx: CommandCtx) => unknown,
  ): void;

  stream(name: string, handler: (ctx: StreamCtx) => unknown): void;
  stream(
    name: string,
    hooks: Hook[],
    handler: (ctx: StreamCtx) => unknown,
  ): void;

  socket(name: string, handler: (ctx: SocketCtx) => void): void;
  socket(name: string, hooks: Hook[], handler: (ctx: SocketCtx) => void): void;


  /** @internal */
  meta: ProgramMeta
}

export function program(config: ProgramConfig): Program {

  const meta: ProgramMeta = {
    config: {
      name: config.name,
      services: config.services ?? {},
      hooks: config.hooks ?? [],
    },
    commands: [],
    streams: [],
    sockets: [],
  };


  const resolve = (hookOrHandler: Hook[] | RouteEntry['handler'], handler?: RouteEntry['handler']) => {
    if (Array.isArray(hookOrHandler)) {
      return { hooks: hookOrHandler, handler: handler! }
    } else {
      return { hooks: [], handler: hookOrHandler }
    }
  }



  return {
    meta,
    command(name: string, hookOrHandler: any, handler?: any) {
      meta.commands.push({
        name,
        ...resolve(hookOrHandler, handler)
      })
    },
    stream(name: string, hookOrHandler: any, handler?: any) {
      meta.streams.push({ name, ...resolve(hookOrHandler, handler) })
    },
    socket(name: string, hookOrHandler: any, handler?: any) {
      meta.sockets.push({ name, ...resolve(hookOrHandler, handler) });
    },
  };
}
