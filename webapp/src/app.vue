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
          </ul>
        </div>
      </nav>
    </div>
    <router-view />
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import { Auth } from './services'

export default {
  data() {
    return {
      showNavigation: true
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['signUserIn', 'getBeneficiaries', 'getTransactions', 'getMiddlemen', 'getInvitations', 'getInvitation', 'doesUserExist'])
  },
  watch: {
    async $route(to) {
      if (to.name === 'home') {
        if(Auth.isAuthenticated()) {
          this.showNavigation = true;
          const { phone, password } = JSON.parse(Auth.getAccessToken());
          await this.signUserIn({ phone, password });
          await this.getBeneficiaries(this.user._id);
          await this.getMiddlemen(this.user._id);
          await this.getTransactions(this.user._id);
          await this.getInvitations();
        }
        else {
          this.$router.push({ name: 'sign-in' });
        }
      }
      else if(to.name === 'accept-invitation') {
        this.showNavigation = false;
        await this.getInvitation({ path: `${to.path}`});
      }
      else if(to.name === 'sign-up') {
        this.showNavigation = false;
        console.log('to: ', to);
        if (to.params.phone) {
          await this.doesUserExist({ phone: to.params.phone});
        }
      }
      else if(to.name === 'sign-up') {
        this.showNavigation = false;
      }
    }
  }
}
</script>
<style scoped>
.navbar {
  border-radius: 10px;
}
</style>