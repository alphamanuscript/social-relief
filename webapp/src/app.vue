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
            <li class="nav-item active" @click="handleLoginAndSignUpBtnClick()">
              <router-link class="nav-link login-and-sign-up-btn" to="#">Login / Sign Up</router-link>
            </li>
          </ul>
        </div>
      </nav>
      <router-view class="view-content" />
    </div>
    <CustomDialog :show="showLoginDialog" @updated:show="hideDialog('login')">
      <div class="logo-container">
        <img :src="imageUrl" alt="Social Relief Logo" class="logo">
      </div>
      <h4>Login</h4>
      <form class="login-form">
        <div class="row form-group">
          <input 
            v-model="signInCreds.phone" 
            type="text" 
            :class="getClassesForSignInDialog('phone')"
            placeholder="Enter phone number"
          />
          <div class="invalid-feedback">
            {{ signInValidationMessages[0] }}
          </div>
        </div>
        <div class="row form-group">
          <input 
            v-model="signInCreds.password" 
            type="password" 
            :class="getClassesForSignInDialog('password')" 
            placeholder="Enter password"
          />
          <div class="invalid-feedback">
            {{ signInValidationMessages[1] }}
          </div>
        </div>
        <button type="button" class="submit-btn" @click.prevent="signIn">Submit</button>
      </form>
      <p>Don't have an account yet? <span @click="showDialog('sign-up')">Sign Up.</span></p>
    </CustomDialog>
    <CustomDialog :show="showSignUpDialog" @updated:show="hideDialog('sign-up')">
      <div class="logo-container">
        <img :src="imageUrl" alt="Social Relief Logo" class="logo">
      </div>
      <h4>Sign Up</h4>
      <form class="login-form">
        <div class="row form-group">
          <input 
            v-model="signUpCreds.phone" 
            type="text" 
            :class="getClassesForSignUpDialog('phone')"
            placeholder="Enter phone number"
          />
          <div class="invalid-feedback">
            {{ signUpValidationMessages[0] }}
          </div>
        </div>
        <div class="row form-group">
          <input 
            v-model="signUpCreds.password" 
            type="password" 
            :class="getClassesForSignUpDialog('password')" 
            placeholder="Enter password"
          />
          <div class="invalid-feedback">
            {{ signUpValidationMessages[1] }}
          </div>
        </div>
        <div class="row form-group">
          <input
            v-model="signUpCreds.confirmedPassword"
            id="confirmedPassword"
            type="password"
            :class="getClassesForSignUpDialog('confirmedPassword')"
            placeholder="Confirm password"
          >
          <div class="invalid-feedback">
            {{ signUpValidationMessages[2] }}
          </div>
        </div>
        <button type="button" class="submit-btn" @click.prevent="signUp">Submit</button>
      </form>
      <p>I have an account. <span @click="showDialog('login')">Login.</span></p>
    </CustomDialog>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import { Auth } from './services';
import CustomDialog from './ui-components/dialog.vue';
import { validateObj } from './views/util';

export default {
  data() {
    return {
      showLoginDialog: false,
      showSignUpDialog: false,
      signInCreds: {
        phone: '',
        password: ''
      },
      signUpCreds: {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      signInValidationMessages: [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Password required'
      ],
      signInValidationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => creds.password.length > 0, }
      ],
      signInValidationResults: [true, true],
      
      signUpValidationMessages: [
        'Invalid Phone number. Must start with 7 and be 9 digit long',
        'Invalid password. Must range between 8 and 18 characters and have at least one uppercase, lowercase, digit, and special character',
        'Confirmed password does not match with password'
      ],
      signUpValidationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?=.{8,18}).*$/.test(creds.password) },
        { test: (creds) => creds.confirmedPassword === creds.password }
      ],
      signUpValidationResults: [true, true, true],
    }
  },
  components: { CustomDialog },
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
        // await this.getTransactions();
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
        this.signInValidationResults = [true, true]
      }
      else if (dialogName === 'sign-up') {
        this.showSignUpDialog = false;
        this.signUpValidationResults = [true, true, true]
      }
    },
    getClassesForSignInDialog(nameOfInput) {
      switch(nameOfInput) {
        case 'phone': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signInValidationResults[0]
          }
        case 'password': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signInValidationResults[1]
          }
        default: 
          return {}
      }
    },
    getClassesForSignUpDialog(nameOfInput) {
      switch(nameOfInput) {
        case 'phone': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signUpValidationResults[0]
          }
        case 'password': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signUpValidationResults[1]
          }
        case 'confirmedPassword': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signUpValidationResults[2]
          }
        default: 
          return {}
      }
    },
    async signIn() {
      this.signInValidationMessages = [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Password required'
      ];
      this.signInValidationResults = this.validateObj(this.signInCreds, this.signInValidationRules);

      if (!this.signInValidationResults.includes(false)) {
        await this.signUserIn({ phone: `254${this.signInCreds.phone}`, password: this.signInCreds.password });
        if (!this.user) {
          this.signInValidationMessages = [
            'Login failed. Incorrect phone or password',
            'Login failed. Incorrect phone or password'
          ];
          this.signInValidationResults = [false, false];
        }
        else this.showLoginDialog = false;
      }
    },
    async signUp() {
      this.signUpValidationMessages[0] = 'Invalid Phone number. Must start with 7 and be 9 digit long';
      this.signUpValidationResults = this.validateObj(this.signUpCreds, this.signUpValidationRules);

      if (!this.signUpValidationResults.includes(false)) {
        await this.createUser({ phone: `254${this.signUpCreds.phone}`, password: this.signUpCreds.password });
        this.hideDialog('sign-up');
      }
    },
    showDialog(dialogName) {
      if (dialogName === 'login') {
        this.showSignUpDialog = false;
        this.signUpCreds = {
          phone: '',
          password: '',
          confirmedPassword: '',
          role: 'donor'
        },
        this.signUpValidationResults = [true, true, true];
        this.showLoginDialog = true;
      }
      else if (dialogName === 'sign-up') {
        this.showLoginDialog = false;
        this.signInCreds = {
          phone: '',
          password: ''
        },
        this.signInValidationResults = [true, true];
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

  .logged-out-structure {
      nav {
        width: 68%;
        margin: 0 auto;
        height: 7rem;
        background-color: #F5F5F5 !important;

        .navbar-brand {
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

            .login-and-sign-up-btn {
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

    .view-content {}
  }

  .logged-in-structure {
    display: grid;
    grid-template-rows: 100vh;
    grid-template-columns: 13rem 1fr;

    .sidebar {
      background-color: #FFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;
      padding: 0;
      box-shadow: 2px 0 5px #E2E2E2;
      z-index: 999;

      .logo-container {
        width: 30%;
        height: 3rem;
        margin: .6rem 0 0 3rem;


        img {
          width: 100%;
          height: 100%;
        }
      }

      .current-balance-container {
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
        width: 57%;
        margin: -5rem 0 2rem 2rem;
        padding: 0;

        li {
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
        }
      }

      .policy-and-terms {
        height: 5rem;
        width: 70%;
        color: #9D1A63;
        font-size: .7rem;
        margin: 0 0 0 2rem;

        span{
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
    .backdrop {
      .logo-container {
        width: 17%;
        height: 2.5rem;
        margin-top: 1rem;

        img {
          width: 100%;
          height: 100%;
        }
      }

      h4 {
        margin-top: .5rem;
        color: #9D1A63;
        font-weight: 450;
      }

      .login-form {
        width: 80%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        .row {
          width: 100%;

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

          .invalid-feedback {
            font-size: .75rem;
            text-align: center;
          }
        }

        .submit-btn {
          border-radius: 3rem;
          width: 7rem;
          height: 1.7rem;
          text-align: center;
          background: darken(#EF5A24, .9);
          color: #fff;
          box-shadow: 0 2px 5px #E2E2E2;
          font-size: .75rem;
          border: none;
          font-weight: bold;
          outline: none;
          margin-bottom: .3rem;

          &:hover {
            background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
          }
        }

      }

      p {
        color: #9D1A63;
        font-size: .75rem;
        
        span {
          color: #EF5A24;
          cursor: pointer;
        }
      }
    }
  }
}

</style>