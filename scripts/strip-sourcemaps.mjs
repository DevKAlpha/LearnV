import { readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Source maps are generated (hidden) only so the startup budget can trace which modules
 * reach the entry chunk. They are removed before publishing so the original source is not
 * shipped. Set KEEP_SOURCEMAPS=1 to keep them for local debugging.
 */
if (process.env.KEEP_SOURCEMAPS === "1") {
  console.log("Source maps kept (KEEP_SOURCEMAPS=1).");
} else {
  const root = resolve(process.argv[2] ?? "dist");
  let removed = 0;
  const walk = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith(".map")) { await rm(path); removed += 1; }
    }
  };
  await walk(root);
  console.log(`Removed ${removed} source map(s) from the published build.`);
}
