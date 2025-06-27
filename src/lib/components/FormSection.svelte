<script lang="ts">
    let {header, children}: {
        header?: string | undefined,
        children?: () => any
    } = $props();
</script>

<div class="card bg-surface-100 dark:bg-surface-800 shadow-lg">
    {#if header}
    <div class="card-header bg-primary-500 text-white p-4" 
         style="background-image: url('/img/details/ground_abilities_bg.png'); background-size: cover; background-position: center;">
        <h3 class="h4 font-bold">{header}</h3>
    </div>
    {/if}
    <div class="p-4">
        {@render children?.()}
    </div>
</div>
