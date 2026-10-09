// Local Pages-like static server: missing paths use the ROOT 404, not index.html.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, relative } from "node:path";

const root = resolve("dist");
const base = process.env.VITE_BASE_PATH || "/LearnV/";
const port = Number(process.env.PORT || 5176);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === base.slice(0, -1)) { response.writeHead(301, { Location: base + url.search }); response.end(); return; }
    if (!url.pathname.startsWith(base)) throw new Error("outside base");
    let file = resolve(root, decodeURIComponent(url.pathname.slice(base.length)));
    const child = relative(root, file);
    if (child.startsWith("..") || child.includes(":")) throw new Error("outside root");
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith("/")) { response.writeHead(301, { Location: `${url.pathname}/${url.search}` }); response.end(); return; }
      file = resolve(file, "index.html");
    }
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(await readFile(resolve(root, "404.html")));
  }
});
server.listen(port, "127.0.0.1", () => console.log(`Pages preview: http://127.0.0.1:${port}${base} and ${base}qa/`));
