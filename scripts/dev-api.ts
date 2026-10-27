/**
 * Local stand-in for Vercel Functions: serves the handlers in /api on port 3001
 * so `vite dev` can proxy /api/* to it (see vite.config.ts). Production does not
 * use this file — Vercel runs api/*.ts itself.
 *
 *   npx tsx scripts/dev-api.ts
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { POST as agentPost } from "../api/agent.js";

type Handler = (req: Request) => Promise<Response>;

const routes: Record<string, Partial<Record<string, Handler>>> = {
  "/api/agent": { POST: agentPost },
};

const PORT = Number(process.env.DEV_API_PORT || 3001);

function toRequest(req: IncomingMessage): Request {
  const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value !== undefined) headers.set(key, value);
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
    // required by Node's fetch when streaming a request body
    ...(hasBody ? { duplex: "half" } : {}),
  } as RequestInit);
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if (!response.body) return res.end();
  // Stream chunk by chunk so the chat renders tokens as they arrive.
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}

createServer(async (req, res) => {
  const path = (req.url ?? "/").split("?")[0];
  const handler = routes[path]?.[req.method ?? "GET"];
  if (!handler) {
    res.statusCode = 404;
    return res.end("Not found");
  }
  try {
    await send(res, await handler(toRequest(req)));
  } catch (err) {
    console.error("[dev-api]", err);
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  }
}).listen(PORT, () => console.log(`[dev-api] serving /api on http://localhost:${PORT}`));
