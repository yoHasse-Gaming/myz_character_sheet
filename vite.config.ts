import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({command}) => ({
  plugins: [
    tailwindcss(),
    svelte()],
  base: command === 'build' ? '/myz_character_sheet/' : '/',
  server: {
    port: 5173,
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
    proxy: {
      '/owlbear_myz_dice': {
        target: 'http://localhost:5174',
        changeOrigin: true
      },
    }
  },
}));
