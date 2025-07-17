<script lang="ts">
    import { scale } from 'svelte/transition';
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { closeDialogueOption, isDialogueOpen, openDialogueOption } from '../../states/modals.svelte';
    import { characterActions } from '../../states/character_sheet.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import itemsData from '../../data/items.json';
    import type { Equipment } from '../../types';

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

    // Create equipment items from items.json
    const availableItems = itemsData.map(item => ({
        name: item.name,
        weight: parseWeight(item.weight),
        comment: item.comment || '',
        bonuses: item.bonuses || [],
        consume_cost: item.consume_cost || '',
        requirement: item.requirement || ''
    }));

    // Add a "Custom" option for manual entry at the beginning
    const equipmentOptions: Array<{name: string; weight: number; comment: string; bonuses: any[]; consume_cost: string; requirement: string; isCustom?: boolean}> = [
        { 
            name: 'Anpassad', 
            weight: 0, 
            comment: 'Skapa din egen anpassade utrustning', 
            bonuses: [],
            consume_cost: '',
            requirement: '',
            isCustom: true 
        },
        ...availableItems
    ];

    // Generate unique variants and rotations for equipment cards
    const equipmentVariants = generateUniqueVariants(equipmentOptions.length);
    const cardRotations = generateRandomRotations(equipmentOptions.length);

    // Custom equipment form state - no longer needed since we edit directly in cards
    // let showCustomForm = $state(false);
    // let customEquipmentName = $state('');
    // let customEquipmentDescription = $state('');
    // let customEquipmentQuantity = $state(1);
    // let customEquipmentWeight = $state(0);

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function selectEquipment(equipment: any) {
        if (equipment.isCustom) {
            // Open the NewEquipmentModal for custom equipment
            closeModal();
            openDialogueOption('newEquipment');
        } else {
            // Add predefined equipment directly (will be editable in the tab)
            // Convert bonuses from items.json format to Equipment type format
            const convertedBonuses = equipment.bonuses.map((bonus: any) => ({
                id: bonus.skill_id,
                value: bonus.bonus
            }));

            const newEquipment: Equipment = {
                id: generateId(),
                name: equipment.name,
                description: equipment.comment || '',
                quantity: 1,
                weight: equipment.weight,
                bonuses: convertedBonuses
            };
            
            characterActions.addEquipment(newEquipment);
            closeModal();
        }
    }

    function closeModal() {
        closeDialogueOption('equipment');
    }

    function formatWeight(weight: number): string {
        if (weight === 0.25) return '¼ kg';
        if (weight === 0.5) return '½ kg';
        if (weight === 0.75) return '¾ kg';
        if (weight === 0) return 'Viktigare';
        return `${weight} kg`;
    }

    function getBonusText(bonuses: any[]): string {
        if (!bonuses || bonuses.length === 0) return '';
        return bonuses.map(bonus => `+${bonus.bonus} bonus`).join(', ');
    }
</script>

<Modal
  open={isDialogueOpen('equipment')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"
  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50"
  contentBase="!z-[101] card bg-surface-100-900 p-6 space-y-4 shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  {#snippet trigger()}
    <!-- No trigger needed since modal is controlled externally -->
  {/snippet}
  
  {#snippet content()}
    <div class="equipment-modal-content">
        <!-- Equipment Selection Grid -->
        <div class="modal-header">
            <h2 class="modal-title">Välj Utrustning</h2>
                <button 
                    class="modal-close-button" 
                    onclick={closeModal} 
                    aria-label="Stäng utrustningsfönster"
                    type="button"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="card-grid">
                {#each equipmentOptions as equipment, index}
                    {@const rotation = cardRotations[index] || 0}
                    
                    <button 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        transition:scale={{ duration: 400, delay: index * 50 }}
                        onclick={() => selectEquipment(equipment)}
                        type="button"
                        aria-label="Välj utrustning: {equipment.name}"
                    >
                        <div class="torn-paper-wrapper {equipmentVariants[index]} {equipment.isCustom ? 'custom-option' : ''}">
                            <div class="card-content">
                                <div class="card-header">
                                    <h3 class="card-name">{equipment.name}</h3>
                                    {#if !equipment.isCustom}
                                        <div class="card-meta">
                                            <span class="card-stat">Vikt: {formatWeight(equipment.weight)}</span>
                                            {#if equipment.consume_cost}
                                                <span class="card-stat">Kostnad: {equipment.consume_cost}</span>
                                            {/if}
                                            {#if equipment.bonuses && equipment.bonuses.length > 0}
                                                <span class="card-bonus">{getBonusText(equipment.bonuses)}</span>
                                            {/if}
                                        </div>
                                    {/if}
                                </div>
                                
                                <div class="card-description">
                                    {equipment.comment || (equipment.isCustom ? 'Lägg till tom utrustning att redigera' : 'Ingen beskrivning tillgänglig')}
                                </div>

                                {#if !equipment.isCustom && equipment.requirement}
                                    <div class="card-requirement">
                                        <strong>Krav:</strong> {equipment.requirement}
                                    </div>
                                {/if}
                                
                                <div class="card-footer">
                                    {#if equipment.isCustom}
                                        <div class="custom-indicator">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                            <span>Anpassad</span>
                                        </div>
                                    {:else}
                                        <div class="select-hint">
                                            Klicka för att lägga till
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
    </div>
  {/snippet}
</Modal>

<style>
    /* Modal Content Styles */
    .equipment-modal-content {
        position: relative;
        z-index: 102;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--color-surface-200);
    }

    :global(.dark) .modal-header {
        border-color: var(--color-surface-600);
    }

    .modal-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-surface-900);
    }

    :global(.dark) .modal-title {
        color: var(--color-surface-100);
    }

    .modal-close-button {
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

    .modal-close-button:hover {
        background: var(--color-surface-200);
        color: var(--color-surface-700);
    }

    :global(.dark) .modal-close-button:hover {
        background: var(--color-surface-600);
        color: var(--color-surface-300);
    }

    /* Card Grid */
    .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        width: 100%;
        min-height: 100vh;
        perspective: 1000px;
        padding: 2rem 0;
    }

    /* Card Wrapper */
    .card-wrapper {
        width: 100%;
        min-height: 320px;
        padding: 0;
        margin: 0;
        background: none;
        border: none;
        cursor: pointer;
        perspective: 1000px;
        animation: fadeInUp 0.6s ease-out forwards;
        animation-fill-mode: both;
        opacity: 0;
        transform: translateY(30px);
        transition: transform 0.3s ease, filter 0.3s ease;
    }

    .card-wrapper:hover {
        transform: rotate(var(--random-rotation, 0deg)) translateY(-8px) scale(1.05);
        filter: brightness(1.1);
    }

    /* Stagger animation delays */
    .card-wrapper:nth-child(1) { animation-delay: 0.1s; }
    .card-wrapper:nth-child(2) { animation-delay: 0.2s; }
    .card-wrapper:nth-child(3) { animation-delay: 0.3s; }
    .card-wrapper:nth-child(4) { animation-delay: 0.4s; }
    .card-wrapper:nth-child(5) { animation-delay: 0.5s; }
    .card-wrapper:nth-child(6) { animation-delay: 0.6s; }
    .card-wrapper:nth-child(7) { animation-delay: 0.7s; }
    .card-wrapper:nth-child(8) { animation-delay: 0.8s; }
    .card-wrapper:nth-child(9) { animation-delay: 0.9s; }
    .card-wrapper:nth-child(n+10) { animation-delay: 1s; }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Card Content */
    .card-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        position: relative;
        z-index: 2;
    }

    .torn-paper-wrapper.custom-option {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.05));
        border: 2px dashed rgba(217, 119, 6, 0.3);
    }

    .torn-paper-wrapper.custom-option:hover {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(217, 119, 6, 0.08));
        border-color: rgba(217, 119, 6, 0.5);
    }

    /* Card Header */
    .card-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .card-name {
        font-family: var(--form-labels), serif;
        font-size: 1.3rem;
        font-weight: bold;
        color: var(--color-surface-900);
        margin: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        line-height: 1.2;
    }

    :global(.dark) .card-name {
        color: var(--color-surface-100);
    }

    .card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .card-stat,
    .card-bonus {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.85rem;
        border: 1px solid rgba(217, 119, 6, 0.2);
    }

    .card-bonus {
        background: rgba(34, 197, 94, 0.1);
        color: var(--color-success-600);
        border-color: rgba(34, 197, 94, 0.2);
    }

    :global(.dark) .card-stat {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }

    :global(.dark) .card-bonus {
        background: rgba(34, 197, 94, 0.2);
        color: var(--color-success-400);
    }

    /* Card Content Sections */
    .card-description {
        font-size: 0.9rem;
        color: var(--color-surface-800);
        line-height: 1.4;
        flex-grow: 1;
    }

    :global(.dark) .card-description {
        color: var(--color-surface-200);
    }

    .card-requirement {
        font-size: 0.85rem;
        color: var(--color-orange-600);
        background: rgba(251, 146, 60, 0.1);
        padding: 0.5rem;
        border-radius: 0.25rem;
        border: 1px solid rgba(251, 146, 60, 0.2);
    }

    :global(.dark) .card-requirement {
        background: rgba(251, 146, 60, 0.2);
        color: var(--color-orange-400);
    }

    /* Card Footer */
    .card-footer {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--color-surface-200);
    }

    :global(.dark) .card-footer {
        border-top-color: var(--color-surface-600);
    }

    .custom-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-primary-600);
        font-weight: 600;
        font-size: 0.9rem;
    }

    :global(.dark) .custom-indicator {
        color: var(--color-primary-400);
    }

    .custom-indicator svg {
        color: var(--color-primary-600);
    }

    :global(.dark) .custom-indicator svg {
        color: var(--color-primary-400);
    }

    .select-hint {
        color: var(--color-surface-700);
        font-style: italic;
        font-size: 0.85rem;
        text-align: center;
        opacity: 0.8;
    }

    :global(.dark) .select-hint {
        color: var(--color-surface-300);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
        .card-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }
    }

    @media (max-width: 768px) {
        .card-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .card-content {
            padding: 1.25rem;
        }

        .card-name {
            font-size: 1.2rem;
        }
    }

    @media (max-width: 480px) {
        .card-grid {
            gap: 1rem;
        }

        .card-content {
            padding: 1rem;
            gap: 0.75rem;
        }

        .card-name {
            font-size: 1.1rem;
        }

        .card-wrapper {
            min-height: 240px;
        }
    }
</style>
