<script lang="ts">
    import { onMount } from "svelte";

	let isDarkMode = $state(true); // Default to dark mode for your apocalyptic theme


    function toggleTheme() {
		isDarkMode = !isDarkMode;
		updateTheme();
		
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
		
	}

    function updateTheme() {
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

    onMount(() => {
        // Check local storage for theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDarkMode = savedTheme === 'dark';
        } else {
            // Default to dark mode for your apocalyptic theme
            isDarkMode = true;
        }
        updateTheme();
    });

</script>


<div class="theme-toggle-container">
	<button 
		class="btn variant-filled-surface theme-toggle-btn util-btn"
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


<style>
    .theme-toggle-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 999;
	}
</style>
