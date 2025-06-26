
<script lang="ts">
    import { onMount } from 'svelte';
    import tooltip from "$lib/tooltip";


let skills = [

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


    // onMount(() => {
    //     // Initialize tooltips for each skill
    //     skills.forEach(skill => {
    //         tippy(`#${skill.name}`, {
    //             content: skill.description,
    //             placement: 'bottom',
    //             theme: 'light',
    //             arrow: true,
    //             delay: 100
    //         });
    //     });
    // });

</script>

<div class="skills-tab">
    
        {#each skills as skill}
            <div class="skill-item">
                <label use:tooltip={{ 
                    content: skill.description + (skill.bonusEffects ? `<br><strong>Bonus:</strong> ${skill.bonusEffects}` : '') + (skill.examples ? `<br><strong>Exempel:</strong> ${skill.examples}` : ''),
                    allowHTML: true,
                }} for={skill.name}>{skill.name} ({skill.baseAbility})</label>

                <input name={skill.name} type="number" min="0" bind:value={skill.value} />
            </div>
        {/each}
    
</div>

<style>

    .skill-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        height: 3rem;
    }

    .skill-item label {
        flex-grow: 1;
        margin-right: 1rem;
    }

    .skill-details {
        flex-grow: 2;
        color: var(--color-secondary-text);
    }

    input[type="number"] {
        width: 4rem;
    }

</style>