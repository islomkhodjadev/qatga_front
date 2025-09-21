import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["foydabor.uz", "b3b1d0f090d7.ngrok-free.app"],
    host: "0.0.0.0",
    port: 5173,
  },
});
