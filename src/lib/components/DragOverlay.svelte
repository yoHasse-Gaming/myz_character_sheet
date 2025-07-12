<script lang="ts">
    import { onDestroy } from 'svelte';
    import { openDialogueOption } from '../states/character_sheet.svelte';
    import { characterActions } from '../states/character_sheet.svelte';

    let isDragActive = $state(false);
    let dragOverZone = $state<string | null>(null);

    // Define drop zones with their positions and actions
    const dropZones = [
        {
            id: 'equipment-general',
            text: 'Lägg till utrustning',
            selector: '.equipment-tab .equipment-section:first-child',
            action: () => openDialogueOption('equipment')
        },
        {
            id: 'weapons',
            text: 'Lägg till vapen', 
            selector: '.equipment-tab .equipment-section:nth-child(2)',
            action: () => openDialogueOption('weapons')
        },
        {
            id: 'armor',
            text: 'Lägg till skydd',
            selector: '.equipment-tab .equipment-section:nth-child(3)',
            action: () => openDialogueOption('armor')
        },
        {
            id: 'mutations',
            text: 'Lägg till mutation',
            selector: '.mutations-tab',
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
            selector: '.talents-tab .talents-section:first-of-type',
            action: () => {
                const canAdd = characterActions.canAddOccupationalTalent() || characterActions.canAddSecondOccupationalTalent();
                if (canAdd) openDialogueOption('occupational-talents');
            }
        },
        {
            id: 'generic-talents',
            text: 'Lägg till generisk talang',
            selector: '.talents-tab .talents-section:last-of-type',
            action: () => {
                if (characterActions.canAddGenericTalent()) openDialogueOption('generic-talents');
            }
        }
    ];

    // Listen for global drag events
    function handleGlobalDragStart(event: DragEvent) {
        setTimeout(() => {
            isDragActive = true;
        }, 1);
    }

    function handleGlobalDragEnd(event: DragEvent) {
        isDragActive = false;
        dragOverZone = null;
    }

    function handleOverlayDragOver(event: DragEvent) {
        event.preventDefault();
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
        dragOverZone = null;
    }

    function handleOverlayDrop(event: DragEvent) {
        event.preventDefault();
        const data = event.dataTransfer?.getData('text/plain');
        
        if (data === 'add-item' && dragOverZone) {
            const zone = dropZones.find(z => z.id === dragOverZone);
            if (zone) {
                zone.action();
            }
        }
        
        isDragActive = false;
        dragOverZone = null;
    }

    function findZoneAtPosition(x: number, y: number): string | null {
        for (const zone of dropZones) {
            // Try the original selector first
            let element = document.querySelector(zone.selector);
            
            // Use the same fallback logic as getZonePosition
            if (!element) {
                if (zone.id.includes('talents')) {
                    const talentSections = document.querySelectorAll('.talents-section');
                    if (zone.id === 'occupational-talents' && talentSections[0]) {
                        element = talentSections[0] as HTMLElement;
                    } else if (zone.id === 'generic-talents' && talentSections[1]) {
                        element = talentSections[1] as HTMLElement;
                    }
                } else if (zone.id.includes('equipment')) {
                    const equipmentSections = document.querySelectorAll('.equipment-section');
                    if (zone.id === 'equipment-general' && equipmentSections[0]) {
                        element = equipmentSections[0] as HTMLElement;
                    } else if (zone.id === 'weapons' && equipmentSections[1]) {
                        element = equipmentSections[1] as HTMLElement;
                    } else if (zone.id === 'armor' && equipmentSections[2]) {
                        element = equipmentSections[2] as HTMLElement;
                    }
                } else if (zone.id === 'mutations') {
                    element = document.querySelector('.mutations-tab') || 
                             document.querySelector('[class*="mutations"]') as HTMLElement;
                } else if (zone.id === 'skills') {
                    element = document.querySelector('[data-drop-zone="skills"]') ||
                             document.querySelector('.skills-tab') as HTMLElement;
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
                // Try to find any talents section
                const talentSections = document.querySelectorAll('.talents-section');
                console.log(`Found ${talentSections.length} .talents-section elements`);
                
                if (zone.id === 'occupational-talents' && talentSections[0]) {
                    element = talentSections[0] as HTMLElement;
                } else if (zone.id === 'generic-talents' && talentSections[1]) {
                    element = talentSections[1] as HTMLElement;
                }
            } else if (zone.id.includes('equipment')) {
                // Try to find any equipment section
                const equipmentSections = document.querySelectorAll('.equipment-section');
                console.log(`Found ${equipmentSections.length} .equipment-section elements`);
                
                if (zone.id === 'equipment-general' && equipmentSections[0]) {
                    element = equipmentSections[0] as HTMLElement;
                } else if (zone.id === 'weapons' && equipmentSections[1]) {
                    element = equipmentSections[1] as HTMLElement;
                } else if (zone.id === 'armor' && equipmentSections[2]) {
                    element = equipmentSections[2] as HTMLElement;
                }
            } else if (zone.id === 'mutations') {
                // Try different mutations selectors
                element = document.querySelector('.mutations-tab') || 
                         document.querySelector('[class*="mutations"]') as HTMLElement;
            } else if (zone.id === 'skills') {
                // Try different skills selectors
                element = document.querySelector('[data-drop-zone="skills"]') ||
                         document.querySelector('.skills-tab') as HTMLElement;
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
        
        width: 300px;
        height: 300px;
        
        transform: translate(-50%, -50%);
        
        /* Realistic white flashlight effect */
        background: radial-gradient(circle, rgba(179, 44, 44, 0.8) 0%, transparent 60%);
        
        /* Krgba(221, 54, 54, 0.8)de for realistic lighting */
        mix-blend-mode: screen;
        
        transition: all 0.3s ease;
    }

    .flashlight-zone.active {
        /* Brighter and larger when active */
        background: radial-gradient(circle, rgba(179, 44, 44, 0.8) 0%, transparent 60%);
        
        transform: translate(-50%, -50%) scale(1.01);
        
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
