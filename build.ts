import { build } from "bun";

await build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "bun",
  format: "esm",
  sourcemap: "none",
});

console.log("Build complete.");
