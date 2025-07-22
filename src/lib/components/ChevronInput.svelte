<script lang="ts">
    import { ChevronDown, ChevronUp, SquareChevronDown, SquareChevronUp } from '@lucide/svelte';

    let {
        value = 1,
        min = 1,
        max = 5,
        onValueChange,
        name = '',
        ariaLabel = '',
        disabled = false,
        class: className = ''
    }: {
        value?: number;
        min?: number;
        max?: number;
        onValueChange?: (value: number) => void;
        name?: string;
        ariaLabel?: string;
        disabled?: boolean;
        class?: string;
    } = $props();

    function handleInputChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const newValue = parseInt(target.value) || min;
        const clampedValue = Math.max(min, Math.min(max, newValue));
        
        if (onValueChange) {
            onValueChange(clampedValue);
        }
    }

    function increment() {
        if (disabled || value >= max) return;
        const newValue = Math.min(max, value + 1);
        if (onValueChange) {
            onValueChange(newValue);
        }
    }

    function decrement() {
        if (disabled || value <= min) return;
        const newValue = Math.max(min, value - 1);
        if (onValueChange) {
            onValueChange(newValue);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (disabled) return;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                increment();
                break;
            case 'ArrowDown':
                event.preventDefault();
                decrement();
                break;
        }
    }
</script>

<div class="chevron-input-container {className}">
    <input 
        type="number" 
        {max}
        {min}
        {name}
        {disabled}
        class="chevron-input font-user" 
        {value}
        aria-label={ariaLabel}
        oninput={handleInputChange}
        onkeydown={handleKeydown}
    />
    <div class="chevron-controls">
        <button 
            class="chevron-button"
            onclick={increment}
            {disabled}
            aria-label="Increase {ariaLabel || name}"
            title="Increase value"
        >
        <SquareChevronUp size={12} />
        </button>
        <button 
            class="chevron-button"
            onclick={decrement}
            {disabled}
            aria-label="Decrease {ariaLabel || name}"
            title="Decrease value"
        >
            <SquareChevronDown size={12} />
        </button>
    </div>
</div>

<style>
    .chevron-input-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chevron-input {
        width: 1rem;
        height: 1rem;
        padding: 0;
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;
        background: transparent;
        color: var(--color-surface-900);
        transition: all 0.2s ease;
        cursor: default;
        position: relative;
        flex-shrink: 0;
    }

    :global(.dark) .chevron-input {
        color: var(--color-surface-100);
    }

    .chevron-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.3);
        transform: scale(1.02);
    }

    .chevron-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Hide default number input spinners */
    .chevron-input::-webkit-outer-spin-button,
    .chevron-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .chevron-input[type=number] {
        -moz-appearance: textfield;
    }
</style>
