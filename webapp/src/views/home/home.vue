<template>
  <div class="container">
    <DonorSection v-if="user" />
  </div>
</template>
<script>
import { mapState } from 'vuex';
import DonorSection from './donor-section.vue';

export default {
  name: 'home',
  components: {  DonorSection }, 
  computed: {
    ...mapState(['user'])
  }
}
</script>
<style lang="scss" scoped>  
</style>