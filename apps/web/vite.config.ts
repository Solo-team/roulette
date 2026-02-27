import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    // Инжектит Buffer и другие Node.js полифиллы в браузерный бандл
    // Нужно для @ton/core, который использует Buffer внутри
    nodePolyfills({ include: ["buffer"], globals: { Buffer: true } }),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  server: {
    proxy: {
      "/api": { target: "http://localhost:3001" },
    },
  },
});
