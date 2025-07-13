<script lang="ts">
    import { sheetState } from '../../states/character_sheet.svelte';
    import itemsData from '../../data/items.json';
    import { scale } from 'svelte/transition';
    import { closeDialogueOption, isDialogueOpen } from '../../states/modals.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";


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

    // Form state
    let newEquipmentName = $state('');
    let newEquipmentQuantity = $state(1);
    let newEquipmentWeight = $state(0);

    // Autocomplete functionality
    let showSuggestions = $state(false);
    let searchQuery = $state('');

    function getFilteredItems(query: string) {
        if (!query || query.length < 2) return [];
        return availableItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    function selectEquipmentItem(item: any) {
        newEquipmentName = item.name;
        newEquipmentWeight = item.weight;
        showSuggestions = false;
        searchQuery = '';
    }

    function handleNameInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        
        newEquipmentName = value;
        searchQuery = value;
        showSuggestions = value.length >= 2;
        
        // If exact match found, auto-fill weight
        const exactMatch = availableItems.find(item => 
            item.name.toLowerCase() === value.toLowerCase()
        );
        if (exactMatch) {
            newEquipmentWeight = exactMatch.weight;
        }
    }

    function hideSuggestions() {
        setTimeout(() => {
            showSuggestions = false;
        }, 150);
    }

    function addEquipment() {
        if (newEquipmentName.trim()) {
            // Initialize equipment table if not exists
            if (!sheetState.equipmentTable || sheetState.equipmentTable.length === 0) {
                sheetState.equipmentTable = Array(10).fill(null).map((_, index) => ({
                    id: `eq-${index}`,
                    name: '',
                    quantity: 0,
                    weight: 0
                }));
            }

            // Find empty slot or add new item
            const emptyIndex = sheetState.equipmentTable.findIndex(item => !item.name);
            if (emptyIndex !== -1) {
                sheetState.equipmentTable[emptyIndex] = {
                    id: `eq-${emptyIndex}`,
                    name: newEquipmentName.trim(),
                    quantity: newEquipmentQuantity,
                    weight: newEquipmentWeight
                };
            } else {
                sheetState.equipmentTable.push({
                    id: `eq-${sheetState.equipmentTable.length}`,
                    name: newEquipmentName.trim(),
                    quantity: newEquipmentQuantity,
                    weight: newEquipmentWeight
                });
            }
            
            resetForm();
            closeDialogueOption('equipment');
        }
    }

    function resetForm() {
        newEquipmentName = '';
        newEquipmentQuantity = 1;
        newEquipmentWeight = 0;
        searchQuery = '';
        showSuggestions = false;
    }

    function closeModal() {
        closeDialogueOption('equipment');
    }

    function handleClose() {
        resetForm();
        closeModal();
    }


</script>

<Modal
  open={isDialogueOpen('equipment')}
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
    <div class="equipment-modal-content">
        <div class="modal-header">
            <h3>Lägg till utrustning</h3>
            <button class="modal-close" 
                    aria-label="Stäng modal"
                    onclick={handleClose}>
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
                            oninput={handleNameInput}
                            onfocus={() => showSuggestions = true}
                            onblur={hideSuggestions}
                            placeholder="Namn på utrustning"
                            required
                        />
                        {#if showSuggestions && searchQuery}
                            <div class="suggestions-dropdown">
                                {#each getFilteredItems(searchQuery) as suggestion}
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
                        required
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
                        required
                    />
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
    
    /* Equipment-specific styles that override common styles if needed */
    .equipment-modal-content {
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
        transition: all 0.2s ease;
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
        font-size: 1rem;
    }

    .btn-primary:hover {
        background: var(--color-primary-700);
        transform: translateY(-1px);
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
        font-size: 1rem;
    }

    .btn-secondary:hover {
        background: var(--color-surface-100);
        color: var(--color-surface-700);
        transform: translateY(-1px);
    }

    :global(.dark) .btn-secondary {
        color: var(--color-surface-400);
        border-color: var(--color-surface-600);
    }

    :global(.dark) .btn-secondary:hover {
        background: var(--color-surface-700);
        color: var(--color-surface-200);
    }

    .name-input-container {
        position: relative;
    }

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
</style>
