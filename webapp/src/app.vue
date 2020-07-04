<template>
  <div id="app">
    <LoggedInStructure v-if="showLoggedInNavigation" />
    <LoggedOutStructure v-else @show:login-dialog="handleLoginAndSignUpBtnClick" />
    <LoginModal/>
    <SignUpModal/>
  </div>
</template>
<script>
import LoginModal from './components/login-modal.vue';
import SignUpModal from './components/sign-up-modal.vue';
import LoggedOutStructure from './views/logged-out-structure.vue';
import LoggedInStructure from './views/logged-in-structure.vue';
import { validateObj } from './views/util';

export default {
  components: { LoginModal, SignUpModal, LoggedInStructure, LoggedOutStructure },
  computed: {
    showLoggedInNavigation () {
      if (this.$route.name === 'home' || this.$route.name === 'sign-in' || this.$route.name === 'sign-up' || this.$route.name === 'google-sign-up') return false
      return true
    },
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    validateObj,
    async signout() {
      await this.signUserOut();
    },
    handleLoginAndSignUpBtnClick() {
      this.showLoginDialog = true;
      this.$bvModal.show('login');
    }
  },
}
</script>
<style lang="scss">
@import "./scss/base";
#app {
  background: $light;
  border: 1px solid $light;
  padding: 0;
  margin: 0;
}
</style>