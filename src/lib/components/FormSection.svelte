<script lang="ts">

    let {header, children}: {
        header?: string | undefined,
        children?: () => any
    } = $props();


</script>

<div>


<article>
    {#if header}
    <header>
        <span>{header}</span>
    </header>
    {/if}
    {@render children?.()}
</article>

</div>


<style>
    article {
        overflow: hidden;
        /* max-width: 983px; */
    }

    article>header {
        background-image: url('/img/details/ground_abilities_bg.png');
        background-size: cover;
        background-position: center;
    }
</style>
