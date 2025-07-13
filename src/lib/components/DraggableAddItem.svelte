<script lang="ts">
    let {
        text = "Dra för att lägga till",
        ariaLabel = "Dra för att lägga till föremål", 
        variant = "variant-6",
        dragType = "add-item",
        position = { top: 120, right: -60 },
        onDragStart = () => {},
        onDragEnd = () => {}
    } = $props();

    let isDragging = $state(false);

    function handleDragStart(event: DragEvent) {
        isDragging = true;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData('text/plain', dragType);
        }
        onDragStart();
    }

    function handleDragEnd() {
        isDragging = false;
        onDragEnd();
    }
</script>

<div class="draggable-add-container" style="top: {position.top}px; right: {position.right}px;">
    <div 
        class="draggable-add-item torn-input-wrapper {variant}"
        role="button"
        tabindex="0"
        aria-label={ariaLabel}
        draggable="true"
        data-drag-type="{dragType}"
        ondragstart={handleDragStart}
        ondragend={handleDragEnd}
        class:dragging={isDragging}
    >
        <div class="add-item-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span class="add-item-text">{text}</span>
        </div>
    </div>
</div>

<style>
    /* Draggable Add Item */
    .draggable-add-container {
        position: fixed;
        z-index: 100;
        transition: right 0.3s ease;
    }

    .draggable-add-container:hover {
        right: 20px !important; /* Slide fully into view on hover */
    }

    .draggable-add-item {
        padding: 1rem;
        cursor: grab;
        user-select: none;
        transition: all 0.3s ease;
        transform: rotate(3deg);
        animation: float 3s ease-in-out infinite;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .draggable-add-item:hover {
        transform: rotate(0deg) scale(1.05);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
    }

    .draggable-add-item.dragging {
        cursor: grabbing;
        transform: rotate(-5deg) scale(0.9);
        opacity: 0.8;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .add-item-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-primary-600);
        position: relative;
        z-index: 1;
    }

    .add-item-content svg {
        color: var(--color-primary-700);
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
        position: relative;
        z-index: 2;
        stroke: currentColor;
    }

    :global(.dark) .add-item-content svg {
        color: var(--color-primary-400);
    }

    .add-item-text {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: center;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        color: var(--color-primary-700);
        position: relative;
        z-index: 2;
    }

    :global(.dark) .add-item-text {
        color: var(--color-primary-300);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    @keyframes float {
        0%, 100% { transform: rotate(3deg) translateY(0px); }
        50% { transform: rotate(3deg) translateY(-8px); }
    }

    /* Responsive adjustments for draggable item */
    @media (max-width: 768px) {
        .draggable-add-container {
            position: static;
            right: auto;
            margin-bottom: 2rem;
            display: flex;
            justify-content: center;
        }

        .draggable-add-container:hover {
            right: auto;
        }
        
        .draggable-add-item {
            animation: none;
            transform: rotate(0deg);
        }
    }
</style>
