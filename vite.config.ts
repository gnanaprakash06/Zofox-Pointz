import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // build
  build: {
    sourcemap: true, // Helpful for debugging production, cursor said need to but that as false since it says production need clarification
  },

  //server
  server: {
    port: 3000, // Optional: set custom port
    open: true, // Optional: auto-open browser
  },

  // alias path
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
