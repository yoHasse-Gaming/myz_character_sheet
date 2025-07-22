<script lang="ts">
    import { characterActions } from '../../states/character_sheet.svelte';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import type { Weapon } from '../../types';

    // Form state
    let newWeaponName = $state('');
    let newWeaponDescription = $state('');
    let newWeaponBonus = $state(0);
    let newWeaponDamage = $state(1);
    let newWeaponRange = $state(0); // 0 = MELEE, 1 = CLOSE, 2 = SHORT, 3 = LONG
    let newWeaponWeight = $state(0);

    // Range names for display
    const rangeNames = ['Närstrid', 'Nära', 'Kort', 'Lång'];

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function addWeapon() {
        if (newWeaponName.trim()) {
            const newWeapon: Weapon = {
                id: generateId(),
                name: newWeaponName.trim(),
                description: newWeaponDescription.trim(),
                bonus: newWeaponBonus,
                damage: newWeaponDamage,
                range: newWeaponRange,
                weight: newWeaponWeight,
                equipped: false
            };
            
            characterActions.addWeapon(newWeapon);
            resetForm();
            closeDialogueOption('newWeapon');
        }
    }

    function resetForm() {
        newWeaponName = '';
        newWeaponDescription = '';
        newWeaponBonus = 0;
        newWeaponDamage = 1;
        newWeaponRange = 0;
        newWeaponWeight = 0;
    }

    function closeModal() {
        resetForm();
        closeDialogueOption('newWeapon');
    }

    function handleClose() {
        resetForm();
        closeModal();
    }
</script>

<Modal
  open={isDialogueOpen('newWeapon')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"
  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50 left-0 top-0 h-screen w-screen"
  contentBase="!z-[101] card p-6 space-y-4 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  
  {#snippet content()}
    <div class="weapon-modal-content torn-paper-wrapper variant-1 modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-icon">
                    <path d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-.665a1.086 1.086 0 00-1.069.028l-.36.18a1 1 0 01-.84.03L9.88 9.88a1 1 0 01-.03-.84l.18-.36a1.086 1.086 0 00.028-1.069l-.665-1.33A1.087 1.087 0 008.294 5.9L6.115 5.19z"></path>
                    <path d="M14 4.6l-4 4"></path>
                    <path d="M10 2l-4 4"></path>
                </svg>
                <h3 class="modal-title">Lägg till anpassat vapen</h3>
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
            <form class="modal-form" onsubmit={(e) => { e.preventDefault(); addWeapon(); }}>
                <div class="form-group">
                    <label for="weapon-name">Namn:</label>
                    <div class="torn-paper-wrapper variant-3">
                        <input 
                            id="weapon-name"
                            type="text" 
                            class="torn-input"
                            bind:value={newWeaponName}
                            placeholder="Namn på vapen"
                            required
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="weapon-description">Beskrivning:</label>
                    <div class="torn-paper-wrapper variant-4">
                        <textarea 
                            id="weapon-description"
                            class="torn-input"
                            bind:value={newWeaponDescription}
                            placeholder="Beskrivning av vapnet (valfritt)"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                <div class="form-group-row">
                    <div class="form-group">
                        <label for="weapon-bonus">Bonus:</label>
                        <div class="torn-paper-wrapper variant-5">
                            <input 
                                id="weapon-bonus"
                                type="number" 
                                class="torn-input"
                                bind:value={newWeaponBonus}
                                min="0"
                                step="1"
                                required
                            />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="weapon-damage">Skada:</label>
                        <div class="torn-paper-wrapper variant-6">
                            <input 
                                id="weapon-damage"
                                type="number" 
                                class="torn-input"
                                bind:value={newWeaponDamage}
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div class="form-group-row">
                    <div class="form-group">
                        <label for="weapon-range">Räckvidd:</label>
                        <div class="torn-paper-wrapper variant-7">
                            <select 
                                id="weapon-range"
                                class="torn-input"
                                bind:value={newWeaponRange}
                                required
                            >
                                {#each rangeNames as rangeName, index}
                                    <option value={index}>{rangeName}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="weapon-weight">Vikt (kg):</label>
                        <div class="torn-paper-wrapper variant-8">
                            <input 
                                id="weapon-weight"
                                type="number" 
                                class="torn-input"
                                bind:value={newWeaponWeight}
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
    /* Weapon Modal Specific Styles */
    .weapon-modal-content {
        /* Weapon-specific adjustments if needed */
        min-height: 500px;
    }

    .form-group-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .form-group-row .form-group {
        flex: 1;
        min-width: 150px;
    }
    

    /* All other styles now in torn-paper.css for reusability */
</style>
