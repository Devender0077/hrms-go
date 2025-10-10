import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator(), tailwindcss()],
  server: {
    allowedHosts: true,
    // ✅ Disable caching to prevent old code issues
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },
  // ✅ Disable build cache
  cacheDir: false,
});
