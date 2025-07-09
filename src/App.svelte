<script lang="ts">
    import SizeControls from './lib/components/SizeControls.svelte';
    import OptionalSkillsModal from './lib/components/Modals/OptionalSkillsModal.svelte';
    import MutationsModal from './lib/components/Modals/MutationsModal.svelte';
    import FormSection from './lib/components/FormSection.svelte';
    import { characterActions, sheetState } from './lib/states/character_sheet.svelte';
    import Mutations from './lib/components/Mutations.svelte';
    import AbilitiesTab from './lib/components/tabs/AbilitiesTab.svelte';
    import CharacterTab from './lib/components/tabs/CharacterTab.svelte';
    import InfoModal from './lib/components/Modals/InfoModal.svelte';
	let isDarkMode = $state(true); // Default to dark mode for your apocalyptic theme

	let showSizeControls = $state(false);
    let containerWidth = $state(800);
	let containerHeight = $state(600);

    function handleResize(event: CustomEvent<{ width: number; height: number }>) {
        containerWidth = event.detail.width;
        containerHeight = event.detail.height;
    }

    function toggleTheme() {
		isDarkMode = !isDarkMode;
		updateTheme();
		
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
		
	}

    function updateTheme() {
        const html = document.documentElement;
        // Clear both classes first
        html.classList.remove('dark', 'light');
        
        if (isDarkMode) {
            html.classList.add('dark');
        } else {
            html.classList.add('light');
        }
        
        // Also update the data-theme for skeleton
        document.body.setAttribute('data-theme', 'vintage');
	}

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
<InfoModal />
<OptionalSkillsModal />
<MutationsModal />

<div class="theme-toggle-container">
	<button 
		class="btn variant-filled-surface theme-toggle-btn"
		onclick={toggleTheme}
		aria-label="Toggle dark/light mode"
		title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
	>
		{#if isDarkMode}
			<!-- Sun icon for switching to light mode -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="5"></circle>
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
			</svg>
		{:else}
			<!-- Moon icon for switching to dark mode -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
			</svg>
		{/if}
	</button>
</div>


<main class="sheet-container">
<svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    height="0"
    width="0"
>
    <defs>
        <filter id="squiggle">
            <feTurbulence
                type="fractalNoise"
                id="turbulence"
                baseFrequency=".06"
                numOctaves="4"
                seed="2"
            />
            <feDisplacementMap
                id="displacement"
                in="SourceGraphic"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="G"
            />
        </filter>
    </defs>
</svg>

<svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    height="0"
    width="0"
>
    <defs>
        <filter id="squiggle_lines">
            <feTurbulence
                type="fractalNoise"
                id="turbulence"
                baseFrequency=".05"
                numOctaves="4"
                seed="1"
            />
            <feDisplacementMap
                id="displacement"
                in="SourceGraphic"
                scale="4"
                xChannelSelector="R"
                yChannelSelector="G"
            />
        </filter>
    </defs>
</svg>

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
            
            <!-- Mutation Points Section -->
            <div class="mt-6">
                <FormSection header="🔬 MUTATIONSPOÄNG">
                    <div class="mutation-points-container">
                        <div class="mutation-points-display">
                            <span class="mutation-points-label">
                                Mutationspoäng:
                            </span>
                            <div class="mutation-points-controls">
                                <div class="mutation-points-indicators">
                                    {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as idx}
                                        <button 
                                            class="mutation-point-indicator"
                                            onclick={() => {
                                                if (sheetState.mutationPoints > idx) {
                                                    // If this indicator is filled, reduce points to this level
                                                    characterActions.setTotalMutationPoints(idx);
                                                } else {
                                                    // If this indicator is not filled, increase points to include this level
                                                    characterActions.setTotalMutationPoints(idx + 1);
                                                }
                                            }}
                                            aria-label="Toggle mutation point {idx + 1}"
                                        >
                                            <!-- Always show the circle as base layer -->
                                            <img src='/img/strokes/o.svg' alt="No points" class="stroke-image circle-layer" />
                                            <!-- Show X on top if point is spent -->
                                            {#if sheetState.mutationPoints > idx}
                                                <img 
                                                    src='/img/strokes/x.svg' 
                                                    alt="Point available" 
                                                    class="stroke-image x-layer" 
                                                />
                                            {/if}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                        <div class="mutation-points-info">
                            <p class="mutation-points-explanation">
                                Mutationspoäng representerar din potentiella kraft från Zonen. 
                                Klicka på cirklarna för att ställa in dina tillgängliga poäng.
                            </p>
                        </div>
                    </div>
                </FormSection>
            </div>
        </div>
    {/if}

    {#if activeTab === 4}
        <FormSection header="⚡ TALANGER">
            <div class="text-center py-8 text-surface-400">
                <div class="text-4xl mb-2">🎯</div>
                <p class="italic">Överlevnadsfärdigheter från Zonen...</p>
                <p class="text-sm mt-2">Kommer implementeras</p>
            </div>
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
</main>



<div class="size-toggle-container">
	<button 
		class="btn variant-filled-surface size-toggle-btn"
		onclick={() => showSizeControls = !showSizeControls}
		aria-label="Toggle size controls"
		title={showSizeControls ? 'Hide Size Controls' : 'Show Size Controls'}
	>
		📏
	</button>
</div>
{#if showSizeControls}
	<SizeControls 
		currentWidth={containerWidth}
		currentHeight={containerHeight}
		onresize={handleResize}
	/>
{/if}
<!-- Modals -->


<style>

    .theme-toggle-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 999;
	}
    .size-toggle-container {
		position: fixed;
		top: 1rem;
		right: 5rem;
		z-index: 999;
	}
    .theme-toggle-btn,
	.size-toggle-btn {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		background: linear-gradient(135deg, #d97706, #b45309) !important;
		border: 2px solid #78350f;
		color: #fef3c7 !important;
	}

    .theme-toggle-btn:hover,
	.size-toggle-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
	}

	:global(.light) .theme-toggle-btn,
	:global(.light) .size-toggle-btn {
		background: linear-gradient(135deg, #525252, #404040) !important;
		border-color: #737373;
		color: #f5f5f5 !important;
	}


    .tab-icon {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
    }
</style>


