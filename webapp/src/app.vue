<template>
  <div id="app">
    <LoggedInStructure v-if="showLoggedInNavigation" />
    <LoggedOutStructure v-else />
    <LoginModal @login:google="handleGoogleLogin"/>
    <SignUpModal  @login:google="handleGoogleLogin"/>
    <GoogleSignUpModal :googleUser="googleUser"/>
    <PaymentListener/>
    <DonateModal/>
    <PrivacyPolicyModal/>
    <TermsOfUseModal/>
  </div>
</template>
<script>
import LoginModal from './components/login-modal.vue';
import SignUpModal from './components/sign-up-modal.vue';
import DonateModal from './components/donate-modal.vue';
import GoogleSignUpModal from './components/google-sign-up-modal.vue';
import PrivacyPolicyModal from './components/privacy-policy-modal.vue';
import TermsOfUseModal from './components/terms-of-use-modal.vue';
import { PaymentListener } from './components/payment';
import LoggedOutStructure from './views/logged-out-structure.vue';
import LoggedInStructure from './views/logged-in-structure.vue';
import { DEFAULT_SIGNED_OUT_PAGE } from './router/defaults';

export default {
  components: {
    LoginModal,
    SignUpModal,
    DonateModal,
    GoogleSignUpModal,
    LoggedInStructure,
    LoggedOutStructure,
    PaymentListener,
    PrivacyPolicyModal,
    TermsOfUseModal
  },
  data() {
    return {
      googleUser: null
    }
  },
  computed: {
    showLoggedInNavigation () {
      if (this.$route.name === DEFAULT_SIGNED_OUT_PAGE ||
          this.$route.name === 'accept-invitation' ||
          this.$route.name === 'signup-new-user') 
        return false
      return true
    },
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    handleGoogleLogin(googleUser) {
      this.googleUser = googleUser;
      this.$bvModal.show('google-sign-up');
    }
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