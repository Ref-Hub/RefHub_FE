import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ mode }) => {
  // 웹앱과 익스텐션을 다르게 빌드할 수 있게 분기 처리
  const isExtension = mode === "extension";

  const plugins = [react()];

  if (isExtension) {
    plugins.push(
      viteStaticCopy({
        targets: [
          { src: "extension/popup.html", dest: "." },
          { src: "extension/manifest.json", dest: "." },
          { src: "extension/images/*", dest: "images" },
        ],
      })
    );
  } else {
    plugins.push(
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
      })
    );
  }

  return {
    publicDir: isExtension ? false : "public",
    plugins,
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },
    build: {
      assetsDir: "assets",
      outDir: isExtension ? "dist-extension" : "dist", // 모드에 따라 빌드 폴더 구분
      rollupOptions: {
        input: isExtension
          ? {
              popup: path.resolve(__dirname, "extension/main.tsx"),
              background: path.resolve(__dirname, "extension/background.ts"),
              content: path.resolve(__dirname, "extension/content-script.ts"),
            }
          : { app: path.resolve(__dirname, "index.html") },
        output: isExtension
          ? {
              entryFileNames: "[name].js",
              chunkFileNames: "[name].js",
            }
          : {
              assetFileNames: (assetInfo) => {
                const info = assetInfo.name.split(".");
                const ext = info[info.length - 1];
                if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                  return `assets/images/[name]-[hash][extname]`;
                }
                return `assets/[name]-[hash][extname]`;
              },
            },
      },
      emptyOutDir: true,
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
              console.log(
                "Sending Request to the Target:",
                req.method,
                req.url
              );
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
  };
});
