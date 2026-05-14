import { existsSync, readFileSync } from "node:fs";
import { relative, resolve, join } from "node:path";
import esbuild from "esbuild";
import { build, type AromixBuildConfig, type Format, type Platform } from "@aromix/core";
import type { TsConfig, ResolvedBuildOptions } from "./types";
import { Config } from "./config";
import { Glob } from "./glob";
import { Transformer } from "./transformer";

export class Build {
   readonly root = process.cwd();


   readonly PlatformMap: Record<Platform, esbuild.Platform> = {
      node: "node",
      bun: "node",
      deno: "neutral",
      edge: "neutral",
   }

   readonly FormatMap: Record<Format, esbuild.Format> = {
      esm: "esm",
      cjs: "cjs",
   };






   async run() {
      const config = new Config(this.root);

      const buildConfig = await config.buildConfig()
      const tsConfig = config.tsConfig(buildConfig.tsconfig);

      const opts = this.resolveOptions(buildConfig, tsConfig);

      const glob = new Glob(tsConfig)
      const transformer = new Transformer(glob);

      console.log(
         `Building  ${opts.entry.map((e) => relative(this.root, e)).join(", ")}\n` +
         `       →  ${relative(this.root, opts.outDir)}\n` +
         `  format   ${opts.formats.join(", ")}  platform  ${opts.platform}`
      );

      await Promise.all(
         opts.formats.map((format) =>
            esbuild.build({
               entryPoints: opts.entry,
               outdir: opts.outDir,
               bundle: true,
               format,
               platform: opts.platform,
               sourcemap: opts.sourcemap,
               minify: opts.minify,
               packages: "external",
               plugins: [this.makeLoadPlugin(transformer)],
               outExtension: format === "cjs" ? { ".js": ".cjs" } : {},
            })
         )
      );

      console.log("Done.");
   }

   private resolveOptions(config: AromixBuildConfig, tsConfig: TsConfig): ResolvedBuildOptions {
      const entry = config.entry.map((e) => resolve(this.root, e));

      for (const e of entry) {
         if (!existsSync(e)) throw new Error(`Entry point not found: ${e}`);
      }

      return {
         entry,
         outDir: config.outDir ? resolve(this.root, config.outDir) : tsConfig.outDir,
         platform: this.PlatformMap[config.platform],
         formats: config.format.map((f) => this.FormatMap[f]),
         sourcemap: config.sourcemap,
         minify: config.minify,
      };
   }

   private makeLoadPlugin(transformer: Transformer): esbuild.Plugin {
      return {
         name: "Aromix:Load",
         setup: (build) => {
            build.onLoad({ filter: /\.[tj]sx?$/ }, (args) => {
               const src = readFileSync(args.path, "utf8");
               if (!src.includes("load(")) return undefined;

               return {
                  contents: transformer.transform(args.path),
                  loader: this.inferLoader(args.path),
               };
            });
         },
      };
   }

   private inferLoader(filePath: string): esbuild.Loader {
      if (filePath.endsWith(".tsx")) return "tsx";
      if (filePath.endsWith(".ts")) return "ts";
      if (filePath.endsWith(".jsx")) return "jsx";
      return "js";
   }
}