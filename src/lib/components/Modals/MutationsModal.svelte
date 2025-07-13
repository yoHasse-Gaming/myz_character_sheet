<script lang="ts">
    import { scale } from "svelte/transition";
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { sheetState, characterActions} from '../../states/character_sheet.svelte';
    import type { Mutation } from '../../types';
    import mutations from '../../data/mutations.json';
    import { closeDialogueOption, isDialogueOpen } from "../../states/modals.svelte";
    import { Modal } from "@skeletonlabs/skeleton-svelte";

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

</script>




<Modal
  open={isDialogueOpen('mutations')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  backdropClasses="!z-[100] backdrop-blur-sm"
  contentBase="!z-[101] card bg-surface-100-900 p-6 space-y-4 shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  {#snippet trigger()}
    <!-- No trigger needed since modal is controlled externally -->
  {/snippet}
  
  {#snippet content()}
    <div class="mutations-modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Välj Mutationer</h2>
        <button 
          class="modal-close-button" 
          onclick={closeModal} 
          aria-label="Stäng"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
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
    
    /* Mutation-specific styles that override common styles if needed */
    .mutations-modal-content {
        position: relative;
        z-index: 102;
    }
    
    .modal-close-button {
        z-index: 103 !important;
    }
</style>
