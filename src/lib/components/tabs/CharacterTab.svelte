<script lang="ts">
    import FormSection from '../FormSection.svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';

    let formData = {
        name: '',
        job: '',
        appearance: {
            face: '',
            body: '',
            clothes: ''
        }
    };

    // Generate random variants for each input to make them unique
    const [nameVariant, jobVariant, faceVariant, bodyVariant, clothesVariant] = generateUniqueVariants(5);

</script>



<div class="character-tab space-y-6">
    <div class="card">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <div class="space-y-2">
            <label for="name" class="text-sm font-bold uppercase tracking-wide">Namn</label>
            <div class="torn-input-wrapper {nameVariant}">
                <input type="text" 
                    class="torn-input font-user" 
                    data-tooltip="Vad kallar dig de andra överlevarna?" 
                    id="name" 
                    data-placement="bottom" 
                    placeholder="t.ex. Rust, Echo, Zero..." 
                    bind:value={formData.name} />
            </div>
        </div>
        <div class="space-y-2">
        <label for="job" class="text-sm font-bold uppercase tracking-wide">Syssla</label>
        <div class="torn-input-wrapper {jobVariant}">
            <input type="text" 
                    class="torn-input font-user" 
                    id="job" 
                    placeholder="t.ex. Skräpsamlare, Vakt, Mekaniker..." 
                    bind:value={formData.job} />
        </div>
        </div>
    </div>
    </div>
    <FormSection header="UTSEENDE">
        <div class="grid grid-cols-1 gap-4">
            <div class="space-y-2">
                <label for="face" class="text-xs uppercase">Ansikte</label>
                <div class="torn-input-wrapper {faceVariant}">
                    <textarea 
                        class="torn-input font-user" 
                        placeholder="Ärrat, väderbitit, maskerat..." 
                        bind:value={formData.appearance.face} ></textarea>
                </div>
            </div>
            <div class="space-y-2">
                <label for="body" class="text-xs text-surface-800 uppercase">Kropp</label>
                <div class="torn-input-wrapper {bodyVariant}">
                    <textarea 
                        class="torn-input font-user" 
                        placeholder="Mager, muskulös, deformerad..." 
                        bind:value={formData.appearance.body} ></textarea>
                </div>
            </div>
            <div class="space-y-2">
                <label for="clothes" class="text-xs text-surface-800 uppercase">Kläder</label>
                <div class="torn-input-wrapper {clothesVariant}">
                    <textarea 
                        class="torn-input font-user" 
                        placeholder="Lappade trasor, läder, folie..." 
                        bind:value={formData.appearance.clothes} ></textarea>
                </div>
            </div>
        </div>
    </FormSection>
</div>