<script lang="ts">
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import { closeDialogueOption, isDialogueOpen, diceRollModalState } from '../../states/modals.svelte';
    import { triggerRoll } from '../../utils/diceUtils';
    import type { DiceRollConfig } from '../../states/dice.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { getIconForAbility } from '../../utils/iconUtils';
    import { type AbilityType } from '../../types';
    import { Dices } from '@lucide/svelte';

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Calculate total dice for each type
    function getTotalBaseDice() {
        return diceRollModalState.baseRoll.baseDice + diceRollModalState.modifiers.extraBaseDice;
    }

    function getTotalSkillDice() {
        return diceRollModalState.baseRoll.skillDice + diceRollModalState.modifiers.extraSkillDice;
    }

    function getTotalGearDice() {
        const baseGear = diceRollModalState.baseRoll.gearDice;
        const extraGear = diceRollModalState.modifiers.extraGearDice;
        const equipmentBonus = getSelectedEquipmentBonus();
        const equippedItemBonus = getSelectedEquippedItemBonus();
        return baseGear + extraGear + equipmentBonus + equippedItemBonus;
    }

    // Get bonus from currently selected equipped item
    function getSelectedEquippedItemBonus() {
        if (selectedEquippedItemId === '') return 0;
        
        const equippedItems = getEquippedItems();
        const selectedItem = equippedItems.find(item => item.id === selectedEquippedItemId);
        
        return selectedItem ? selectedItem.bonus : 0;
    }

    // Calculate bonus from selected equipment
    function getSelectedEquipmentBonus() {
        let bonus = 0;
        
        diceRollModalState.selectedEquipment.forEach(equipmentId => {
            // Check weapons
            const weapon = sheetState.weapons.find(w => w.id === equipmentId);
            if (weapon) {
                bonus += weapon.bonus;
                return;
            }
            
            // Check armor (if it has bonus)
            const armor = sheetState.armor.find(a => a.id === equipmentId);
            if (armor && 'bonus' in armor) {
                bonus += (armor as any).bonus;
                return;
            }
            
            // Check equipment (if it has bonus)
            const equipment = sheetState.equipment.find(e => e.id === equipmentId);
            if (equipment && 'bonus' in equipment) {
                bonus += (equipment as any).bonus;
            }
        });
        
        return bonus;
    }

    // Toggle equipment selection
    function toggleEquipmentSelection(equipmentId: string) {
        const index = diceRollModalState.selectedEquipment.indexOf(equipmentId);
        if (index === -1) {
            diceRollModalState.selectedEquipment.push(equipmentId);
        } else {
            diceRollModalState.selectedEquipment.splice(index, 1);
        }
    }

    // Check if equipment is selected
    function isEquipmentSelected(equipmentId: string) {
        return diceRollModalState.selectedEquipment.includes(equipmentId);
    }

    // Modifier adjustment functions
    function adjustModifier(type: 'extraBaseDice' | 'extraSkillDice' | 'extraGearDice', delta: number) {
        const current = diceRollModalState.modifiers[type];
        const newValue = Math.max(0, current + delta);
        diceRollModalState.modifiers[type] = newValue;
    }

    // Execute the dice roll
    async function executeRoll() {
        const config: DiceRollConfig = {
            dice: [],
            hidden: false
        };

        // Add base dice if any
        const totalBaseDice = getTotalBaseDice();
        if (totalBaseDice > 0) {
            config.dice.push({
                style: "MYZBASE",
                count: totalBaseDice
            });
        }

        // Add skill dice if any
        const totalSkillDice = getTotalSkillDice();
        if (totalSkillDice > 0) {
            config.dice.push({
                style: "MYZSKILL",
                count: totalSkillDice
            });
        }

        // Add gear dice if any
        const totalGearDice = getTotalGearDice();
        if (totalGearDice > 0) {
            config.dice.push({
                style: "MYZGEAR",
                count: totalGearDice
            });
        }

        try {
            await triggerRoll(config);
            closeModal();
        } catch (error) {
            console.error('Failed to execute dice roll:', error);
            // Could add error handling here
        }
    }

    function closeModal() {
        closeDialogueOption('diceRoll');
    }

    function handleClose() {
        closeModal();
    }

    // Get all equipped weapons and armor for selection
    function getEquippedItems(): Array<{id: string; name: string; bonus: number; type: string}> {
        const result: Array<{id: string; name: string; bonus: number; type: string}> = [];
        
        // Add equipped weapons
        sheetState.weapons.forEach(weapon => {
            if (weapon.equipped) {
                result.push({
                    id: weapon.id,
                    name: weapon.name,
                    bonus: weapon.bonus,
                    type: 'Vapen'
                });
            }
        });
        
        // Add equipped armor (note: armor doesn't have bonus in the current type definition)
        sheetState.armor.forEach(armor => {
            if (armor.equipped) {
                result.push({
                    id: armor.id,
                    name: armor.name,
                    bonus: 0, // Armor doesn't have bonus dice, only protection
                    type: 'Skydd'
                });
            }
        });
        
        return result;
    }

    // Track the currently selected equipped item
    let selectedEquippedItemId = $state('');

    // Handle selection of equipped item from dropdown
    function onEquippedItemSelect(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedEquippedItemId = select.value;
    }

    // Get all equipment with bonuses for selection (keeping original function for compatibility)
    function getEquipmentWithBonuses(): Array<{id: string; name: string; bonus: number; type: string}> {
        const result: Array<{id: string; name: string; bonus: number; type: string}> = [];
        
        // Add weapons
        sheetState.weapons.forEach(weapon => {
            if (weapon.bonus > 0) {
                result.push({
                    id: weapon.id,
                    name: weapon.name,
                    bonus: weapon.bonus,
                    type: 'Vapen'
                });
            }
        });
        
        // Add armor with bonuses (if any have bonus property)
        sheetState.armor.forEach(armor => {
            if ('bonus' in armor && (armor as any).bonus > 0) {
                result.push({
                    id: armor.id,
                    name: armor.name,
                    bonus: (armor as any).bonus,
                    type: 'Skydd'
                });
            }
        });
        
        // Add equipment with bonuses (if any have bonus property)
        sheetState.equipment.forEach(equipment => {
            if ('bonus' in equipment && (equipment as any).bonus > 0) {
                result.push({
                    id: equipment.id,
                    name: equipment.name,
                    bonus: (equipment as any).bonus,
                    type: 'Utrustning'
                });
            }
        });
        
        return result;
    }
</script>

<Modal
  open={isDialogueOpen('diceRoll')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"
  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50 left-0 top-0 h-screen w-screen"
  contentBase="!z-[101] card p-0 space-y-0 shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto p-3"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  
  {#snippet content()}
    <div class="dice-roll-modal-content torn-paper-wrapper variant-1 modal-content-wrapper">
        <div class="modal-form">
            <!-- Roll Summary -->
            <div class="roll-summary">
                <h4 class="summary-title">
                    {#if diceRollModalState.abilityType}
                        {@const BaseAbilityIcon = getIconForAbility(diceRollModalState.abilityType as AbilityType) }
                        <BaseAbilityIcon size={16} /> 
                    {/if}
                    {diceRollModalState.rollName}
                </h4>
                {#if diceRollModalState.skillName && diceRollModalState.abilityType}
                    <p class="summary-details"> {diceRollModalState.skillName}</p>
                {/if}
            </div>
            <div class="torn-paper-wrapper variant-9 btn-wrapper">
                <button type="button" class="btn-primary roll-button" onclick={executeRoll}>
                    <Dices /> Slå tärning
                </button>
            </div>

            <!-- Dice Breakdown -->
            <div class="dice-breakdown">
                <h5 class="section-title">Justering</h5>
                
                <div class="dice-row">
                    <span class="dice-label">Grundtärningar:</span>
                    <div class="dice-controls">
                        <button type="button" class="dice-btn" onclick={() => adjustModifier('extraBaseDice', -1)}>-</button>
                        <span class="dice-count">{getTotalBaseDice()}</span>
                        <button type="button" class="dice-btn" onclick={() => adjustModifier('extraBaseDice', 1)}>+</button>
                    </div>
                    <span class="dice-detail">
                        {diceRollModalState.baseRoll.baseDice}
                        {#if diceRollModalState.modifiers.extraBaseDice !== 0}
                            + {diceRollModalState.modifiers.extraBaseDice}
                        {/if}
                    </span>
                </div>

                <div class="dice-row">
                    <span class="dice-label">Färdighetstärningar:</span>
                    <div class="dice-controls">
                        <button type="button" class="dice-btn" onclick={() => adjustModifier('extraSkillDice', -1)}>-</button>
                        <span class="dice-count">{getTotalSkillDice()}</span>
                        <button type="button" class="dice-btn" onclick={() => adjustModifier('extraSkillDice', 1)}>+</button>
                    </div>
                    <span class="dice-detail">
                        {diceRollModalState.baseRoll.skillDice}
                        {#if diceRollModalState.modifiers.extraSkillDice !== 0}
                            + {diceRollModalState.modifiers.extraSkillDice}
                        {/if}
                    </span>
                </div>

                <div class="dice-row">
                    <span class="dice-label">Utrustningtärningar:</span>
                    <div class="dice-controls">
                        <button type="button" class="dice-btn" onclick={() => adjustModifier('extraGearDice', -1)}>-</button>
                        <span class="dice-count">{getTotalGearDice()}</span>
                        <button type="button" class="dice-btn" onclick={() => adjustModifier('extraGearDice', 1)}>+</button>
                    </div>
                    <span class="dice-detail">
                        {diceRollModalState.baseRoll.gearDice}
                        {#if diceRollModalState.modifiers.extraGearDice !== 0}
                            + {diceRollModalState.modifiers.extraGearDice}
                        {/if}
                        {#if getSelectedEquipmentBonus() > 0}
                            + {getSelectedEquipmentBonus()} (utrustning)
                        {/if}
                        {#if getSelectedEquippedItemBonus() > 0}
                            + {getSelectedEquippedItemBonus()} (utrustad)
                        {/if}
                    </span>
                </div>
            </div>

            <!-- Equipped Items Dropdown -->
            {#if getEquippedItems().length > 0}
                <div class="equipped-items-section">
                    <h5 class="section-title">Använd utrustad utrustning</h5>
                    <div class="equipped-dropdown-container">
                        <select class="equipped-dropdown" bind:value={selectedEquippedItemId} onchange={onEquippedItemSelect}>
                            <option value="">Ingen utrustning vald...</option>
                            {#each getEquippedItems() as item (item.id)}
                                <option value={item.id}>
                                    {item.name} ({item.type}) 
                                    {#if item.bonus > 0}+{item.bonus} tärningar{/if}
                                </option>
                            {/each}
                        </select>
                        <p class="equipped-help-text">
                            Välj en utrustad vapen eller rustning för att automatiskt lägga till dess bonus till utrustningtärningar.
                        </p>
                    </div>
                </div>
            {/if}
        </div>
    </div>
  {/snippet}
</Modal>

<style>
    .dice-roll-modal-content {
        box-shadow: none !important;
        padding: 2rem;
        min-height: 500px;
        max-width: 600px;
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

    .roll-summary {
        text-align: center;
        margin-bottom: 1rem;
    }

    .summary-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--color-primary-600);
        margin: 0 0 0.5rem 0;
    }

    .summary-details {
        color: var(--color-surface-600);
        margin: 0;
        font-style: italic;
    }

    :global(.dark) .summary-details {
        color: var(--color-surface-300);
    }

    .section-title {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--color-surface-800);
        margin: 0 0 1rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    :global(.dark) .section-title {
        color: var(--color-surface-200);
    }

    .dice-breakdown {
        
        padding: 1rem;
        border-radius: 8px;
        
    }

    .dice-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        gap: 1rem;
    }

    .dice-row:last-child {
        margin-bottom: 0;
    }

    .dice-label {
        font-weight: 500;
        color: var(--color-surface-800);
        min-width: 150px;
    }

    :global(.dark) .dice-label {
        color: var(--color-surface-200);
    }

    .dice-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .dice-btn {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .dice-btn:hover {
        background: var(--color-primary-900);
        color: var(--color-surface-100);
    }

    :global(.dark) .dice-btn {
        color: var(--color-surface-100);
    }

    :global(.dark) .dice-btn:hover {
        background: var(--color-surface-100);
        color: var(--color-surface-900);
    }

    .dice-count {
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--color-primary-600);
        min-width: 32px;
        text-align: center;
    }

    :global(.dark) .dice-count {
        color: var(--color-primary-400);
    }

    .dice-detail {
        font-size: 0.9rem;
        color: var(--color-surface-600);
        font-style: italic;
    }

    :global(.dark) .dice-detail {
        color: var(--color-surface-400);
    }

    .equipment-selection {
        background: rgba(59, 130, 246, 0.05);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .equipment-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .equipment-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .equipment-item:hover {
        background: rgba(59, 130, 246, 0.1);
    }

    .equipment-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .equipment-type {
        font-size: 0.8rem;
        color: var(--color-surface-500);
    }

    .equipment-bonus {
        font-size: 0.9rem;
        color: var(--color-primary-600);
        font-weight: 500;
    }

    :global(.dark) .equipment-bonus {
        color: var(--color-primary-400);
    }

    .equipped-items-section {
        background: rgba(34, 197, 94, 0.05);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid rgba(34, 197, 94, 0.2);
    }

    :global(.dark) .equipped-items-section {
        background: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.3);
    }

    .equipped-dropdown-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .equipped-dropdown {
        padding: 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--color-surface-300);
        background: var(--color-surface-50);
        color: var(--color-surface-900);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .equipped-dropdown:hover {
        border-color: var(--color-primary-500);
    }

    .equipped-dropdown:focus {
        outline: none;
        border-color: var(--color-primary-600);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    :global(.dark) .equipped-dropdown {
        background: var(--color-surface-800);
        color: var(--color-surface-100);
        border-color: var(--color-surface-600);
    }

    :global(.dark) .equipped-dropdown:hover {
        border-color: var(--color-primary-400);
    }

    :global(.dark) .equipped-dropdown:focus {
        border-color: var(--color-primary-400);
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
    }

    .equipped-help-text {
        font-size: 0.85rem;
        color: var(--color-surface-600);
        font-style: italic;
        margin: 0;
    }

    :global(.dark) .equipped-help-text {
        color: var(--color-surface-400);
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

    .roll-button {
        font-size: 1.1rem;
        padding: 0.75rem 2rem;
        font-weight: bold;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
        .dice-roll-modal-content {
            padding: 1.5rem;
            max-width: 90vw;
        }

        .dice-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .dice-label {
            min-width: auto;
        }

        .modal-actions {
            flex-direction: column;
        }

        .modal-title {
            font-size: 1.25rem;
        }
    }
</style>
