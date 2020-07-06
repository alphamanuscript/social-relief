<template>
  <b-modal
    id="google-sign-up"
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
    <p v-if="googleUser">
        Welcome {{ googleUser.getBasicProfile().getName() }}, please enter your phone number to finish creating your account.
    </p>
    <b-form>
      <b-form-group>
        <label for="phone" class="sr-only">Phone Number</label>
        <b-form-input 
          v-model="signUpCreds.phone" 
          type="text" 
          :state="signUpValidationResults[0]"
          class="custom-dialog-form-input"
          placeholder="Enter phone number"
          id="phone"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages[0] }}
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
  name: 'google-sign-up-modal',
  props: {
    googleUser: {
      type: Object
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
      
      signUpValidationMessages: [
        'Invalid Phone number. Must start with 7 and be 9 digits long'
      ],
      signUpValidationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) }
      ],
      signUpValidationResults: [null]
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
        role: 'donor'
      },
      this.signUpValidationResults = [null];
      this.$bvModal.show('login');
    },
    hideDialog() {
      this.signUpCreds = {
        phone: '',
        role: 'donor'
      },
      this.signUpValidationResults = [null, null, null];
    },
    async signUp() {
      this.signUpValidationMessages = [
        'Invalid Phone number. Must start with 7 and be 9 digits long'
      ]
      this.signUpValidationResults = this.validateObj(this.signUpCreds, this.signUpValidationRules);
      if (this.googleUser && this.validationResults[0]) {
        await this.createUser({ phone: `254${this.signUpCreds.phone}`, googleIdToken: this.googleUser.getAuthResponse().id_token });
        if (!this.user) {
          this.signUpValidationMessages = [
            'Sign-up failed. Phone number already assigned to existing account'
          ];
          this.signUpValidationResults = [false];
        }
        else {
          this.signUpCreds = {
            phone: '',
            role: 'donor'
          },
          this.signUpValidationResults = [true];
          this.$bvModal.hide('google-sign-up');
        }
      }
    }
  }
}
</script>