<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, closeDialogueOption, isDialogueOpen } from '../../states/character_sheet.svelte';
    import type { Mutation } from '../../types';
    import mutations from '../../data/mutations.json';
    import '../../styles/common-modal.css';

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
        <button 
            class="modal-close-button" 
            onclick={closeModal} 
            aria-label="Stäng mutationsfönster"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="carousel-container"
            bind:this={carouselContainer}
            onclick={handleCarouselClick}
            onwheel={handleWheel}
        >
            <div class="card-stack">
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
                            class="card-wrapper {isCurrent ? 'current' : ''} {isNext ? 'next' : ''} {isPrev ? 'prev' : ''}"
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
                                <div class="card-content">
                                    <div class="card-header">
                                        <h3 class="card-name">{mutation.name}</h3>
                                    </div>
                                    
                                    <div class="card-description">
                                        {@html mutation.description}
                                    </div>
                                    
                                    <div class="card-trigger">
                                        <h4 class="card-trigger-title">Utlöses när:</h4>
                                        <div class="card-trigger-content">
                                            {mutation.trigger_when}
                                        </div>
                                    </div>
                                    
                                    <div class="card-footer">
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
            
            <!-- Navigation Controls -->
            <div class="carousel-navigation">
                <button 
                    class="nav-button prev" 
                    onclick={prevMutation}
                    disabled={currentMutationIndex === 0}
                    aria-label="Föregående mutation"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>
                
                <div class="carousel-indicator">
                    <span class="current-index">{currentMutationIndex + 1}</span>
                    <span class="separator">/</span>
                    <span class="total-count">{filteredMutations().length}</span>
                </div>
                
                <button 
                    class="nav-button next" 
                    onclick={nextMutation}
                    disabled={currentMutationIndex >= filteredMutations().length - 1}
                    aria-label="Nästa mutation"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Mutation-specific styles that override common styles if needed */
</style>
