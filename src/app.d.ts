// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Extend the existing declarations for SvelteKit paths
declare module '$app/paths' {
	export const base: string;
	export const assets: string;
}

export {};
