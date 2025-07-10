<script lang="ts">
    import { characterActions, sheetState } from "../states/character_sheet.svelte";
    import FormSection from "./FormSection.svelte";
    import AbilitiesTab from "./tabs/AbilitiesTab.svelte";
    import CharacterTab from "./tabs/CharacterTab.svelte";
    import Mutations from "./tabs/Mutations.svelte";
    import TalentsTab from "./tabs/TalentsTab.svelte";
    import EquipmentTab from "./tabs/EquipmentTab.svelte";
    import RelationsNotesTab from "./tabs/RelationsNotesTab.svelte";

    let activeTab = $state(1);

    const tabs = [
        { id: 1, label: 'Karaktär' },
        { id: 2, label: 'Egenskaper' },
        { id: 3, label: 'Mutationer' },
        { id: 4, label: 'Talanger' },
        { id: 5, label: 'Utrustning' },
        { id: 6, label: 'Relationer' }
    ];

    const tabVariants = ['tab-variant-1', 'tab-variant-2', 'tab-variant-3', 'tab-variant-4', 'tab-variant-5', 'tab-variant-6'];


    
</script>

<div class="tab-nav">
    {#each tabs as tab, index}
        <div class="tab-button-wrapper {tabVariants[index]} {activeTab === tab.id ? 'active' : ''}">
            <button 
                class="tab-button {activeTab === tab.id ? 'active' : ''}"
                onclick={() => activeTab = tab.id}
            >
                {tab.label}
                
                {#if activeTab === tab.id}
                    <img 
                        src={`/img/stroke.png`} 
                        alt="{tab.label} icon"
                        class="tab-icon stroke-image active" />
                {/if}
            </button>
        </div>
    {/each}
</div>

<div class="tab-content relative overflow-hidden">
    
    <!-- Tab 1: Karaktär -->
    {#if activeTab === 1}
        <CharacterTab />
    {/if}

    <!-- Tab 2: Egenskaper -->
    {#if activeTab === 2}
        <AbilitiesTab />
    {/if}

    <!-- Tab 3: Mutationer -->
    {#if activeTab === 3}
        <div class="talents-mutations-tab">
            <FormSection header="🧬 MUTATIONER">
                <Mutations />
            </FormSection>
        </div>
    {/if}

    <!-- Tab 4: Talanger -->
    {#if activeTab === 4}
        <FormSection header="⚡ TALANGER">
            <TalentsTab />
        </FormSection>
    {/if}

    <!-- Tab 5: Utrustning -->
    {#if activeTab === 5}
        <EquipmentTab />
    {/if}

    <!-- Tab 6: Relationer och Anteckningar -->
    {#if activeTab === 6}
        <RelationsNotesTab />
    {/if}

</div>

<style>
    .tab-icon {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
    }
</style>