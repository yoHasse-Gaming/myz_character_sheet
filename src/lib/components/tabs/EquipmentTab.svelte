<script lang="ts">
    import FormSection from '../FormSection.svelte';
    import DraggableAddItem from '../DraggableAddItem.svelte';
    import DragOverlay from '../DragOverlay.svelte';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import itemsData from '../../data/items.json';

    // Parse weight values from items.json (convert fractions to decimals)
    function parseWeight(weightStr: string): number {
        if (!weightStr || weightStr === '') return 0;
        
        // Handle fractions
        if (weightStr === '¼') return 0.25;
        if (weightStr === '½') return 0.5;
        if (weightStr === '¾') return 0.75;
        
        // Handle numbers
        const num = parseFloat(weightStr);
        return isNaN(num) ? 0 : num;
        
    }

    // Create equipment items from items.json with parsed weights
    const availableItems = itemsData.map(item => ({
        name: item.name,
        weight: parseWeight(item.belastning),
        comment: item.kommentar || ''
    }));

    // Initialize equipment table with 10 empty rows if not already set
    if (!sheetState.equipmentTable || sheetState.equipmentTable.length === 0) {
        sheetState.equipmentTable = Array(10).fill(null).map((_, index) => ({
            id: `eq-${index}`,
            name: '',
            quantity: 0,
            weight: 0
        }));
    }

    // Modal states are now managed globally through isDialogueOpen
    
    // Drag and drop states
    let dragOverSection = $state(''); // 'equipment', 'weapons', 'armor', or ''

    // Drag and drop handlers
    function handleDragStart() {
        // Dragging started - you could add any global logic here
    }

    function handleDragEnd() {
        dragOverSection = '';
    }

    // Equipment management
    // Equipment management - now handled by modal
    function handleEquipmentAdd(event: CustomEvent) {
        const equipment = event.detail;
        
        // Check if item exists in equipmentTable, if not add new row
        const emptyIndex = sheetState.equipmentTable.findIndex(item => !item.name);
        if (emptyIndex !== -1) {
            sheetState.equipmentTable[emptyIndex] = {
                id: `eq-${emptyIndex}`,
                name: equipment.name,
                quantity: equipment.quantity,
                weight: equipment.weight
            };
        } else {
            // Add new item if no empty slots
            sheetState.equipmentTable.push({
                id: `eq-${sheetState.equipmentTable.length}`,
                name: equipment.name,
                quantity: equipment.quantity,
                weight: equipment.weight
            });
        }
    }

    function removeEquipment(index: number) {
        sheetState.equipmentTable[index] = {
            id: `eq-${index}`,
            name: '',
            quantity: 0,
            weight: 0
        };
    }

    // Filter out empty equipment items for display
    const equipmentItems = $derived(
        sheetState.equipmentTable.filter(item => item.name && item.name.trim() !== '')
    );

    // Calculate total weight from equipment items
    const totalWeight = $derived(() => {
        const total = equipmentItems.reduce((sum, item) => 
            sum + (item.quantity * item.weight), 0
        );
        console.log('Total weight calculated:', total, 'from items:', equipmentItems);
        return total;
    });

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generate variants for visual variety
    const equipmentVariants = $derived(generateUniqueVariants(equipmentItems.length + 1));
    const weaponVariants = $derived(generateUniqueVariants(sheetState.weapons.length + 1));
    const armorVariants = $derived(generateUniqueVariants(sheetState.armor.length + 1));
    
    // Special variant for the draggable add item
    const addItemVariant = 'variant-6'; // Using a vibrant variant for the add item
</script>

<div class="equipment-tab">
    <!-- Draggable Add Item -->
    <DraggableAddItem 
        text="Dra för att lägga till"
        ariaLabel="Dra för att lägga till föremål"
        variant={addItemVariant}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
    />

    <!-- Equipment Grid -->
    <div class="equipment-grid">
        <!-- Equipment Section -->
        <div class="equipment-section" data-drop-zone="equipment">
            <FormSection header="🎒 UTRUSTNING">
                <!-- Equipment list -->
                <div class="section-items-list">
                    {#each equipmentItems as item, index}
                        <div class="torn-input-wrapper {equipmentVariants[index]} section-item-card">
                            <div class="section-item-content">
                                <div class="section-item-header">
                                    <h4 class="section-item-name">{item.name}</h4>
                                    <button 
                                        class="section-remove-button" 
                                        onclick={() => removeEquipment(sheetState.equipmentTable.findIndex(eq => eq.id === item.id))}
                                        aria-label="Ta bort {item.name}"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <div class="section-item-stats">
                                    <span class="section-stat">Antal: {item.quantity}</span>
                                    <span class="section-stat">Vikt: {item.weight} kg</span>
                                    <span class="section-stat">Tot: {(item.quantity * item.weight).toFixed(2)} kg</span>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Total weight display -->
                <div class="section-total-weight">
                    <span class="section-total-label">Total: {totalWeight().toFixed(2)} kg</span>
                </div>
            </FormSection>
        </div>

        <!-- Weapons Section -->
        <div class="weapons-section" data-drop-zone="weapons">
            <FormSection header="⚔️ VAPEN">
                <!-- Weapons list -->
                <div class="section-items-list">
                    {#each sheetState.weapons as weapon, index}
                        <div class="torn-input-wrapper {weaponVariants[index]} section-item-card">
                            <div class="section-item-content">
                                <div class="section-item-header">
                                    <h4 class="section-item-name">{weapon.name}</h4>
                                    <div class="section-item-actions">
                                        <label class="section-equipped-checkbox">
                                            <input 
                                                type="checkbox" 
                                                bind:checked={weapon.equipped}
                                            />
                                            <span class="section-checkbox-label">Utrustad</span>
                                        </label>
                                        <button 
                                            class="section-remove-button" 
                                            onclick={() => characterActions.removeWeapon(weapon.id)}
                                            aria-label="Ta bort {weapon.name}"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {#if weapon.description}
                                    <p class="section-item-description">{weapon.description}</p>
                                {/if}
                                <div class="section-item-stats">
                                    <span class="section-stat">Bonus: +{weapon.bonus}</span>
                                    <span class="section-stat">Skada: {weapon.damage}</span>
                                    <span class="section-stat">Räckvidd: {weapon.range}</span>
                                    <span class="section-stat">Vikt: {weapon.weight} kg</span>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </FormSection>
        </div>

        <!-- Armor Section -->
        <div class="armor-section" data-drop-zone="armor">
            <FormSection header="🛡️ RUSTNING">
                <!-- Armor list -->
                <div class="section-items-list">
                    {#each sheetState.armor as armor, index}
                        <div class="torn-input-wrapper {armorVariants[index]} section-item-card">
                            <div class="section-item-content">
                                <div class="section-item-header">
                                    <h4 class="section-item-name">{armor.name}</h4>
                                    <div class="section-item-actions">
                                        <label class="section-equipped-checkbox">
                                            <input 
                                                type="checkbox" 
                                                bind:checked={armor.equipped}
                                            />
                                            <span class="section-checkbox-label">Utrustad</span>
                                        </label>
                                        <button 
                                            class="section-remove-button" 
                                            onclick={() => characterActions.removeArmor(armor.id)}
                                            aria-label="Ta bort {armor.name}"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {#if armor.description}
                                    <p class="section-item-description">{armor.description}</p>
                                {/if}
                                <div class="section-item-stats">
                                    <span class="section-stat">Skydd: {armor.protection}</span>
                                    <span class="section-stat">Vikt: {armor.weight} kg</span>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </FormSection>
        </div>
    </div>
</div>

<!-- Drag Overlay -->
<DragOverlay />



<style>
    .equipment-tab {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    /* Equipment Grid Layout */
    .equipment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
        align-items: start;
    }

    @media (max-width: 768px) {
        .equipment-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Section Content Styles */
    .section-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: relative;
        min-height: 200px;
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .section-items-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .section-item-card {
        padding: 1rem;
        margin: 0;
        position: relative;
        z-index: 1;
        transition: all 0.2s ease;
    }

    .section-item-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 2;
    }

    .section-item-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        position: relative;
        z-index: 1;
    }

    .section-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
    }

    .section-item-name {
        margin: 0;
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--color-surface-900);
        flex: 1;
    }

    :global(.dark) .section-item-name {
        color: var(--color-surface-100);
    }

    .section-item-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-shrink: 0;
    }

    .section-equipped-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--color-surface-700);
        cursor: pointer;
    }

    :global(.dark) .section-equipped-checkbox {
        color: var(--color-surface-300);
    }

    .section-checkbox-label {
        white-space: nowrap;
    }

    .section-remove-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--color-danger-500);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
    }

    .section-remove-button:hover {
        background: var(--color-danger-600);
        transform: scale(1.1);
    }

    .section-item-description {
        margin: 0;
        font-style: italic;
        color: var(--color-surface-600);
        line-height: 1.4;
    }

    :global(.dark) .section-item-description {
        color: var(--color-surface-400);
    }

    .section-item-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .section-stat {
        font-size: 0.9rem;
        color: var(--color-surface-700);
        font-weight: 600;
        background: rgba(0, 0, 0, 0.05);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
    }

    :global(.dark) .section-stat {
        color: var(--color-surface-300);
        background: rgba(255, 255, 255, 0.05);
    }

    .section-total-weight {
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(217, 119, 6, 0.1);
        border-radius: 0.5rem;
        text-align: center;
        position: relative;
        z-index: 10;
    }

    .section-total-label {
        font-weight: bold;
        font-size: 1.1rem;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    :global(.dark) .section-total-label {
        color: var(--color-surface-100);
    }
</style>
