import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["core/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
  },
  {
    entry: ["examples/1.ts"],
    format: ["esm"],
    dts: false,
    clean: false,
    outDir: "dist/examples",
    experimentalDts: false,
  },
]);
