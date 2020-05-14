<template>
  <div class="container">
    <DonorSection v-if="user" />
    <MiddlemanSection v-else-if="user && 'middleman' in user.roles" />
  </div>
</template>
<script>
import { mapState } from 'vuex';
import DonorSection from './donor-section.vue';
import MiddlemanSection from './middleman-section.vue';

export default {
  name: 'home',
  components: {  DonorSection, MiddlemanSection }, 
  computed: {
    ...mapState(['user'])
  }
}
</script>
<style lang="scss" scoped>  
</style>