<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import talentsData from '../../data/talents.json';
    import generalTalentsData from '../../data/general_talents.json';
    import type { Talent } from '../../types';
    import { closeDialogueOption, isDialogueOpen } from "../../states/modals.svelte";
    import { Modal } from "@skeletonlabs/skeleton-svelte";

    // Props to determine which type of talents to show
    let { modalType = 'occupational' }: { modalType: 'occupational' | 'generic' } = $props();
    
    // Determine which talents to show based on modal type
    const availableTalents = $derived(modalType === 'occupational' 
        ? talentsData as Talent[]
        : generalTalentsData as Talent[]);
    
    // Filter out already selected talents
    // const filteredTalents = $derived(availableTalents.filter(talent => 
    //     !sheetState.talents.some(selected => selected.id === talent.id)
    // ));
    
    // Check if a talent is already selected
    function isTalentSelected(talentId: string): boolean {
        return sheetState.talents.some(t => t.id === talentId);
    }
    
    // Generate unique variants and rotations for talent cards
    const talentVariants = $derived(generateUniqueVariants(availableTalents.length));
    const cardRotations = $derived(generateRandomRotations(availableTalents.length));

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


</script>

<!-- Occupational Talents Modal -->
<Modal
  open={isDialogueOpen('occupational-talents') && modalType === 'occupational'}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"

  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50"
  contentBase="!z-[101] card p-6 space-y-4 shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  {#snippet trigger()}
    <!-- No trigger needed since modal is controlled externally -->
  {/snippet}
  
  {#snippet content()}
    <div class="talents-modal-content">
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
        
        <div class="card-grid">
                {#each availableTalents as talent, index}
                    {@const variantIndex = availableTalents.findIndex(t => t.id === talent.id)}
                    {@const isSelected = isTalentSelected(talent.id)}
                    {@const rotation = cardRotations[index] || 0}
                    
                    <button 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        onclick={() => addTalent(talent)}
                    >
                        <div class="torn-paper-wrapper {talentVariants[variantIndex]} {isSelected ? 'selected' : ''}">
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
                    </button>
                {/each}
            </div>
        </div>
  {/snippet}
</Modal>

<!-- Generic Talents Modal -->
<Modal
  open={isDialogueOpen('generic-talents') && modalType === 'generic'}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"

  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50"
  contentBase="!z-[101] card p-6 space-y-4 shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  {#snippet trigger()}
    <!-- No trigger needed since modal is controlled externally -->
  {/snippet}
  
  {#snippet content()}
    <div class="talents-modal-content">
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
        
        <div class="card-grid">
                {#each availableTalents as talent, index}
                    {@const variantIndex = availableTalents.findIndex(t => t.id === talent.id)}
                    {@const isSelected = isTalentSelected(talent.id)}
                    {@const rotation = cardRotations[index] || 0}
                    
                    <button 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        onclick={() => addTalent(talent)}
                    >
                        <div class="torn-paper-wrapper {talentVariants[variantIndex]} {isSelected ? 'selected' : ''}">
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
                    </button>
                {/each}
            </div>
        </div>
  {/snippet}
</Modal>

<style>
    /* Ensure modal appears on top and is properly styled */
    :global(.skeleton-modal-backdrop) {
        z-index: 100 !important;
    }
    
    :global(.skeleton-modal-positioner) {
        z-index: 100 !important;
    }
    
    :global(.skeleton-modal-content) {
        z-index: 101 !important;
    }
    
    /* Talents-specific styles that override common styles if needed */
    .talents-modal-content {
        position: relative;
        z-index: 102;
    }
    
    .modal-close-button {
        z-index: 103 !important;
    }

    /* Talent-specific styles */
    .talent-icon {
        font-size: 1.2rem;
    }


</style>
