<script>
    export let title = '';
  </script>
  
  <div class="table-section">
    <h3>{title}</h3>
    <slot></slot>
  </div>
  
  <style>
    .table-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f9f9f9;
    }
  
    h3 {
      margin-bottom: 0.75rem;
    }
  </style>
  