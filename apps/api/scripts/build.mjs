import { build } from "esbuild";
import { fileURLToPath } from "node:url";

/**
 * Bundles the API and its dependencies into dist/server.mjs, so the runtime image needs only
 * Node and the SQL migrations. Optional native or edge-only modules stay external.
 */
const root = fileURLToPath(new URL("..", import.meta.url));
await build({
  absWorkingDir: root,
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.mjs",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: false,
  legalComments: "none",
  // PGlite is development-only; pg-native and pg-cloudflare are optional pg back ends.
  external: ["@electric-sql/pglite", "pg-native", "pg-cloudflare", "cloudflare:sockets"],
  // CommonJS dependencies (express, pg) call require() for Node built-ins.
  banner: { js: "import { createRequire as __learnvRequire } from 'node:module'; const require = __learnvRequire(import.meta.url);" },
  logLevel: "warning",
});
console.log("API bundled: dist/server.mjs");
