<script lang="ts">
    import { characterActions } from '../states/character_sheet.svelte';
    import { diceStates } from '../states/dice.svelte';

    // Test function to manually trigger dice roll modal with sample data
    function testDiceRollModal() {
        characterActions.openSkillRollModal(
            'Test Skill',
            3,
            'Styrka',
            4,
            1
        );
    }

    // Test function for ability roll
    function testAbilityRollModal() {
        characterActions.openAbilityRollModal(
            'Styrka',
            4,
            1
        );
    }
</script>

<div class="dice-test-container">
    <h3>Dice Roll Modal Test</h3>
    <p>These buttons will test the new dice roll modal functionality:</p>
    
    <div class="test-buttons">
        <button 
            class="test-btn"
            onclick={testDiceRollModal}
            disabled={!diceStates.isDicePluginAvailable}
        >
            Test Skill Roll Modal
        </button>
        
        <button 
            class="test-btn"
            onclick={testAbilityRollModal}
            disabled={!diceStates.isDicePluginAvailable}
        >
            Test Ability Roll Modal
        </button>
    </div>
    
    {#if !diceStates.isDicePluginAvailable}
        <p class="warning">⚠️ Dice plugin not available - buttons disabled</p>
    {/if}
    
    <div class="instructions">
        <h4>How to use:</h4>
        <ul>
            <li>Click dice buttons next to skills in the Skills tab to roll for that skill</li>
            <li>Click dice buttons next to abilities in the Character tab to roll for that ability</li>
            <li>The modal allows you to adjust dice counts and select equipment bonuses</li>
            <li>Equipment with bonuses will automatically appear for selection</li>
        </ul>
    </div>
</div>

<style>
    .dice-test-container {
        position: fixed;
        top: 120px;
        right: 1rem;
        z-index: 999;
        background: var(--color-surface-100);
        border: 2px solid var(--color-primary-500);
        border-radius: 8px;
        padding: 1rem;
        max-width: 300px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    :global(.dark) .dice-test-container {
        background: var(--color-surface-800);
        border-color: var(--color-primary-400);
    }

    .dice-test-container h3 {
        margin: 0 0 1rem 0;
        color: var(--color-primary-600);
        font-size: 1.1rem;
    }

    :global(.dark) .dice-test-container h3 {
        color: var(--color-primary-400);
    }

    .test-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 1rem 0;
    }

    .test-btn {
        padding: 0.5rem 1rem;
        background: var(--color-primary-500);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .test-btn:hover:not(:disabled) {
        background: var(--color-primary-600);
        transform: translateY(-1px);
    }

    .test-btn:disabled {
        background: var(--color-surface-400);
        cursor: not-allowed;
        opacity: 0.6;
    }

    .warning {
        color: var(--color-warning-600);
        font-size: 0.9rem;
        font-style: italic;
        margin: 0.5rem 0;
    }

    .instructions {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--color-surface-300);
    }

    :global(.dark) .instructions {
        border-top-color: var(--color-surface-600);
    }

    .instructions h4 {
        margin: 0 0 0.5rem 0;
        color: var(--color-surface-800);
        font-size: 0.95rem;
    }

    :global(.dark) .instructions h4 {
        color: var(--color-surface-200);
    }

    .instructions ul {
        margin: 0;
        padding-left: 1rem;
        font-size: 0.85rem;
        color: var(--color-surface-700);
    }

    :global(.dark) .instructions ul {
        color: var(--color-surface-300);
    }

    .instructions li {
        margin-bottom: 0.25rem;
    }
</style>
