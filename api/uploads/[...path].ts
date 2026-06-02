import type { VercelRequest, VercelResponse } from "@vercel/node";

const backendOrigin =
  (process.env.VITE_API_URL || process.env.API_PROXY_TARGET || "https://prashanth-lawyer-bknd.onrender.com")
    .replace(/\/$/, "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pathParam = req.query.path;
    const segments = Array.isArray(pathParam) ? pathParam : pathParam ? [String(pathParam)] : [];
    const pathname = `/uploads/${segments.join("/")}`;
    const search = req.url?.includes("?") ? `?${req.url.split("?")[1]}` : "";

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

    const backendRes = await fetch(`${backendOrigin}${pathname}${search}`, init);

    res.status(backendRes.status);
    const skip = new Set(["content-encoding", "content-length", "transfer-encoding", "connection"]);
    backendRes.headers.forEach((value, key) => {
      if (!skip.has(key.toLowerCase())) res.setHeader(key, value);
    });

    const body = Buffer.from(await backendRes.arrayBuffer());
    res.setHeader("content-length", String(body.length));
    res.send(body);
  } catch (error) {
    console.error("[vercel] uploads proxy error:", error);
    res.status(502).json({ error: "Bad gateway", detail: String(error) });
  }
}
