<template>
  <div class="container">
    <div class="row mb md-5">
      <div class="col">
        <h2>Sign In Page</h2>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
export default {
  name: 'sign-in',
  data() {
    return {
      phone: '',
      password: '',
      phoneMessage: 'Please provide a valid phone',
      passwordMessage: 'Please provide a valid password',
    }
  },
  computed: {
    ...mapState(['signinPhone']),
  },
  watch: {
    async signinPhone(oldVal, newVal) {
      if(newVal) {
        this.phone = this.signinPhone;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  
</style>