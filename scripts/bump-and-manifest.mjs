import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

const packageList = [
  { name: "@aromix/core", file: "packages/core/package.json" },
  { name: "@aromix/bun", file: "packages/bun/package.json" },
  { name: "@aromix/cloudflare", file: "packages/cloudflare/package.json" },
  { name: "@aromix/cli", file: "packages/cli/package.json" },
];

// Read all versions before bump
const before = {};

for (const entry of packageList) {
  const content = readFileSync(entry.file, "utf8");
  const parsed = JSON.parse(content);

  before[entry.name] = parsed.version;
}

// Beachball does the bumping
execSync("npx beachball bump --yes", { stdio: "inherit" });

// Find what changed
const bumped = [];

for (const entry of packageList) {
  const content = readFileSync(entry.file, "utf8");
  const parsed = JSON.parse(content);

  if (before[entry.name] !== parsed.version) {
    bumped.push({ name: entry.name, version: parsed.version });
  }
}

const result = JSON.stringify({ packages: bumped }, null, 2);
writeFileSync(".bumped.json", result);
