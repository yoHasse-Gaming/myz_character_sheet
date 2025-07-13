<script lang="ts">
    import { characterActions} from '../../states/character_sheet.svelte';
    import { scale } from 'svelte/transition';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";


    // Form state
    let newWeaponName = $state('');
    let newWeaponDescription = $state('');
    let newWeaponBonus = $state(0);
    let newWeaponDamage = $state(1);
    let newWeaponRange = $state(1);
    let newWeaponWeight = $state(0);

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function addWeapon() {
        if (newWeaponName.trim()) {
            characterActions.addWeapon({
                id: generateId(),
                name: newWeaponName.trim(),
                description: newWeaponDescription.trim(),
                bonus: newWeaponBonus,
                damage: newWeaponDamage,
                range: newWeaponRange,
                weight: newWeaponWeight,
                equipped: false
            });
            
            resetForm();
            closeDialogueOption('weapons');
        }
    }

    function resetForm() {
        newWeaponName = '';
        newWeaponDescription = '';
        newWeaponBonus = 0;
        newWeaponDamage = 1;
        newWeaponRange = 1;
        newWeaponWeight = 0;
    }

    function closeModal() {
        closeDialogueOption('weapons');
    }

    function handleClose() {
        resetForm();
        closeModal();
    }



</script>

<Modal
  open={isDialogueOpen('weapons')}
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
    <div class="weapon-modal-content torn-input-wrapper variant-1 modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-icon">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <h3 class="modal-title">Lägg till vapen</h3>
            </div>
            <button class="modal-close-button"
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
                    <div class="torn-input-wrapper variant-3">
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
                    <div class="torn-input-wrapper variant-4">
                        <textarea 
                            id="weapon-description"
                            class="torn-input"
                            bind:value={newWeaponDescription}
                            placeholder="Beskrivning (valfritt)"
                            rows="2"
                        ></textarea>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="weapon-bonus">Bonus:</label>
                        <div class="torn-input-wrapper variant-5">
                            <input 
                                id="weapon-bonus"
                                type="number" 
                                class="torn-input"
                                bind:value={newWeaponBonus}
                                min="0"
                            />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="weapon-damage">Skada:</label>
                        <div class="torn-input-wrapper variant-6">
                            <input 
                                id="weapon-damage"
                                type="number" 
                                class="torn-input"
                                bind:value={newWeaponDamage}
                                min="1"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="weapon-range">Räckvidd:</label>
                        <div class="torn-input-wrapper variant-7">
                            <input 
                                id="weapon-range"
                                type="number" 
                                class="torn-input"
                                bind:value={newWeaponRange}
                                min="1"
                                required
                            />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="weapon-weight">Vikt (kg):</label>
                        <div class="torn-input-wrapper variant-8">
                            <input 
                                id="weapon-weight"
                                type="number" 
                                class="torn-input"
                                bind:value={newWeaponWeight}
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick={handleClose}>
                        Avbryt
                    </button>
                    <div class="torn-input-wrapper variant-9 btn-wrapper">
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
        min-height: 400px; /* Slightly taller than default */

    /* All other styles now in torn-paper.css for reusability */
        box-shadow: none !important;
        padding: 2rem;
        min-height: 400px;
        max-width: 500px;
        width: 100%;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(217, 119, 6, 0.2);
        position: relative;
        z-index: 103;
    }

    .modal-title-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .modal-icon {
        color: var(--color-primary-600);
        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2));
    }

    :global(.dark) .modal-icon {
        color: var(--color-primary-400);
    }

    .modal-title {
        font-family: var(--form-labels), serif;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    :global(.dark) .modal-title {
        color: var(--color-surface-100);
    }


    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        position: relative;
        z-index: 103;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }



    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1.5rem;
        border-top: 2px solid rgba(217, 119, 6, 0.2);
    }

    /* Override for non-wrapped buttons */


    :global(.dark) .btn-secondary {
        color: var(--color-surface-300);
        border-color: var(--color-surface-600);
    }

    :global(.dark) .btn-secondary:hover {
        background: var(--color-surface-800);
        color: var(--color-surface-100);
        border-color: var(--color-surface-400);
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
        .weapon-modal-content {
            padding: 1.5rem;
            max-width: 90vw;
        }

        .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .modal-actions {
            flex-direction: column;
        }

        .modal-title {
            font-size: 1.25rem;
        }
    }
</style>
