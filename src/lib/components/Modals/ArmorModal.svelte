<script lang="ts">
    import { characterActions } from '../../states/character_sheet.svelte';
    import { scale } from 'svelte/transition';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';

    // Form state
    let newArmorName = $state('');
    let newArmorDescription = $state('');
    let newArmorProtection = $state(1);
    let newArmorWeight = $state(0);

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function addArmor() {
        if (newArmorName.trim()) {
            characterActions.addArmor({
                id: generateId(),
                name: newArmorName.trim(),
                description: newArmorDescription.trim(),
                protection: newArmorProtection,
                weight: newArmorWeight,
                equipped: false
            });
            
            resetForm();
                    closeDialogueOption('armor');

        }
    }

    function resetForm() {
        newArmorName = '';
        newArmorDescription = '';
        newArmorProtection = 1;
        newArmorWeight = 0;
    }

    function handleClose() {
        resetForm();
        closeDialogueOption('armor');

    }




</script>

{#if isDialogueOpen('armor')}

<dialog transition:scale={{ duration: 400, start: 1.2 }}>
    <div class="modal-content">
        <div class="modal-header">
            <h3>Lägg till rustning</h3>
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
                    <input 
                        id="armor-name"
                        type="text" 
                        bind:value={newArmorName}
                        placeholder="Namn på rustning"
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="armor-description">Beskrivning:</label>
                    <textarea 
                        id="armor-description"
                        bind:value={newArmorDescription}
                        placeholder="Beskrivning (valfritt)"
                        rows="2"
                    ></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="armor-protection">Skydd:</label>
                        <input 
                            id="armor-protection"
                            type="number" 
                            bind:value={newArmorProtection}
                            min="1"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label for="armor-weight">Vikt (kg):</label>
                        <input 
                            id="armor-weight"
                            type="number" 
                            bind:value={newArmorWeight}
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
</dialog>
{/if}

