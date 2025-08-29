import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: 'localhost', // Explicitly set the host to 127.0.0.1
    port: 8080, // Optional: Specify a port
  },
  plugins: [react(), tailwindcss(), flowbiteReact()],
});
