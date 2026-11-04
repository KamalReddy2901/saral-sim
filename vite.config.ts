/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cloudflare Pages / Vercel / Netlify serve from "/". For GitHub Pages project
// sites build with:  BASE_PATH=/repo-name/ npm run build
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1100,
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
  },
});
