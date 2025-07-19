<script lang="ts">
    import { characterActions } from '../../states/character_sheet.svelte';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";

    // Form state
    let newRelationName = $state('');
    let newRelationDescription = $state('');
    let newRelationIsClose = $state(false);

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function addRelation() {
        if (newRelationName.trim()) {
            characterActions.addRelation({
                id: generateId(),
                name: newRelationName.trim(),
                description: newRelationDescription.trim(),
                isClose: newRelationIsClose
            });
            
            resetForm();
            closeDialogueOption('relations');
        }
    }

    function resetForm() {
        newRelationName = '';
        newRelationDescription = '';
        newRelationIsClose = false;
    }

    function closeModal() {
        resetForm();
        closeDialogueOption('relations');
    }

    function handleClose() {
        resetForm();
        closeModal();
    }
</script>

<Modal
  open={isDialogueOpen('relations')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"
  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50"
  contentBase="!z-[101] card p-6 space-y-4 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  
  {#snippet content()}
    <div class="relation-modal-content torn-paper-wrapper variant-1 modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-icon">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3 class="modal-title">Lägg till relation</h3>
            </div>
            <button class="modal-close"
                    aria-label="Stäng modal" 
                    onclick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form class="modal-form" onsubmit={(e) => { e.preventDefault(); addRelation(); }}>
                <div class="form-group">
                    <label for="relation-name">Namn:</label>
                    <div class="torn-paper-wrapper variant-3">
                        <input 
                            id="relation-name"
                            type="text" 
                            class="torn-input"
                            bind:value={newRelationName}
                            placeholder="Namn på person"
                            required
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="relation-description">Beskrivning:</label>
                    <div class="torn-paper-wrapper variant-4">
                        <textarea 
                            id="relation-description"
                            class="torn-input"
                            bind:value={newRelationDescription}
                            placeholder="Relation och beskrivning (valfritt)"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label class="close-relation-checkbox">
                        <input 
                            type="checkbox" 
                            bind:checked={newRelationIsClose}
                        />
                        <span class="checkbox-label">Nära relation</span>
                        <span class="checkbox-hint">(Vän, familj, eller särskilt viktigt)</span>
                    </label>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick={handleClose}>
                        Avbryt
                    </button>
                    <div class="torn-paper-wrapper variant-5 btn-wrapper">
                        <button type="submit" class="btn-primary">
                            Lägg till
                        </button>
                    </div>
                </div>
            </form>
        </div>
  {/snippet}
</Modal>

<style>
    /* Relation Modal Specific Styles */
    .relation-modal-content {
        /* Relation-specific adjustments if needed */
        min-height: 400px;
    }

    .close-relation-checkbox {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--color-surface-700);
        padding: 0.5rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s ease;
    }

    .close-relation-checkbox:hover {
        background: rgba(217, 119, 6, 0.05);
    }

    :global(.dark) .close-relation-checkbox {
        color: var(--color-surface-300);
    }

    .checkbox-label {
        font-weight: 600;
        color: var(--color-surface-800);
    }

    :global(.dark) .checkbox-label {
        color: var(--color-surface-200);
    }

    .checkbox-hint {
        font-size: 0.8rem;
        color: var(--color-surface-500);
        font-style: italic;
    }

    .close-relation-checkbox input[type="checkbox"] {
        margin-right: 0.5rem;
        transform: scale(1.2);
    }

    /* All other styles now in torn-paper.css for reusability */
</style>
