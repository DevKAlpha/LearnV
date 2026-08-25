import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(root, "src");
const sourceExtensions = new Set([".ts", ".tsx"]);
const requiredFeatureFolders = ["home", "scholarship", "study", "documents", "profile"];

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : sourceExtensions.has(extname(path)) ? [path] : [];
  });
}

function modulePath(importer, specifier) {
  if (specifier.startsWith("@/")) return normalize(join(sourceRoot, specifier.slice(2)));
  if (specifier.startsWith(".")) return normalize(resolve(dirname(importer), specifier));
  return null;
}

function section(path) {
  return relative(sourceRoot, path).split(sep)[0];
}

function feature(path) {
  const parts = relative(sourceRoot, path).split(sep);
  return parts[0] === "features" ? parts[1] : null;
}

const allowedTargets = {
  domain: new Set(["domain"]),
  infrastructure: new Set(["domain", "infrastructure"]),
  application: new Set(["domain", "infrastructure", "application"]),
  shared: new Set(["domain", "infrastructure", "application", "shared"]),
};

const violations = [];
for (const featureName of requiredFeatureFolders) {
  const expected = join(sourceRoot, "features", featureName);
  if (!existsSync(expected)) violations.push(`Missing feature folder: src/features/${featureName}`);
}

for (const importer of sourceFiles(sourceRoot)) {
  const importerSection = section(importer);
  const importerFeature = feature(importer);
  const content = readFileSync(importer, "utf8");
  const imports = [...content.matchAll(/(?:from\s+|import\s*\()["']([^"']+)["']/g)].map((match) => match[1]);

  for (const specifier of imports) {
    const target = modulePath(importer, specifier);
    if (!target || !target.startsWith(sourceRoot)) continue;
    const targetSection = section(target);

    if (allowedTargets[importerSection] && !allowedTargets[importerSection].has(targetSection)) {
      violations.push(`${relative(root, importer)} cannot import ${specifier}`);
    }

    if (importerSection === "features") {
      if (targetSection === "app") violations.push(`${relative(root, importer)} cannot depend on app composition`);
      const targetFeature = feature(target);
      if (targetFeature && targetFeature !== importerFeature) {
        violations.push(`${relative(root, importer)} cannot reach feature '${targetFeature}' directly`);
      }
    }
  }
}

if (violations.length) {
  console.error("Architecture validation failed:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Architecture boundaries validated.");
