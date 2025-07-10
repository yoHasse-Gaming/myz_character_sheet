<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { onMount } from 'svelte';
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { sheetState, characterActions, closeDialogueOption, isDialogueOpen } from '../../states/character_sheet.svelte';
    import talentsData from '../../data/talents.json';
    import generalTalentsData from '../../data/general_talents.json';
    import type { Talent } from '../../types';
    import '../../styles/common-modal.css';

    // Props to determine which type of talents to show
    let { modalType = 'occupational' }: { modalType: 'occupational' | 'generic' } = $props();
    
    // Determine which talents to show based on modal type
    const availableTalents = $derived(modalType === 'occupational' 
        ? talentsData as Talent[]
        : generalTalentsData as Talent[]);
    
    // Filter out already selected talents
    const filteredTalents = $derived(availableTalents.filter(talent => 
        !sheetState.talents.some(selected => selected.id === talent.id)
    ));
    
    // Check if a talent is already selected
    function isTalentSelected(talentId: string): boolean {
        return sheetState.talents.some(t => t.id === talentId);
    }
    
    // Generate unique variants and rotations for talent cards
    const talentVariants = $derived(generateUniqueVariants(availableTalents.length));
    const cardRotations = $derived(generateRandomRotations(filteredTalents.length));

    function addTalent(talent: Talent) {
        // Validate talent selection based on rules
        if (modalType === 'occupational') {
            const occupationalCount = characterActions.getOccupationalTalentCount();
            const genericCount = characterActions.getGenericTalentCount();
            
            if (occupationalCount >= 2) {
                alert('Du kan bara välja 2 yrkestalanger.');
                return;
            }
            
            if (occupationalCount === 1 && genericCount < 3) {
                alert('Du behöver minst 3 generiska talanger för att välja en andra yrkestalang.');
                return;
            }
        } else {
            const genericCount = characterActions.getGenericTalentCount();
            if (genericCount >= 5) {
                alert('Du kan bara välja 5 generiska talanger.');
                return;
            }
        }
        
        characterActions.addTalent(talent);
        // Automatically close the modal after selection
        setTimeout(() => closeModal(), 500);
    }

    function closeModal() {
        closeDialogueOption(modalType === 'occupational' ? 'occupational-talents' : 'generic-talents');
    }

    // Close modal on Escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    // Prevent modal close when clicking inside grid
    function handleGridClick(event: MouseEvent) {
        event.stopPropagation();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Occupational Talents Modal -->
{#if isDialogueOpen('occupational-talents') && modalType === 'occupational'}
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
            aria-label="Stäng talangfönster"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="grid-container"
            onclick={handleGridClick}
        >
            <div class="card-grid">
                {#each filteredTalents as talent, index}
                    {@const variantIndex = availableTalents.findIndex(t => t.id === talent.id)}
                    {@const isSelected = isTalentSelected(talent.id)}
                    {@const rotation = cardRotations[index] || 0}
                    
                    <div 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        onclick={() => addTalent(talent)}
                    >
                        <div class="torn-input-wrapper {talentVariants[variantIndex]} {isSelected ? 'selected' : ''}">
                            <div class="card-content">
                                <div class="card-header">
                                    <h3 class="card-name">{talent.name}</h3>
                                </div>
                                
                                <div class="card-description">
                                    {@html talent.description}
                                </div>
                                
                                <div class="card-occupation">
                                    <h4 class="card-occupation-title">Kategori:</h4>
                                    <div class="card-occupation-content">
                                        {talent.occupation === 'generic' ? 'Generisk talang' : `Yrkestalang - ${talent.occupation}`}
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
    </div>
{/if}

<!-- Generic Talents Modal -->
{#if isDialogueOpen('generic-talents') && modalType === 'generic'}
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
            aria-label="Stäng talangfönster"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="grid-container"
            onclick={handleGridClick}
        >
            <div class="card-grid">
                {#each filteredTalents as talent, index}
                    {@const variantIndex = availableTalents.findIndex(t => t.id === talent.id)}
                    {@const isSelected = isTalentSelected(talent.id)}
                    {@const rotation = cardRotations[index] || 0}
                    
                    <div 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        onclick={() => addTalent(talent)}
                    >
                        <div class="torn-input-wrapper {talentVariants[variantIndex]} {isSelected ? 'selected' : ''}">
                            <div class="card-content">
                                <div class="card-header">
                                    <h3 class="card-name">{talent.name}</h3>
                                    <div class="card-meta">
                                        <span class="talent-icon">🎯</span>
                                        <span class="card-id">{talent.id}</span>
                                    </div>
                                </div>
                                
                                <div class="card-description">
                                    {@html talent.description}
                                </div>
                                
                                <div class="card-occupation">
                                    <h4 class="card-occupation-title">Kategori:</h4>
                                    <div class="card-occupation-content">
                                        {talent.occupation === 'generic' ? 'Generisk talang' : `Yrkestalang - ${talent.occupation}`}
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
    </div>
{/if}

<style>
    /* Talent-specific styles */
    .talent-icon {
        font-size: 1.2rem;
    }
</style>
