<template>
  <div class="container">
    <div class="row mb md-5">
      <div class="col">
        <h2>Sign In Page</h2>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="phone">Phone (7xxxxxxxx)</label>
              <input
                v-model="signinCreds.phone"
                id="phone"
                type="text"
                :class="getClasses('phone')"
              >
              <div class="invalid-feedback">
                {{ validationMessages[0] }}
              </div>
            </div>
            <div class="col-md-12 form-group">
              <label for="password">Password</label>
              <input
                v-model="signinCreds.password"
                id="password"
                type="password"
                :class="getClasses('password')"
              >
              <div class="invalid-feedback">
                {{ validationMessages[1] }}
              </div>
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="signin">Sign In</button>
              <GoogleLogin :params="params" :renderParams="renderParams" :onSuccess="onSuccess" :onFailure="onFailure"></GoogleLogin>
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
  name: 'sign-in',
  data() {
    return {
      signinCreds: {
        phone: '',
        password: ''
      },
      validationMessages: [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Password required'
      ],
      validationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => creds.password.length > 0, }
      ],
      validationResults: [true, true],
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
    ...mapState(['user']),
  },
  methods: {
    ...mapActions(['signUserIn']),
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
        default: 
          return {}
      }
    },
    async signin() {
      this.validationMessages = [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Password required'
      ];
      this.validationResults = this.validateObj(this.signinCreds, this.validationRules);

      if (!this.validationResults.includes(false)) {
        await this.signUserIn({ phone: `254${this.signinCreds.phone}`, password: this.signinCreds.password });
        if (!this.user) {
          this.validationMessages = [
            'Login failed. Incorrect phone or password',
            'Login failed. Incorrect phone or password'
          ];
          this.validationResults = [false, false];
          
        }
      }
    },
    onSuccess(googleUser) {
      const profile = googleUser.getBasicProfile();
      console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
      console.log('Name: ' + profile.getName());
      console.log('Image URL: ' + profile.getImageUrl());
      console.log('Email: ' + profile.getEmail());
      console.log('ID Token: ' + googleUser.getAuthResponse().id_token);
    },
    onFailure(error) {
      console.log(error);
    }
  }
}
</script>
<style lang="scss" scoped>
  
</style>