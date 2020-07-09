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
    content-class="rounded"
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
          v-model="signUpCreds.name"
          type="text"
          class="custom-dialog-input"
          placeholder="Enter name"
          id="name"
        />
      </b-form-group>
      <b-form-group>
        <b-input-group>
          <b-input-group-prepend>
            <b-button disabled class="custom-dialog-input-phone-prepend">+254</b-button>
          </b-input-group-prepend>
          <label for="phone" class="sr-only">Phone Number</label>
          <b-form-input 
            v-model="signUpCreds.phone" 
            type="text" 
            :state="signUpValidationResults.phone"
            class="custom-dialog-input-phone"
            placeholder="Enter phone number"
            id="phone"
            @update="helper.phone = true"
          />
        </b-input-group>
        <b-form-text v-show="showPhoneHelper" class="text-center">
          Start with 7, for example 712345678.
        </b-form-text>
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages.phone }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <label for="password" class="sr-only">Password</label>
        <b-form-input 
          v-model="signUpCreds.password" 
          type="password" 
          :state="signUpValidationResults.password"
          class="custom-dialog-input" 
          placeholder="Enter password"
          id="password"
          @update="helper.password = true"
        />
        <b-form-text v-show="showPasswordHelper" class="text-center">
          Between 8 and 18 characters including uppercase, numeric and special characters
        </b-form-text>
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages.password }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <label for="confirmedPassword" class="sr-only">Confirmed Password</label>
        <b-form-input
          v-model="signUpCreds.confirmedPassword"
          type="password"
          :state="signUpValidationResults.confirmedPassword"
          class="custom-dialog-input"
          placeholder="Confirm password"
          id="confirmedPassword"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages.confirmedPassword }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="signUp">Submit</b-button>
      </div>
      <div class="border-bottom mt-3"></div>
      <div class="text-center mt-3 ">
        <span class="text-secondary font-weight-light pr-3">or:</span>
        <i class="fab fa-google text-primary"></i>
        <GoogleLogin :params="params" :onSuccess="onGoogleLoginSuccess" class="bg-white border-0 text-secondary">Sign up with Google</GoogleLogin>
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
import { validateNamedRules } from '../views/util';
import { GOOGLE_CLIENT_ID } from '../api-urls';
export default {
  name: 'sign-up-modal',
  data() {
    return {
      signUpCreds: {
        name: '',
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      
      signUpValidationMessages: {
        phone: 'Invalid Phone number. Must start with 7 and be 9 digits long',
        password: 'Invalid password. Must range between 8 and 18 characters',
        confirmedPassword: 'Confirmed password does not match with password'
      },
      signUpValidationRules: {
        phone: { test: (creds) => /^7\d{8}$/.test(creds.phone) },
        password: { test: (creds) => /^.{8,18}$/.test(creds.password) },
        confirmedPassword: { test: (creds) => creds.confirmedPassword === creds.password }
      },
      signUpValidationResults: { phone: null, password: null, confirmedPassword: null },
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
      return this.signUpValidationResults.phone == null && this.helper.phone;
    },
    showPasswordHelper () {
      return this.signUpValidationResults.password == null && this.helper.password;
    }
  },
  methods: {
    ...mapActions(['createUser']),
    showLoginDialog() {
      this.$bvModal.show('login');
    },
    hideDialog() {
      this.signUpCreds = {
        name: '',
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      this.signUpValidationResults = { phone: null, password: null, confirmedPassword: null },
      this.helper = {
        phone: false,
        password: false
      };
    },
    async signUp() {
      this.signUpValidationMessages = {
        phone: 'Invalid Phone number. Must start with 7 and be 9 digits long',
        password: 'Invalid password. Must range between 8 and 18 characters',
        confirmedPassword: 'Confirmed password does not match with password'
      };
      this.helper = {
        phone: false,
        password: false
      };
      this.signUpValidationResults = validateNamedRules(this.signUpCreds, this.signUpValidationRules);

      if (!Object.values(this.signUpValidationResults).includes(false)) {
        const data = {
          name: this.signUpCreds.name,
          phone: `254${this.signUpCreds.phone}`,
          password: this.signUpCreds.password
        };
        await this.createUser(data);

        if (!this.user) {
          this.signUpValidationMessages = {
            phone: 'Sign-up failed. Phone number already assigned to existing account',
            password: 'Sign-up failed. Phone number already assigned to existing account',
            confirmedPassword: 'Sign-up failed. Phone number already assigned to existing account',
          };
          this.signUpValidationResults = { phone: false, password: null, confirmedPassword: null };
        }
        else {
          this.signUpCreds = {
            name: '',
            phone: '',
            password: '',
            confirmedPassword: '',
            role: 'donor'
          },
          this.signUpValidationResults = { phone: true, password: true, confirmedPassword: true };
          this.$bvModal.hide('sign-up');
        }
      }
    },
    async onGoogleLoginSuccess(googleUser) {
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