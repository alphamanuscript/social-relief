<template>
  <div class="container">
    <div class="row mb md-5">
      <div class="col">
        <h2>Sign In Page</h2>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="phone">Phone</label>
              <input
                v-if="signinPhone.length"
                :value="signinPhone"
                id="phone"
                type="text"
                :class="getClasses('phone')"
                disabled
              >
              <input
                v-else
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
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { validateObj } from './util';
export default {
  name: 'sign-in',
  data() {
    return {
      signinCreds: {
        phone: '',
        password: ''
      },
      validationMessages: [
        'Invalid Phone number. Must be 11 digit long',
        'Invalid password. Must be at least one character long'
      ],
      validationRules: [
        { test: (creds) => creds.phone.length === 10, },
        { test: (creds) => creds.password.length > 0, }
      ],
      validationResults: [true, true],
    }
  },
  computed: {
    ...mapState(['signinPhone']),
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
    signin() {
      console.log('Phone: ', this.signinCreds.phone);
      console.log('Password: ', this.signinCreds.password);
      this.validationResults = this.validateObj(this.signinCreds, this.validationRules);

      if (!this.validationResults.includes(false)) {
        this.signUserIn({ phone: this.signinCreds.phone, password: this.signinCreds.password });
      }
    },
  },
  watch: {
    async signinPhone(newVal) {
      console.log('Watching signinPhone: ', newVal);
      if(newVal) {
        this.creds.phone = this.signinPhone;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  
</style>