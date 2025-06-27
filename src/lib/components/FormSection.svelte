<script lang="ts">
    let {header, children}: {
        header?: string | undefined,
        children?: () => any
    } = $props();
</script>

<div class="card" style="border: 1px solid #FFF;">
    {#if header}
    <h3 class="h4 font-bold form-labels friendly-stranger text-surface-800">{header}</h3>
    {/if}
    <div class="p-4">
        {@render children?.()}
    </div>
</div>
