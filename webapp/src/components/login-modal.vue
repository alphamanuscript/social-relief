<template>
  <b-modal
    id="login"
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
        <h4 class="text-secondary text-center">Login</h4>
      </div>
    </template>
    <b-form>
      <b-form-group>
        <label for="phone" class="sr-only">Phone Number</label>
        <b-form-input 
          v-model="signInCreds.phone" 
          type="text"
          :state="signInValidationResults[0]"
          class="custom-dialog-form-input"
          placeholder="Enter phone number"
          id="phone"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signInValidationMessages[0] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <label for="password" class="sr-only">Password</label>
        <b-form-input 
          v-model="signInCreds.password" 
          type="password" 
          :state="signInValidationResults[1]"
          class="custom-dialog-form-input"
          placeholder="Enter password"
          id="password"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signInValidationMessages[1] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="signIn">Submit</b-button>
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
        'Invalid phone number. Must start with 7 and be 9 digits long',
        'Password required'
      ],
      signInValidationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => creds.password.length > 0, }
      ],
      signInValidationResults: [null, null],
    }
  },
  computed: {
    ...mapState(['user']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    }
  },
  methods: {
    ...mapActions([
      'signUserIn'
    ]),
    validateObj,
    showSignUpDialog() {
      this.signInCreds = {
        phone: '',
        password: ''
      },
      this.signInValidationResults = [null, null];
      this.$bvModal.show('sign-up');
    },
    hideDialog() {
      this.signInCreds = {
        phone: '',
        password: ''
      },
      this.signInValidationResults = [null, null];
    },
    async signIn() {
      this.signInValidationMessages = [
        'Invalid phone number. Must start with 7 and be 9 digits long',
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