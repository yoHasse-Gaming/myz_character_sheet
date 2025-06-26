<script lang="ts">
    export let label = '';
    export let type = 'text';
    export let bindValue: any;
  </script>
  
  <div class="input-field">
    <label>{label}</label>
    <input type={type} bind:value={bindValue} />
  </div>
  
<style>
.input-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
  