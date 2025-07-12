<script lang="ts">
    let {
        dragOverText = "Släpp för att lägga till",
        onDragOver = () => {},
        onDragLeave = () => {},
        onDrop = () => {},
        children
    } = $props();

    let dragOverActive = $state(false);

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
        dragOverActive = true;
        onDragOver(event);
    }

    function handleDragLeave() {
        dragOverActive = false;
        onDragLeave();
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        dragOverActive = false;
        
        const data = event.dataTransfer?.getData('text/plain');
        if (data === 'add-item') {
            onDrop(event);
        }
    }
</script>

<div 
    class="drop-zone"
    class:drag-over={dragOverActive}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="region"
    aria-label="Drop zone för att lägga till föremål"
>
    <div class="drop-zone-hint">
        {#if dragOverActive}
            <div class="drop-hint-text">{dragOverText}</div>
        {/if}
    </div>

    <div class="drop-zone-content">
        {@render children()}
    </div>
</div>

<style>
    /* Drop Zones */
    .drop-zone {
        position: relative;
        transition: all 0.3s ease;
        border-radius: 0.5rem;
    }

    .drop-zone.drag-over {
        background: rgba(217, 119, 6, 0.1);
        border: 2px dashed var(--color-primary-500);
        transform: scale(1.02);
        box-shadow: 0 8px 25px rgba(217, 119, 6, 0.2);
    }

    .drop-zone-hint {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 9999;
    }

    .drop-hint-text {
        background: var(--color-primary-600);
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        animation: pulse 1s ease-in-out infinite alternate;
        z-index: 10000;
        position: relative;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.05); }
    }

    .drop-zone-content {
        position: relative;
        z-index: 1;
    }
</style>
