<template>
  <div class="container">

  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'home',
  components: { }, 
  computed: {
    ...mapState(['user'])
  }
}
</script>
<style lang="scss" scoped>  
</style>