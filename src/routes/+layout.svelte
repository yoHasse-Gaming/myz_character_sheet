<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
    

    let { children } = $props();

	const browser = typeof window !== 'undefined';

	let isDarkMode = $state(true); // Default to dark mode for your apocalyptic theme

	// Theme toggle functionality
	function toggleTheme() {
		isDarkMode = !isDarkMode;
		updateTheme();
		if (browser) {
			localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
		}
	}

	function updateTheme() {
		if (browser) {
			const html = document.documentElement;
			// Clear both classes first
			html.classList.remove('dark', 'light');
			
			if (isDarkMode) {
				html.classList.add('dark');
			} else {
				html.classList.add('light');
			}
			
			// Also update the data-theme for skeleton
			document.body.setAttribute('data-theme', 'vintage');
		}
	}

	// Initialize theme on mount
	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('theme');
			if (savedTheme) {
				isDarkMode = savedTheme === 'dark';
			} else {
				// Default to dark mode for the apocalyptic feel
				isDarkMode = true;
			}
			updateTheme();
		}
	});
</script>

<svelte:head>
	<title>Mutant: Year Zero Character Sheet</title>
</svelte:head>

<!-- Theme Toggle Button -->
<div class="theme-toggle-container">
	<button 
		class="btn variant-filled-surface theme-toggle-btn"
		onclick={toggleTheme}
		aria-label="Toggle dark/light mode"
		title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
	>
		{#if isDarkMode}
			<!-- Sun icon for switching to light mode -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="5"></circle>
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
			</svg>
		{:else}
			<!-- Moon icon for switching to dark mode -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
			</svg>
		{/if}
	</button>
</div>

<!-- Main Content -->
<main class="container mx-auto px-4 py-8">
	{@render children?.()}
</main>

<style>
	.theme-toggle-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 999;
	}

	.theme-toggle-btn {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		background: linear-gradient(135deg, #d97706, #b45309) !important;
		border: 2px solid #78350f;
		color: #fef3c7 !important;
	}

	.theme-toggle-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
	}

	:global(.light) .theme-toggle-btn {
		background: linear-gradient(135deg, #525252, #404040) !important;
		border-color: #737373;
		color: #f5f5f5 !important;
	}
</style>
