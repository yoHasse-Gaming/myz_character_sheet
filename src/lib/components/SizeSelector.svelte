

<script lang="ts">
    import SizeControls from "./SizeControls.svelte";

    let showSizeControls = $state(false);
    let containerWidth = $state(800);
	let containerHeight = $state(600);

    function handleResize(event: CustomEvent<{ width: number; height: number }>) {
        containerWidth = event.detail.width;
        containerHeight = event.detail.height;
    }
</script>

<div class="size-toggle-container">
	<button 
		class="btn variant-filled-surface size-toggle-btn util-btn"
		onclick={() => showSizeControls = !showSizeControls}
		aria-label="Toggle size controls"
		title={showSizeControls ? 'Hide Size Controls' : 'Show Size Controls'}
	>
		📏
	</button>
</div>
{#if showSizeControls}
	<SizeControls 
		currentWidth={containerWidth}
		currentHeight={containerHeight}
		onresize={handleResize}
	/>
{/if}

<style>
    .size-toggle-container {
		position: fixed;
		top: 1rem;
		right: 5rem;
		z-index: 999;
	}
	.size-toggle-btn {
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
</style>
