<template>
  <div class="container">
    <div class="row mb md-5">
      <div class="col">
        <h2>Sign Up Page</h2>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="phone">Phone</label>
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
            <div class="col-md-12 form-group">
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
            <div class="col-md-12 form-group">
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
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { AccountService } from '@/services';
import { validateObj } from './util';

export default {
  name: 'sign-up',
  data() {
    return {
      signUpCreds: {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      validationMessages: [
        'Invalid Phone number. Must be 1O digit long',
        'Invalid password. Must range between 8 and 18 characters and have at least one uppercase, lowercase, digit, and special character',
        'Confirmed password does not match with password'
      ],
      validationRules: [
        { test: (creds) => /^(?=.*\d)(?=.{10,10}$)/.test(creds.phone) },
        { test: (creds) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])(?=.{8,18}$)[a-zA-Z][a-zA-Z\d]*[~!@#$%^&*?<>]*$/.test(creds.password) },
        { test: (creds) => creds.confirmedPassword === creds.password }
      ],
      validationResults: [true, true, true],
    }
  },
  computed: {
    ...mapState(['user', 'message'])
  },
  methods: {
    ...mapActions(['createUser']),
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
      console.log('Phone: ', this.signUpCreds.phone);
      console.log('Password: ', this.signUpCreds.password);
      console.log('Confirmed Password: ', this.signUpCreds.confirmedPassword);
      console.log('Role: ', this.signUpCreds.role);
      this.validationMessages[0] ='Invalid Phone number. Must be 1O digit long';
      this.validationResults = this.validateObj(this.signUpCreds, this.validationRules);

      if (!this.validationResults.includes(false)) {
        console.log('All test cases pass');
        await this.createUser({ phone: this.signUpCreds.phone, password: this.signUpCreds.password });
      }
    },
    async canSignup() {
      const user = await AccountService.getUser(this.phone);
      if(!user) {
        if (this.role === 'middleman') {
          const middleman = await AccountService.getMiddleman(this.phone);
          return !middleman ? false : true;
        }
        else {
          const beneficiary = await AccountService.getBeneficiary(this.phone);
          return !beneficiary ? true : false;
        }
      }
      return true;
    }
  },
  watch: {
    async message(newVal) {
      if (newVal.type === 'error' && newVal.message === 'The specified phone number is already in use') {
        this.validationMessages[0] = newVal.message;
        this.validationResults[0] = false;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  
</style>