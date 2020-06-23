<template>
  <div id="app">
    <div v-if="showLoggedInNavigation" class="logged-in-structure">
      <div class="sidebar">
        <div class="logo-container">
          <img :src="imageUrl" alt="Social Relief Logo" class="logo">
        </div>
        <div class="current-balance-container">
          <span>Current balance</span>
          <span>KSH</span>
          <span>1,500</span>
        </div>
        <ul class="vertical-navigation">
          <li class="active">Beneficiaries</li>
          <li>Middlemen</li>
          <li>My invitations</li>
          <li>History</li>
        </ul>
        <div class="policy-and-terms">
          <span>privacy policy</span>
          <span>terms of use</span>
          <span>(c)2020</span>
        </div>
      </div>
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
            <li class="nav-item active">
              <router-link class="nav-link sign-up-and-login-btn" to="#">Sign Up / Login</router-link>
            </li>
          </ul>
        </div>
      </nav>
      <router-view class="view-content" />
    </div>
    <div class="custom-dialog">
      <div class="backdrop">
        <div class="logo-container">
          <img :src="imageUrl" alt="Social Relief Logo" class="logo">
        </div>
        <h4>Login</h4>
        <form class="login-form">
          <input type="text" class="input phone-input" placeholder="Enter phone number">
          <input type="password" class="input password-input" placeholder="Enter password">
          <button type="button" class="submit-btn">Submit</button>
        </form>
        <p>Don't have an account yet? <span>Sign Up.</span></p>
      </div>
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
      if (this.$route.name === 'home' || this.$route.name === 'sign-in' || this.$route.name === 'sign-up') return false
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
      if (this.$route.name === 'beneficiaries' && Auth.isAuthenticated() && !hasDataBeenFetched) {
        await this.getCurrentUser();
        await this.getTransactions();
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
    // border: 1px solid #000;
    display: grid;
    grid-template-rows: 100vh;
    grid-template-columns: 13rem 1fr;

    .sidebar {
      // border: 1px solid green;
      background-color: #FFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;
      padding: 0;
      box-shadow: 2px 0 5px #E2E2E2;
      z-index: 999;

      .logo-container {
        // border: 1px solid #000;
        width: 30%;
        height: 3rem;
        margin: .6rem 0 0 3rem;


        img {
          width: 100%;
          height: 100%;
        }
      }

      .current-balance-container {
        // border: 1px solid #000;
        background-color: #9D1A63;
        height: 5rem;
        width: 65%;
        margin: -4rem 0 0 2rem;
        border-radius: 1rem; 
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 0 2px 5px #E2E2E2;

        span {
          color:  #FFF;
          font-size: .7rem;
          // border: 1px solid #000;
          display: block;
          height: 1rem;
          width: 6rem;

          &:not(:last-child) {
            margin-bottom: .15rem;
            font-weight: 400;
          }

          &:last-child {
            font-size: .9rem;
            font-weight: 500;
          }
        }
      }

      .vertical-navigation {
        // border: 1px solid #000;
        width: 57%;
        margin: -5rem 0 2rem 2rem;
        padding: 0;

        li {
          // border: 1px solid #000;
          list-style: none;
          padding: 0 0 0 1rem;
          margin-bottom: 1.2rem;
          font-size: .9rem;

          &:not(:first-child) {
            color: lighten(#000, 20%);
            font-weight: 500;
          }

          &:hover {
            cursor: pointer;
          }

        }

        .active {
          border-radius: 1rem;
          background-color: #9D1A63;
          color: #FFF;
          font-weight: bold;
          height: 1.5rem;
          // border: none;
          // font-size: .9rem;
        }
      }

      .policy-and-terms {
        // border: 1px solid #000;
        height: 5rem;
        width: 70%;
        color: #9D1A63;
        font-size: .7rem;
        margin: 0 0 0 2rem;

        span{
          // border: 1px solid #000;
          display: block;
          margin-bottom: .3rem;
        }
      }
    }

    .view-content {
      height: 100vh;
      overflow-y: scroll;
      background: #F5F5F5;
      padding: 0 3rem 0 3rem;
    }
  }

  .custom-dialog {
    border: 1px solid #000;
    width: 100vw;
    height: 100vh;
    background-color: rgba(#000, 60%);
    top: 0;
    overflow: auto;
    position: fixed;
    z-index: 99999;

    .backdrop {
      border: 1px solid #fff;
      height: 57%;
      width: 22%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: .8rem;
      background-color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;

      .logo-container {
        // border: 1px solid #000;
        width: 17%;
        height: 2.5rem;
        margin-top: 1rem;

        img {
          // border: 1px solid #000;
          width: 100%;
          height: 100%;
        }
      }

      h4 {
        // border: 1px solid red;
        margin-top: .5rem;
        color: #9D1A63;
        font-weight: 450;
      }

      .login-form {
        margin-top: -.4rem;
        width: 80%;
        height: 10rem;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        .input {
          width: 100%;
          height: 2.2rem;
          border-radius: .8rem;
          text-align: center;
          font-size: .8rem;
          box-shadow: 0 2px 5px #E2E2E2; 
          font-weight: 300;
          background-color: #F5F5F5;
          border: none;

          &:focus {
            outline: none;
          }
        }

        .submit-btn {
          border-radius: 3rem;
          width: 7rem;
          height: 1.7rem;
          text-align: center;
          background: darken(#EF5A24, .9);
          color: #fff;
          transition: all 0.5s;
          box-shadow: 0 2px 5px #E2E2E2;
          font-size: .75rem;
          border: none;
          font-weight: bold;

          &:hover {
            background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
          }
        }
      }

      p {
        color: #9D1A63;
        font-size: .75rem;
        
        span {
          // border: 1px solid #000;
          color: #EF5A24;
          cursor: pointer;
        }
      }
    }
  }
}

</style>