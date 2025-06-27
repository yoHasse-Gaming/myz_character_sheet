
<script lang="ts">
    import { onMount } from 'svelte';
    import {
        FloatingArrow,
        arrow,
        autoUpdate,
        flip,
        offset,
        shift,
        useClick,
        useDismiss,
        useFloating,
        useInteractions,
        useRole,
    } from "@skeletonlabs/floating-ui-svelte";
    import { fade } from "svelte/transition";
    import { useHover } from '@skeletonlabs/floating-ui-svelte';

    let openSkillIndex = $state<number | null>(null);
    let elemArrow: HTMLElement | null = $state(null);

    // Create floating instance for each skill
    function createFloatingForSkill(skillIndex: number) {
        const isOpen = () => openSkillIndex === skillIndex;
        
        const floating = useFloating({
            whileElementsMounted: autoUpdate,
            get open() {
                return isOpen();
            },
            onOpenChange: (v) => {
                openSkillIndex = v ? skillIndex : null;
            },
            placement: "top",
            get middleware() {
                return [offset(10), flip(), shift({ padding: 8 }), elemArrow && arrow({ element: elemArrow })];
            },
        });

        const hover = useHover(floating.context, {
            delay: { open: 300, close: 100 }
        });
        const dismiss = useDismiss(floating.context);
        const role = useRole(floating.context, { role: "tooltip" });
        const interactions = useInteractions([hover, dismiss, role]);

        return { floating, interactions };
    }

    type Skill = {
        name: string;
        baseAbility: string;
        description: string;
        bonusEffects: string;
        examples?: string;
        value: number;
    };

    let skills: Skill[] = [

    {
        name: "Kämpa på",
        baseAbility: "STY",
        description: "<p>När Zonen kräver sin tribut - när du måste uthärda kyla, trötthet eller smärta - använder du denna färdighet för att fortsätta framåt.</p>",
        bonusEffects: "<ul><li>För varje extra <strong>☢️</strong> kan du hjälpa en vän i samma situation - de slipper rulla tärning.</li><li>Du kan offra dig själv för att hjälpa en vän, även vid enbart ett lyckat <strong>☢️</strong>.</li></ul>",
        examples: "<p>Används vid marsch i hårt väder, köld, utmattning.</p>",
        value: 0
    },

    {
        name: "Ta krafttag",
        baseAbility: "STY",
        description: "<p>Används för att lyfta, knuffa eller bryta upp föremål med ren styrka.</p>",
        bonusEffects: "<ul><li>Kasta föremålet så att en fiende tar skada lika med antal extra <strong>☢️</strong>.</li><li>Upptäck en dold passage eller ett dolt föremål (SL avgör vad).</li></ul>",
        examples: "<p>Lyfta bråte, forcera dörrar, dra upp fastklämda vänner.</p>",
        value: 0
    },

    {
        name: "Slåss",
        baseAbility: "STY",
        description: "<p>Används för närstrid - att slåss mot fiender med knytnävar eller vapen.</p>",
        bonusEffects: "<ul><li>+1 skada (kan upprepas).</li><li>Fienden tar 1 stress.</li><li>+2 initiativ nästa runda.</li><li>Fienden tappar ett föremål.</li><li>Fienden faller eller knuffas bakåt.</li><li>Du greppar fienden (han kan inte agera utan att slå sig fri).</li></ul>",
        examples: "<p>När du slåss i handgemäng, parerar eller tar någon till fånga.</p>",
        value: 0
    },

    {
        name: "Smyga",
        baseAbility: "KYL",
        description: "<p>Att tyst och osedd ta sig förbi fiender eller positionera sig för bakhåll.</p>",
        bonusEffects: "<ul><li>+1 modifikation per extra <strong>☢️</strong> för smygattack.</li></ul>",
        examples: "<p>Undvika strid, smyga upp på vakter, positionera sig för överraskning.</p>",
        value: 0
    },

    {
        name: "Fly",
        baseAbility: "KYL",
        description: "<p>För att ta dig ur konflikter, farliga situationer eller fysiskt svåra moment som hopp och balans.</p>",
        bonusEffects: "<ul><li>För varje extra <strong>☢️</strong> kan du hjälpa en vän att fly utan att rulla.</li><li>Du kan offra dig för en vän även vid bara ett <strong>☢️</strong>.</li></ul>",
        examples: "<p>Springa undan, klättra snabbt, kasta sig i skydd.</p>",
        value: 0
    },

    {
        name: "Skjuta",
        baseAbility: "KYL",
        description: "<p>Används för att träffa fiender med skjutvapen. Kräver ammunition. Lyckat slag gör vapenskada.</p>",
        bonusEffects: "<ul><li>+1 skada per extra <strong>☢️</strong> (kan upprepas).</li><li>Fienden får 1 stress.</li><li>+2 initiativ nästa runda.</li></ul>",
        examples: "<p>Avfyra pistol, gevär, improviserat vapen på avstånd.</p>",
        value: 0
    },

    {
        name: "Speja",
        baseAbility: "SKP",
        description: "<p>För att aktivt spana efter faror, platser eller individer i omgivningen.</p>",
        bonusEffects: "<ul><li>För varje extra <strong>☢️</strong>, välj en fråga:<br>- Är det ute efter mig?<br>- Finns det fler?<br>- Hur tar jag mig in/förbi/undan?</li></ul>",
        examples: "<p>Observera fiender, planera infallsväg, upptäcka fällor.</p>",
        value: 0
    },

    {
        name: "Förstå sig på",
        baseAbility: "SKP",
        description: "<p>För att förstå gammal teknologi, texter eller ruiner från den gamla världen.</p>",
        bonusEffects: "<ul><li>För varje extra <strong>☢️</strong> kan du lära någon annan hur man använder artefakten.</li></ul>",
        examples: "<p>Analysera artefakter, läsa forntekniska manualer.</p>",
        value: 0
    },

    {
        name: "Känna Zonen",
        baseAbility: "SKP",
        description: "<p>För att identifiera faror och fenomen ute i Zonen.</p>",
        bonusEffects: "<ul><li>För varje extra <strong>☢️</strong>, välj en fråga:<br>- Hur kan det skada mig?<br>- Hur kan jag skada det?</li></ul>",
        examples: "<p>Förstå mutantvarelser, farliga växter, zonfenomen.</p>",
        value: 0
    },

    {
        name: "Genomskåda",
        baseAbility: "KNS",
        description: "<p>För att tolka en annan mutants känslor och avsikter genom närkontakt och observation.</p>",
        bonusEffects: "<ul><li>För varje extra <strong>☢️</strong>, välj en fråga:<br>- Talar han sanning?<br>- Vill han mig illa?<br>- Vill han ha något av mig?</li></ul>",
        examples: "<p>Avläsa lögner, bedöma lojalitet, förstå motivation.</p>",
        value: 0
    },

    {
        name: "Manipulera",
        baseAbility: "KNS",
        description: "<p>För att övertala, hota eller förföra någon till att göra som du vill. Kräver rimlig motprestation.</p>",
        bonusEffects: "<ul><li>+1 tvivel eller stress på motparten per extra <strong>☢️</strong>. Om de blir brutna går de med på kravet utan motprestation.</li></ul>",
        examples: "<p>Förhandla, ljuga, utöva social press eller charm.</p>",
        value: 0
    },

    {
        name: "Vårda",
        baseAbility: "KNS",
        description: "<p>För att hela trauma och rädda liv - både fysiska och mentala skador.</p>",
        bonusEffects: "<ul><li>Vid lyckat slag på en bruten vän återfår de antal poäng lika med antalet <strong>☢️</strong>.</li><li>Vid kritiska skador kan ett misslyckat slag innebära döden.</li></ul>",
        examples: "<p>Första hjälpen, psykologisk tröst, stabilisera blödningar.</p>",
        value: 0
    }

];




</script>

<div class="skills-tab space-y-3">
    {#each skills as skill, index}
        {@const { floating, interactions } = createFloatingForSkill(index)}
        <div class="skill-item flex items-center justify-between p-2 bg-surface-200 dark:bg-surface-700 rounded">
            <div class="flex items-center flex-grow mr-4">
                <label class="label cursor-pointer">
                    <span class="text-sm font-medium">{skill.name} ({skill.baseAbility})</span>
                </label>
                <button 
                    class="info-icon ml-2 p-1 rounded-full hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
                    bind:this={floating.elements.reference}
                    {...interactions.getReferenceProps()}
                    aria-label="Show skill information"
                >
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                        class="text-surface-600 dark:text-surface-400"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9,9h0a3,3,0,0,1,5.12,2.12h0A3,3,0,0,1,13,14"></path>
                        <circle cx="12" cy="17" r=".5"></circle>
                    </svg>
                </button>
            </div>
            <input name={skill.name} 
                   type="number" 
                   min="0" 
                   class="input input-sm w-16 text-center font-user" 
                   bind:value={skill.value} />
        </div>

        {#if openSkillIndex === index}
            <div
                bind:this={floating.elements.floating}
                style={floating.floatingStyles}
                class="floating-tooltip"
                {...interactions.getFloatingProps()}
                transition:fade={{ duration: 150 }}
            >
                <div class="tooltip-content bg-surface-100 dark:bg-surface-700 border border-surface-300 dark:border-surface-300 rounded-lg p-4 shadow-lg max-w-sm">
                    <h3 class="font-bold text-lg mb-2 text-orange-400">{skill.name}</h3>
                    <div class="mb-3">
                        <h4 class="font-semibold text-sm mb-1 text-surface-800 dark:text-surface-100">Beskrivning:</h4>
                        <div class="text-sm text-surface-700 dark:text-surface-300 italic">{@html skill.description}</div>
                    </div>
                    <div class="mb-2">
                        <h4 class="font-semibold text-sm mb-1 text-surface-800 dark:text-surface-100">Bonuseffekter:</h4>
                        <div class="text-sm text-surface-700 dark:text-surface-200">{@html skill.bonusEffects}</div>
                    </div>
                    {#if skill.examples}
                        <div>
                            <h4 class="font-semibold text-sm mb-1 text-surface-800 dark:text-surface-100">Exempel:</h4>
                            <div class="text-sm text-surface-700 dark:text-surface-200">{@html skill.examples}</div>
                        </div>
                    {/if}
                </div>
                <FloatingArrow bind:ref={elemArrow} context={floating.context} class="fill-surface-100" />
            </div>
        {/if}
    {/each}
</div>

<style>
    .floating-tooltip {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1000;
        max-width: 320px;
    }

    .tooltip-content {
        line-height: 1.4;
    }

    .tooltip-content :global(strong) {
        font-weight: 600;
        color: var(--color-warning-500);
    }

    .tooltip-content :global(ul) {
        margin: 0.5rem 0;
        padding-left: 1rem;
    }

    .tooltip-content :global(li) {
        margin: 0.25rem 0;
        color: inherit;
    }

    .tooltip-content :global(p) {
        margin: 0.5rem 0;
        color: inherit;
    }

    .info-icon {
        opacity: 0.7;
        transition: opacity 0.2s ease;
    }

    .info-icon:hover {
        opacity: 1;
    }

    .info-icon svg {
        transition: transform 0.2s ease;
    }

    .info-icon:hover svg {
        transform: scale(1.1);
    }
</style>