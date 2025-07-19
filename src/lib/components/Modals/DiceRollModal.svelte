<script lang="ts">
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import { closeDialogueOption, isDialogueOpen, diceRollModalState } from '../../states/modals.svelte';
    import { triggerRoll } from '../../utils/diceUtils';
    import type { DiceRollConfig } from '../../states/dice.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";

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
        return baseGear + extraGear + equipmentBonus;
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

    // Get all equipment with bonuses for selection
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
  contentBase="!z-[101] card p-0 space-y-0 shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  
  {#snippet content()}
    <div class="dice-roll-modal-content torn-paper-wrapper variant-1 modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="1"></circle>
                    <circle cx="15" cy="15" r="1"></circle>
                </svg>
                <h3 class="modal-title">Tärningsslag</h3>
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

        <div class="modal-form">
            <!-- Roll Summary -->
            <div class="roll-summary">
                <h4 class="summary-title">{diceRollModalState.rollName}</h4>
                {#if diceRollModalState.skillName && diceRollModalState.abilityName}
                    <p class="summary-details">{diceRollModalState.skillName} ({diceRollModalState.abilityName})</p>
                {/if}
            </div>

            <!-- Dice Breakdown -->
            <div class="dice-breakdown">
                <h5 class="section-title">Tärningar</h5>
                
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
                    </span>
                </div>
            </div>

            <!-- Equipment Selection -->
            {#if getEquipmentWithBonuses().length > 0}
                <div class="equipment-selection">
                    <h5 class="section-title">Välj utrustning med bonus</h5>
                    <div class="equipment-grid">
                        {#each getEquipmentWithBonuses() as item (item.id)}
                            <label class="equipment-item">
                                <input 
                                    type="checkbox" 
                                    checked={isEquipmentSelected(item.id)}
                                    onchange={() => toggleEquipmentSelection(item.id)}
                                />
                                <span class="equipment-details">
                                    <strong>{item.name}</strong>
                                    <span class="equipment-type">({item.type})</span>
                                    <span class="equipment-bonus">+{item.bonus} tärningar</span>
                                </span>
                            </label>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Action Buttons -->
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick={handleClose}>
                    Avbryt
                </button>
                <div class="torn-paper-wrapper variant-9 btn-wrapper">
                    <button type="button" class="btn-primary roll-button" onclick={executeRoll}>
                        🎲 Slå tärning
                    </button>
                </div>
            </div>
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
        background: rgba(217, 119, 6, 0.05);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid rgba(217, 119, 6, 0.2);
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
        color: var(--color-surface-700);
        min-width: 150px;
    }

    :global(.dark) .dice-label {
        color: var(--color-surface-300);
    }

    .dice-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .dice-btn {
        width: 32px;
        height: 32px;
        border: 2px solid var(--color-primary-500);
        background: var(--color-surface-100);
        color: var(--color-primary-600);
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .dice-btn:hover {
        background: var(--color-primary-500);
        color: white;
    }

    :global(.dark) .dice-btn {
        background: var(--color-surface-800);
        color: var(--color-primary-400);
        border-color: var(--color-primary-400);
    }

    :global(.dark) .dice-btn:hover {
        background: var(--color-primary-400);
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
