<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, closeDialogueOption, isDialogueOpen } from '../../states/character_sheet.svelte';
    import type { Mutation } from '../../types';
    import mutations from '../../data/mutations.json';

    // Get the modal state from the global dialogue system
    let carouselContainer: HTMLElement | null = $state(null);
    let currentMutationIndex = $state(0);
    let isScrolling = $state(false);

    // Get available mutations
    const availableMutations: Mutation[] = mutations;
    
    // Use all mutations without filtering
    const filteredMutations = $derived(() => availableMutations);
    
    // Check if a mutation is already selected
    function isMutationSelected(mutationId: string): boolean {
        return sheetState.mutations.some(m => m.id === mutationId);
    }
    
    // Generate unique variants for mutation cards
    const mutationVariants = generateUniqueVariants(availableMutations.length);
    
    function selectMutation(mutation: Mutation) {
        if (isMutationSelected(mutation.id)) {
            characterActions.removeMutation(mutation.id);
        } else {
            const selectedMutation: Mutation = mutation;
            characterActions.addMutation(selectedMutation);
            // Automatically close the modal after selection
            setTimeout(() => closeModal(), 500);
        }
    }
    
    function closeModal() {
        closeDialogueOption('mutations');
    }
    
    // Navigate carousel
    function nextMutation() {
        if (currentMutationIndex < filteredMutations().length - 1) {
            currentMutationIndex++;
        }
    }
    
    function prevMutation() {
        if (currentMutationIndex > 0) {
            currentMutationIndex--;
        }
    }
    
    // Handle scroll wheel navigation
    function handleWheel(event: WheelEvent) {
        event.preventDefault();
        
        if (isScrolling) return;
        isScrolling = true;
        
        if (event.deltaY > 0) {
            nextMutation();
        } else {
            prevMutation();
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 300);
    }
    
    // Close modal on Escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            nextMutation();
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            prevMutation();
        }
    }
    
    // Prevent modal close when clicking inside carousel
    function handleCarouselClick(event: MouseEvent) {
        event.stopPropagation();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isDialogueOpen('mutations')}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="modal-backdrop" 
        onclick={closeModal}
        transition:fade={{ duration: 200 }}
    >
        <!-- Carousel Wheel Container -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="carousel-container"
            bind:this={carouselContainer}
            onclick={handleCarouselClick}
            onwheel={handleWheel}
        >
            <div class="mutation-stack">
                {#each filteredMutations() as mutation, index}
                    {@const variantIndex = availableMutations.findIndex(m => m.id === mutation.id)}
                    {@const isSelected = isMutationSelected(mutation.id)}
                    {@const isCurrent = index === currentMutationIndex}
                    {@const isNext = index === currentMutationIndex + 1}
                    {@const isPrev = index === currentMutationIndex - 1}
                    {@const distance = Math.abs(index - currentMutationIndex)}
                    {@const isVisible = distance <= 3}
                    
                    {#if isVisible}
                        <div 
                            class="mutation-card-wrapper {isCurrent ? 'current' : ''} {isNext ? 'next' : ''} {isPrev ? 'prev' : ''}"
                            style="
                                z-index: {100 - distance};
                                transform: 
                                    translateX({(index - currentMutationIndex) * 15}px)
                                    translateY({distance * 15}px)
                                    rotate({(index - currentMutationIndex) * 3}deg)
                                    scale({1 - distance * 0.1});
                                opacity: {1 - distance * 0.3};
                            "
                            transition:scale={{ duration: 400, delay: distance * 50 }}
                            onclick={() => selectMutation(mutation)}
                        >
                            <div class="torn-input-wrapper {mutationVariants[variantIndex]} {isSelected ? 'selected' : ''}">
                                <div class="mutation-card-content">
                                    <div class="mutation-card-header">
                                        <h3 class="mutation-card-name">{mutation.name}</h3>

                                    </div>
                                    
                                    <div class="mutation-card-description">
                                        {@html mutation.description}
                                    </div>
                                    
                                    <div class="mutation-card-trigger">
                                        <h4 class="trigger-title">Utlöses när:</h4>
                                        <div class="trigger-content">
                                            {mutation.trigger_when}
                                        </div>
                                    </div>
                                    
                                    <div class="mutation-card-footer">
                                        {#if isSelected}
                                            <div class="selected-indicator">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                    <polyline points="20,6 9,17 4,12"></polyline>
                                                </svg>
                                                <span>Vald</span>
                                            </div>
                                        {:else}
                                            <div class="select-hint">
                                                Klicka för att välja
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>

            <!-- Navigation Indicators -->
            <div class="nav-indicators">
                {#each filteredMutations() as _, index}
                    <button 
                        class="nav-dot {index === currentMutationIndex ? 'active' : ''}"
                        onclick={() => currentMutationIndex = index}
                        aria-label="Gå till mutation {index + 1}"
                    ></button>
                {/each}
            </div>

            <!-- Navigation Controls -->
            <div class="nav-controls">
                <button 
                    class="nav-button prev" 
                    onclick={prevMutation}
                    disabled={currentMutationIndex === 0}
                    aria-label="Föregående mutation"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>

                <div class="carousel-counter">
                    {currentMutationIndex + 1} / {filteredMutations().length}
                </div>

                <button 
                    class="nav-button next" 
                    onclick={nextMutation}
                    disabled={currentMutationIndex === filteredMutations().length - 1}
                    aria-label="Nästa mutation"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(8px);
    }

    .carousel-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 1rem;
        overflow: hidden;
    }

    .mutation-stack {
        position: relative;
        width: 50%;
        height: 50%;
    }

    .mutation-card-wrapper {
        position: absolute;
        top: 25%;
        left: 50%;
        width: 90%;
        height: 85%;
        transform-origin: center center;
        transform-style: preserve-3d;
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        cursor: pointer;
    }

    /* .mutation-card-wrapper:hover {
        transform: translate(-50%, -50%) scale(1.02) !important;
    } */

    .mutation-card-wrapper.current {
        transform: translate(-50%, -50%) scale(1) rotateZ(0deg);
        z-index: 100;
    }
    
    .mutation-card-wrapper.next {
        transform: translate(-30%, -50%) scale(0.9) rotateZ(5deg) translateZ(-50px);
        z-index: 99;
        opacity: 0.8;
    }
    
    .mutation-card-wrapper.prev {
        transform: translate(-70%, -50%) scale(0.9) rotateZ(-5deg) translateZ(-50px);
        z-index: 99;
        opacity: 0.8;
    }
    
    .mutation-card-wrapper:not(.current):not(.next):not(.prev) {
        transform: translate(-50%, -50%) scale(0.7) rotateZ(0deg) translateZ(-100px);
        opacity: 0.4;
    }
    
    .mutation-card-content {
        position: relative;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        overflow-y: auto;
        z-index: 1;
    }
    
    .mutation-card-header {
        text-align: center;
        padding-bottom: 1rem;
    }
    
    .mutation-card-name {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
        color: var(--color-surface-900);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        line-height: 1.2;
    }
    
    :global(.dark) .mutation-card-name {
        color: var(--color-surface-100);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
    
    .mutation-card-meta {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        justify-content: center;
        margin-top: 0.5rem;
    }
    
    .mutation-id {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
    }
    
    :global(.dark) .mutation-id {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }
    
    .mutation-card-description {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--color-surface-800);
        flex: 1;
    }
    
    .mutation-card-trigger {
        background: rgba(217, 119, 6, 0.05);
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(217, 119, 6, 0.2);
    }
    
    :global(.dark) .mutation-card-trigger {
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(217, 119, 6, 0.3);
    }
    
    :global(.dark) .mutation-card-description {
        color: var(--color-surface-200);
    }
    
    .trigger-title {
        font-weight: bold;
        font-size: 0.85rem;
        color: var(--color-surface-700);
        margin: 0 0 0.5rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    :global(.dark) .trigger-title {
        color: var(--color-surface-300);
    }
    
    .trigger-content {
        font-size: 0.9rem;
        color: var(--color-surface-800);
        line-height: 1.5;
        font-style: italic;
    }
    
    :global(.dark) .trigger-content {
        color: var(--color-surface-200);
    }
    
    .mutation-card-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 1rem;
        border-top: 1px solid var(--color-surface-300);
        margin-top: auto;
    }
    
    :global(.dark) .mutation-card-footer {
        border-top-color: var(--color-surface-600);
    }
    
    .selected-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-success-600);
        font-weight: bold;
        font-size: 0.9rem;
    }
    
    .select-hint {
        color: var(--color-surface-600);
        font-size: 0.9rem;
        font-style: italic;
    }
    
    :global(.dark) .select-hint {
        color: var(--color-surface-400);
    }

    .nav-indicators {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2rem;
        backdrop-filter: blur(8px);
    }

    .nav-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .nav-dot:hover {
        background: rgba(255, 255, 255, 0.7);
        transform: scale(1.2);
    }

    .nav-dot.active {
        background: var(--color-primary-500);
        transform: scale(1.3);
    }

    .nav-controls {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2rem;
        backdrop-filter: blur(8px);
    }

    .nav-button {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .nav-button:hover:not(:disabled) {
        background: var(--color-primary-600);
        transform: scale(1.1);
    }

    .nav-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .carousel-counter {
        color: white;
        font-size: 0.9rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        min-width: 4rem;
        text-align: center;
    }

    /* HTML content styling */
    .mutation-card-description :global(p) {
        margin: 0.5rem 0;
    }
    
    .mutation-card-description :global(p:first-child) {
        margin-top: 0;
    }
    
    .mutation-card-description :global(p:last-child) {
        margin-bottom: 0;
    }
    
    .mutation-card-description :global(ul) {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
    }
    
    .mutation-card-description :global(li) {
        margin: 0.5rem 0;
        line-height: 1.5;
    }
    
    .mutation-card-description :global(strong) {
        color: var(--color-primary-600);
        font-weight: bold;
    }
    
    :global(.dark) .mutation-card-description :global(strong) {
        color: var(--color-primary-400);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .carousel-container {
            width: 95vw;
            height: 90vh;
        }
        
        .mutation-card-content {
            padding: 1rem;
            gap: 0.75rem;
        }
        
        .mutation-card-name {
            font-size: 1.25rem;
        }
        
        .nav-controls {
            gap: 0.75rem;
            padding: 0.5rem 1rem;
        }
        
        .nav-button {
            width: 2rem;
            height: 2rem;
        }
    }
</style>
