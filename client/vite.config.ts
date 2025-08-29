import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  // vite.config.ts is INSIDE client/, so root should be the same folder ('.' or import.meta.dirname)
  root: path.resolve(import.meta.dirname),

  plugins: [
    react(),
    runtimeErrorOverlay(),
    // keep the replit cartographer plugin only when running inside REPL dev
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],

  resolve: {
    alias: {
      // aliases relative to the client folder
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },

  build: {
    // produce dist inside client/dist (or change to ../dist/public if you want output in repo root)
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "index.html"),
    },
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
