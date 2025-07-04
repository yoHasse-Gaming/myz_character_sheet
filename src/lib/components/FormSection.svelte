<script lang="ts">
    let {header, children}: {
        header?: string | undefined,
        children?: () => any
    } = $props();
</script>

<div class="card" >
    {#if header}
    <h4 class="h4 font-bold form-labels">{header}</h4>
    {/if}
    <div class="p-4">
        {@render children?.()}
    </div>
</div>
