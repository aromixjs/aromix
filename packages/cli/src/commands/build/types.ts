import type esbuild from "esbuild";

export interface TsConfig {
	outDir:  string;
	baseUrl: string;
	paths:   Record<string, string[]>;
}

export interface ResolvedBuildOptions {
	entry:     string[];
	outDir:    string;
	platform:  esbuild.Platform;
	formats:   esbuild.Format[];
	sourcemap: boolean;
	minify:    boolean;
}