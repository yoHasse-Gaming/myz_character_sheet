<script lang="ts">
    import {
        FloatingArrow,
        arrow,
        autoUpdate,
        flip,
        offset,
        shift,
        useFloating,
        useInteractions,
        useRole,
        useHover,
        useDismiss
    } from "@skeletonlabs/floating-ui-svelte";
    import type { Placement } from "@floating-ui/dom";
    import { fade } from "svelte/transition";

    let {
        children,
        content,
        placement = "top" as Placement,
        delay = { open: 300, close: 100 },
        offsetDistance = 10
    } = $props();

    let isOpen = $state(false);
    let elemArrow: HTMLElement | null = $state(null);
    let isBrowser = typeof window !== 'undefined';

    const floating = useFloating({
        whileElementsMounted: autoUpdate,
        get open() {
            return isOpen;
        },
        onOpenChange: (v: boolean) => {
            isOpen = v;
        },
        placement,
        get middleware() {
            return [offset(offsetDistance), flip(), shift({ padding: 8 }), elemArrow && arrow({ element: elemArrow })];
        },
        strategy: 'fixed'
    });

    const hover = useHover(floating.context, { delay });
    const dismiss = useDismiss(floating.context);
    const role = useRole(floating.context, { role: "tooltip" });
    const interactions = useInteractions([hover, dismiss, role]);
</script>

<!-- Reference element (trigger) -->
<div
    bind:this={floating.elements.reference}
    {...interactions.getReferenceProps()}
>
    {@render children()}
</div>

<!-- Floating tooltip - portaled to document body -->
{#if isOpen && isBrowser}
    {#key isOpen}
        <div
            bind:this={floating.elements.floating}
            style={floating.floatingStyles}
            class="base-ability-floating-tooltip"
            {...interactions.getFloatingProps()}
            transition:fade={{ duration: 150 }}
        >
            <div class="tooltip-wrapper">
                <!-- Background element with the torn paper effect -->
                <div class="tooltip-background"></div>
                <!-- Content element without the effect -->
                <div class="tooltip-content">
                    {@render content()}
                </div>
            </div>
            <FloatingArrow bind:ref={elemArrow} context={floating.context} class="fill-surface-700 dark:fill-surface-300" />
        </div>
    {/key}
{/if}

<style>
    .base-ability-floating-tooltip {
        position: fixed;
        z-index: 99999;
        max-width: min(90vw, 400px);
        filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15));
    }

    .tooltip-wrapper {
        position: relative;
        border-radius: 0;
        overflow: hidden;
    }

    .tooltip-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('/img/card_bg.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        filter: var(--torn-filter-effect);
        z-index: 1;
        pointer-events: none;
    }

    :global(.dark) .tooltip-background {
        background: url('/img/card_bg_dark.png');
    }

    .tooltip-content {
        position: relative;
        z-index: 2;
        padding: 1.5rem;
        color: var(--color-surface-900);
        font-family: var(--font-user), serif;
        line-height: 1.6;
        background: transparent;
    }

    :global(.dark) .tooltip-content {
        color: var(--color-surface-100);
    }

    /* Content styling */
    .tooltip-content :global(h3) {
        font-family: var(--form-labels), serif;
        font-weight: bold;
        font-size: 1.25rem;
        color: var(--color-primary-900);
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) .tooltip-content :global(h3) {
        color: var(--color-primary-400);
    }

    .tooltip-content :global(h4) {
        font-weight: bold;
        font-size: 0.9rem;
        color: var(--color-surface-800);
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    :global(.dark) .tooltip-content :global(h4) {
        color: var(--color-surface-200);
    }

    .tooltip-content :global(.section-content) {
        font-size: 0.9rem;
        color: var(--color-surface-900);
        margin-bottom: 1rem;
    }

    .tooltip-content :global(.section-content):last-child {
        margin-bottom: 0;
    }

    :global(.dark) .tooltip-content :global(.section-content) {
        color: var(--color-surface-100);
    }

    .tooltip-content :global(strong) {
        font-weight: 600;
        color: var(--color-primary-600);
    }

    :global(.dark) .tooltip-content :global(strong) {
        color: var(--color-primary-400);
    }

    .tooltip-content :global(ul) {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }

    .tooltip-content :global(li) {
        margin: 0.25rem 0;
        color: inherit;
    }

    .tooltip-content :global(p) {
        margin: 0.5rem 0;
        color: inherit;
    }

    .tooltip-content :global(.trauma-item) {
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: rgba(217, 119, 6, 0.1);
        border-radius: 0.25rem;
        border-left: 3px solid var(--color-primary-600);
    }

    .tooltip-content :global(.trauma-item):last-child {
        margin-bottom: 0;
    }

    .tooltip-content :global(.trauma-title) {
        font-weight: bold;
        color: var(--color-primary-700);
        margin-bottom: 0.25rem;
        font-size: 1rem;
    }

    :global(.dark) .tooltip-content :global(.trauma-title) {
        color: var(--color-primary-400);
    }

    .tooltip-content :global(.trauma-description) {
        font-size: 0.9rem;
        line-height: 1.5;
    }
</style>
