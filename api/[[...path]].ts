import type { VercelRequest, VercelResponse } from "@vercel/node";

const backendOrigin =
  (process.env.VITE_API_URL || process.env.API_PROXY_TARGET || "https://prashanth-lawyer-bknd.onrender.com")
    .replace(/\/$/, "");

function resolveApiPath(req: VercelRequest): string {
  const raw = req.url || "/";
  if (raw.startsWith("/api/") && !raw.startsWith("/api/index")) {
    return raw.split("?")[0] || "/api";
  }

  const pathParam = req.query.path;
  const segments = Array.isArray(pathParam) ? pathParam : pathParam ? [String(pathParam)] : [];
  if (segments.length) {
    return `/api/${segments.join("/")}`;
  }

  return "/api";
}

async function proxyToBackend(req: VercelRequest, pathname: string, search: string): Promise<Response> {
  const method = req.method || "GET";
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || key.toLowerCase() === "host") continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD" && req.body !== undefined) {
    init.body =
      typeof req.body === "string"
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body
          : JSON.stringify(req.body);
  }

  return fetch(`${backendOrigin}${pathname}${search}`, init);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pathname = resolveApiPath(req);
    const search = req.url?.includes("?") ? `?${req.url.split("?")[1]}` : "";
    const backendRes = await proxyToBackend(req, pathname, search);

    res.status(backendRes.status);
    const skip = new Set(["content-encoding", "content-length", "transfer-encoding", "connection"]);
    backendRes.headers.forEach((value, key) => {
      if (!skip.has(key.toLowerCase())) res.setHeader(key, value);
    });

    const body = Buffer.from(await backendRes.arrayBuffer());
    res.setHeader("content-length", String(body.length));
    res.send(body);
  } catch (error) {
    console.error("[vercel] api proxy error:", error);
    res.status(502).json({ error: "Bad gateway", detail: String(error) });
  }
}
