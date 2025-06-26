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



<div class="character-tab">
    <div class="grid">
        <input type="text" data-tooltip="Namn" id="name" data-placement="bottom" placeholder="Namn" bind:value={formData.name} />
        <input type="text" id="job" placeholder="Syssla" bind:value={formData.job} />
    </div>
    <FormSection header="UTSEENDE">
        <div class="grid">
            <input type="text" placeholder="Ansikte" bind:value={formData.appearance.face} />
            <input type="text" placeholder="Kropp" bind:value={formData.appearance.body} />
            <input type="text" placeholder="Kläder" bind:value={formData.appearance.clothes} />
        </div>
    </FormSection>
</div>