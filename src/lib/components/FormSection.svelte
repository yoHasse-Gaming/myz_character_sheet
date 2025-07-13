<script lang="ts">
    import { type Icon as IconType } from '@lucide/svelte';
    import type { Component } from 'svelte';


    let {header, headerIcon, children}: {
        header?: string | undefined,
        headerIcon?: Component | undefined,
        children?: () => any
    } = $props();

</script>
<div class="card">
    {#if header}
    {@const Icon = headerIcon}

    <h4 class="h4 font-bold form-labels">
        {#if Icon}
            <Icon />
        {/if}
        {header}
    </h4>
    {/if}
    <div class="p-4">
        {@render children?.()}
    </div>
</div>


<style>


</style>
