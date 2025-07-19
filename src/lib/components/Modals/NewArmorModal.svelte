<script lang="ts">
    import { characterActions } from '../../states/character_sheet.svelte';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import type { Armor } from '../../types';

    // Form state
    let newArmorName = $state('');
    let newArmorDescription = $state('');
    let newArmorProtection = $state(0);
    let newArmorWeight = $state(0);

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function addArmor() {
        if (newArmorName.trim()) {
            const newArmor: Armor = {
                id: generateId(),
                name: newArmorName.trim(),
                description: newArmorDescription.trim(),
                protection: newArmorProtection,
                weight: newArmorWeight,
                equipped: false
            };
            
            characterActions.addArmor(newArmor);
            resetForm();
            closeDialogueOption('newArmor');
        }
    }

    function resetForm() {
        newArmorName = '';
        newArmorDescription = '';
        newArmorProtection = 0;
        newArmorWeight = 0;
    }

    function closeModal() {
        resetForm();
        closeDialogueOption('newArmor');
    }

    function handleClose() {
        resetForm();
        closeModal();
    }
</script>

<Modal
    open={isDialogueOpen('newArmor')}
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
    <div class="armor-modal-content torn-paper-wrapper variant-1 modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-icon">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <h3 class="modal-title">Lägg till anpassad rustning</h3>
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
            <form class="modal-form" onsubmit={(e) => { e.preventDefault(); addArmor(); }}>
                <div class="form-group">
                    <label for="armor-name">Namn:</label>
                    <div class="torn-paper-wrapper variant-3">
                        <input 
                            id="armor-name"
                            type="text" 
                            class="torn-input"
                            bind:value={newArmorName}
                            placeholder="Namn på rustning"
                            required
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="armor-description">Beskrivning:</label>
                    <div class="torn-paper-wrapper variant-4">
                        <textarea 
                            id="armor-description"
                            class="torn-input"
                            bind:value={newArmorDescription}
                            placeholder="Beskrivning av rustningen (valfritt)"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                <div class="form-group-row">
                    <div class="form-group">
                        <label for="armor-protection">Skydd:</label>
                        <div class="torn-paper-wrapper variant-5">
                            <input 
                                id="armor-protection"
                                type="number" 
                                class="torn-input"
                                bind:value={newArmorProtection}
                                min="0"
                                step="1"
                                required
                            />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="armor-weight">Vikt (kg):</label>
                        <div class="torn-paper-wrapper variant-6">
                            <input 
                                id="armor-weight"
                                type="number" 
                                class="torn-input"
                                bind:value={newArmorWeight}
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
    /* Armor Modal Specific Styles */
    .armor-modal-content {
        /* Armor-specific adjustments if needed */
        min-height: 400px;
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
