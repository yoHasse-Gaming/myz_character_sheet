<script lang="ts">
    import FormSection from '../FormSection.svelte';
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

    // Autocomplete functionality
    let activeSearchIndex = $state(-1);
    let showSuggestions = $state(Array(10).fill(false));
    let searchQuery = $state(Array(10).fill(''));

    function getFilteredItems(query: string) {
        if (!query || query.length < 2) return [];
        return availableItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions
    }

    function selectItem(rowIndex: number, item: any) {
        sheetState.equipmentTable[rowIndex].name = item.name;
        sheetState.equipmentTable[rowIndex].weight = item.weight;
        if (sheetState.equipmentTable[rowIndex].quantity === 0) {
            sheetState.equipmentTable[rowIndex].quantity = 1;
        }
        
        showSuggestions[rowIndex] = false;
        searchQuery[rowIndex] = '';
    }

    function handleNameInput(rowIndex: number, event: Event) {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        
        sheetState.equipmentTable[rowIndex].name = value;
        searchQuery[rowIndex] = value;
        showSuggestions[rowIndex] = value.length >= 2;
        
        // If exact match found, auto-fill weight
        const exactMatch = availableItems.find(item => 
            item.name.toLowerCase() === value.toLowerCase()
        );
        if (exactMatch) {
            sheetState.equipmentTable[rowIndex].weight = exactMatch.weight;
            if (sheetState.equipmentTable[rowIndex].quantity === 0) {
                sheetState.equipmentTable[rowIndex].quantity = 1;
            }
        }
    }

    function updateQuantity(rowIndex: number, quantity: number) {
        sheetState.equipmentTable[rowIndex].quantity = Math.max(0, quantity);
    }

    function updateWeight(rowIndex: number, weight: number) {
        sheetState.equipmentTable[rowIndex].weight = Math.max(0, weight);
    }

    function hideSuggestions(rowIndex: number) {
        // Small delay to allow click events on suggestions to fire
        setTimeout(() => {
            showSuggestions[rowIndex] = false;
        }, 150);
    }

    // Calculate total weight
    const totalWeight = $derived(
        sheetState.equipmentTable.reduce((total, item) => 
            total + (item.quantity * item.weight), 0
        )
    );

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
        }
    }

    // Generate variants for visual variety
    const weaponVariants = $derived(generateUniqueVariants(sheetState.weapons.length + 1));
    const armorVariants = $derived(generateUniqueVariants(sheetState.armor.length + 1));
</script>

<div class="equipment-tab space-y-6">
    <!-- Equipment Table Section -->
    <FormSection header="🎒 UTRUSTNING">
        <div class="equipment-section">
            <!-- Equipment Table -->
            <div class="torn-input-wrapper variant-1">
                <div class="equipment-table-container">
                    <table class="equipment-table">
                    <thead>
                        <tr>
                            <th class="name-header">Föremål</th>
                            <th class="quantity-header">Antal</th>
                            <th class="weight-header">Vikt (kg)</th>
                            <th class="total-header">Tot. vikt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each sheetState.equipmentTable as item, index}
                            <tr class="equipment-row">
                                <td class="name-cell">
                                    <div class="name-input-container">
                                        <input 
                                            type="text" 
                                            class="equipment-name-input" 
                                            placeholder="Föremålsnamn..." 
                                            value={item.name}
                                            oninput={(e) => handleNameInput(index, e)}
                                            onblur={() => hideSuggestions(index)}
                                        />
                                        {#if showSuggestions[index] && searchQuery[index]}
                                            <div class="suggestions-dropdown">
                                                {#each getFilteredItems(searchQuery[index]) as suggestion}
                                                    <button 
                                                        class="suggestion-item"
                                                        onmousedown={(e) => {
                                                            e.preventDefault();
                                                            selectItem(index, suggestion);
                                                        }}
                                                    >
                                                        <span class="suggestion-name">{suggestion.name}</span>
                                                        <span class="suggestion-weight">{suggestion.weight} kg</span>
                                                    </button>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </td>
                                <td class="quantity-cell">
                                    <input 
                                        type="number" 
                                        class="equipment-number-input" 
                                        min="0"
                                        value={item.quantity}
                                        oninput={(e) => updateQuantity(index, parseInt((e.target as HTMLInputElement).value) || 0)}
                                    />
                                </td>
                                <td class="weight-cell">
                                    <input 
                                        type="number" 
                                        class="equipment-number-input" 
                                        min="0"
                                        step="0.25"
                                        value={item.weight}
                                        oninput={(e) => updateWeight(index, parseFloat((e.target as HTMLInputElement).value) || 0)}
                                    />
                                </td>
                                <td class="total-cell">
                                    <span class="total-weight">
                                        {(item.quantity * item.weight).toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="2" class="total-label">Total bärkapacitet: </td>
                            <td class="grand-total">
                                <span class="grand-total-weight">{totalWeight.toFixed(2)} kg</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                </div>
            </div>
        </div>
    </FormSection>

    <!-- Weapons Section -->
    <FormSection header="⚔️ VAPEN">
        <div class="weapons-section">
            <!-- Add new weapon form -->
            <div class="add-item-form">
                <div class="form-row">
                    <div class="torn-input-wrapper variant-1">
                        <input 
                            type="text" 
                            class="torn-input font-user" 
                            placeholder="Vapennamn..." 
                            bind:value={newWeaponName}
                        />
                    </div>
                    <div class="torn-input-wrapper variant-2">
                        <input 
                            type="text" 
                            class="torn-input font-user" 
                            placeholder="Beskrivning..." 
                            bind:value={newWeaponDescription}
                        />
                    </div>
                </div>
                <div class="form-row">
                    <div class="torn-input-wrapper variant-3">
                        <input 
                            type="number" 
                            class="torn-input font-user" 
                            placeholder="Bonus" 
                            bind:value={newWeaponBonus}
                        />
                    </div>
                    <div class="torn-input-wrapper variant-4">
                        <input 
                            type="number" 
                            class="torn-input font-user" 
                            placeholder="Skada" 
                            min="1"
                            bind:value={newWeaponDamage}
                        />
                    </div>
                    <div class="torn-input-wrapper variant-5">
                        <input 
                            type="number" 
                            class="torn-input font-user" 
                            placeholder="Räckvidd" 
                            min="1"
                            bind:value={newWeaponRange}
                        />
                    </div>
                    <div class="torn-input-wrapper variant-6">
                        <input 
                            type="number" 
                            class="torn-input font-user" 
                            placeholder="Vikt" 
                            min="0"
                            step="0.1"
                            bind:value={newWeaponWeight}
                        />
                    </div>
                    <button class="add-button" onclick={addWeapon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Lägg till
                    </button>
                </div>
            </div>

            <!-- Weapons list -->
            <div class="items-list">
                {#each sheetState.weapons as weapon, index}
                    <div class="torn-input-wrapper {weaponVariants[index]} item-card">
                        <div class="item-content">
                            <div class="item-header">
                                <h4 class="item-name">{weapon.name}</h4>
                                <div class="item-actions">
                                    <label class="equipped-checkbox">
                                        <input 
                                            type="checkbox" 
                                            bind:checked={weapon.equipped}
                                        />
                                        <span class="checkbox-label">Utrustad</span>
                                    </label>
                                    <button 
                                        class="remove-button" 
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
                                <p class="item-description">{weapon.description}</p>
                            {/if}
                            <div class="item-stats">
                                <span class="stat">Bonus: +{weapon.bonus}</span>
                                <span class="stat">Skada: {weapon.damage}</span>
                                <span class="stat">Räckvidd: {weapon.range}</span>
                                <span class="stat">Vikt: {weapon.weight} kg</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </FormSection>

    <!-- Armor Section -->
    <FormSection header="🛡️ RUSTNING">
        <div class="armor-section">
            <!-- Add new armor form -->
            <div class="add-item-form">
                <div class="form-row">
                    <div class="torn-input-wrapper variant-1">
                        <input 
                            type="text" 
                            class="torn-input font-user" 
                            placeholder="Rustningsnamn..." 
                            bind:value={newArmorName}
                        />
                    </div>
                    <div class="torn-input-wrapper variant-2">
                        <input 
                            type="text" 
                            class="torn-input font-user" 
                            placeholder="Beskrivning..." 
                            bind:value={newArmorDescription}
                        />
                    </div>
                </div>
                <div class="form-row">
                    <div class="torn-input-wrapper variant-3">
                        <input 
                            type="number" 
                            class="torn-input font-user" 
                            placeholder="Skydd" 
                            min="1"
                            bind:value={newArmorProtection}
                        />
                    </div>
                    <div class="torn-input-wrapper variant-4">
                        <input 
                            type="number" 
                            class="torn-input font-user" 
                            placeholder="Vikt" 
                            min="0"
                            step="0.1"
                            bind:value={newArmorWeight}
                        />
                    </div>
                    <button class="add-button" onclick={addArmor}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Lägg till
                    </button>
                </div>
            </div>

            <!-- Armor list -->
            <div class="items-list">
                {#each sheetState.armor as armor, index}
                    <div class="torn-input-wrapper {armorVariants[index]} item-card">
                        <div class="item-content">
                            <div class="item-header">
                                <h4 class="item-name">{armor.name}</h4>
                                <div class="item-actions">
                                    <label class="equipped-checkbox">
                                        <input 
                                            type="checkbox" 
                                            bind:checked={armor.equipped}
                                        />
                                        <span class="checkbox-label">Utrustad</span>
                                    </label>
                                    <button 
                                        class="remove-button" 
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
                                <p class="item-description">{armor.description}</p>
                            {/if}
                            <div class="item-stats">
                                <span class="stat">Skydd: {armor.protection}</span>
                                <span class="stat">Vikt: {armor.weight} kg</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </FormSection>
</div>

<style>
    .equipment-tab {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    /* Equipment Table Styles */
    .equipment-table-container {
        overflow-x: auto;

        position: relative;
        z-index: 2;
    }

    .equipment-table {
        width: 100%;

        font-family: var(--form-labels), serif;
        background: transparent;
        position: relative;
        z-index: 1;


    }

    

    .equipment-table th {
        /* background: rgba(217, 119, 6, 0.2); */
        /* color: var(--color-surface-900); */
        padding: 0.75rem;
        text-align: left;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;


        position: relative;
        z-index: 10;
    }

    .equipment-table td {
        outline: none;


    }

    :global(.dark) .equipment-table th {
        /* background: rgba(217, 119, 6, 0.3); */
        color: var(--color-surface-100);


    }

    .name-header {
        width: 40%;
        min-width: 200px;
    }

    .quantity-header {
        width: 15%;
        min-width: 80px;
        text-align: center;
    }

    .weight-header {
        width: 20%;
        min-width: 100px;
        text-align: center;
    }

    .total-header {
        width: 25%;
        min-width: 100px;
        text-align: center;
    }

    .equipment-row {

        transition: all 0.2s ease;
    }

    .equipment-row:hover {
        background: rgba(217, 119, 6, 0.08);
    }

    .equipment-table td {
        padding: 0.5rem 0.75rem;
        vertical-align: middle;
    }

    .name-input-container {
        position: relative;
    }

    /* Custom styling for equipment table inputs */
    .equipment-name-input, .equipment-number-input {
        width: 100%;
        min-height: 2.5rem;
        font-size: 1rem;
        padding: 0.5rem 1rem;


        background: var(--color-surface-50);
        color: var(--color-surface-900);
        font-family: var(--form-labels), serif;
        transition: all 0.2s ease;
    }

    .equipment-name-input:focus, .equipment-number-input:focus {
        outline: none;

        /* box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2); */
    }

    :global(.dark) .equipment-name-input, 
    :global(.dark) .equipment-number-input {
        background: var(--color-surface-800);
        color: var(--color-surface-100);

    }

    .equipment-number-input {
        text-align: center;
    }

    .quantity-cell, .weight-cell, .total-cell {
        text-align: center;
    }

    .total-weight {
        font-weight: 600;
        color: var(--color-primary-600);
        /* background: rgba(217, 119, 6, 0.1); */
        padding: 0.25rem 0.5rem;

        display: inline-block;
        min-width: 60px;
    }

    :global(.dark) .total-weight {
        color: var(--color-primary-400);
        /* background: rgba(217, 119, 6, 0.2); */
    }

    /* Suggestions dropdown */
    .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-surface-50);



        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    :global(.dark) .suggestions-dropdown {
        background: var(--color-surface-800);

    }

    .suggestion-item {
        width: 100%;
        padding: 0.5rem 0.75rem;

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

    /* Total row */
    .total-row {
        background: url('/img/card_bg.png');
        background-size: cover;

        font-weight: bold;
        position: relative;
    }

    .total-row::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #654321;
        opacity: 0.8;
    }

    :global(.dark) .total-row {
        background: url('/img/card_bg_dark.png');

    }

    :global(.dark) .total-row::before {
        background: #A0522D;
    }

    .total-label {
        text-align: right;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    :global(.dark) .total-label {
        color: var(--color-surface-100);
    }

    .grand-total {
        text-align: center;
    }

    .grand-total-weight {
        font-size: 1.1rem;
        font-weight: bold;
        color: #8B4513;
        background: rgba(255, 248, 240, 0.9);
        padding: 0.5rem 1rem;

        display: inline-block;
        min-width: 80px;

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

    /* Weapon and Armor sections (keeping existing styles) */
    .add-item-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: rgba(217, 119, 6, 0.05);


    }

    .form-row {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .form-row .torn-input-wrapper {
        flex: 1;
        min-width: 150px;
    }

    .add-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--color-primary-600);
        color: white;


        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
    }

    .add-button:hover {
        background: var(--color-primary-700);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }

    .items-list {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .item-card {
        transition: all 0.2s ease;
    }

    .item-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }

    .item-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
    }

    .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
    }

    .item-name {
        font-family: var(--form-labels), serif;
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        flex: 1;
    }

    :global(.dark) .item-name {
        color: var(--color-surface-100);
    }

    .item-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .equipped-checkbox {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        cursor: pointer;
        font-size: 0.8rem;
        color: var(--color-surface-700);
    }

    :global(.dark) .equipped-checkbox {
        color: var(--color-surface-300);
    }

    .equipped-checkbox input[type="checkbox"] {
        margin: 0;
    }

    .remove-button {
        padding: 0.25rem;


        background: transparent;
        color: var(--color-error-600);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .remove-button:hover {
        background: var(--color-error-600);
        color: white;
        transform: scale(1.1);
    }

    .item-description {
        font-size: 0.9rem;
        color: var(--color-surface-700);
        margin: 0.5rem 0;
        line-height: 1.4;
    }

    :global(.dark) .item-description {
        color: var(--color-surface-300);
    }

    .item-stats {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
    }

    .stat {
        font-size: 0.8rem;
        color: var(--color-surface-600);
        background: rgba(0, 0, 0, 0.1);
        padding: 0.25rem 0.5rem;

        font-weight: 500;
    }

    :global(.dark) .stat {
        color: var(--color-surface-400);
        background: rgba(255, 255, 255, 0.1);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .equipment-table-container {
            overflow-x: auto;
        }

        .equipment-table {
            min-width: 500px;
        }

        .form-row {
            flex-direction: column;
        }

        .form-row .torn-input-wrapper {
            min-width: unset;
        }

        .items-list {
            grid-template-columns: 1fr;
        }

        .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .item-stats {
            gap: 0.5rem;
        }

        .stat {
            font-size: 0.75rem;
        }
    }
</style>
