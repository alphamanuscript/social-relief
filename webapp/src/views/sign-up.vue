<template>
  <div class="container">
    <div class="row mb md-5">
      <div class="col">
        <h2>Sign Up Page</h2>
        <h6 v-if="googleUser">Welcome {{ googleUser.getBasicProfile().getName() }}, please enter your phone number to finish creating your account.</h6>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="phone">Phone (7xxxxxxxx)</label>
              <input
                v-model="signUpCreds.phone"
                id="phone"
                type="text"
                :class="getClasses('phone')"
              >
              <div class="invalid-feedback">
                {{ validationMessages[0] }}
              </div>
            </div>
            <div v-show="!googleUser" class="col-md-12 form-group">
              <label for="password">Password</label>
              <input
                v-model="signUpCreds.password"
                id="password"
                type="password"
                :class="getClasses('password')"
              >
              <div class="invalid-feedback">
                {{ validationMessages[1] }}
              </div>
            </div>
            <div v-show="!googleUser" class="col-md-12 form-group">
              <label for="confirmedPassword">Confirm Password</label>
              <input
                v-model="signUpCreds.confirmedPassword"
                id="confirmedPassword"
                type="password"
                :class="getClasses('confirmedPassword')"
              >
              <div class="invalid-feedback">
                {{ validationMessages[2] }}
              </div>
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="signup">Sign Up</button>
              <GoogleLogin v-show="!googleUser" :params="params" :renderParams="renderParams" :onSuccess="onSuccess"></GoogleLogin>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { GoogleLogin } from 'vue-google-login';
import { validateObj } from './util';
import { GOOGLE_CLIENT_ID } from '../api-urls'
export default {
  name: 'sign-up',
  props: {
    googleUser: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      signUpCreds: {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      validationMessages: [
        'Invalid Phone number. Must start with 7 and be 9 digit long',
        'Invalid password. Must range between 8 and 18 characters and have at least one uppercase, lowercase, digit, and special character',
        'Confirmed password does not match with password'
      ],
      validationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?=.{8,18}).*$/.test(creds.password) },
        { test: (creds) => creds.confirmedPassword === creds.password }
      ],
      validationResults: [true, true, true],
      params: {
        clientId: GOOGLE_CLIENT_ID
      },
      renderParams: {
        width: 250,
        height: 50,
        longtitle: true
      }
    }
  },
  components: {
    GoogleLogin
  },
  computed: {
    ...mapState(['user', 'message'])
  },
  methods: {
    ...mapActions(['createUser', 'signUserIn']),
    validateObj,
    getClasses(nameOfInput) {
      switch(nameOfInput) {
        case 'phone': 
          return {
            'form-control': true,
            'is-invalid': !this.validationResults[0]
          }
        case 'password': 
          return {
            'form-control': true,
            'is-invalid': !this.validationResults[1]
          }
        case 'confirmedPassword': 
          return {
            'form-control': true,
            'is-invalid': !this.validationResults[2]
          }
        default: 
          return {}
      }
    },
    async signup() {
      this.validationMessages[0] = 'Invalid Phone number. Must start with 7 and be 9 digit long';
      this.validationResults = this.validateObj(this.signUpCreds, this.validationRules);
      if (this.googleUser && this.validationResults[0]) {
        await this.createUser({ phone: `254${this.signUpCreds.phone}`, googleIdToken: this.googleUser.getAuthResponse().id_token });
      }
      else if (!this.validationResults.includes(false)) {
        await this.createUser({ phone: `254${this.signUpCreds.phone}`, password: this.signUpCreds.password });
      }
    },
    async onSuccess(googleUser) {
      await this.signUserIn({ googleIdToken: googleUser.getAuthResponse().id_token });
      if (!this.user)
        this.$router.push({ name: 'google-sign-up', params: { googleUser: googleUser } });
    }
  },
  watch: {
    async message(newVal) {
      if (newVal.type === 'error' && newVal.message === 'The specified phone number is already in use') {
        this.validationMessages[0] = newVal.message;
        this.validationResults= [false, true, true];
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  
</style>