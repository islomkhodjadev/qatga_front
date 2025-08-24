import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["foydabor.uz", "4aa60bbbf73f.ngrok-free.app"],
    host: "0.0.0.0",
    port: 5173,
  },
});
