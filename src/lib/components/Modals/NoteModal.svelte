<script lang="ts">
    import { characterActions } from '../../states/character_sheet.svelte';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";

    // Form state
    let newNoteText = $state('');

    function addNote() {
        if (newNoteText.trim()) {
            characterActions.addNote(newNoteText.trim());
            resetForm();
            closeDialogueOption('notes');
        }
    }

    function resetForm() {
        newNoteText = '';
    }

    function closeModal() {
        resetForm();
        closeDialogueOption('notes');
    }

    function handleClose() {
        resetForm();
        closeModal();
    }
</script>

<Modal
  open={isDialogueOpen('notes')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50"
  contentBase="!z-[101] card bg-surface-100-900 p-6 space-y-4 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  
  {#snippet content()}
    <div class="note-modal-content torn-input-wrapper variant-2 modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-icon">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <h3 class="modal-title">Lägg till anteckning</h3>
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
            <form class="modal-form" onsubmit={(e) => { e.preventDefault(); addNote(); }}>
                <div class="form-group">
                    <label for="note-text">Anteckning:</label>
                    <div class="torn-input-wrapper variant-3">
                        <textarea 
                            id="note-text"
                            class="torn-input"
                            bind:value={newNoteText}
                            placeholder="Skriv din anteckning här..."
                            rows="6"
                            required
                        ></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick={handleClose}>
                        Avbryt
                    </button>
                    <div class="torn-input-wrapper variant-4 btn-wrapper">
                        <button type="submit" class="btn-primary">
                            Lägg till anteckning
                        </button>
                    </div>
                </div>
            </form>
        </div>
  {/snippet}
</Modal>

<style>
    /* Note Modal Specific Styles */
    .note-modal-content {
        /* Note-specific adjustments if needed */
        min-height: 350px;
    }

    /* All other styles now in torn-paper.css for reusability */
</style>
