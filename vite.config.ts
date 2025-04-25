import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { splitVendorChunkPlugin } from "vite";
import { compression } from "vite-plugin-compression2";
import { visualizer } from "rollup-plugin-visualizer";
import type { UserConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    compression({
      algorithm: "gzip",
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["images/icon.svg"],
      manifest: {
        short_name: "RefHub",
        name: "RefHub - 레퍼런스 허브",
        description:
          "모든 레퍼런스를 한 곳에서 관리하세요. 기획자, 디자이너를 위한 통합 레퍼런스 관리 플랫폼입니다.",
        icons: [
          {
            src: "/images/icon.svg",
            type: "image/svg+xml",
            sizes: "any",
            purpose: "any maskable",
          },
        ],
        id: "/",
        start_url: "/",
        display: "standalone",
        theme_color: "#52C39C",
        background_color: "#ffffff",
        orientation: "any",
        categories: ["productivity", "utilities"],
        lang: "ko-KR",
        dir: "ltr",
        prefer_related_applications: false,
        scope: "/",
        display_override: ["window-controls-overlay"],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 3000000,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  build: {
    target: "esnext",
    minify: "terser",
    sourcemap: process.env.NODE_ENV === "development",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }
            if (id.includes("@headlessui") || id.includes("@heroicons")) {
              return "ui-vendor";
            }
            if (
              id.includes("date-fns") ||
              id.includes("axios") ||
              id.includes("zustand")
            ) {
              return "utils-vendor";
            }
            return "vendor";
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: ["@headlessui/react", "@heroicons/react"],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://refhub.site",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
} as UserConfig);
