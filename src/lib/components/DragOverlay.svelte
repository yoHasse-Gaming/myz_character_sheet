<script lang="ts">
    import { onDestroy } from 'svelte';
    import { characterActions } from '../states/character_sheet.svelte';
    import { openDialogueOption } from '../states/modals.svelte';

    let isDragActive = $state(false);
    let dragOverZone = $state<string | null>(null);
    let currentDragType = $state<string | null>(null);

    // Define drop zones with their positions and actions
    const dropZones = [
        {
            id: 'equipment-general',
            text: 'Lägg till utrustning',
            selector: '[data-drop-zone="equipment"]',
            action: () => openDialogueOption('equipment')
        },
        {
            id: 'weapons',
            text: 'Lägg till vapen', 
            selector: '[data-drop-zone="weapons"], .weapons-section',
            action: () => openDialogueOption('weapons')
        },
        {
            id: 'armor',
            text: 'Lägg till skydd',
            selector: '[data-drop-zone="armor"], .armor-section',
            action: () => openDialogueOption('armor')
        },
        {
            id: 'mutations',
            text: 'Lägg till mutation',
            selector: '.mutations-list, [data-drop-zone="mutations"]',
            action: () => openDialogueOption('mutations')
        },
        {
            id: 'skills',
            text: 'Lägg till färdigheter',
            selector: '[data-drop-zone="skills"]',
            action: () => openDialogueOption('optionalSkills')
        },
        {
            id: 'occupational-talents',
            text: 'Lägg till yrkestalang',
            selector: '[data-drop-zone="occupational-talents"]',
            action: () => {
                const canAdd = characterActions.canAddOccupationalTalent() || characterActions.canAddSecondOccupationalTalent();
                if (canAdd) openDialogueOption('occupational-talents');
            }
        },
        {
            id: 'generic-talents',
            text: 'Lägg till generisk talang',
            selector: '[data-drop-zone="generic-talents"]',
            action: () => {
                if (characterActions.canAddGenericTalent()) openDialogueOption('generic-talents');
            }
        },
        {
            id: 'relations',
            text: 'Lägg till relation',
            selector: '[data-drop-zone="relations"], .relations-section',
            action: () => openDialogueOption('relations')
        },
        {
            id: 'notes',
            text: 'Lägg till anteckning',
            selector: '[data-drop-zone="notes"], .notes-section',
            action: () => characterActions.addNote('NewNote')
        }
    ];

    // Listen for global drag events
    function handleGlobalDragStart(event: DragEvent) {
        // Only activate overlay for our specific drag operations
        // Check if this is a valid HTML5 drag event with our data
        if (!event.dataTransfer || !isValidDragSource(event)) {
            return;
        }
        
        // Get the drag type
        const target = event.target as HTMLElement;
        currentDragType = target?.closest('[draggable="true"]')?.getAttribute('data-drag-type') || 'add-item';
        
        setTimeout(() => {
            isDragActive = true;
        }, 1);
    }

    function handleGlobalDragEnd(event: DragEvent) {
        // Only deactivate if this was our drag operation
        if (!event.dataTransfer || !isValidDragSource(event)) {
            return;
        }
        
        isDragActive = false;
        dragOverZone = null;
        currentDragType = null;
    }

    function isValidDragSource(event: DragEvent): boolean {
        // Check if the drag source is our add-item draggable
        const target = event.target as HTMLElement;
        
        // Check for our specific data type
        const hasAddItemData = event.dataTransfer?.types.includes('text/plain') ?? false;
        
        // Check if the dragged element or its parent has our specific classes/attributes
        const dragTypeAttribute = target?.closest('[draggable="true"]')?.getAttribute('data-drag-type');
        const isAddItemDraggable = dragTypeAttribute && (
            dragTypeAttribute === 'add-item' || 
            dragTypeAttribute === 'add-relation' || 
            dragTypeAttribute === 'add-note'
        );
        
        // Check if this is NOT an interact.js drag (interact.js usually doesn't use HTML5 dragstart events)
        const isInteractJsDrag = target?.closest('.interact-draggable') ||
                                target?.hasAttribute('data-interact') ||
                                (event.target as HTMLElement)?.classList?.contains('interact-draggable');
        
        return hasAddItemData && !!isAddItemDraggable && !isInteractJsDrag;
    }

    function handleOverlayDragOver(event: DragEvent) {
        event.preventDefault();
        
        // Only handle if this is our drag operation
        if (!isValidDragOperation(event)) {
            return;
        }
        
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
        
        // Find which zone we're over
        const rect = event.currentTarget as HTMLElement;
        const x = event.clientX;
        const y = event.clientY;
        
        // Find the zone based on cursor position
        dragOverZone = findZoneAtPosition(x, y);
    }

    function handleOverlayDragLeave(event: DragEvent) {
        // Only handle if this is our drag operation
        if (!isValidDragOperation(event)) {
            return;
        }
        
        dragOverZone = null;
    }

    function handleOverlayDrop(event: DragEvent) {
        event.preventDefault();
        
        // Only handle if this is our drag operation
        if (!isValidDragOperation(event)) {
            return;
        }
        
        const data = event.dataTransfer?.getData('text/plain');
        
        if (dragOverZone) {
            const zone = dropZones.find(z => z.id === dragOverZone);
            if (zone && data === 'add-item') {
                zone.action();
            }
        }
        
        isDragActive = false;
        dragOverZone = null;
        currentDragType = null;
    }

    function isValidDragOperation(event: DragEvent): boolean {
        // Check if we have the expected data type and content
        const data = event.dataTransfer?.getData('text/plain') || '';
        return (
            data === 'add-item' || 
            data === 'add-relation' || 
            data === 'add-note' || 
            (event.dataTransfer?.types.includes('text/plain') ?? false)
        );
    }

    function findZoneAtPosition(x: number, y: number): string | null {        
        for (const zone of dropZones) {
            // For add-item drag type, show all zones
            // For specific drag types, only show matching zones
            if (currentDragType !== 'add-item') {
                if ((zone.id === 'relations' && currentDragType !== 'add-relation') ||
                    (zone.id === 'notes' && currentDragType !== 'add-note')) {
                    continue;
                }
            }
            
            // Try the original selector first
            let element = document.querySelector(zone.selector);
            
            // Use the same fallback logic as getZonePosition
            if (!element) {
                if (zone.id.includes('talents')) {
                    // Try to find the specific talents section by data attribute
                    if (zone.id === 'occupational-talents') {
                        element = document.querySelector('[data-drop-zone="occupational-talents"]') ||
                                 document.querySelector('.talents-section:first-of-type') as HTMLElement;
                    } else if (zone.id === 'generic-talents') {
                        element = document.querySelector('[data-drop-zone="generic-talents"]') ||
                                 document.querySelector('.talents-section:last-of-type') as HTMLElement;
                    }
                } else if (zone.id.includes('equipment') || zone.id === 'weapons' || zone.id === 'armor') {
                    // Try to find equipment sections by data attribute or class
                    if (zone.id === 'equipment-general') {
                        element = document.querySelector('[data-drop-zone="equipment"]') ||
                                 document.querySelector('.equipment-section') as HTMLElement;
                    } else if (zone.id === 'weapons') {
                        element = document.querySelector('[data-drop-zone="weapons"]') ||
                                 document.querySelector('.weapons-section') as HTMLElement;
                    } else if (zone.id === 'armor') {
                        element = document.querySelector('[data-drop-zone="armor"]') ||
                                 document.querySelector('.armor-section') as HTMLElement;
                    }
                } else if (zone.id === 'mutations') {
                    element = document.querySelector('.mutations-list') ||
                            document.querySelector('[data-drop-zone="mutations"]') ||
                            document.querySelector('.mutations-tab') as HTMLElement;
                } else if (zone.id === 'skills') {
                    element = document.querySelector('[data-drop-zone="skills"]') ||
                            document.querySelector('.skills-tab') as HTMLElement;                } else if (zone.id === 'relations') {
                    element = document.querySelector('[data-drop-zone="relations"]') ||
                             document.querySelector('.relations-section') as HTMLElement;
                } else if (zone.id === 'notes') {
                    element = document.querySelector('[data-drop-zone="notes"]') ||
                             document.querySelector('.notes-section') as HTMLElement;
                }
            }
            
            if (element) {
                const rect = element.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    return zone.id;
                }
            }
        }
        return null;
    }

    function getZonePosition(zone: typeof dropZones[0]) {
        // Try the original selector first
        let element = document.querySelector(zone.selector);
        
        // If not found, try alternative selectors based on the zone type
        if (!element) {
            if (zone.id.includes('talents')) {
                // Try to find the specific talents section by data attribute
                console.log(`Looking for talents zone: ${zone.id}`);
                
                if (zone.id === 'occupational-talents') {
                    element = document.querySelector('[data-drop-zone="occupational-talents"]') ||
                             document.querySelector('.talents-section:first-of-type') as HTMLElement;
                } else if (zone.id === 'generic-talents') {
                    element = document.querySelector('[data-drop-zone="generic-talents"]') ||
                             document.querySelector('.talents-section:last-of-type') as HTMLElement;
                }
            } else if (zone.id.includes('equipment') || zone.id === 'weapons' || zone.id === 'armor') {
                // Try to find equipment sections by data attribute or class
                console.log(`Looking for equipment zone: ${zone.id}`);
                
                if (zone.id === 'equipment-general') {
                    element = document.querySelector('[data-drop-zone="equipment"]') ||
                             document.querySelector('.equipment-section') as HTMLElement;
                } else if (zone.id === 'weapons') {
                    element = document.querySelector('[data-drop-zone="weapons"]') ||
                             document.querySelector('.weapons-section')  as HTMLElement;
                } else if (zone.id === 'armor') {
                    element = document.querySelector('[data-drop-zone="armor"]') ||
                             document.querySelector('.armor-section') as HTMLElement;
                }
            } else if (zone.id === 'mutations') {
                // Try different mutations selectors - prioritize content area
                element = document.querySelector('.mutations-list') ||
                         document.querySelector('[data-drop-zone="mutations"]') ||
                         document.querySelector('.mutations-tab') as HTMLElement;
            } else if (zone.id === 'skills') {
                // Try different skills selectors
                element = document.querySelector('[data-drop-zone="skills"]') ||
                         document.querySelector('.skills-tab') as HTMLElement;
            } else if (zone.id === 'relations') {
                // Try different relations selectors
                element = document.querySelector('[data-drop-zone="relations"]') ||
                         document.querySelector('.relations-section') as HTMLElement;
            } else if (zone.id === 'notes') {
                // Try different notes selectors
                element = document.querySelector('[data-drop-zone="notes"]') ||
                         document.querySelector('.notes-section') as HTMLElement;
            }
        }
        
        if (element) {
            const rect = element.getBoundingClientRect();
            console.log(`Found zone ${zone.id} at:`, rect);
            return {
                left: rect.left + rect.width / 2,
                top: rect.top + rect.height / 2,
                visible: true
            };
        }
        
        console.log('Zone not found:', zone.id, zone.selector);
        return { left: 0, top: 0, visible: false };
    }

    // Add global event listeners
    if (typeof window !== 'undefined') {
        window.addEventListener('dragstart', handleGlobalDragStart);
        window.addEventListener('dragend', handleGlobalDragEnd);
        
        onDestroy(() => {
            window.removeEventListener('dragstart', handleGlobalDragStart);
            window.removeEventListener('dragend', handleGlobalDragEnd);
        });
    }
</script>

{#if isDragActive}
    <div 
        class="drag-overlay"
        role="region"
        aria-label="Drop zones för att lägga till föremål"
        ondragover={handleOverlayDragOver}
        ondragleave={handleOverlayDragLeave}
        ondrop={handleOverlayDrop}
    >
        {#each dropZones as zone}
            {@const shouldShow = (
                currentDragType === 'add-item' || 
                (zone.id === 'relations' && currentDragType === 'add-relation') ||
                (zone.id === 'notes' && currentDragType === 'add-note')
            )}
            {#if shouldShow}
                {@const pos = getZonePosition(zone)}
                {#if pos.visible}
                    <div 
                        class="flashlight-zone"
                        class:active={dragOverZone === zone.id}
                        style="
                            left: {pos.left}px;
                            top: {pos.top}px;
                        "
                    >
                        <div class="flashlight-text">{zone.text}</div>
                    </div>
                {/if}
            {/if}
        {/each}
    </div>
{/if}

<style>
    .drag-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8); /* Darker for better flashlight effect */
        z-index: 999;
        backdrop-filter: blur(1px);
    }

    .flashlight-zone {
        position: absolute;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        
        width: 400px;
        height: 400px;
        
        transform: translate(-50%, -50%);
        
        /* Realistic white flashlight effect */
        background: radial-gradient(circle, rgba(179, 44, 44, 0.8) 0%, transparent 70%);
        
        /* Krgba(221, 54, 54, 0.8)de for realistic lighting */
        mix-blend-mode: screen;
        
        transition: all 0.3s ease;
    }

    .flashlight-zone.active {
        /* Brighter and larger when active */
        background: radial-gradient(circle, rgba(179, 44, 44, 0.9) 0%, transparent 70%);
        
        transform: translate(-50%, -50%) scale(1.1);
        
        /* Add a subtle golden tint for active state */
        filter: sepia(0.8) saturate(2) hue-rotate(10deg) brightness(1.3);
    }


    .flashlight-text {
        font-size: 1.1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        
        /* Text that matches the red flashlight tint with gradient falloff */
        background: radial-gradient(
            circle at center,
            #ff6b6b 0%,
            #cc4444 30%,
            #992222 60%,
            #661111 80%,
            #440000 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        
        /* No background - let the flashlight illuminate it naturally */
        
        /* Simple spacing */
        padding: 0.5rem;
        
        /* Text appears to glow in the red light */
        position: relative;
        z-index: 1;
    }
</style>
