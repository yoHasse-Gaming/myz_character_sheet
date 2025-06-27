<script lang="ts">
    export let label = '';
    export let bindValue: string;
</script>

<div class="form-control w-full">
    <label class="label">
        <span class="label-text">{label}</span>
    </label>
    <textarea class="textarea textarea-bordered h-24" bind:value={bindValue}></textarea>
</div>