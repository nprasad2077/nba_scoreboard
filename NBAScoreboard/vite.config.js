// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgo: true,
      svgoConfig: {
        plugins: [{ removeViewBox: false }],
      },
    }),
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  define: {
    "process.env": {},
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    commonjsOptions: {
      include: [],
    },
  },
});
