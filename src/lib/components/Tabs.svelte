<script lang="ts">
    import { characterActions, sheetState } from "../states/character_sheet.svelte";
    import FormSection from "./FormSection.svelte";
    import AbilitiesTab from "./tabs/AbilitiesTab.svelte";
    import CharacterTab from "./tabs/CharacterTab.svelte";
    import Mutations from "./tabs/Mutations.svelte";
    import TalentsTab from "./tabs/TalentsTab.svelte";

    let activeTab = $state(1);

    const tabs = [
        { id: 1, label: 'Karaktär' },
        { id: 2, label: 'Egenskaper' },
        { id: 3, label: 'Mutationer' },
        { id: 4, label: 'Talanger' },
        { id: 5, label: 'Övrigt' }
    ];


    const tabVariants = ['tab-variant-1', 'tab-variant-2', 'tab-variant-3', 'tab-variant-4'];


    
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

    <!-- Tab 3: Talanger & Mutationer -->
    {#if activeTab === 3}
        <div class="talents-mutations-tab">

            <FormSection header="🧬 MUTATIONER">
                <Mutations />
            </FormSection>
            

        </div>
    {/if}

    {#if activeTab === 4}
        <FormSection header="⚡ TALANGER">
            <TalentsTab />
        </FormSection>
    {/if}


    <!-- Tab 4: Övrigt -->
    {#if activeTab === 5}
        <div class="other-tab space-y-6">
            <FormSection header="🎒 UTRUSTNING">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">📦</div>
                    <p class="italic">Skrot och rost som håller dig vid liv...</p>
                </div>
            </FormSection>
            <FormSection header="⚔️ VAPEN & RUSTNING">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">🛡️</div>
                    <p class="italic">Ditt skydd mot Zonens faror</p>
                </div>
            </FormSection>
            <FormSection header="👥 RELATIONER">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">🤝</div>
                    <p class="italic">Vänner och fiender i ödemarken</p>
                </div>
            </FormSection>
            <FormSection header="📝 ANTECKNINGAR">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">📋</div>
                    <p class="italic">Minnen från den gamla världen...</p>
                </div>
            </FormSection>
        </div>
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