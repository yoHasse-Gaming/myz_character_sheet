import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const repo = 'myz_character_sheet';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	build: {
		target: 'esnext' // Support top-level await
	},
	server: {
		open: `/${repo}/`                           // convenience: browser tab opens at the right URL
	}
});
