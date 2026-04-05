import { make, serve, inject, Plugin, PluginContext, HttpMethod } from "@aromix/core";
import { UserHandler } from "./handlers/user.handler";
import { DatabaseService } from "./services/db";
import { LoggerService } from "./services/logger";

/**
 * Advanced API Example
 * Illustrating nested DI trees, plugin architecture, and real HTTP routes.
 */
const apiPlugin: Plugin = {
  name: "user-api",
  install(ctx: PluginContext) {
    const handler = inject(UserHandler);

    ctx.service(LoggerService, () => new LoggerService());
    ctx.service(DatabaseService, () => new DatabaseService());
    ctx.service(UserHandler, () => new UserHandler());

    ctx.route("POST", "/user/create", async (req: Request) => {
      const body = await req.json();
      const result = await handler.createUser(body);
      return new Response(JSON.stringify(result.data), { status: result.status });
    });

    ctx.route("GET", "/user/get", async (req: Request) => {
      const url = new URL(req.url);
      const id = url.searchParams.get("id") || "";
      const result = await handler.getUser(id);
      return new Response(JSON.stringify(result.data), { status: result.status });
    });
  },
};

const app = make({ plugins: [apiPlugin] });

serve(app, { port: 4000 });
console.log("🚀 Advanced API up on http://localhost:4000");
console.log("   POST /user/create");
console.log("   GET  /user/get?id=...");
