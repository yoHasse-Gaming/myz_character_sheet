<script lang="ts">
    export let name = '';
    export let options: number[] = [];
    export let title = '';
</script>

<div class="radio-group">
    <label>{title}</label>
    {#each options as option}
    {@const newName = name + option}
        <input type="radio" name={newName} value={option} />
    {/each}
</div>

<style>
    .radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>