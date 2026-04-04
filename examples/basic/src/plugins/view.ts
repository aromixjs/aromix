// plugins/view.ts
import type { Plugin, PluginContext } from "@aromix/core";
import { Router } from "./router";

export interface ViewOptions {
  router: Router; // we'll create this below
}

export function view(options: ViewOptions): Plugin {
  return {
    name: "view",
    install(ctx: PluginContext) {
      // Register all routes from the router into Aromix
      for (const route of options.router.routes) {
        ctx.route("GET", route.path, async (req: Request) => {
          const html = await route.render();
          return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        });
      }
    },
  };
}
