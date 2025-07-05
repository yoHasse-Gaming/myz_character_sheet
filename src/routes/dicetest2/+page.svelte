<!--
  Svelte 5 Dice Page Example using runes (+page.svelte)
  This shows a complete dice rolling interface with character sheet integration
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    diceState, 
    getDiceAnalysis, 
    diceActions, 
    checkDiceAvailability 
  } from '$lib/stores/dice.svelte';

  // Get the derived analysis
  const diceAnalysis = getDiceAnalysis();

  // Character stats using Svelte 5 runes
  let characterStats = $state({
    might: 3,
    agility: 4,
    wits: 2,
    empathy: 3
  });

  let selectedSkill = $state('survival');
  let skillLevel = $state(2);
  let gearBonus = $state(1);
  let errorMessage = $state('');

  // Derived values using Svelte 5 runes
  let canPushRoll = $derived(
    diceState.lastResult && 
    Object.values(diceState.lastResult.individualResults).some(v => v !== 1 && v !== 6)
  );

  let rerollableDiceCount = $derived(
    diceState.lastResult 
      ? Object.values(diceState.lastResult.individualResults).filter(v => v !== 1 && v !== 6).length
      : 0
  );

  onMount(() => {
    // Check dice availability when page loads
    checkDiceAvailability();
  });

  async function rollAttribute(attribute: keyof typeof characterStats) {
    try {
      errorMessage = '';
      await diceActions.rollAttribute(characterStats[attribute]);
    } catch (error) {
      errorMessage = `${attribute} roll failed: ${(error as Error).message}`;
      console.error(`${attribute} roll failed:`, error);
    }
  }

  async function rollSkill() {
    try {
      errorMessage = '';
      await diceActions.rollSkillCheck(skillLevel, gearBonus);
    } catch (error) {
      errorMessage = `Skill roll failed: ${(error as Error).message}`;
      console.error("Skill roll failed:", error);
    }
  }

  async function rollPush() {
    if (!canPushRoll) {
      errorMessage = "No dice can be re-rolled!";
      return;
    }
    
    try {
      errorMessage = '';
      await diceActions.customRoll({
        dice: [
          { style: "MYZSKILL", count: rerollableDiceCount }
        ],
        hidden: false
      });
    } catch (error) {
      errorMessage = `Push roll failed: ${(error as Error).message}`;
      console.error("Push roll failed:", error);
    }
  }

  function clearError() {
    errorMessage = '';
  }
</script>

<svelte:head>
  <title>Dice Rolling - Your Plugin</title>
</svelte:head>

<div class="dice-page">
  <h1>MYZ Dice Rolling (Svelte 5)</h1>

  {#if errorMessage}
    <div class="error-banner">
      <span>{errorMessage}</span>
      <button onclick={clearError} class="error-close">×</button>
    </div>
  {/if}

  {#if !diceState.isDiceAvailable}
    <div class="warning-card">
      <h2>⚠️ MYZ Dice Plugin Required</h2>
      <p>This page requires the MYZ Dice plugin to function.</p>
      <p>Please install the MYZ Dice plugin from the Owlbear Rodeo store to enable dice rolling features.</p>
      <button onclick={checkDiceAvailability} class="btn btn-primary">
        Check Again
      </button>
    </div>
  {:else}
    <div class="dice-interface">
      <!-- Character Attributes -->
      <section class="card">
        <h2>Character Attributes</h2>
        <div class="attribute-grid">
          {#each Object.entries(characterStats) as [attr, value]}
            <div class="attribute-btn" onclick={() => rollAttribute(attr as keyof typeof characterStats)}>
              <div class="attr-name">{attr.toUpperCase()}</div>
              <div class="attr-value">{value}</div>
              <div class="attr-edit">
                <div 
                  onclick={(e) => {
                    e.stopPropagation();
                    characterStats[attr as keyof typeof characterStats] = Math.max(1, value - 1);
                  }}
                  class="stat-btn"
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      characterStats[attr as keyof typeof characterStats] = Math.max(1, value - 1);
                    }
                  }}
                >
                  -
                </div>
                <div 
                  onclick={(e) => {
                    e.stopPropagation();
                    characterStats[attr as keyof typeof characterStats] = Math.min(5, value + 1);
                  }}
                  class="stat-btn"
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      characterStats[attr as keyof typeof characterStats] = Math.min(5, value + 1);
                    }
                  }}
                >
                  +
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Skill Rolling -->
      <section class="card">
        <h2>Skill Check</h2>
        <div class="skill-controls">
          <div class="input-group">
            <label for="skill-select">Skill:</label>
            <select id="skill-select" bind:value={selectedSkill}>
              <option value="survival">Survival</option>
              <option value="combat">Combat</option>
              <option value="stealth">Stealth</option>
              <option value="tech">Tech</option>
              <option value="social">Social</option>
            </select>
          </div>
          
          <div class="input-group">
            <label for="skill-level">Skill Level:</label>
            <input 
              id="skill-level" 
              type="number" 
              min="0" 
              max="5" 
              bind:value={skillLevel}
            />
          </div>
          
          <div class="input-group">
            <label for="gear-bonus">Gear Dice:</label>
            <input 
              id="gear-bonus" 
              type="number" 
              min="0" 
              max="3" 
              bind:value={gearBonus}
            />
          </div>
          
          <button 
            onclick={rollSkill}
            disabled={diceState.isRolling}
            class="btn btn-success btn-large"
          >
            {diceState.isRolling ? "Rolling..." : `Roll ${selectedSkill} (${skillLevel}+${gearBonus})`}
          </button>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="card">
        <h2>Quick Actions</h2>
        <div class="quick-actions">
          <button 
            onclick={() => diceActions.rollBaseDice(1)}
            disabled={diceState.isRolling}
            class="btn btn-warning"
          >
            Single Die
          </button>
          
          <button 
            onclick={() => diceActions.customRoll({
              dice: [
                { style: "MYZBASE", count: 2 },
                { style: "MYZSKILL", count: 2 },
                { style: "MYZGEAR", count: 2 }
              ]
            })}
            disabled={diceState.isRolling}
            class="btn btn-purple"
          >
            Full Pool (2+2+2)
          </button>
          
          <button 
            onclick={diceActions.openManualRoll}
            class="btn btn-secondary"
          >
            Manual Roll
          </button>
        </div>
      </section>

      <!-- Results Display -->
      {#if diceState.lastResult}
        <section class="card result-card">
          <h2>Roll Result</h2>
          
          <div class="result-summary">
            <div class="total-result">
              <span class="total-label">Total:</span>
              <span class="total-value">{diceState.lastResult.finalValue}</span>
            </div>
            
            <div class="myz-result" 
                 class:success={diceAnalysis.successes >= 3} 
                 class:failure={diceAnalysis.successes === 0} 
                 class:mishap={diceAnalysis.successes === 0 && diceAnalysis.ones > 0}>
              {diceAnalysis.rollSummary}
            </div>
          </div>

          <div class="result-details">
            <div class="stat">
              <strong>Successes (6s):</strong> {diceAnalysis.successes}
            </div>
            <div class="stat">
              <strong>Ones:</strong> {diceAnalysis.ones}
            </div>
            <div class="stat">
              <strong>Player:</strong> {diceState.lastResult.playerName}
            </div>
          </div>

          <!-- Push option -->
          {#if canPushRoll}
            <div class="push-section">
              <p><strong>Push the roll?</strong> Re-roll {rerollableDiceCount} dice that aren't 1s or 6s (but risk more 1s).</p>
              <button 
                onclick={rollPush}
                disabled={diceState.isRolling}
                class="btn btn-warning"
              >
                {diceState.isRolling ? "Rolling..." : `Push the Roll! (${rerollableDiceCount} dice)`}
              </button>
            </div>
          {/if}

          <details class="individual-results">
            <summary>Individual Die Results</summary>
            <div class="dice-results">
              {#each Object.entries(diceState.lastResult.individualResults) as [dieId, value]}
                <span class="die-result" 
                      class:success={value === 6} 
                      class:failure={value === 1}
                      class:rerollable={value !== 1 && value !== 6}>
                  {value}
                </span>
              {/each}
            </div>
          </details>
        </section>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dice-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
  }

  .error-banner {
    background-color: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #991b1b;
  }

  .error-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #991b1b;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .warning-card {
    background-color: #fef3cd;
    border: 1px solid #faebcc;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  .dice-interface {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .attribute-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .attribute-btn {
    background-color: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    position: relative;
  }

  .attribute-btn:hover:not(:disabled) {
    background-color: #e2e8f0;
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }

  .attribute-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .attr-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .attr-value {
    font-size: 2rem;
    font-weight: bold;
    color: #374151;
    margin: 0.5rem 0;
  }

  .attr-edit {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .stat-btn {
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: bold;
    transition: background-color 0.2s;
  }

  .stat-btn:hover {
    background-color: #2563eb;
  }

  .skill-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    align-items: end;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .input-group select,
  .input-group input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .input-group select:focus,
  .input-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .quick-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    color: white;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-large {
    grid-column: 1 / -1;
    padding: 1rem;
    font-size: 1rem;
  }

  .btn-primary { background-color: #3b82f6; }
  .btn-success { background-color: #10b981; }
  .btn-warning { background-color: #f59e0b; }
  .btn-purple { background-color: #8b5cf6; }
  .btn-secondary { background-color: #6b7280; }

  .btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .result-card {
    border-left: 4px solid #10b981;
  }

  .result-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .total-result {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .total-label {
    font-size: 1.125rem;
    color: #6b7280;
  }

  .total-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #374151;
  }

  .myz-result {
    font-size: 1.25rem;
    font-weight: bold;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    background-color: #f3f4f6;
    color: #374151;
    transition: all 0.2s;
  }

  .myz-result.success {
    background-color: #d1fae5;
    color: #065f46;
  }

  .myz-result.failure {
    background-color: #fee2e2;
    color: #991b1b;
  }

  .myz-result.mishap {
    background-color: #fecaca;
    color: #7f1d1d;
  }

  .result-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stat {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .push-section {
    background-color: #fef3cd;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
  }

  .individual-results {
    margin-top: 1rem;
  }

  .individual-results summary {
    cursor: pointer;
    font-weight: 600;
    padding: 0.5rem 0;
    transition: color 0.2s;
  }

  .individual-results summary:hover {
    color: #3b82f6;
  }

  .dice-results {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .die-result {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background-color: #f3f4f6;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.125rem;
    color: #374151;
    transition: all 0.2s;
  }

  .die-result.success {
    background-color: #d1fae5;
    border-color: #a7f3d0;
    color: #065f46;
  }

  .die-result.failure {
    background-color: #fee2e2;
    border-color: #fecaca;
    color: #991b1b;
  }

  .die-result.rerollable {
    background-color: #fef3cd;
    border-color: #fde68a;
    color: #92400e;
  }

  @media (max-width: 768px) {
    .dice-page {
      padding: 0.5rem;
    }
    
    .attribute-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
    
    .skill-controls {
      grid-template-columns: 1fr;
    }
    
    .result-summary {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }
  }
</style>
