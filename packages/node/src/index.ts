import {
  ActionNotFoundError,
  AromixDescriptor,
  InvalidResponseError,
  RawRequest,
  requestStorage,
  response,
  ResponseBuilder,
} from "@aromix/core";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { TLSSocket } from "node:tls";
import { parseBody, parseCookies, toWebRequest } from "./utils";

export function serve(descriptor: AromixDescriptor) {
  const server = createServer();

  server.on("request", async (req: IncomingMessage, serverRes: ServerResponse) => {
    const protocol = req.socket instanceof TLSSocket ? "https" : "http";
    const fullUrl = new URL(req.url!, `${protocol}://${req.headers.host}`);
    const webReq = toWebRequest(fullUrl.href, req);
    const action = webReq.headers.get("x-action");
    const entry = action ? descriptor.handlers.get(action) : undefined;

    try {
      if (!action || !entry) throw new ActionNotFoundError(action ?? "unknown");

      const raw: RawRequest = {
        body: await parseBody(webReq),
        headers: Object.fromEntries(webReq.headers.entries()),
        cookies: parseCookies(webReq.headers.get("cookie")),
        ip: req.socket.remoteAddress ?? "",
        action,
      };

      const result = await requestStorage.run(raw, async () => {
        let builder: ResponseBuilder;

        // short circuit if before handler returns any value
        for (const hook of entry.beforeHandlerHooks) {
          const short = await hook.run();
          if (short instanceof ResponseBuilder) {
            builder = short;
            break;
          }
        }

        if (!builder!) {
          const handlerResult = await entry.handler();

          // handler returned something other than ResponseBuilder
          if (!(handlerResult instanceof ResponseBuilder)) {
            throw new InvalidResponseError(`Handler '${action}' must return a ResponseBuilder.`);
          }

          builder = handlerResult;
        }

        for (const hook of entry.afterHandlerHooks) {
          const override = await hook.run(builder);

          if (override instanceof ResponseBuilder) {
            builder = override;
          }
        }

        return builder;
      });

      const reply = result.toReplyValue();
      serverRes.statusCode = reply.status;

      for (const [k, v] of Object.entries(reply.headers)) {
        serverRes.setHeader(k, v);
      }
      if (reply.data !== undefined) {
        serverRes.setHeader("content-type", "application/json");
        serverRes.end(JSON.stringify(reply.data));
      } else {
        serverRes.end();
      }
    } catch (error) {
      const errorHooks = entry?.errorHooks ?? [];
      let result: ResponseBuilder | undefined;

      for (const hook of errorHooks) {
        try {
          const handled = await hook.run(error);
          if (handled instanceof ResponseBuilder) {
            result = handled;
            break;
          }
        } catch {
          continue;
        }
      }

      const fallback = result ?? response.internalError("Something went wrong");
      const reply = fallback.toReplyValue();

      serverRes.statusCode = reply.status;
      for (const [k, v] of Object.entries(reply.headers)) {
        serverRes.setHeader(k, v);
      }

      if (reply.data !== undefined) {
        serverRes.setHeader("content-type", "application/json");
        serverRes.end(JSON.stringify(reply.data));
      } else {
        serverRes.end();
      }
    }
  });

  server.on("listening", async () => {
    for (const hook of descriptor.appStartHooks) {
      await hook.run();
    }
  });

  server.on("close", async () => {
    for (const hook of descriptor.appStopHooks) {
      await hook.run();
    }
  });

  return server;
}
