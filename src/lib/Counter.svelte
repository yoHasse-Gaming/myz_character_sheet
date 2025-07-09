<script lang="ts">
  import OBR from '@owlbear-rodeo/sdk'
  let count: number = $state(0)
  const increment = () => {
    count += 1
  }

  OBR.onReady(() => {
    console.log('OBR is ready')
    
  })

</script>

<button onclick={increment}>
  count is {count}
</button>
