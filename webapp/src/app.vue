<template>
  <div id="app">
    <LoggedInStructure v-if="showLoggedInNavigation" />
    <LoggedOutStructure v-else />
    <LoginModal/>
    <SignUpModal/>
    <DonateModal/>
    <ConfirmDonationModal/>
  </div>
</template>
<script>
import LoginModal from './components/login-modal.vue';
import SignUpModal from './components/sign-up-modal.vue';
import DonateModal from './components/donate-modal.vue';
import ConfirmDonationModal from './components/confirm-donation-modal.vue';
import LoggedOutStructure from './views/logged-out-structure.vue';
import LoggedInStructure from './views/logged-in-structure.vue';
import { DEFAULT_SIGNED_OUT_PAGE } from './router/defaults';

export default {
  components: { LoginModal, SignUpModal, DonateModal, ConfirmDonationModal, LoggedInStructure, LoggedOutStructure },
  computed: {
    showLoggedInNavigation () {
      if (this.$route.name === DEFAULT_SIGNED_OUT_PAGE || this.$route.name === 'sign-in' || this.$route.name === 'sign-up' || this.$route.name === 'google-sign-up') return false
      return true
    },
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  }
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