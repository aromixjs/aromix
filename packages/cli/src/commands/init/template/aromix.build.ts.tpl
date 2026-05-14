import { build } from "@aromix/core";

export default build({
  entry:     ["src/index.ts"],
  outDir:    "dist",
  platform:  "{{platform}}",
  format:    [{{format}}],
  tsconfig:  "tsconfig.json",
  sourcemap: true,
  minify:    false,
});
