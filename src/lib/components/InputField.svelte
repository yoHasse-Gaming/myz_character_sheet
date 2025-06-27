<script lang="ts">
    export let label = '';
    export let type = 'text';
    export let bindValue: any;
</script>

<div class="space-y-2">
    {#if label}
        <label class="label" for={label.toLowerCase().replace(' ', '-')}>
            <span class="text-sm font-medium">{label}</span>
        </label>
    {/if}
    <input 
        class="input" 
        id={label.toLowerCase().replace(' ', '-')}
        {type} 
        bind:value={bindValue} 
        placeholder={label}
    />
</div>
  