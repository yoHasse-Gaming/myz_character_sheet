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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
            <label class="text-sm font-bold text-surface-300 uppercase tracking-wide">👤 Mutantnamn</label>
            <input type="text" 
                   class="input" 
                   data-tooltip="Vad kallar dig de andra överlevarna?" 
                   id="name" 
                   data-placement="bottom" 
                   placeholder="t.ex. Rust, Echo, Zero..." 
                   bind:value={formData.name} />
        </div>
        <div class="space-y-2">
            <label class="text-sm font-bold text-surface-300 uppercase tracking-wide">⚙️ Syssla</label>
            <input type="text" 
                   class="input" 
                   id="job" 
                   placeholder="t.ex. Skräpsamlare, Vakt, Mekaniker..." 
                   bind:value={formData.job} />
        </div>
    </div>
    <FormSection header="👁️ UTSEENDE">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
                <label class="text-xs text-surface-400 uppercase">Ansikte</label>
                <input type="text" 
                       class="input" 
                       placeholder="Ärrat, väderbitit, maskerat..." 
                       bind:value={formData.appearance.face} />
            </div>
            <div class="space-y-2">
                <label class="text-xs text-surface-400 uppercase">Kropp</label>
                <input type="text" 
                       class="input" 
                       placeholder="Mager, muskulös, deformerad..." 
                       bind:value={formData.appearance.body} />
            </div>
            <div class="space-y-2">
                <label class="text-xs text-surface-400 uppercase">Kläder</label>
                <input type="text" 
                       class="input" 
                       placeholder="Lappade trasor, läder, folie..." 
                       bind:value={formData.appearance.clothes} />
            </div>
        </div>
    </FormSection>
</div>