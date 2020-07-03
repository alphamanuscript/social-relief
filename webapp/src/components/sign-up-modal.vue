<template>
  <b-modal
    id="sign-up"
    size="sm" 
    centered
    hide-header-close
    header-class="border-bottom-0"
    hide-footer
    no-stacking
    @hidden="hideDialog()"
    content-class="rounded-lg"
    >
    <template v-slot:modal-header>
    <div class="d-flex flex-column m-auto">
        <img :src="imageUrl" width="70" alt="Social Relief Logo" class="m-4">
        <h4 class="text-secondary text-center">Sign Up</h4>
    </div>
    </template>
    <b-form>
      <b-form-group>
        <b-form-input 
          v-model="signUpCreds.phone" 
          type="text" 
          :state="signUpValidationResults[0]"
          class="custom-form-input"
          placeholder="Enter phone number"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages[0] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <b-form-input 
          v-model="signUpCreds.password" 
          type="password" 
          :state="signUpValidationResults[1]"
          class="custom-form-input" 
          placeholder="Enter password"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages[1] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <b-form-input
          v-model="signUpCreds.confirmedPassword"
          id="confirmedPassword"
          type="password"
          :state="signUpValidationResults[2]"
          class="custom-form-input"
          placeholder="Confirm password"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages[2] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="signUp">Submit</b-button>
      </div>
    </b-form>
    <p class="text-center small mt-3 text-secondary">
      I have an account.
      <b-link href=# class="text-primary" @click="showLoginDialog()">Login.</b-link>
    </p>
</b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { validateObj } from '../views/util';
export default {
  name: 'sign-up-modal',
  data() {
    return {
      signUpCreds: {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      
      signUpValidationMessages: [
        'Invalid Phone number. Must start with 7 and be 9 digit long',
        'Invalid password. Must range between 8 and 18 characters',
        'Confirmed password does not match with password'
      ],
      signUpValidationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => /^.{8,18}$/.test(creds.password) },
        { test: (creds) => creds.confirmedPassword === creds.password }
      ],
      signUpValidationResults: [null, null, null],
    }
  },
  computed: {
    ...mapState(['user']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    ...mapActions(['createUser']),
    validateObj,
    showLoginDialog() {
      this.signUpCreds = {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      this.signUpValidationResults = [null, null, null];
      this.$bvModal.show('login');
    },
    hideDialog() {
      this.signUpCreds = {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      this.signUpValidationResults = [null, null, null];
    },
    async signUp() {
      this.signUpValidationMessages = [
        'Invalid Phone number. Must start with 7 and be 9 digit long',
        'Invalid password. Must range between 8 and 18 characters',
        'Confirmed password does not match with password'
      ]
      this.signUpValidationResults = this.validateObj(this.signUpCreds, this.signUpValidationRules);

      if (!this.signUpValidationResults.includes(false)) {
        await this.createUser({ phone: `254${this.signUpCreds.phone}`, password: this.signUpCreds.password });
        if (!this.user) {
          this.signUpValidationMessages = [
            'Sign-up failed. Phone number already assigned to existing account',
            'Sign-up failed. Phone number already assigned to existing account',
            'Sign-up failed. Phone number already assigned to existing account',
          ];
          this.signUpValidationResults = [false, null, null];
        }
        else {
          this.signUpCreds = {
            phone: '',
            password: '',
            confirmedPassword: '',
            role: 'donor'
          },
          this.signUpValidationResults = [true, true, true];
          this.$bvModal.hide('sign-up');
        }
      }
    },
  }
}
</script>