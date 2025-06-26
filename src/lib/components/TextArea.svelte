<script>
    export let label = '';
    export let bindValue;
  </script>
  
  <div class="text-area">
    <label>{label}</label>
    <textarea bind:value={bindValue}></textarea>
  </div>
  
  <style>
    .text-area {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    textarea {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      resize: vertical;
    }
  </style>