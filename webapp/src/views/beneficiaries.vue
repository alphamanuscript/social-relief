<template>
  <div class="outermost-container">
    This is the beneficiaries page
  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'beneficiaries',
  components: { }, 
  computed: {
    ...mapState(['user'])
  }
}
</script>
<style lang="scss" scoped>
  .outermost-container {
    border: 1px solid #000;
  }
</style>