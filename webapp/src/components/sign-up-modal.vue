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
        <label for="phone" class="sr-only">Phone Number</label>
        <b-form-input 
          v-model="signUpCreds.phone" 
          type="text" 
          :state="signUpValidationResults[0]"
          class="custom-dialog-form-input"
          placeholder="Enter phone number"
          id="phone"
          @update="helper.phone = true"
        />
        <b-form-text v-show="showPhoneHelper" class="text-center">
          Start with 7, for example 712345678.
        </b-form-text>
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages[0] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <label for="password" class="sr-only">Password</label>
        <b-form-input 
          v-model="signUpCreds.password" 
          type="password" 
          :state="signUpValidationResults[1]"
          class="custom-dialog-form-input" 
          placeholder="Enter password"
          id="password"
          @update="helper.password = true"
        />
        <b-form-text v-show="showPasswordHelper" class="text-center">
          Between 8 and 18 characters including uppercase, numeric and special characters
        </b-form-text>
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages[1] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <label for="confirmedPassword" class="sr-only">Confirmed Password</label>
        <b-form-input
          v-model="signUpCreds.confirmedPassword"
          type="password"
          :state="signUpValidationResults[2]"
          class="custom-dialog-form-input"
          placeholder="Confirm password"
          id="confirmedPassword"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages[2] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="signUp">Submit</b-button>
      </div>
      <div class="text-center mt-3 ">
        <i class="fab fa-google text-primary"></i>
        <GoogleLogin :params="params" :onSuccess="onSuccess" class="bg-white border-0 text-secondary">Sign up with Google</GoogleLogin>
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
import { GoogleLogin } from 'vue-google-login';
import { validateObj } from '../views/util';
import { GOOGLE_CLIENT_ID } from '../api-urls';
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
        'Invalid Phone number. Must start with 7 and be 9 digits long',
        'Invalid password. Must range between 8 and 18 characters',
        'Confirmed password does not match with password'
      ],
      signUpValidationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => /^.{8,18}$/.test(creds.password) },
        { test: (creds) => creds.confirmedPassword === creds.password }
      ],
      signUpValidationResults: [null, null, null],
      params: {
        clientId: GOOGLE_CLIENT_ID
      },
      helper: {
        phone: false,
        password: false
      }
    }
  },
  components: {
    GoogleLogin
  },
  computed: {
    ...mapState(['user']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
    showPhoneHelper () {
          return this.signUpValidationResults[0] == null && this.helper.phone;
    },
    showPasswordHelper () {
          return this.signUpValidationResults[1] == null && this.helper.password;
    }
  },
  methods: {
    ...mapActions(['createUser']),
    validateObj,
    showLoginDialog() {
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
      this.helper = {
        phone: false,
        password: false
      };
    },
    async signUp() {
      this.signUpValidationMessages = [
        'Invalid Phone number. Must start with 7 and be 9 digits long',
        'Invalid password. Must range between 8 and 18 characters',
        'Confirmed password does not match with password'
      ];
      this.helper = {
        phone: false,
        password: false
      };
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
    async onSuccess(googleUser) {
      if (googleUser) {
        await this.signUserIn({ googleIdToken: googleUser.getAuthResponse().id_token });
        if (!this.user) {
          this.$emit('login:google', googleUser);
        }
        else {
          this.$bvToast.toast('Please try again later.', {
            title: 'Problem connecting to Google',
            variant: 'warning',
            solid: true
          });
        }
      }
    },
    onFailure() {
      this.$bvToast.toast('Please try again later.', {
        title: 'Problem connecting to Google',
        variant: 'warning',
        solid: true
      });
    }
  }
}
</script>