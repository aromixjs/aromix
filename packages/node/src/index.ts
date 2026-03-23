import { createServer, IncomingMessage, ServerResponse } from "node:http";
import {
  AromixDescriptor,
  contextStorage,
  RequestContext,
  ResponsePayload,
} from "@aromix/core";
import { AsyncLocalStorage } from "node:async_hooks";

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  return new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: chunks.length ? Buffer.concat(chunks) : null,
  });
}

function toWebResponse(payload: ResponsePayload): Response {
  if (payload.data === undefined) {
    return new Response(null, { status: payload.status });
  }
  const isText = typeof payload.data === "string";
  return new Response(
    isText ? (payload.data as string) : JSON.stringify(payload.data),
    {
      status: payload.status,
      headers: { "Content-Type": isText ? "text/plain" : "application/json" },
    },
  );
}
async function writeNodeResponse(res: ServerResponse, webRes: Response) {
  webRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.writeHead(webRes.status);
  res.end(webRes.body ? Buffer.from(await webRes.arrayBuffer()) : null);
}

export function serve(descriptor: AromixDescriptor) {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const webReq = await toWebRequest(req);
    const action = webReq.headers.get("x-action");

    if (!action || !descriptor.handlers.has(action)) {
      await writeNodeResponse(
        res,
        Response.json({ error: "Action not found" }, { status: 404 }),
      );
      return;
    }

    const context: RequestContext = {
      body: await webReq.json().catch(() => ({})),
      headers: Object.fromEntries(webReq.headers),
      send: ({ status, data }) => ({ status, data }),
    };

    const handler = descriptor.handlers.get(action)!;
    const payload = await contextStorage.run(context, () => handler());

    await writeNodeResponse(res, toWebResponse(payload));
  });
}
