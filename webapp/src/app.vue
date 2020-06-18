<template>
  <div id="app">
    <div v-if="showLoggedInNavigation" class="logged-in-structure">
      <div class="sidebar"></div>
      <router-view class="view-content" />
    </div>
    <div v-else class="logged-out-structure">
      <nav class="navbar navbar-expand-lg navbar-light bg-light mt-3 mb-5">
        <a class="navbar-brand" href="#">
          <img :src="imageUrl" alt="Social Relief Logo" class="logo">
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <router-link class="nav-link" to="/about">About Us</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="#">Contact Us</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/beneficiaries">Nominate</router-link>
            </li>
            <li class="nav-item active" @click="signout">
              <router-link class="nav-link sign-up-and-login-btn" to="#">Sign Up / Login</router-link>
            </li>
          </ul>
        </div>
      </nav>
      <router-view class="view-content" />
    </div>
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
      if (this.$route.name === 'home') return false
      return true
    },
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
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
  border: 1px solid #F5F5F5;
  padding: 0;
  margin: 0;

  .logged-out-structure {
      nav {
        width: 68%;
        margin: 0 auto;
        height: 7rem;
        background-color: #F5F5F5 !important;
        // border: 1px solid #000;

        .navbar-brand {
          // border: 1px solid #000;
          width: 7rem;
          height: 12rem;
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: inherit;
            height: inherit;
          }
        }

        #navbarSupportedContent {
          width: 5px;
          margin-left: 4rem;


          .navbar-nav {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;

            li {
              font-weight: 500;
            }

            .sign-up-and-login-btn {
              border-radius: 3rem;
              width: 7.3rem;
              height: 2.2rem;
              text-align: center;
              background: darken(#EF5A24, .9);
              color: #fff;
              transition: all 0.5s;
              box-shadow: 0 2px 5px #E2E2E2;
              font-size: .75rem;
              border: none;

              &:hover {
                background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
              }
            }
          }
        }
    }

    .view-content {

    }
  }

  .logged-in-structure {
    border: 1px solid #000;
    display: grid;
    grid-template-rows: 100vh;
    grid-template-columns: 12rem 1fr;

    .sidebar {
      border: 1px solid green;
    }

    .view-content {
      border: 1px solid red;
      height: 100vh;
      overflow-y: scroll;
    }
  }
}

</style>