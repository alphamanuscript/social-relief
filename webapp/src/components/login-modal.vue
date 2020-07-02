<template>
  <b-modal
    id="login"
    size="sm" 
    centered
    hideHeaderClose
    headerClass="border-bottom-0"
    hide-footer
    no-stacking
    @hidden="hideDialog()"
    >
    <template v-slot:modal-header>
      <div class="d-flex flex-column m-auto">
        <img :src="imageUrl" width="70" alt="Social Relief Logo" class="m-4">
        <h4 class="text-secondary text-center">Login</h4>
      </div>
    </template>
    <b-form>
      <b-form-group>
        <b-form-input 
          v-model="signInCreds.phone" 
          type="text" 
          :class="getClassesForSignInDialog('phone')"
          placeholder="Enter phone number"
        />
        <b-form-invalid-feedback>
          {{ signInValidationMessages[0] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <b-form-input 
          v-model="signInCreds.password" 
          type="password" 
          :class="getClassesForSignInDialog('password')" 
          placeholder="Enter password"
        />
        <b-form-invalid-feedback>
          {{ signInValidationMessages[1] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" pill variant="primary" class="px-5" @click.prevent="signIn">Submit</b-button>
      </div>
    </b-form>
    <p class="text-center small mt-3 text-secondary">
      Do you have an account yet?
      <b-link href=# class="text-primary" @click="showSignUpDialog()">Sign up.</b-link>
    </p>
</b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { validateObj } from '../views/util';
export default {
  name: 'login-modal',
  data() {
    return {
      signInCreds: {
        phone: '',
        password: ''
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
    }
  },
  computed: {
    ...mapState(['user', 'transactions']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    ...mapActions([
      'signUserIn', 'getBeneficiaries',
      'getCurrentUser', 'signUserOut', 'createUser'
    ]),
    validateObj,
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
    showSignUpDialog() {
      this.signInCreds = {
        phone: '',
        password: ''
      },
      this.signInValidationResults = [true, true];
      this.$bvModal.show('sign-up');
    },
    hideDialog() {
      this.signInCreds = {
        phone: '',
        password: ''
      },
      this.signInValidationResults = [true, true];
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
        else {
          this.signInCreds = {
            phone: '',
            password: ''
          },
          this.signInValidationResults = [true, true];
          this.$bvModal.hide('login');
        } 
      }
    }
  }
}
</script>

<style>

</style>