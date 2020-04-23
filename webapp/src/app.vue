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
              <router-link class="nav-link" to="/donate">Donate</router-link>
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
    ...mapActions(['login', 'getBeneficiaries', 'getTransactions', 'getMiddlemen', 'getInvitations', 'getInvitation'])
  },
  watch: {
    async $route(to) {
      if (to.name === 'donate') {
        this.showNavigation = true;
        await this.login('userid');
        await this.getBeneficiaries(this.user._id);
        await this.getMiddlemen(this.user._id);
        await this.getTransactions(this.user._id);
        await this.getInvitations();
      }
      else if(to.name === 'accept-invitation') {
        this.showNavigation = false;
        await this.getInvitation({ path: `${to.path}`});
      }
      else if(to.name === 'sign-up') {
        this.showNavigation = false;
        if (to.params.phone) {
          await this.doesUserExist({ phone: to.params.phone});
        }
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