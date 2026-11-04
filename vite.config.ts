import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { cpSync } from "node:fs";
import { resolve } from "node:path";
import { localBirthData } from "./scripts/local-birth-data";

export default defineConfig(({ mode }) => ({
  server: {
    port: 5174,
    strictPort: true,
    watch: {
      ignored: [
        "**/output/**",
        "**/.output/**",
        "**/.vercel/**",
        "**/.venv/**",
        "**/prompt-files/**",
        "**/src/generated/**",
        "**/openapi.json",
      ],
    },
  },
  plugins: [
    localBirthData(),
    tanstackStart(),
    nitro({
      preset: mode === "vercel" ? "vercel" : "node-server",
      traceDeps: ["sweph*"],
      vercel: { functions: { maxDuration: 120 } },
      hooks: {
        compiled(nitro) {
          cpSync(resolve("ephemeris"), resolve(nitro.options.output.serverDir, "ephemeris"), {
            recursive: true,
          });
        },
      },
    }),
    react(),
  ],
  ssr: { external: ["sweph"] },
}));
