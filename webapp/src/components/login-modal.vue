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
    content-class="rounded"
  >
    <template v-slot:modal-header>
      <div class="d-flex flex-column m-auto">
        <img :src="imageUrl" width="70" alt="Social Relief Logo" class="m-4">
        <h4 class="text-secondary text-center">Login</h4>
      </div>
    </template>
    <b-form>
      <b-form-group>
        <b-input-group>
          <b-input-group-prepend>
            <b-button disabled class="custom-dialog-input-phone-prepend">+254</b-button>
          </b-input-group-prepend>
          <label for="phone" class="sr-only">Phone Number</label>
          <b-form-input 
            v-model="signInCreds.phone" 
            type="text"
            :state="signInValidationResults[0]"
            class="custom-dialog-input-phone"
            placeholder="Enter phone number"
            id="phone"
            @update="helper.phone = true"
          />
          <b-form-invalid-feedback class="text-center">
            {{ signInValidationMessages[0] }}
          </b-form-invalid-feedback>
        </b-input-group>
        <b-form-text v-show="showPhoneHelper" class="text-center">
          For example 712345678
        </b-form-text>
      </b-form-group>
      <b-form-group>
        <label for="password" class="sr-only">Password</label>
        <b-form-input 
          v-model="signInCreds.password" 
          type="password" 
          :state="signInValidationResults[1]"
          class="custom-dialog-input"
          placeholder="Enter password"
          id="password"
          @update="helper.password = true"
        />
        <b-form-text v-show="showPasswordHelper" class="text-center">
          Between 8 and 18 characters including uppercase, numeric and special characters
        </b-form-text>
        <b-form-invalid-feedback class="text-center">
          {{ signInValidationMessages[1] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="signIn">Submit</b-button>
      </div>
      <div class="border-bottom mt-3"></div>
      <div class="text-center mt-3 ">
        <span class="text-secondary font-weight-light pr-3">or:</span>  
        <GoogleButton text="Sign in with Google" @success:google-login="onGoogleLoginSuccess" @failure:google-login="onGoogleLoginFailure"/>
      </div>
    </b-form>
    <p class="text-center small mt-3 text-secondary">
      Don't have an account yet?
      <b-link href=# class="text-primary" @click="showSignUpDialog()">Sign up.</b-link>
    </p>
  </b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { validateObj } from '../views/util';
import GoogleButton from './google-button';
export default {
  name: 'login-modal',
  data() {
    return {
      signInCreds: {
        phone: '',
        password: ''
      },
      signInValidationMessages: [
        'Invalid phone number. Must be 9 digits long and cannot start with 0',
        'Password required'
      ],
      signInValidationRules: [
        { test: (creds) => creds.phone[0] !== '0' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => creds.password.length > 0, }
      ],
      signInValidationResults: [null, null],
      helper: {
        phone: false,
        password: false
      }
    }
  },
  components: {
    GoogleButton
  },
  computed: {
    ...mapState(['user']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
    showPhoneHelper () {
          return this.signInValidationResults[0] == null && this.helper.phone;
    },
    showPasswordHelper () {
          return this.signInValidationResults[1] == null && this.helper.password;
    }
  },
  methods: {
    ...mapActions([
      'signUserIn'
    ]),
    validateObj,
    showSignUpDialog() {
      this.$bvModal.show('sign-up');
    },
    async hideDialog() {
      this.signInCreds = {
        phone: '',
        password: ''
      },
      this.signInValidationResults = [null, null];
      this.helper = {
        phone: false,
        password: false
      };    
    },
    async signIn() {
      this.signInValidationMessages = [
        'Invalid phone number. Must be 9 digits long and cannot start with 0',
        'Password required'
      ];
      this.helper = {
        phone: false,
        password: false
      };
      this.signInValidationResults = this.validateObj(this.signInCreds, this.signInValidationRules);
      if (!this.signInValidationResults.includes(false)) {
        await this.signUserIn({ phone: `254${this.signInCreds.phone}`, password: this.signInCreds.password });
        if (this.user) {
          this.signInCreds = {
            phone: '',
            password: ''
          },
          this.signInValidationResults = [true, true];
          this.$bvModal.hide('login');
        } 
      }
    },
    async onGoogleLoginSuccess(googleUser) {
      await this.signUserIn({ googleIdToken: googleUser.getAuthResponse().id_token }); 
      if (!this.user) {
        this.$emit('login:google', googleUser);
      }
      this.$bvModal.hide('login');
    },
    onGoogleLoginFailure(error) {
      this.$bvToast.toast(error, {
        title: 'Google Login Error',
        variant: 'danger',
        solid: true
      });
    }
  }
}
</script>