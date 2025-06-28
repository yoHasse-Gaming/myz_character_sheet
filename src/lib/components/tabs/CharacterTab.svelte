<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';

    let formData = {
        name: '',
        job: '',
        appearance: {
            face: '',
            body: '',
            clothes: ''
        }
    };


</script>



<div class="character-tab space-y-6">
    <div class="card">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <div class="space-y-2">
            <label for="name" class="text-sm font-bold text-surface-900 dark:text-surface-900 uppercase tracking-wide">Namn</label>
            <div class="input-wrapper">
                <input type="text" 
                    class="input font-user" 
                    data-tooltip="Vad kallar dig de andra överlevarna?" 
                    id="name" 
                    data-placement="bottom" 
                    placeholder="t.ex. Rust, Echo, Zero..." 
                    bind:value={formData.name} />
            </div>
        </div>
        <div class="space-y-2">
        <label for="job" class="text-sm font-bold text-surface-900 uppercase tracking-wide">Syssla</label>
        <div class="input-wrapper">
            <input type="text" 
                    class="input font-user" 
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
                <label for="face" class="text-xs text-surface-900 uppercase">Ansikte</label>
                <div class="input-wrapper">
                    <textarea 
                        class="input font-user" 
                        placeholder="Ärrat, väderbitit, maskerat..." 
                        bind:value={formData.appearance.face} ></textarea>
                </div>
            </div>
            <div class="space-y-2">
                <label for="body" class="text-xs text-surface-800 uppercase">Kropp</label>
                <div class="input-wrapper">
                    <textarea 
                        class="input font-user" 
                        placeholder="Mager, muskulös, deformerad..." 
                        bind:value={formData.appearance.body} ></textarea>
                </div>
            </div>
            <div class="space-y-2">
                <label for="clothes" class="text-xs text-surface-800 uppercase">Kläder</label>
                <div class="input-wrapper">
                    <textarea 
                        class="input font-user" 
                        placeholder="Lappade trasor, läder, folie..." 
                        bind:value={formData.appearance.clothes} ></textarea>
                </div>
            </div>
        </div>
    </FormSection>
</div>