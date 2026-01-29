import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "RescueGrid",
        short_name: "RescueGrid",
        description: "Localized Disaster Shelter Allocation Intelligence",
        theme_color: "#050814",
        background_color: "#050814",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "favicon.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "favicon.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
      },
    }),
  ],
});
