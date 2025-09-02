import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["foydabor.uz", "d5bcf9998c5c.ngrok-free.app"],
    host: "0.0.0.0",
    port: 5173,
  },
});
