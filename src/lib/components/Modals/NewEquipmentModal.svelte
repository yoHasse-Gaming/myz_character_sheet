


<script lang="ts">
    import { characterActions } from '../../states/character_sheet.svelte';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import type { Equipment } from '../../types';

    // Form state
    let newEquipmentName = $state('');
    let newEquipmentDescription = $state('');
    let newEquipmentQuantity = $state(1);
    let newEquipmentWeight = $state(0);

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function addEquipment() {
        if (newEquipmentName.trim()) {
            const newEquipment: Equipment = {
                id: generateId(),
                name: newEquipmentName.trim(),
                description: newEquipmentDescription.trim(),
                quantity: newEquipmentQuantity,
                weight: newEquipmentWeight,
                bonuses: []
            };
            
            characterActions.addEquipment(newEquipment);
            resetForm();
            closeDialogueOption('newEquipment');
        }
    }

    function resetForm() {
        newEquipmentName = '';
        newEquipmentDescription = '';
        newEquipmentQuantity = 1;
        newEquipmentWeight = 0;
    }

    function closeModal() {
        resetForm();
        closeDialogueOption('newEquipment');
    }

    function handleClose() {
        resetForm();
        closeModal();
    }
</script>

<Modal
  open={isDialogueOpen('newEquipment')}
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
    <div class="equipment-modal-content torn-paper-wrapper variant-1 modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-icon">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6"></path>
                </svg>
                <h3 class="modal-title">Lägg till anpassad utrustning</h3>
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
            <form class="modal-form" onsubmit={(e) => { e.preventDefault(); addEquipment(); }}>
                <div class="form-group">
                    <label for="equipment-name">Namn:</label>
                    <div class="torn-paper-wrapper variant-3">
                        <input 
                            id="equipment-name"
                            type="text" 
                            class="torn-input"
                            bind:value={newEquipmentName}
                            placeholder="Namn på utrustning"
                            required
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="equipment-description">Beskrivning:</label>
                    <div class="torn-paper-wrapper variant-4">
                        <textarea 
                            id="equipment-description"
                            class="torn-input"
                            bind:value={newEquipmentDescription}
                            placeholder="Beskrivning av utrustningen (valfritt)"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                <div class="form-group-row">
                    <div class="form-group">
                        <label for="equipment-quantity">Antal:</label>
                        <div class="torn-paper-wrapper variant-5">
                            <input 
                                id="equipment-quantity"
                                type="number" 
                                class="torn-input"
                                bind:value={newEquipmentQuantity}
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="equipment-weight">Vikt (kg per styck):</label>
                        <div class="torn-paper-wrapper variant-6">
                            <input 
                                id="equipment-weight"
                                type="number" 
                                class="torn-input"
                                bind:value={newEquipmentWeight}
                                min="0"
                                step="0.1"
                                required
                            />
                        </div>
                    </div>
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
    /* Equipment Modal Specific Styles */
    .equipment-modal-content {
        /* Equipment-specific adjustments if needed */
        min-height: 450px;
    }

    .form-group-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .form-group-row .form-group {
        flex: 1;
        min-width: 200px;
    }

    /* All other styles now in torn-paper.css for reusability */
</style>
