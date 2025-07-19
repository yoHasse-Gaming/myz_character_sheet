<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { characterActions } from '../states/character_sheet.svelte';
    import { openDialogueOption } from '../states/modals.svelte';
    import { Backpack, Dna, Shield, Star, Swords, Notebook, Target, type Icon as IconType, Users } from '@lucide/svelte';

    let isDropping = $state(false);
    let dropType = $state('');
    let hoveredZone = $state<string | null>(null);

    type DropZoneType = {
        label: string;
        icon: typeof IconType;
        description: string;
        handler: () => void;
    }

    // Define the different drop zones and their handlers - using same actions as DragOverlay
    const dropZones = {
        'add-mutation': {
            label: 'Lägg till mutation',
            icon: Dna,
            description: 'Släpp här för att lägga till en ny mutation',
            handler: () => openDialogueOption('mutations')
        },
        'add-talent': {
            label: 'Lägg till talang', 
            icon: Star,
            description: 'Släpp här för att lägga till en ny talang',
            handler: () => openDialogueOption('generic-talents')
        },
        'add-equipment': {
            label: 'Lägg till utrustning',
            icon: Backpack,
            description: 'Släpp här för att lägga till ny utrustning', 
            handler: () => openDialogueOption('equipment')
        },
        'add-optional-skill': {
            label: 'Lägg till färdighet',
            icon: Target,
            description: 'Släpp här för att lägga till färdighet',
            handler: () => openDialogueOption('optionalSkills')
        },
        'add-weapon': {
            label: 'Lägg till vapen',
            icon: Swords,
            description: 'Släpp här för att lägga till ett nytt vapen',
            handler: () => openDialogueOption('weapons')
        },
        'add-armor': {
            label: 'Lägg till rustning',
            icon: Shield,
            description: 'Släpp här för att lägga till ny rustning',
            handler: () => openDialogueOption('armor')
        },
        'add-note': {
            label: 'Lägg till anteckning',
            icon: Notebook,
            description: 'Släpp här för att lägga till en ny anteckning',
            handler: () => characterActions.addNote('NewNote')
        },
        'add-relation': {
            label: 'Lägg till relation',
            icon: Users,
            description: 'Släpp här för att lägga till en ny relation',
            handler: () => openDialogueOption('relations')
        }
    };

    onMount(() => {
        // Listen for global drag events to show the drop zone overlay
        function handleGlobalDragEnter(event: DragEvent) {
            // Only show drop zone if we're dragging something with our drag type
            if (event.dataTransfer && event.dataTransfer.types.includes('text/plain')) {
                console.log('Drag detected, showing drop zone');
                isDropping = true;
                dropType = 'add-item'; // Default, will be updated on dragover
            }
        }

        function handleGlobalDragEnd(event: DragEvent) {
            console.log('Global drag end detected');
            isDropping = false;
            hoveredZone = null;
            dropType = '';
        }

        // Add global listeners - using dragenter instead of dragstart
        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragend', handleGlobalDragEnd);

        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragend', handleGlobalDragEnd);
        };
    });

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
            
            // Try to get the actual drag type here where dataTransfer is available
            const draggedType = event.dataTransfer.types.includes('text/plain') ? 
                event.dataTransfer.getData('text/plain') : 'add-item';
            if (draggedType && draggedType !== dropType) {
                dropType = draggedType;
            }
        }
    }

    function handleZoneDragOver(event: DragEvent, zoneType: string) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
        // Set the hovered zone for visual feedback
        hoveredZone = zoneType;
    }

    function handleZoneDragLeave(event: DragEvent, zoneType: string) {
        // Only clear hover if we're actually leaving this zone
        if (!(event.currentTarget as Element)?.contains(event.relatedTarget as Node)) {
            hoveredZone = null;
        }
    }

    function handleDragEnter(event: DragEvent) {
        event.preventDefault();
        // Already handled by global drag start
    }

    function handleDragLeave(event: DragEvent) {
        // Only hide if we're leaving the entire drop zone container
        if (!(event.currentTarget as Element)?.contains(event.relatedTarget as Node)) {
            // Don't hide here - let the global dragend handle it
            hoveredZone = null;
        }
    }

    function handleDrop(event: DragEvent, zoneType: string) {
        event.preventDefault();
        isDropping = false;
        hoveredZone = null;
        
        const zone = dropZones[zoneType as keyof typeof dropZones];
        if (zone) {
            zone.handler();
        }
        
        dropType = '';
    }

    function handleContainerDrop(event: DragEvent) {
        event.preventDefault();
        isDropping = false;
        hoveredZone = null;
        dropType = '';
    }
</script>

<!-- Drop Zone Container - Flashlight style overlay with spread out zones -->
{#if isDropping}
    <div 
        class="drag-overlay"
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleContainerDrop}
        role="application"
        aria-roledescription="Drop Zone Overlay"
    >
        <!-- Drop zones spread around the screen -->
        {#each Object.entries(dropZones) as [zoneType, zone], index}
            {@const Icone = zone.icon}
            <div 
                class="flashlight-zone"
                class:active={dropType === zoneType}
                class:hovered={hoveredZone === zoneType}
                style="--zone-position: {index};"
                ondrop={(e) => handleDrop(e, zoneType)}
                ondragover={(e) => handleZoneDragOver(e, zoneType)}
                ondragleave={(e) => handleZoneDragLeave(e, zoneType)}
                role="button"
                tabindex="0"
                aria-label={zone.description}
            >
                <div class="flashlight-content">
                    <Icone />
                    <div class="flashlight-text">{zone.label}</div>
                </div>
            </div>
        {/each}
        
        <!-- Central instruction text -->
        <div class="drag-instruction">
            <p>Släpp på en av zonerna för att lägga till</p>
        </div>
    </div>
{/if}

<style>
    .drag-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85); /* Dark background for flashlight effect */
        z-index: 2000;
        pointer-events: auto;
        animation: fadeIn 0.3s ease-out;
    }

    .flashlight-zone {
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        
        /* Flashlight effect - red/orange glow */
        background: radial-gradient(circle, rgba(217, 119, 6, 0.6) 0%, rgba(217, 119, 6, 0.3) 40%, transparent 70%);
        box-shadow: 
            0 0 50px rgba(217, 119, 6, 0.4),
            inset 0 0 50px rgba(217, 119, 6, 0.2);
        
        /* Position zones around the screen using CSS custom properties */
        /* Top row */

    }

    /* Position each zone using nth-child - improved spacing */
    .flashlight-zone:nth-child(1) { top: 12vh; left: 5vw; right: auto; }
    .flashlight-zone:nth-child(2) { top: 5vh; left: calc(50vw - 100px); right: auto; }
    .flashlight-zone:nth-child(3) { top: 12vh; right: 5vw; left: auto; }
    .flashlight-zone:nth-child(4) { top: calc(50vh - 100px); right: 2vw; left: auto; }
    .flashlight-zone:nth-child(5) { bottom: 12vh; right: 8vw; left: auto; top: auto; }
    .flashlight-zone:nth-child(6) { bottom: 5vh; left: calc(50vw - 100px); right: auto; top: auto; }
    .flashlight-zone:nth-child(7) { bottom: 12vh; left: 8vw; right: auto; top: auto; }
    .flashlight-zone:nth-child(8) { top: calc(50vh - 100px); left: 2vw; right: auto; }

    /* Responsive positioning for smaller screens */
    @media (max-width: 770px) and (min-width: 481px) {
        .flashlight-zone {
            width: 120px;
            height: 120px;
        }
        
        /* Simplified 2x4 grid for mobile */
        .flashlight-zone:nth-child(1) { top: 10vh; left: 10px; right: auto; }
        .flashlight-zone:nth-child(2) { top: 10vh; right: 10px; left: auto; }
        .flashlight-zone:nth-child(3) { top: calc(30vh - 60px); left: 10px; right: auto; }
        .flashlight-zone:nth-child(4) { top: calc(30vh - 60px); right: 10px; left: auto; }
        .flashlight-zone:nth-child(5) { top: calc(50vh - 60px); left: 10px; right: auto; }
        .flashlight-zone:nth-child(6) { top: calc(50vh - 60px); right: 10px; left: auto; }
        .flashlight-zone:nth-child(7) { top: calc(70vh - 60px); left: 10px; right: auto; }
        .flashlight-zone:nth-child(8) { top: calc(70vh - 60px); right: 10px; left: auto; }
        
        .flashlight-zone :global(svg) {
            width: 2rem;
            height: 2rem;
        }
        
        .flashlight-zone:hover :global(svg),
        .flashlight-zone.hovered :global(svg) {
            width: 2.5rem;
            height: 2.5rem;
        }
        
        .flashlight-text {
            font-size: 0.8rem;
        }
    }

    .flashlight-zone:hover,
    .flashlight-zone.active,
    .flashlight-zone.hovered {
        transform: scale(1.15);
        background: radial-gradient(circle, rgba(217, 119, 6, 0.9) 0%, rgba(217, 119, 6, 0.6) 40%, transparent 70%);
        box-shadow: 
            0 0 100px rgba(217, 119, 6, 0.8),
            inset 0 0 100px rgba(217, 119, 6, 0.4),
            0 0 200px rgba(255, 165, 0, 0.3);
        
        /* Add a pulsing animation on hover */
        animation: pulse 1.5s infinite ease-in-out;
    }

    .flashlight-content {
        text-align: center;
        color: white;
        z-index: 2001;
        pointer-events: none;
        padding: 1rem;
        transition: all 0.3s ease;
    }



    /* Icon styling with hover effects */
    .flashlight-zone :global(svg) {
        width: 3rem;
        height: 3rem;
        margin-bottom: 0.5rem;
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
        transition: all 0.3s ease;
        stroke-width: 1.5;
    }

    .flashlight-zone:hover :global(svg),
    .flashlight-zone.hovered :global(svg) {
        width: 3.5rem;
        height: 3.5rem;
        filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 10px rgba(255, 165, 0, 0.6));
        stroke-width: 2;
    }

    .flashlight-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
    }

    .flashlight-text {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        background: radial-gradient(
            circle,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.9) 30%,
            rgba(255, 255, 255, 0.7) 60%,
            rgba(255, 255, 255, 0.5) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        transition: all 0.3s ease;
    }

    .flashlight-zone:hover .flashlight-text,
    .flashlight-zone.hovered .flashlight-text {
        font-size: 1.2rem;
        text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
        background: radial-gradient(
            circle,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 1) 40%,
            rgba(255, 255, 255, 0.9) 70%,
            rgba(255, 255, 255, 0.7) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .drag-instruction {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: white;
        z-index: 2001;
        pointer-events: none;
    }

    .drag-instruction p {
        font-size: 1.2rem;
        font-weight: 600;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        margin: 0;
        background: radial-gradient(
            circle,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0.6) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    @keyframes pulse {
        0%, 100% {
            box-shadow: 
                0 0 100px rgba(217, 119, 6, 0.8),
                inset 0 0 100px rgba(217, 119, 6, 0.4),
                0 0 200px rgba(255, 165, 0, 0.3);
        }
        50% {
            box-shadow: 
                0 0 120px rgba(217, 119, 6, 1),
                inset 0 0 120px rgba(217, 119, 6, 0.5),
                0 0 250px rgba(255, 165, 0, 0.5);
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) and (min-width: 771px) {
        .flashlight-zone {
            width: 140px;
            height: 140px;
        }

        /* Adjust positioning to prevent overlaps on medium screens */
        .flashlight-zone:nth-child(1) { top: 12vh; left: 6vw; right: auto; }
        .flashlight-zone:nth-child(2) { top: 6vh; left: calc(35vw - 70px); right: auto; }
        .flashlight-zone:nth-child(3) { top: 6vh; left: calc(65vw - 70px); right: auto; }
        .flashlight-zone:nth-child(4) { top: 12vh; right: 6vw; left: auto; }
        .flashlight-zone:nth-child(5) { top: calc(50vh - 70px); right: 4vw; left: auto; }
        .flashlight-zone:nth-child(6) { bottom: 12vh; right: 10vw; left: auto; }
        .flashlight-zone:nth-child(7) { bottom: 6vh; left: calc(50vw - 70px); right: auto; }
        .flashlight-zone:nth-child(8) { top: calc(50vh - 70px); left: 4vw; right: auto; }

        .flashlight-zone :global(svg) {
            width: 2.5rem;
            height: 2.5rem;
        }

        .flashlight-zone:hover :global(svg),
        .flashlight-zone.hovered :global(svg) {
            width: 3rem;
            height: 3rem;
        }

        .flashlight-text {
            font-size: 1rem;
        }

        .flashlight-zone:hover .flashlight-text,
        .flashlight-zone.hovered .flashlight-text {
            font-size: 1.1rem;
        }
    }

    @media (min-width: 1025px) {
        /* Keep default positioning for larger screens */
    }

    @media (max-width: 480px) {
        .flashlight-zone {
            width: 100px;
            height: 100px;
        }

        /* Even more compact layout for very small screens */
        .flashlight-zone:nth-child(1) { top: 8vh; left: 5px; right: auto; }
        .flashlight-zone:nth-child(2) { top: 8vh; right: 5px; left: auto; }
        .flashlight-zone:nth-child(3) { top: calc(25vh - 50px); left: 5px; right: auto; }
        .flashlight-zone:nth-child(4) { top: calc(25vh - 50px); right: 5px; left: auto; }
        .flashlight-zone:nth-child(5) { top: calc(45vh - 50px); left: 5px; right: auto; }
        .flashlight-zone:nth-child(6) { top: calc(45vh - 50px); right: 5px; left: auto; }
        .flashlight-zone:nth-child(7) { bottom: calc(15vh - 50px); left: 5px; right: auto; }
        .flashlight-zone:nth-child(8) { bottom: calc(15vh - 50px); right: 5px; left: auto; }

        .flashlight-zone :global(svg) {
            width: 1.5rem;
            height: 1.5rem;
        }

        .flashlight-zone:hover :global(svg),
        .flashlight-zone.hovered :global(svg) {
            width: 2rem;
            height: 2rem;
        }

        .flashlight-text {
            font-size: 0.7rem;
        }

        .flashlight-zone:hover .flashlight-text,
        .flashlight-zone.hovered .flashlight-text {
            font-size: 0.8rem;
        }

        .drag-instruction p {
            font-size: 0.9rem;
        }
    }
</style>
