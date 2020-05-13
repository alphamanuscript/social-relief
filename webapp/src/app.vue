<template>
  <div id="app">
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-light bg-light mt-3 mb-5">
        <a class="navbar-brand" href="#">Project Lockdown</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div v-if="showNavigation" class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <router-link class="nav-link" to="/">Home <span class="sr-only">(current)</span></router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/how-it-works">How it works</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/about">About</router-link>
            </li>
            <li class="nav-item active" @click="signout">
              <router-link class="nav-link" to="#">Sign out</router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <router-view />
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import { Auth } from './services';

export default {
  computed: {
    ...mapState(['user', 'message']),
    showNavigation () {
      this.showPageOrRedirect();
      if (this.$route.name === 'home') return true;
      return false;
    }
  },
  methods: {
    ...mapActions([
      'signUserIn', 'getBeneficiaries', 'getTransactions', 
      'getMiddlemen', 'getInvitations', 'getInvitation', 
      'doesUserExist', 'getCurrentUser', 'signUserOut'
    ]),
    async showPageOrRedirect () {
      if (this.$route.name === 'home' && Auth.isAuthenticated() && !this.user) {
        await this.getCurrentUser();
        await this.getTransactions();
        await this.getBeneficiaries();
      } 
      else if (this.$route.name === 'home' && !Auth.isAuthenticated()) this.$router.push({ name: 'sign-in' });
      else if (this.$route.name === 'sign-in' && Auth.isAuthenticated() && !this.user) {
        await this.getCurrentUser();
        this.$router.push({ name: 'home' });
      }
    },
    async signout() {
      console.log('Signing out...');
      await this.signUserOut();
    }
  }
}
</script>
<style scoped>
.navbar {
  border-radius: 10px;
}
</style>