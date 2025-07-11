<script lang="ts">
    import FormSection from '../FormSection.svelte';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import itemsData from '../../data/items.json';
    import { fade, scale } from 'svelte/transition';

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

    // Modal states
    let showEquipmentModal = $state(false);
    let showWeaponModal = $state(false);
    let showArmorModal = $state(false);

    // Drag and drop states
    let isDragging = $state(false);
    let dragOverSection = $state(''); // 'equipment', 'weapons', 'armor', or ''

    // Drag and drop handlers
    function handleDragStart(event: DragEvent) {
        isDragging = true;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData('text/plain', 'add-item');
        }
    }

    function handleDragEnd() {
        isDragging = false;
        dragOverSection = '';
    }

    function handleDragOver(event: DragEvent, section: string) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
        dragOverSection = section;
    }

    function handleDragLeave() {
        dragOverSection = '';
    }

    function handleDrop(event: DragEvent, section: string) {
        event.preventDefault();
        isDragging = false;
        dragOverSection = '';
        
        const data = event.dataTransfer?.getData('text/plain');
        if (data === 'add-item') {
            switch (section) {
                case 'equipment':
                    showEquipmentModal = true;
                    break;
                case 'weapons':
                    showWeaponModal = true;
                    break;
                case 'armor':
                    showArmorModal = true;
                    break;
            }
        }
    }

    // Equipment management
    let newEquipmentName = $state('');
    let newEquipmentQuantity = $state(1);
    let newEquipmentWeight = $state(0);

    // Autocomplete functionality for equipment
    let showEquipmentSuggestions = $state(false);
    let equipmentSearchQuery = $state('');

    function getFilteredItems(query: string) {
        if (!query || query.length < 2) return [];
        return availableItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions
    }

    function selectEquipmentItem(item: any) {
        newEquipmentName = item.name;
        newEquipmentWeight = item.weight;
        showEquipmentSuggestions = false;
        equipmentSearchQuery = '';
    }

    function handleEquipmentNameInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        
        newEquipmentName = value;
        equipmentSearchQuery = value;
        showEquipmentSuggestions = value.length >= 2;
        
        // If exact match found, auto-fill weight
        const exactMatch = availableItems.find(item => 
            item.name.toLowerCase() === value.toLowerCase()
        );
        if (exactMatch) {
            newEquipmentWeight = exactMatch.weight;
        }
    }

    function hideEquipmentSuggestions() {
        // Small delay to allow click events on suggestions to fire
        setTimeout(() => {
            showEquipmentSuggestions = false;
        }, 150);
    }

    function addEquipment() {
        if (newEquipmentName.trim()) {
            // Check if item exists in equipmentTable, if not add new row
            const emptyIndex = sheetState.equipmentTable.findIndex(item => !item.name);
            if (emptyIndex !== -1) {
                sheetState.equipmentTable[emptyIndex] = {
                    id: `eq-${emptyIndex}`,
                    name: newEquipmentName.trim(),
                    quantity: newEquipmentQuantity,
                    weight: newEquipmentWeight
                };
            } else {
                // Add new item if no empty slots
                sheetState.equipmentTable.push({
                    id: `eq-${sheetState.equipmentTable.length}`,
                    name: newEquipmentName.trim(),
                    quantity: newEquipmentQuantity,
                    weight: newEquipmentWeight
                });
            }
            
            // Reset form
            newEquipmentName = '';
            newEquipmentQuantity = 1;
            newEquipmentWeight = 0;
            equipmentSearchQuery = '';
            showEquipmentSuggestions = false;
            showEquipmentModal = false;
            showEquipmentModal = false;
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

    // Generate random IDs for new items (for weapons and armor)
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Weapon management
    let newWeaponName = $state('');
    let newWeaponDescription = $state('');
    let newWeaponBonus = $state(0);
    let newWeaponDamage = $state(1);
    let newWeaponRange = $state(1);
    let newWeaponWeight = $state(0);

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
            
            // Reset form
            newWeaponName = '';
            newWeaponDescription = '';
            newWeaponBonus = 0;
            newWeaponDamage = 1;
            newWeaponRange = 1;
            newWeaponWeight = 0;
            showWeaponModal = false;
        }
    }

    // Armor management
    let newArmorName = $state('');
    let newArmorDescription = $state('');
    let newArmorProtection = $state(1);
    let newArmorWeight = $state(0);

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
            
            // Reset form
            newArmorName = '';
            newArmorDescription = '';
            newArmorProtection = 1;
            newArmorWeight = 0;
            showArmorModal = false;
        }
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
    <div class="draggable-add-container">
        <div 
            class="draggable-add-item torn-input-wrapper {addItemVariant}"
            role="button"
            tabindex="0"
            aria-label="Dra för att lägga till föremål"
            draggable="true"
            ondragstart={handleDragStart}
            ondragend={handleDragEnd}
            class:dragging={isDragging}
        >
            <div class="add-item-content">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span class="add-item-text">Dra för att lägga till</span>
            </div>
        </div>
    </div>

    <!-- Equipment Grid -->
    <div class="equipment-grid">
        <!-- Equipment Section -->
        <div class="equipment-section">
            <FormSection header="🎒 UTRUSTNING">
                <div 
                    class="section-content drop-zone"
                    role="region"
                    aria-label="Utrustning dropzone"
                    class:drag-over={dragOverSection === 'equipment'}
                    ondragover={(e) => handleDragOver(e, 'equipment')}
                    ondragleave={handleDragLeave}
                    ondrop={(e) => handleDrop(e, 'equipment')}
                >
                    <div class="drop-zone-hint">
                        {#if dragOverSection === 'equipment'}
                            <div class="drop-hint-text">Släpp för att lägga till utrustning</div>
                        {/if}
                    </div>

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
                </div>
            </FormSection>
        </div>

        <!-- Weapons Section -->
        <div class="weapons-section">
            <FormSection header="⚔️ VAPEN">
                <div 
                    class="section-content drop-zone"
                    role="region"
                    aria-label="Vapen dropzone"
                    class:drag-over={dragOverSection === 'weapons'}
                    ondragover={(e) => handleDragOver(e, 'weapons')}
                    ondragleave={handleDragLeave}
                    ondrop={(e) => handleDrop(e, 'weapons')}
                >
                    <div class="drop-zone-hint">
                        {#if dragOverSection === 'weapons'}
                            <div class="drop-hint-text">Släpp för att lägga till vapen</div>
                        {/if}
                    </div>

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
                </div>
            </FormSection>
        </div>

        <!-- Armor Section -->
        <div class="armor-section">
            <FormSection header="🛡️ RUSTNING">
                <div 
                    class="section-content drop-zone"
                    role="region"
                    aria-label="Rustning dropzone"
                    class:drag-over={dragOverSection === 'armor'}
                    ondragover={(e) => handleDragOver(e, 'armor')}
                    ondragleave={handleDragLeave}
                    ondrop={(e) => handleDrop(e, 'armor')}
                >
                    <div class="drop-zone-hint">
                        {#if dragOverSection === 'armor'}
                            <div class="drop-hint-text">Släpp för att lägga till rustning</div>
                        {/if}
                    </div>

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
                </div>
            </FormSection>
        </div>
    </div>
</div>

<!-- Equipment Modal -->
{#if showEquipmentModal}
    <div class="modal-overlay" 
        transition:scale={{ duration: 400, start: 1.2 }}
         role="dialog" 
         aria-modal="true"
         tabindex="-1"
         onclick={() => showEquipmentModal = false}
         onkeydown={(e) => e.key === 'Escape' && (showEquipmentModal = false)}>
        <div class="modal-content" 
            
            

            role="document">
            <div class="modal-header">
                <h3>Lägg till utrustning</h3>
                <button class="modal-close" 
                        aria-label="Stäng modal"
                        onclick={() => showEquipmentModal = false}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form class="modal-form" onsubmit={(e) => { e.preventDefault(); addEquipment(); }}>
                <div class="form-group">
                    <label for="equipment-name">Namn:</label>
                    <div class="name-input-container">
                        <input 
                            id="equipment-name"
                            type="text" 
                            bind:value={newEquipmentName}
                            oninput={(e) => handleEquipmentNameInput(e)}
                            onfocus={() => showEquipmentSuggestions = true}
                            onblur={hideEquipmentSuggestions}
                            placeholder="Namn på utrustning"
                        />
                        {#if showEquipmentSuggestions && equipmentSearchQuery}
                            <div class="suggestions-dropdown">
                                {#each getFilteredItems(equipmentSearchQuery) as suggestion}
                                    <button 
                                        type="button"
                                        class="suggestion-item"
                                        onmousedown={(e) => {
                                            e.preventDefault();
                                            selectEquipmentItem(suggestion);
                                        }}
                                    >
                                        <span class="suggestion-name">{suggestion.name}</span>
                                        <span class="suggestion-weight">{suggestion.weight} kg</span>
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="form-group">
                    <label for="equipment-quantity">Antal:</label>
                    <input 
                        id="equipment-quantity"
                        type="number" 
                        bind:value={newEquipmentQuantity}
                        min="1"
                    />
                </div>
                <div class="form-group">
                    <label for="equipment-weight">Vikt (kg):</label>
                    <input 
                        id="equipment-weight"
                        type="number" 
                        bind:value={newEquipmentWeight}
                        min="0"
                        step="0.1"
                    />
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick={() => showEquipmentModal = false}>
                        Avbryt
                    </button>
                    <button type="submit" class="btn-primary">
                        Lägg till
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Weapon Modal -->
{#if showWeaponModal}
    <div class="modal-overlay"
         role="dialog" 
         aria-modal="true"
         tabindex="-1"
        transition:scale={{ duration: 400, start: 1.2 }}

         onclick={() => showWeaponModal = false}
         onkeydown={(e) => e.key === 'Escape' && (showWeaponModal = false)}>
        <div class="modal-content"
            transition:scale={{ duration: 400, start: 1.2 }}

             role="document">
            <div class="modal-header">
                <h3>Lägg till vapen</h3>
                <button class="modal-close"
                        aria-label="Stäng modal" 
                        onclick={() => showWeaponModal = false}>
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
                    <button type="button" class="btn-secondary" onclick={() => showWeaponModal = false}>
                        Avbryt
                    </button>
                    <button type="submit" class="btn-primary">
                        Lägg till
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Armor Modal -->
{#if showArmorModal}
    <div class="modal-overlay"
         role="dialog" 
         aria-modal="true"
         tabindex="-1"
         onclick={() => showArmorModal = false}
         onkeydown={(e) => e.key === 'Escape' && (showArmorModal = false)}>
        <div class="modal-content"
        transition:scale={{ duration: 400, start: 1.2 }}

             role="document">
            <div class="modal-header">
                <h3>Lägg till rustning</h3>
                <button class="modal-close"
                        aria-label="Stäng modal" 
                        onclick={() => showArmorModal = false}>
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
                    <button type="button" class="btn-secondary" onclick={() => showArmorModal = false}>
                        Avbryt
                    </button>
                    <button type="submit" class="btn-primary">
                        Lägg till
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

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

    /* Draggable Add Item */
    .draggable-add-container {
        position: fixed;
        top: 120px;
        right: -60px; /* Position mostly off-screen */
        z-index: 100;
        transition: right 0.3s ease;
    }

    .draggable-add-container:hover {
        right: 20px; /* Slide fully into view on hover */
    }

    .draggable-add-item {
        padding: 1rem;
        cursor: grab;
        user-select: none;
        transition: all 0.3s ease;
        transform: rotate(3deg);
        animation: float 3s ease-in-out infinite;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .draggable-add-item:hover {
        transform: rotate(0deg) scale(1.05);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
    }

    .draggable-add-item.dragging {
        cursor: grabbing;
        transform: rotate(-5deg) scale(0.9);
        opacity: 0.8;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .add-item-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-primary-600);
        position: relative;
        z-index: 1;
    }

    .add-item-content svg {
        color: var(--color-primary-700);
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
        position: relative;
        z-index: 2;
        stroke: currentColor;
    }

    :global(.dark) .add-item-content svg {
        color: var(--color-primary-400);
    }

    .add-item-text {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: center;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        color: var(--color-primary-700);
        position: relative;
        z-index: 2;
    }

    :global(.dark) .add-item-text {
        color: var(--color-primary-300);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    @keyframes float {
        0%, 100% { transform: rotate(3deg) translateY(0px); }
        50% { transform: rotate(3deg) translateY(-8px); }
    }

    /* Drop Zones */
    .drop-zone {
        position: relative;
        transition: all 0.3s ease;
        border-radius: 0.5rem;
    }

    .drop-zone.drag-over {
        background: rgba(217, 119, 6, 0.1);
        border: 2px dashed var(--color-primary-500);
        transform: scale(1.02);
        box-shadow: 0 8px 25px rgba(217, 119, 6, 0.2);
    }

    .drop-zone-hint {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 9999;
    }

    .drop-hint-text {
        background: var(--color-primary-600);
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        animation: pulse 1s ease-in-out infinite alternate;
        z-index: 10000;
        position: relative;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.05); }
    }

    /* Responsive adjustments for draggable item */
    @media (max-width: 768px) {
        .draggable-add-container {
            position: static;
            right: auto;
            margin-bottom: 2rem;
            display: flex;
            justify-content: center;
        }

        .draggable-add-container:hover {
            right: auto;
        }
        
        .draggable-add-item {
            animation: none;
            transform: rotate(0deg);
        }
    }

    /* Equipment autocomplete styles */
    .name-input-container {
        position: relative;
    }

    /* Suggestions dropdown */
    .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-surface-50);
        border: 1px solid var(--color-surface-200);
        border-radius: 0.25rem;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    :global(.dark) .suggestions-dropdown {
        background: var(--color-surface-800);
        border-color: var(--color-surface-600);
    }

    .suggestion-item {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .suggestion-item:hover {
        background: rgba(217, 119, 6, 0.1);
    }

    .suggestion-name {
        font-weight: 500;
        color: var(--color-surface-900);
    }

    :global(.dark) .suggestion-name {
        color: var(--color-surface-100);
    }

    .suggestion-weight {
        font-size: 0.85rem;
        color: var(--color-surface-600);
        font-weight: 600;
    }

    :global(.dark) .suggestion-weight {
        color: var(--color-surface-400);
    }

    /* Total weight display */
    .total-weight-display {
        margin-top: 1rem;
        position: relative;
        z-index: 1;
    }

    .total-weight-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.5rem;
        position: relative;
        z-index: 1;
    }

    .total-label {
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    :global(.dark) .total-label {
        color: var(--color-surface-100);
    }

    .grand-total-weight {
        font-size: 1.1rem;
        font-weight: bold;
        color: #8B4513;
        background: rgba(255, 248, 240, 0.9);
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        transform: rotate(-0.5deg);
        transition: all 0.2s ease;
    }

    .grand-total-weight:hover {
        transform: rotate(0deg) scale(1.05);
        box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
    }

    :global(.dark) .grand-total-weight {
        background: rgba(40, 35, 30, 0.9);
        color: #D2691E;
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

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: var(--color-surface-50);
        border-radius: 0.5rem;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) .modal-content {
        background: var(--color-surface-800);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-surface-200);
    }

    :global(.dark) .modal-header {
        border-color: var(--color-surface-600);
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--color-surface-900);
    }

    :global(.dark) .modal-header h3 {
        color: var(--color-surface-100);
    }

    .modal-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: transparent;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--color-surface-500);
    }

    .modal-close:hover {
        background: var(--color-surface-200);
        color: var(--color-surface-700);
    }

    :global(.dark) .modal-close:hover {
        background: var(--color-surface-600);
        color: var(--color-surface-300);
    }

    .modal-form {
        padding: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .form-group label {
        font-weight: 600;
        color: var(--color-surface-700);
        font-size: 0.9rem;
    }

    :global(.dark) .form-group label {
        color: var(--color-surface-300);
    }

    .form-group input,
    .form-group textarea {
        padding: 0.75rem;
        border: 1px solid var(--color-surface-300);
        border-radius: 0.25rem;
        background: var(--color-surface-100);
        color: var(--color-surface-900);
        font-size: 1rem;
    }

    :global(.dark) .form-group input,
    :global(.dark) .form-group textarea {
        background: var(--color-surface-700);
        border-color: var(--color-surface-600);
        color: var(--color-surface-100);
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--color-primary-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    @media (max-width: 480px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--color-surface-200);
    }

    :global(.dark) .modal-actions {
        border-color: var(--color-surface-600);
    }

    .btn-primary {
        padding: 0.75rem 1.5rem;
        background: var(--color-primary-600);
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .btn-primary:hover {
        background: var(--color-primary-700);
    }

    .btn-secondary {
        padding: 0.75rem 1.5rem;
        background: transparent;
        color: var(--color-surface-600);
        border: 1px solid var(--color-surface-300);
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .btn-secondary:hover {
        background: var(--color-surface-100);
        color: var(--color-surface-700);
    }

    :global(.dark) .btn-secondary {
        color: var(--color-surface-400);
        border-color: var(--color-surface-600);
    }

    :global(.dark) .btn-secondary:hover {
        background: var(--color-surface-700);
        color: var(--color-surface-200);
    }
</style>
