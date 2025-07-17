<script lang="ts">
    import { scale } from 'svelte/transition';
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { closeDialogueOption, isDialogueOpen, openDialogueOption } from '../../states/modals.svelte';
    import { characterActions } from '../../states/character_sheet.svelte';
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import weaponsData from '../../data/weapons.json';
    import type { Weapon } from '../../types';

    // Combine all weapons from the JSON file
    const allWeapons = [...weaponsData.meleeWeapons, ...weaponsData.rangedWeapons];

    // Add a "Custom" option for manual entry at the beginning
    const weaponOptions: Array<{name: string; bonus: number; damage: number; range: string; comment: string; isCustom?: boolean}> = [
        { 
            name: 'Anpassad', 
            bonus: 0, 
            damage: 1, 
            range: 'SHORT', 
            comment: 'Skapa ett anpassat vapen', 
            isCustom: true 
        },
        ...allWeapons
    ];

    // Range mapping for display and conversion
    const rangeLabels: Record<string, string> = {
        'MELEE': 'Närstrid',
        'CLOSE': 'Nära',
        'SHORT': 'Kort',
        'LONG': 'Lång'
    };

    const rangeToNumber: Record<string, number> = {
        'MELEE': 0,
        'CLOSE': 1,
        'SHORT': 2,
        'LONG': 3
    };

    // Generate unique variants and rotations for weapon cards
    const weaponVariants = generateUniqueVariants(weaponOptions.length);
    const cardRotations = generateRandomRotations(weaponOptions.length);

    // Custom weapon form state - no longer needed since we edit directly in cards
    // let showCustomForm = $state(false);
    // let customWeaponName = $state('');
    // let customWeaponDescription = $state('');
    // let customWeaponBonus = $state(0);
    // let customWeaponDamage = $state(1);
    // let customWeaponRange = $state('SHORT');
    // let customWeaponWeight = $state(0);

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function selectWeapon(weapon: any) {
        if (weapon.isCustom) {
            // Open the NewWeaponModal for custom weapon
            closeModal();
            openDialogueOption('newWeapon');
        } else {
            // Add predefined weapon directly (will be editable in the tab)
            const newWeapon: Weapon = {
                id: generateId(),
                name: weapon.name,
                description: weapon.comment || '',
                bonus: weapon.bonus,
                damage: weapon.damage,
                range: rangeToNumber[weapon.range] ?? 2,
                weight: 0, // Default weight since it's not in weapons.json
                equipped: false
            };
            
            characterActions.addWeapon(newWeapon);
            closeModal();
        }
    }

    function closeModal() {
        closeDialogueOption('weapons');
    }
</script>

<Modal
  open={isDialogueOpen('weapons')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude absolute"
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
    <div class="weapons-modal-content">
        <!-- Weapon Selection Grid -->
        <div class="modal-header">
            <h2 class="modal-title">Välj Vapen</h2>
            <button 
                class="modal-close-button" 
                onclick={closeModal} 
                aria-label="Stäng vapenfönster"
                type="button"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        
        <div class="card-grid">
            {#each weaponOptions as weapon, index}
                {@const rotation = cardRotations[index] || 0}
                
                <button 
                    class="card-wrapper"
                    style="--random-rotation: {rotation}deg"
                    transition:scale={{ duration: 400, delay: index * 50 }}
                    onclick={() => selectWeapon(weapon)}
                    type="button"
                    aria-label="Välj vapen: {weapon.name}"
                >
                    <div class="torn-paper-wrapper {weaponVariants[index]} {weapon.isCustom ? 'custom-option' : ''}">
                        <div class="card-content">
                            <div class="card-header">
                                <h3 class="card-name">{weapon.name}</h3>
                                {#if !weapon.isCustom}
                                    <div class="card-meta">
                                        <span class="card-stat">Bonus: +{weapon.bonus}</span>
                                        <span class="card-stat">Skada: {weapon.damage}</span>
                                        <span class="card-range">{rangeLabels[weapon.range]}</span>
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="card-description">
                                {weapon.comment || (weapon.isCustom ? 'Lägg till ett tomt vapen att redigera' : 'Inget beskrivning tillgänglig')}
                            </div>
                            
                            <div class="card-footer">
                                {#if weapon.isCustom}
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
    .weapons-modal-content {
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
    .card-range {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.85rem;
        border: 1px solid rgba(217, 119, 6, 0.2);
    }

    :global(.dark) .card-stat,
    :global(.dark) .card-range {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
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
}

</style>


