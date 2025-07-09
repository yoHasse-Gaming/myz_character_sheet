import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte()],
  server: {
    port: 5173,
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
    proxy: {
      '/diceroll': {
        target: 'http://localhost:5174',
        changeOrigin: true
      },
    }
  },
})
