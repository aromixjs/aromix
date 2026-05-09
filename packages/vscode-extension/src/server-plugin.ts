import type ts from "typescript/lib/tsserverlibrary";
import fs from "fs";
import path from "path";

export = function init(modules: { typescript: typeof ts }) {
  function create(info: ts.server.PluginCreateInfo) {
    const projectDir = info.project.getCurrentDirectory();
    
    // Diagnostic log to home folder
    const diagnosticLog = path.join(process.env.HOME || process.env.USERPROFILE || "/tmp", "aromix-diagnostic.log");
    try {
      fs.appendFileSync(diagnosticLog, `[${new Date().toISOString()}] ProjectDir: ${projectDir}\n`);
    } catch(e) {}

    const logFilePath = projectDir.includes("playground")
      ? path.join(projectDir, "aromix-plugin.log")
      : path.join(
          process.env.HOME || process.env.USERPROFILE || "/tmp",
          "aromix-plugin.log"
        );

    function log(message: string, data?: any) {
      const timestamp = new Date().toISOString();
      const line = data 
        ? `[${timestamp}] ${message}\n${JSON.stringify(data, null, 2)}\n`
        : `[${timestamp}] ${message}\n`;
      
      try {
        fs.appendFileSync(logFilePath, line);
      } catch (e) {
        // silently fail if can't write
      }
    }

    // Clear log on init
    try {
      fs.writeFileSync(logFilePath, "");
    } catch (e) {}

    log("=== AROMIX PLUGIN INITIALIZED ===");
    log("Project directory:", info.project.getCurrentDirectory());
    log("Project files:", info.project.getFileNames());

    // Get original service
    const original = info.languageService;

    // Create proxy using proper typing
    const proxy = Object.create(null) as ts.LanguageService;

    // Copy all properties from original
    for (const key of Object.keys(original) as Array<keyof ts.LanguageService>) {
      const value = original[key];
      
      // Only proxy functions
      if (typeof value === 'function') {
        (proxy as any)[key] = function(this: any, ...args: any[]) {
          log(`[CALL] ${key}`, {
            args: args.slice(0, 2), // file, position
          });
          
          const result = (value as Function).apply(original, args);
          
          if (result && key === 'getQuickInfoAtPosition') {
            log(`[QUICKINFO] ${key}`, {
              hasResult: true,
              type: typeof result,
            });
          }
          
          return result;
        };
      } else {
        (proxy as any)[key] = value;
      }
    }

    log("=== PLUGIN READY ===");
    return proxy;
  }

  return { create };
}
