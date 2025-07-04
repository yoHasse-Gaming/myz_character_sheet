<script lang="ts">
    // Demo component showing how to use CSS filter utility classes
    // for theme-aware SVG coloring
</script>

<div class="demo-container">
    <h3>SVG Theme Filter Demo</h3>
    
    <div class="demo-section">
        <h4>Circle Icons (Different Colors)</h4>
        <div class="icon-row">
            <div class="icon-demo">
                <img src="/myz_character_sheet/img/strokes/o.svg" alt="Circle" class="svg-surface-100" />
                <span>surface-100</span>
            </div>
            <div class="icon-demo">
                <img src="/myz_character_sheet/img/strokes/o.svg" alt="Circle" class="svg-surface-300" />
                <span>surface-300</span>
            </div>
            <div class="icon-demo">
                <img src="/myz_character_sheet/img/strokes/o.svg" alt="Circle" class="svg-surface-600" />
                <span>surface-600</span>
            </div>
            <div class="icon-demo">
                <img src="/myz_character_sheet/img/strokes/o.svg" alt="Circle" class="svg-surface-900" />
                <span>surface-900</span>
            </div>
        </div>
    </div>

    <div class="demo-section">
        <h4>X Icons (Different Colors)</h4>
        <div class="icon-row">
            <div class="icon-demo">
                <img src="/myz_character_sheet/img/strokes/x.svg" alt="X" class="svg-primary" />
                <span>primary</span>
            </div>
            <div class="icon-demo">
                <img src="/myz_character_sheet/img/strokes/x.svg" alt="X" class="svg-warning" />
                <span>warning</span>
            </div>
            <div class="icon-demo">
                <img src="/myz_character_sheet/img/strokes/x.svg" alt="X" class="svg-surface-900" />
                <span>surface-900</span>
            </div>
        </div>
    </div>

    <div class="demo-section">
        <h4>Usage Example</h4>
        <pre><code>{`<!-- Apply theme-aware colors to any SVG -->
<img src="your-icon.svg" class="svg-surface-900" alt="Dark icon" />
<img src="your-icon.svg" class="svg-surface-300" alt="Light icon" />
<img src="your-icon.svg" class="svg-primary" alt="Primary colored icon" />
<img src="your-icon.svg" class="svg-warning" alt="Warning colored icon" />

<!-- Colors automatically adapt to light/dark theme -->
<!-- No need for :global(.dark) overrides! -->`}</code></pre>
    </div>

    <div class="demo-section">
        <h4>Available CSS Filter Classes</h4>
        <ul>
            <li><code>.svg-surface-100</code> - Very light (adapts to theme)</li>
            <li><code>.svg-surface-300</code> - Light (adapts to theme)</li>
            <li><code>.svg-surface-600</code> - Medium (adapts to theme)</li>
            <li><code>.svg-surface-900</code> - Dark (adapts to theme)</li>
            <li><code>.svg-primary</code> - Primary color</li>
            <li><code>.svg-warning</code> - Warning/error color</li>
        </ul>
    </div>
</div>

<style>
    .demo-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        background: var(--color-surface-50);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    :global(.dark) .demo-container {
        background: var(--color-surface-800);
    }

    .demo-section {
        margin-bottom: 2rem;
    }

    h3 {
        color: var(--color-surface-900);
        margin-bottom: 1.5rem;
    }

    :global(.dark) h3 {
        color: var(--color-surface-100);
    }

    h4 {
        color: var(--color-surface-700);
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }

    :global(.dark) h4 {
        color: var(--color-surface-300);
    }

    .icon-row {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
    }

    .icon-demo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .icon-demo img {
        width: 32px;
        height: 32px;
        transition: filter 0.2s ease;
    }

    .icon-demo span {
        font-size: 0.8rem;
        color: var(--color-surface-600);
        font-family: monospace;
    }

    :global(.dark) .icon-demo span {
        color: var(--color-surface-400);
    }

    pre {
        background: var(--color-surface-200);
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.9rem;
    }

    :global(.dark) pre {
        background: var(--color-surface-700);
    }

    code {
        color: var(--color-surface-900);
        font-family: 'Courier New', monospace;
    }

    :global(.dark) code {
        color: var(--color-surface-100);
    }

    ul {
        list-style-type: disc;
        padding-left: 2rem;
    }

    li {
        margin-bottom: 0.5rem;
        color: var(--color-surface-700);
    }

    :global(.dark) li {
        color: var(--color-surface-300);
    }

    li code {
        background: var(--color-surface-200);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-size: 0.85rem;
    }

    :global(.dark) li code {
        background: var(--color-surface-600);
    }
</style>
