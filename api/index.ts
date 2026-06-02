import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";

import type { VercelRequest, VercelResponse } from "@vercel/node";

type WorkerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const clientDist = join(process.cwd(), "dist", "client");

function contentType(pathname: string): string {
  const ext = extname(pathname).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

async function sendNodeResponse(vercelRes: VercelResponse, webRes: Response) {
  vercelRes.status(webRes.status);
  webRes.headers.forEach((value, key) => {
    vercelRes.setHeader(key, value);
  });
  try {
    const ab = await webRes.arrayBuffer();
    vercelRes.send(Buffer.from(ab));
  } catch (err) {
    console.error("[vercel] failed to stream response:", err);
    if (!vercelRes.headersSent) {
      vercelRes.status(500).json({ error: "Internal Server Error" });
    }
  }
}

function serveStaticIfExists(pathname: string, res: VercelResponse): boolean {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const relative = normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(clientDist, relative);
  if (!existsSync(filePath)) return false;

  const body = readFileSync(filePath);
  res.setHeader("content-type", contentType(filePath));
  if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
    res.setHeader("cache-control", "public, max-age=31536000, immutable");
  }
  res.status(200).send(body);
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || "/", "https://placeholder.local");

    // Serve built client assets directly.
    if (serveStaticIfExists(url.pathname, res)) return;

    // Delegate route rendering and API proxying to the built TanStack Start server bundle.
    const mod = (await import("../dist/server/index.js")) as { default: WorkerEntry };
    const app = mod.default;
    const origin = `https://${req.headers.host}`;
    const requestUrl = `${origin}${url.pathname}${url.search}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const method = req.method || "GET";
    const init: RequestInit = { method, headers };
    if (method !== "GET" && method !== "HEAD" && req.body) {
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const webRes = await app.fetch(new Request(requestUrl, init), {}, {});
    await sendNodeResponse(res, webRes);
  } catch (error) {
    console.error("[vercel] handler error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
