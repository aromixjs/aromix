import { Format, Platform } from "@aromix/core";
import { Answers, PackageManager } from "./types";
import * as p from "@clack/prompts";
import { join, resolve } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";


export class Init {

   private readonly TypesPackage: Record<Platform, string> = {
      node: "@types/node",
      bun: "bun-types",
      deno: "",  // built-in types, no package needed
      edge: "@cloudflare/workers-types",
   };

   private readonly InstallCmd: Record<PackageManager, string> = {
      npm: "npm install",
      bun: "bun install",
      pnpm: "pnpm install",
      yarn: "yarn install",
   };


   async run() {



      p.intro("Aromix — new project");

      const answers = await p.group(
         {
            name: () =>
               p.text({
                  message: "Project name",
                  placeholder: "my-app",
                  validate: (v) => (!v?.trim() ? "Name is required" : undefined),
               }),

            platform: () =>
               p.select<Platform>({
                  message: "Target runtime",
                  options: [
                     { value: "node", label: "Node.js" },
                     { value: "bun", label: "Bun" },
                     { value: "deno", label: "Deno" },
                     { value: "edge", label: "Cloudflare Workers (edge)" },
                  ],
               }),

            format: () =>
               p.multiselect<Format>({
                  message: "Output format",
                  options: [
                     { value: "esm", label: "ESM", hint: "recommended" },
                     { value: "cjs", label: "CJS" },
                  ],
                  initialValues: ["esm"],
                  required: true,
               }),

            packageManager: () =>
               p.select<PackageManager>({
                  message: "Package manager",
                  options: [
                     { value: "npm", label: "npm" },
                     { value: "bun", label: "bun" },
                     { value: "pnpm", label: "pnpm" },
                     { value: "yarn", label: "yarn" },
                  ],
               }),
         },
         {
            onCancel: () => {
               p.cancel("Cancelled.");
               process.exit(0);
            },
         }
      );




      const dir = resolve(process.cwd(), answers.name);

      if (existsSync(dir)) {
         p.cancel(`Directory "${answers.name}" already exists.`);
         process.exit(1);
      }

      mkdirSync(dir, { recursive: true });

      const spinner = p.spinner();
      spinner.start("Writing project files");


      this.writePackageJson(dir, answers);
      this.writeTsConfig(dir, answers.platform);
      this.writeAromixBuild(dir, answers);
      this.writeEntryPoint(dir);


      spinner.stop("Project files written");
      spinner.start(`Installing dependencies with ${answers.packageManager}`);


      try {

         execSync(this.InstallCmd[answers.packageManager], { cwd: dir, stdio: "ignore" });
         spinner.stop("Dependencies installed");


      } catch (error) {
         spinner.stop("Install failed — run it manually:");
         p.note(`cd ${answers.name}\n${this.InstallCmd[answers.packageManager]}`);
      }

      p.outro(`Done. Get started:\n\n  cd ${answers.name}\n  aromix build`);

   }



   private writePackageJson(dir: string, answers: Answers) {
      const typesPackage = this.TypesPackage[answers.platform];
      let src = this.readTemplate("package.json.tpl");

      if (!typesPackage) {
         src = src.replace(/\s+"{{types_package}}": "latest",?\n/, "\n");
      }

      writeFileSync(
         join(dir, "package.json"),
         this.render(src, { name: answers.name, types_package: typesPackage }),
         "utf8"
      );
   }




   private writeTsConfig(dir: string, platform: Platform) {
      writeFileSync(
         join(dir, "tsconfig.json"),
         this.readTemplate(`tsconfig.${platform}.json`),
         "utf8"
      );
   }

   private writeAromixBuild(dir: string, answers: Answers) {
      const src = this.render(this.readTemplate("aromix.build.ts.tpl"), {
         platform: answers.platform,
         format: answers.format.map((f) => `"${f}"`).join(", "),
      });

      writeFileSync(join(dir, "aromix.build.ts"), src, "utf8");
   }



   private writeEntryPoint(dir: string) {
      mkdirSync(join(dir, "src"), { recursive: true });
      writeFileSync(join(dir, "src", "index.ts"), this.readTemplate("index.ts.tpl"), "utf8");
   }



   private readTemplate(filename: string): string {
      return readFileSync(join(__dirname, "templates", filename), "utf8");
   }


   private render(template: string, tokens: Record<string, string>): string {
      return Object.entries(tokens).reduce(
         (src, [key, value]) => src.replaceAll(`{{${key}}}`, value),
         template
      );
   }

}