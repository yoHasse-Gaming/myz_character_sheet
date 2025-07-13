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
  {#snippet trigger()}
    <!-- No trigger needed since modal is controlled externally -->
  {/snippet}
  
  {#snippet content()}
    <div class="weapon-modal-content">
        <div class="modal-header">
            <h3>Lägg till vapen</h3>
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
                    <input 
                        id="weapon-name"
                        type="text" 
                        bind:value={newWeaponName}
                        placeholder="Namn på vapen"
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="weapon-description">Beskrivning:</label>
                    <textarea 
                        id="weapon-description"
                        bind:value={newWeaponDescription}
                        placeholder="Beskrivning (valfritt)"
                        rows="2"
                    ></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="weapon-bonus">Bonus:</label>
                        <input 
                            id="weapon-bonus"
                            type="number" 
                            bind:value={newWeaponBonus}
                            min="0"
                        />
                    </div>
                    <div class="form-group">
                        <label for="weapon-damage">Skada:</label>
                        <input 
                            id="weapon-damage"
                            type="number" 
                            bind:value={newWeaponDamage}
                            min="1"
                            required
                        />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="weapon-range">Räckvidd:</label>
                        <input 
                            id="weapon-range"
                            type="number" 
                            bind:value={newWeaponRange}
                            min="1"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label for="weapon-weight">Vikt (kg):</label>
                        <input 
                            id="weapon-weight"
                            type="number" 
                            bind:value={newWeaponWeight}
                            min="0"
                            step="0.1"
                        />
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick={handleClose}>
                        Avbryt
                    </button>
                    <button type="submit" class="btn-primary">
                        Lägg till
                    </button>
                </div>
            </form>
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
    
    /* Weapon-specific styles that override common styles if needed */
    .weapon-modal-content {
        position: relative;
        z-index: 102;
    }

    .modal-content {
        background: var(--color-surface-50);
        border-radius: 0.5rem;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) .modal-content {
        background: var(--color-surface-800);
    }
</style>
