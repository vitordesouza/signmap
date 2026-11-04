import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { birthDraftSchema } from "../src/schemas/birth";
/** Runtime-only dev middleware. Private data is never imported into an app bundle. */
export function localBirthData(): Plugin {
  return {
    name: "mapa-local-birth-data",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/__local/birth-data") return next();
        res.setHeader("Cache-Control", "no-store");
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end();
          return;
        }
        try {
          const draft = birthDraftSchema.parse(
            JSON.parse(readFileSync(resolve("output/private/birth-draft.json"), "utf8")),
          );
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(draft));
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            res.statusCode = 204;
            res.end();
          } else {
            res.statusCode = 500;
            res.end("Invalid local birth prefill. Check output/private/birth-draft.json.");
          }
        }
      });
    },
  };
}
