<script lang="ts">
    import DraggableAddItem from '../DraggableAddItem.svelte';
        import { characterActions, sheetState, initialCardPositions } from '../../states/character_sheet.svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import EquipmentModal from '../Modals/EquipmentModal.svelte';
    import WeaponModal from '../Modals/WeaponModal.svelte';
    import ArmorModal from '../Modals/ArmorModal.svelte';
    import NewEquipmentModal from '../Modals/NewEquipmentModal.svelte';
    import NewWeaponModal from '../Modals/NewWeaponModal.svelte';
    import { openInfoModal } from '../../states/modals.svelte';
    import { Backpack, BowArrow, CircleX, Dices, Grab, Hand, Info, ShieldHalf, Swords } from '@lucide/svelte';
    import PaperCard from '../PaperCard.svelte';
    import ConfirmationModal from '../Modals/ConfirmationModal.svelte';
    import type { Weapon } from '../../types';
    import { diceStates } from '../../states/dice.svelte';

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


    // Initialize empty arrays if not already set - the modal actions will populate them
    // No longer using equipmentTable as we use sheetState.equipment directly

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

    // Calculate total weight from equipment items
    const totalWeight = $derived(() => {
        const total = sheetState.equipment.reduce((sum, item) => 
            sum + (item.quantity * item.weight), 0
        );
        const weaponTotal = sheetState.weapons.reduce((sum, weapon) => 
            sum + (1), 0 // TODO: update to weapon.weight when available
        );
        console.log('Total weight calculated:', total, 'from items:', sheetState.equipment);
        return total + weaponTotal;
    });


    // Generate variants for visual variety
    const equipmentVariants = $derived(generateUniqueVariants(sheetState.equipment.length + 1));
    const weaponVariants = $derived(generateUniqueVariants(sheetState.weapons.length + 1));
    const armorVariants = $derived(generateUniqueVariants(sheetState.armor.length + 1));
    
    // Special variant for the draggable add item
    const addItemVariant = 'variant-6'; // Using a vibrant variant for the add item

    // Confirmation modal state for weapons
    let weaponConfirmationOpen = $state(false);
    let weaponToDelete = $state<string | null>(null);
    let weaponNameToDelete = $state<string>("");

    function requestDeleteWeapon(weaponId: string, weaponName: string) {
        weaponToDelete = weaponId;
        weaponNameToDelete = weaponName;
        weaponConfirmationOpen = true;
    }



    function confirmDeleteWeapon() {
        if (weaponToDelete) {
            characterActions.removeWeapon(weaponToDelete);
            weaponToDelete = null;
            weaponNameToDelete = "";
        }
    }

    function cancelDeleteWeapon() {
        weaponToDelete = null;
        weaponNameToDelete = "";
    }

    function rollForWeapon(weaponIndex: number) {
        // Implement the roll logic for the weapon
        const weapon = sheetState.weapons[weaponIndex];
        if (!weapon) return;

        const isRanged = weapon.type === 'RANGED';
        console.log('weapon type:', weapon.type, 'isRanged:', isRanged);
        // If range, use "skjuta" skill, otherwise use "slåss"
        const skillId = isRanged ? 'sk_6d8f2g5h' : 'sk_9q3w7e2r'; // sk_9q3w7e2r == slåss, sk_6d8f2g5h == skjuta

        const skill = sheetState.skills.find(s => s.id === skillId);
        console.log(`Rolling for weapon: ${weapon.name}, using skill: ${skill ? skill.name : 'not found'}`);
        if (!skill) {
            console.error(`Skill with ID ${skillId} not found`);
            return;
        }

        const baseAbility = sheetState.baseAbilities.find(a => a.type === skill.baseAbility);
        if (!baseAbility) {
            console.error(`Base ability with type ${skill.baseAbility} not found`);
            return;
        }

        characterActions.openWeaponRollModal(
            weapon,
            skill,
            baseAbility
        );

    }

    // Function to show equipment info in modal
    function showEquipmentInfo(item: any) {
        const totalWeight = (item.quantity * item.weight).toFixed(2);
        const content = `
            <div class="equipment-section">
                <h4 class="section-title">Beskrivning:</h4>
                <div class="section-content">${item.description || 'Ingen beskrivning tillgänglig'}</div>
            </div>
            <div class="equipment-section">
                <h4 class="section-title">Detaljer:</h4>
                <div class="section-content">
                    <p><strong>Antal:</strong> ${item.quantity}</p>
                    <p><strong>Vikt per stycke:</strong> ${item.weight} kg</p>
                    <p><strong>Total vikt:</strong> ${totalWeight} kg</p>
                </div>
            </div>
        `;
        openInfoModal(item.name || 'Utrustning', content, 'equipment');
    }

    // Function to show weapon info in modal
    function showWeaponInfo(weapon: Weapon) {
        const rangeNames = ['Närstrid', 'Nära', 'Kort', 'Lång'];
        const content = `
            <div class="equipment-section">
                <h4 class="section-title">Beskrivning:</h4>
                <div class="section-content">${weapon.description || 'Ingen beskrivning tillgänglig'}</div>
            </div>
            <div class="equipment-section">
                <h4 class="section-title">Kampstatistik:</h4>
                <div class="section-content">
                    <p><strong>Bonus:</strong> +${weapon.bonus || 0}</p>
                    <p><strong>Skada:</strong> ${weapon.damage || 1}</p>
                    <p><strong>Räckvidd:</strong> ${rangeNames[weapon.range] || 'Närstrid'}</p>
                    <p><strong>Vikt:</strong> ${weapon.weight || 0} kg</p>
                    <p><strong>Status:</strong> ${weapon.equipped ? 'Utrustad' : 'Inte utrustad'}</p>
                </div>
            </div>
        `;
        openInfoModal(weapon.name || 'Vapen', content, 'weapon');
    }

    // Function to show armor info in modal
    function showArmorInfo(armor: any) {
        const content = `
            <div class="equipment-section">
                <h4 class="section-title">Beskrivning:</h4>
                <div class="section-content">${armor.description || 'Ingen beskrivning tillgänglig'}</div>
            </div>
            <div class="equipment-section">
                <h4 class="section-title">Skyddsstatistik:</h4>
                <div class="section-content">
                    <p><strong>Skydd:</strong> ${armor.protection || 0}</p>
                    <p><strong>Vikt:</strong> ${armor.weight || 0} kg</p>
                    <p><strong>Status:</strong> ${armor.equipped ? 'Utrustad' : 'Inte utrustad'}</p>
                </div>
            </div>
        `;
        openInfoModal(armor.name || 'Rustning', content, 'armor');
    }
</script>

<EquipmentModal />

<WeaponModal />

<ArmorModal />

<NewEquipmentModal />

<NewWeaponModal />

    <!-- Draggable Add Item -->
    <!-- <DraggableAddItem 
        text="Dra för att lägga till"
        ariaLabel="Dra för att lägga till föremål"
        variant={addItemVariant}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
    /> -->

    <!-- Equipment Section -->
<PaperCard
    paperId={`equipment`}
    draggable={true}
    resizable={true}
    autoResize={true}
    initialSize={{ width: 450, height: 100 }}
    minSize={{ width: 350, height: 100 }}
    initialPosition={initialCardPositions["equipment"]}
    class=""
>

    {#snippet content()}
    <span class="field-label">Utrustning - Total vikt: {totalWeight()} kg</span>
{#each sheetState.equipment as item, index}

        <div class="equipment-content">
            <Backpack size={16} />
            <input 
                type="text" 
                class="equipment-name-input"
                bind:value={item.name}
                placeholder="Utrustnings namn"
                title="Utrustnings namn"
            />
            <input
                    type="number"
                    min="1"
                    class="equipment-quantity"
                    bind:value={item.quantity}
                    title="Antal"
                />
            <div class="equipment-controls">
                <button 
                    class="info-icon-button"
                    onclick={() => showEquipmentInfo(item)}
                    aria-label="Information om {item.name}"
                    title="Visa information om {item.name}"
                >
                    <Info size={16} />
                </button>

                <button 
                    class="remove-button" 
                    onclick={() => characterActions.removeEquipment(item.id)}
                    aria-label="Ta bort vapen {item.name}"
                >
                    <CircleX size={16} />
                </button>
            </div>
        </div>

{/each}
            {/snippet}
</PaperCard>
<!-- Weapons Section -->
<PaperCard
        paperId={`weapons`}
        draggable={true}
        resizable={false}
        initialPosition={initialCardPositions["weapons"]}
        minSize={{ width: 450, height: 100 }}
    >
{#snippet content()}
<span>Vapen</span>

{#each sheetState.weapons as weapon, index}

            <div class="weapon-content">
                <div class="weapon-header">
                    <div class="weapon-name-section">
                        {#if weapon.type === 'MELEE'}
                        <Swords size={18} color={weapon.equipped ? "#22c55e" : "currentColor"} />
                        {:else}
                        <BowArrow size={18} color={weapon.equipped ? "#22c55e" : "currentColor"} />
                        {/if}
                        <input 
                            type="text" 
                            class="weapon-name-input"
                            bind:value={weapon.name}
                            placeholder="Vapens namn"
                            title="Vapens namn"
                        />
                    </div>
                    <div class="weapon-controls">
                        <button 
                            class="equipped-button {weapon.equipped ? 'active' : ''}"
                            onclick={() => weapon.equipped = !weapon.equipped}
                            aria-label="Markera som {weapon.equipped ? 'inte utrustad' : 'utrustad'}"
                            title={weapon.equipped ? 'Utrustad' : 'Inte utrustad'}
                        >
                            {#if weapon.equipped}
                                <Grab size={16} color="#22c55e" />
                            {:else}
                                <Hand size={16} />
                            {/if}
                        </button>
                        {#if diceStates.isDicePluginAvailable}
                            <button 
                                class="dice-roll-button"
                                onclick={() => rollForWeapon(index)}
                                aria-label="Slå tärning för {weapon.name}"
                                title="Slå tärning för {weapon.name}"
                            >
                                <Dices />
                            </button>
                        {/if}
                        <button 
                            class="info-icon-button"
                            onclick={() => showWeaponInfo(weapon)}
                            aria-label="Information om {weapon.name}"
                            title="Visa information om {weapon.name}"
                        >
                            <Info size={16} />
                        </button>
                        <button 
                            class="remove-button" 
                            onclick={() => requestDeleteWeapon(weapon.id, weapon.name)}
                            aria-label="Ta bort vapen {weapon.name}"
                        >
                            <CircleX size={16} />
                        </button>
                    </div>
                </div>
                <div class="weapon-stats">
                    <div class="stat-item">
                        <span class="stat-label">Bonus:</span>
                        <input 
                            type="number" 
                            min="0" 
                            max="10"
                            class="stat-input"
                            bind:value={weapon.bonus}
                            title="Vapens bonusmodifikator"
                        />
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Skada:</span>
                        <input 
                            type="number" 
                            min="1" 
                            max="20"
                            class="stat-input"
                            bind:value={weapon.damage}
                            title="Vapens skada"
                        />
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Räckvidd:</span>
                        <select 
                            class="stat-select"
                            bind:value={weapon.range}
                            title="Vapens räckvidd"
                        >
                            <option value={0}>Närstrid</option>
                            <option value={1}>Nära</option>
                            <option value={2}>Kort</option>
                            <option value={3}>Lång</option>
                        </select>
                    </div>
                </div>
            </div>

{/each}
    {/snippet}
</PaperCard>

        <!-- Armor Section -->
<PaperCard
        paperId={`armors`}
        draggable={true}
        resizable={false}
        initialPosition={initialCardPositions["armors"]}
        minSize={{ width: 450, height: 100 }}
    >
        {#snippet content()}    
        <span class="field-label">Rustning</span>
{#each sheetState.armor as armor, index}

            <div class="armor-content">
                <ShieldHalf size={16} />
                <span class="armor-name">{armor.name || 'Rustning'}</span>
                <div class="armor-controls">
                    <label class="equipped-checkbox">
                        <input 
                            type="checkbox" 
                            bind:checked={armor.equipped}
                        />
                        <span class="equipped-label">Utrustad</span>
                    </label>
                    <button 
                        class="info-icon-button"
                        onclick={() => showArmorInfo(armor)}
                        aria-label="Information om {armor.name}"
                        title="Visa information om {armor.name}"
                    >
                        <Info size={16} />
                    </button>
                    <button
                        class="remove-button"
                        onclick={() => characterActions.removeArmor(armor.id)}
                        aria-label="Ta bort {armor.name}"
                    >
                        <CircleX size={16} />
                    </button>
                </div>
            </div>

{/each}
    {/snippet}
</PaperCard>

<!-- Drag Overlay -->

<!-- Weapon Confirmation Modal -->
<ConfirmationModal 
    bind:open={weaponConfirmationOpen}
    title="Ta bort vapen"
    message={`Är du säker på att du vill ta bort vapnet "${weaponNameToDelete}"?`}
    confirmText="Ta bort"
    cancelText="Avbryt"
    onConfirm={confirmDeleteWeapon}
    onCancel={cancelDeleteWeapon}
/>

<style>
    /* Section containers for better drop zone targeting */
    .equipment-section,
    .weapons-section,
    .armor-section {
        position: relative;
        min-height: 200px;
        padding: 1rem;
        border-radius: 8px;

    }


    /* Equipment Grid Layout */
    .equipment-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
    }

    .equipment-name {
        flex: 1;
        font-size: 0.85rem;
        font-weight: 500;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .equipment-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .equipment-quantity {
        width: 40px;
        height: 24px;
        padding: 2px 4px;
        font-size: 1rem;
        text-align: center;
        border: 1px solid var(--color-border);
        border-radius: 3px;
        background: var(--color-background);
        pointer-events: auto; /* Allow interaction with input */
        cursor: text;
    }

    /* Weapon styles */
    .weapon-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
    }

    .weapon-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
    }

    .weapon-name-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .weapon-name {
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        pointer-events: none;
    }

    :global(.dark) .weapon-name {
        color: var(--color-surface-100);
    }

    .weapon-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .weapon-stats {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.25rem 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        flex: 1;
    }

    .stat-label {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--color-surface-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .stat-input {
        font-size: 1rem;
        font-weight: bold;
        color: var(--color-primary-600);
    }

    :global(.dark) .stat-label {
        color: var(--color-surface-200);
    }

    :global(.dark) .stat-value {
        color: var(--color-primary-400);
    }

    /* Armor styles */
    .armor-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
    }

    .armor-name {
        flex: 1;
        font-size: 0.85rem;
        font-weight: 500;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        pointer-events: none;
    }

    .armor-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    /* Shared styles for equipped checkbox */
    .equipped-checkbox {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.7rem;
        cursor: pointer;
        pointer-events: auto;
    }

    .equipped-label {
        white-space: nowrap;
    }

    .equipped-button {
        padding: 0.25rem;
        border-radius: 50%;
        border: 1px solid var(--color-surface-300);
        background: transparent;
        color: var(--color-surface-600);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        pointer-events: auto;
    }

    .equipped-button:hover {
        background: var(--color-surface-100);
        transform: scale(1.1);
    }

    .equipped-button.active {
        border-color: var(--color-success-500);
        background: var(--color-success-50);
        color: var(--color-success-600);
    }

    .equipped-button.active:hover {
        background: var(--color-success-100);
    }

    :global(.dark) .equipped-button {
        border-color: var(--color-surface-600);
        color: var(--color-surface-400);
    }

    :global(.dark) .equipped-button:hover {
        background: var(--color-surface-700);
    }

    :global(.dark) .equipped-button.active {
        border-color: var(--color-success-400);
        background: var(--color-success-900);
        color: var(--color-success-300);
    }


</style>
