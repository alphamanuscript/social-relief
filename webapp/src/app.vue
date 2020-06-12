<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mt-3 mb-5">
      <a class="navbar-brand" href="#">
        <img :src="imageUrl" alt="Social Relief Logo" class="logo">
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div v-if="showLoggedInNavigation" class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <router-link class="nav-link" to="/about">About Us</router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="#">Contact Us</router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="#">Nominate</router-link>
          </li>
          <li class="nav-item active" @click="signout">
            <router-link class="nav-link" to="#">Sign in / Login</router-link>
          </li>
        </ul>
      </div>
      <div v-else>
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <router-link class="nav-link" to="/sign-in">Sign In</router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="/sign-up">Sign Up</router-link>
          </li>
        </ul>
      </div>
    </nav>
    <router-view />
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import { Auth } from './services';

export default {
  computed: {
    ...mapState(['user', 'message', 'transactions']),
    showLoggedInNavigation () {
      this.showPageOrRedirect();
      if (this.$route.name === 'sign-in' || this.$route.name === 'sign-up') return false
      return true
    },
    imageUrl () {
      return require(`@/assets/Social Relief Logo.jpg`);
    }
  },
  methods: {
    ...mapActions([
      'signUserIn', 'getBeneficiaries', 'getTransactions',
      'getCurrentUser', 'signUserOut'
    ]),
    async showPageOrRedirect () {
      const hasDataBeenFetched = this.user && this.transactions.length > 0;
      if (this.$route.name === 'home' && Auth.isAuthenticated() && !hasDataBeenFetched) {
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
      await this.signUserOut();
    },
  }
}
</script>
<style scoped lang="scss">
@import "./scss/base";
#app {
  background: #F5F5F5;
  height: 100vh;
  width: 100vw;
  border: 1px solid #000;
  padding: 0;
  margin: 0;

  nav {
    width: 75%;
    margin: auto;
    height: 7rem;

    .navbar-brand {
      border: 1px solid #000;
      img {
        height: 5rem;
        opacity: .9;
      }
    }

    #navbarSupportedContent {
      border: 1px solid #000;
    }
  }
}

</style>