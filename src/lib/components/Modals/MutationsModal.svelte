<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { sheetState, characterActions} from '../../states/character_sheet.svelte';
    import type { Mutation } from '../../types';
    import mutations from '../../data/mutations.json';
    import '../../styles/common-modal.css';
    import { onMount } from "svelte";
    import { closeDialogueOption, isDialogueOpen } from "../../states/modals.svelte";

    let mutationsDialog: HTMLDialogElement;

    // Get available mutations
    const availableMutations: Mutation[] = mutations;
    
    // Use all mutations without filtering
    const filteredMutations = $derived(() => availableMutations);
    
    // Check if a mutation is already selected
    function isMutationSelected(mutationId: string): boolean {
        return sheetState.mutations.some(m => m.id === mutationId);
    }
    
    // Generate unique variants and random rotations for mutation cards
    const mutationVariants = generateUniqueVariants(availableMutations.length);
    const randomRotations = generateRandomRotations(availableMutations.length);
    
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
    
    // Close modal on Escape key or grid click
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    


</script>

<svelte:window on:keydown={handleKeydown} />

{#if isDialogueOpen('mutations')}
    <dialog 
        transition:fade={{ duration: 200 }}
    >
        <button class="modal-close-button" onclick={closeModal} aria-label="Stäng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <div class="grid-container" >
            <div class="card-grid">
                {#each filteredMutations() as mutation, index}
                    {@const variantIndex = availableMutations.findIndex(m => m.id === mutation.id)}
                    {@const isSelected = isMutationSelected(mutation.id)}
                    {@const rotation = randomRotations[index % randomRotations.length]}
                    
                    <div 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        transition:scale={{ duration: 400, delay: index * 50 }}
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
                {/each}
            </div>
        </div>
    </dialog>
{/if}

<style>
    /* Mutation-specific styles that override common styles if needed */
</style>
