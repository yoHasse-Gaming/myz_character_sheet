<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, initialCardPositions } from '../../states/character_sheet.svelte';
    import FormSection from '../FormSection.svelte';
    import DraggableAddItem from '../DraggableAddItem.svelte';
    import { openDialogueOption, openInfoModal } from '../../states/modals.svelte';
    import MutationsModal from '../Modals/MutationsModal.svelte';
    import { Circle, Dna, DnaOff, Info, Microscope, PlusCircle, Radiation, Radius, X } from '@lucide/svelte';
    import { Rating } from '@skeletonlabs/skeleton-svelte';
    import type { Mutation } from '../../types';
    import PaperCard from '../PaperCard.svelte';

    // Generate unique variants for mutation items to make them look different
    const mutationVariants = generateUniqueVariants(20); // Generate enough variants

    const initializedMutations: string[] = $state([]);

    function showMutationInfo(mutation: any) {
        const content = `
            <div class="mutation-section">
                <div class="section-content">${mutation.description}</div>
            </div>
            <div class="mutation-section">
                <h4 class="section-title">Utlöses när:</h4>
                <div class="section-content">${mutation.trigger_when}</div>
            </div>
        `;
        openInfoModal(mutation.name, content, 'mutation');
    }
    
    function removeMutation(mutationId: string) {
        characterActions.removeMutation(mutationId);
    }

    function resetMutationLayout() {
        // Clear saved layout
        characterActions.clearPaperLayouts();
        
        // Reset mutation points element to default position and size
        const mutationPointsElement = document.querySelector('.mutation-points-wrapper') as HTMLElement;
        if (mutationPointsElement) {
            // Reset transform
            mutationPointsElement.style.transform = '';
            mutationPointsElement.setAttribute('data-x', '0');
            mutationPointsElement.setAttribute('data-y', '0');
            // Reset size
            mutationPointsElement.style.width = '';
            mutationPointsElement.style.height = '';
        }
        
        console.log('Mutation layout reset to defaults');
    
    }

    onMount(() => {
        // Initialize InteractJS for the mutation points component
        const mutationPointsElement = document.querySelector('.mutation-points-wrapper') as HTMLElement;
        if (mutationPointsElement) {            
            // Apply saved layout if it exists
            const savedLayout = characterActions.getPaperLayout('mutation-points');
            if (savedLayout) {
                if (savedLayout.x !== undefined && savedLayout.y !== undefined) {
                    mutationPointsElement.style.transform = `translate(${savedLayout.x}px, ${savedLayout.y}px)`;
                    mutationPointsElement.setAttribute('data-x', savedLayout.x.toString());
                    mutationPointsElement.setAttribute('data-y', savedLayout.y.toString());
                }
                if (savedLayout.width) {
                    mutationPointsElement.style.width = `${savedLayout.width}px`;
                }
                if (savedLayout.height) {
                    mutationPointsElement.style.height = `${savedLayout.height}px`;
                }
            }
        }

    });

</script>

<MutationsModal />

    <!-- Draggable Add Item -->
    <!-- <DraggableAddItem 
        text="Dra för mutation"
        ariaLabel="Dra för att lägga till mutation"
        variant="variant-3"
    /> -->
<PaperCard 
    paperId={`mutations`}
    draggable={true}
    resizable={false}
    minSize={{ width: 300, height: 60 }}
    initialPosition={initialCardPositions["mutations"]}
    class="p-2 pt-3"
    >
    {#snippet header()}
    <span>Mutationer</span>
        <button 
            class="add-item-button"
            onclick={() => openDialogueOption('mutations')}
            aria-label="Lägg till ny relation"
            title="Lägg till ny relation"
        >
            <PlusCircle size={16} />
        </button>
    {/snippet}
    {#snippet content()}
        {#each sheetState.mutations as mutation, index}

                <div class="mutation-content">
                <span class="mutation-name"><Dna />  {mutation.name}</span>
                <div class="mutation-controls-right">
                    <button 
                        class="info-icon-button"
                        onclick={() => showMutationInfo(mutation)}
                        aria-label="Information om {mutation.name}"
                        title="Visa information om {mutation.name}"
                    >
                        <Info size={16} />
                    </button>
                    <button
                        class="remove-mutation-button"
                        onclick={() => removeMutation(mutation.id)}
                        aria-label="Ta bort {mutation.name}"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                </div>


        {/each}
        {/snippet}
</PaperCard>



<PaperCard 
    paperId="mutation-points"
    variant="variant-1"
    draggable={true}
    resizable={false}
    minSize={{ width: 200, height: 60 }}
    initialPosition={initialCardPositions["mutation-points"]}
> 

{#snippet content()}
        <span class="points-label"><Microscope size={20} class="mutation-points-icon" /> MUTATIONSPOÄNG</span>
        <div class="points-indicators">

            {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as idx}
                <button 
                    class="point-indicator"
                    onclick={() => {
                        if (sheetState.mutationPoints > idx) {
                            characterActions.setTotalMutationPoints(idx);
                        } else {
                            characterActions.setTotalMutationPoints(idx + 1);
                        }
                    }}
                    aria-label="Toggle mutation point {idx + 1}"
                >

                        <Circle size={22} 
                            color={sheetState.mutationPoints > idx ? 'var(--color-primary-300)' : 'var(--color-surface-200)'}
                        />
                    <!-- <img src='/img/strokes/o.svg' alt="No points" class="stroke-image circle-layer" /> -->
                    {#if sheetState.mutationPoints > idx}
                        <Radiation size={12} fill="var(--color-primary-300)" color="var(--color-primary-300)" />
                    {/if}
                </button>
            {/each}
            
            
        
        </div>
{/snippet}

</PaperCard>


<style>

    
    .mutation-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem;
        min-height: 2rem;
    }

    .mutation-name {
        font-family: var(--font-user), serif;
        font-weight: bold;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-grow: 1;
        margin-left: 0.25rem;
        margin-right: 0.25rem;
    }

    :global(.dark) .mutation-name {
        color: var(--color-surface-100);
    }

    .mutation-controls-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
        flex-shrink: 0;
    }

    .remove-mutation-button {
        padding: 0.2rem;
        border-radius: 50%;
        border: 1px solid var(--color-error-500);
        background: transparent;
        color: var(--color-error-600);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .remove-mutation-button:hover {
        background: var(--color-error-600);
        color: white;
        transform: scale(1.1);
    }


    /* Responsive adjustments */
    @media (max-width: 768px) {

        .mutation-controls-right {
            align-self: flex-end;
        }
    }



    :global(.dark) .mutation-points-title {
        color: var(--color-surface-100);
    }




</style>
