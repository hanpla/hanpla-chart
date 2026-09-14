import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api/upbit": {
        target: "https://api.upbit.com/v1",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/upbit/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-charts": ["lightweight-charts"],
          "vendor-query": ["@tanstack/react-query", "@tanstack/react-virtual"],
          "vendor-react": ["react", "react-dom", "zustand"],
        },
      },
    },
  },
});
