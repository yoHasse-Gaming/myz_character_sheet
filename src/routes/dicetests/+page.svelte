<!--
  Svelte 5 component example using runes and shared state
  This shows how to use the dice integration with Svelte 5 runes
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    diceState, 
    getDiceAnalysis, 
    diceActions, 
    initializeDiceState, 
    cleanupDiceState 
  } from '$lib/stores/dice.svelte';

  // Get the derived analysis
  const diceAnalysis = getDiceAnalysis();

  onMount(async () => {
    // Initialize the dice state
    await initializeDiceState();
    
    // Cleanup on component destroy
    return () => {
      cleanupDiceState();
    };
  });

  async function handleSkillCheck() {
    try {
      await diceActions.rollSkillCheck(3, 2);
      console.log(`Skill check: ${diceAnalysis.successes} successes, ${diceAnalysis.ones} ones`);
      
      if (diceAnalysis.successes >= 3) {
        alert("Great success!");
      } else if (diceAnalysis.successes === 0 && diceAnalysis.ones > 0) {
        alert("Mishap!");
      }
    } catch (error) {
      alert("Failed to roll dice: " + (error as Error).message);
    }
  }

  async function handleAttributeCheck() {
    try {
      await diceActions.rollAttribute(4);
    } catch (error) {
      console.error("Attribute check failed:", error);
    }
  }

  async function handleCustomRoll() {
    try {
      await diceActions.customRoll({
        dice: [
          { style: "MYZBASE", count: 2 },
          { style: "MYZSKILL", count: 3 },
          { style: "MYZGEAR", count: 1 }
        ],
        hidden: false
      });
    } catch (error) {
      console.error("Custom roll failed:", error);
    }
  }
</script>

{#if !diceState.isDiceAvailable}
  <div class="plugin-container">
    <h3>Your Svelte 5 Plugin</h3>
    <p>MYZ Dice plugin is not available. Dice rolling features are disabled.</p>
    <p>Install the MYZ Dice plugin to enable dice rolling.</p>
  </div>
{:else}
  <div class="plugin-container">
    <h3>Your Svelte 5 Plugin - Dice Integration</h3>
    
    <div class="status">
      <strong>Status:</strong> MYZ Dice plugin detected ✅
    </div>

    <div class="button-grid">
      <button 
        onclick={handleSkillCheck} 
        disabled={diceState.isRolling}
        class="btn btn-success"
      >
        {diceState.isRolling ? "Rolling..." : "Skill Check (3+2)"}
      </button>
      
      <button 
        onclick={handleAttributeCheck} 
        disabled={diceState.isRolling}
        class="btn btn-primary"
      >
        {diceState.isRolling ? "Rolling..." : "Attribute Check (4)"}
      </button>
      
      <button 
        onclick={() => diceActions.rollBaseDice(3)} 
        disabled={diceState.isRolling}
        class="btn btn-warning"
      >
        {diceState.isRolling ? "Rolling..." : "Base Dice (3)"}
      </button>
      
      <button 
        onclick={handleCustomRoll} 
        disabled={diceState.isRolling}
        class="btn btn-purple"
      >
        {diceState.isRolling ? "Rolling..." : "Custom Roll"}
      </button>
      
      <button 
        onclick={diceActions.openManualRoll}
        class="btn btn-secondary"
      >
        Open Dice Plugin
      </button>
    </div>

    {#if diceState.lastResult}
      <div class="result-display">
        <h4>Last Roll Result:</h4>
        <div><strong>Player:</strong> {diceState.lastResult.playerName}</div>
        <div><strong>Total:</strong> {diceState.lastResult.finalValue}</div>
        
        <div class="myz-analysis">
          <strong>MYZ Analysis:</strong>
          <div class="analysis-summary" class:success={diceAnalysis.successes >= 3} class:mishap={diceAnalysis.successes === 0 && diceAnalysis.ones > 0}>
            {diceAnalysis.rollSummary}
          </div>
          <ul>
            <li>Successes (6s): {diceAnalysis.successes}</li>
            <li>Ones: {diceAnalysis.ones}</li>
          </ul>
        </div>

        <details>
          <summary>Individual Results</summary>
          <ul>
            {#each Object.entries(diceState.lastResult.individualResults) as [dieId, value]}
              <li class:success={value === 6} class:one={value === 1}>
                Die {dieId.slice(-3)}: {value}
              </li>
            {/each}
          </ul>
        </details>
      </div>
    {/if}
  </div>
{/if}

<style>
  .plugin-container {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    max-width: 600px;
  }

  .status {
    margin-bottom: 15px;
    font-size: 16px;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  .btn {
    padding: 10px 16px;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-success {
    background-color: #4CAF50;
  }

  .btn-primary {
    background-color: #2196F3;
  }

  .btn-warning {
    background-color: #FF9800;
  }

  .btn-purple {
    background-color: #9C27B0;
  }

  .btn-secondary {
    background-color: #607D8B;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .result-display {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    border-left: 4px solid #007bff;
  }

  .result-display h4 {
    margin-top: 0;
    color: #495057;
  }

  .myz-analysis {
    margin: 15px 0;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
  }

  .analysis-summary {
    font-size: 18px;
    font-weight: bold;
    margin: 5px 0;
    padding: 8px;
    border-radius: 4px;
    background-color: #e9ecef;
  }

  .analysis-summary.success {
    background-color: #d4edda;
    color: #155724;
  }

  .analysis-summary.mishap {
    background-color: #f8d7da;
    color: #721c24;
  }

  details {
    margin-top: 10px;
  }

  summary {
    cursor: pointer;
    font-weight: bold;
    padding: 5px 0;
  }

  .result-display ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  .result-display li {
    margin: 3px 0;
  }

  .result-display li.success {
    color: #28a745;
    font-weight: bold;
  }

  .result-display li.one {
    color: #dc3545;
    font-weight: bold;
  }
</style>
