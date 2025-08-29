import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async () => ({
  root: path.resolve(import.meta.dirname),   // client/ is root
  base: "./",                                // make assets relative

  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [(await import("@replit/vite-plugin-cartographer")).cartographer()]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },

  build: {
    outDir: path.resolve(import.meta.dirname, "dist"), // client/dist
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "index.html"),
    },
  },

  server: {
    fs: { strict: true, deny: ["**/.*"] },
  },
}));
