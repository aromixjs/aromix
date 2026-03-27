import { action } from "./action";
import { group } from "./group";
import { Hook } from "./hooks";
import { ResponseBuilder } from "./response";

export interface MakeOptions {
  groups: Array<new () => any>;
  hooks?: Hook[];
}

export interface DispatchEntry {
  handler: () => Promise<ResponseBuilder>;
  requestHooks: Hook[];
  responseHooks: Hook[];
  errorHooks: Hook[];
}

export interface AromixDescriptor {
  handlers: Map<string, DispatchEntry>;
}

export function make(options: MakeOptions): AromixDescriptor {
  const descriptor: AromixDescriptor = {
    handlers: new Map(),
  };

  // global hooks

  const globalRequestHooks = options.hooks?.filter((h) => h.event === "request") ?? [];
  const globalResponseHooks = options.hooks?.filter((h) => h.event === "response") ?? [];
  const globalErrorHooks = options.hooks?.filter((h) => h.event === "error") ?? [];

  for (const gp of options.groups) {
    const instance = new gp();
    const groupMeta = group.getMeta(instance);
    const actionMap = action.getMeta(instance);

    if (!groupMeta || !actionMap) continue;

    // group-level scoped hooks
    const groupRequestHooks = groupMeta.hooks.filter((h) => h.event === "request");
    const groupResponseHooks = groupMeta.hooks.filter((h) => h.event === "response");
    const groupErrorHooks = groupMeta.hooks.filter((h) => h.event === "error");

    for (const [methodKey, actionMeta] of Object.entries(actionMap)) {
      const fullKey = `${groupMeta.prefix}:${actionMeta.prefix}`;

      // action-level scoped hooks
      const actionRequestHooks = actionMeta.hooks.filter((h) => h.event === "request");
      const actionResponseHooks = actionMeta.hooks.filter((h) => h.event === "response");
      const actionErrorHooks = actionMeta.hooks.filter((h) => h.event === "error");

      descriptor.handlers.set(fullKey, {
        handler: () => (instance[methodKey] as Function).call(instance),
        requestHooks: [...globalRequestHooks, ...groupRequestHooks, ...actionRequestHooks],
        responseHooks: [...actionResponseHooks, ...groupResponseHooks, ...globalResponseHooks],
        errorHooks: [...actionErrorHooks, ...groupErrorHooks, ...globalErrorHooks],
      });
    }
  }

  return descriptor;
}
