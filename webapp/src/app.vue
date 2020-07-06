<template>
  <div id="app">
    <LoggedInStructure v-if="showLoggedInNavigation" />
    <LoggedOutStructure v-else @show:login-dialog="handleLoginAndSignUpBtnClick" />
    <LoginDialog :show="showLoginDialog" @hide="hideDialog('login')" @show:sign-up="showDialog('sign-up')" />
    <SignUpDialog :show="showSignUpDialog" @hide="hideDialog('sign-up')" @show:login="showDialog('login')" />
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import { Auth } from './services';
import LoginDialog from './components/login-dialog.vue';
import SignUpDialog from './components/sign-up-dialog.vue';
import LoggedOutStructure from './views/logged-out-structure.vue';
import LoggedInStructure from './views/logged-in-structure.vue';
import { validateObj } from './views/util';

export default {
  data() {
    return {
      showLoginDialog: false,
      showSignUpDialog: false,
    }
  },
  components: { LoginDialog, SignUpDialog, LoggedInStructure, LoggedOutStructure },
  computed: {
    ...mapState(['user', 'message', 'transactions']),
    showLoggedInNavigation () {
      this.showPageOrRedirect();
      if (this.$route.name === 'home' || this.$route.name === 'sign-in' || this.$route.name === 'sign-up' || this.$route.name === 'google-sign-up') return false
      return true
    },
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    ...mapActions([
      'signUserIn', 'getBeneficiaries', 'getTransactions',
      'getCurrentUser', 'signUserOut', 'createUser'
    ]),
    validateObj,
    async showPageOrRedirect () {
      const hasDataBeenFetched = this.user && this.transactions.length > 0;
      if (this.$route.name === 'beneficiaries' && Auth.isAuthenticated() && !hasDataBeenFetched) {
        await this.getCurrentUser();
        await this.getBeneficiaries();
      } 
      else if (this.$route.name === 'beneficiaries' && !Auth.isAuthenticated()) this.$router.push({ name: 'home' });
      else if (this.$route.name === 'home' && Auth.isAuthenticated() && !this.user) {
        await this.getCurrentUser();
        this.$router.push({ name: 'beneficiaries' });
      }
    },
    async signout() {
      await this.signUserOut();
    },
    handleLoginAndSignUpBtnClick() {
      this.showLoginDialog = true;
    },
    hideDialog(dialogName) {
      if (dialogName === 'login') {
        this.showLoginDialog = false;
      }
      else if (dialogName === 'sign-up') {
        this.showSignUpDialog = false;
      }
    },
    showDialog(dialogName) {
      if (dialogName === 'login') {
        this.showSignUpDialog = false;
        this.showLoginDialog = true;
      }
      else if (dialogName === 'sign-up') {
        this.showLoginDialog = false;
        this.showSignUpDialog = true;
      }
    }
  }
}
</script>
<style lang="scss">
@import "./scss/base";
#app {
  background: #F5F5F5;
  border: 1px solid #F5F5F5;
  padding: 0;
  margin: 0;
}

</style>