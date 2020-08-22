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
        <label for="name" class="sr-only">Name</label>
        <b-form-input
          v-model="signUpCreds.name"
          type="text"
          :state="signUpValidationResults.name"
          class="custom-dialog-input"
          placeholder="Enter name"
          id="name"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages.name }}
        </b-form-invalid-feedback>
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
          <b-form-invalid-feedback class="text-center">
            {{ signUpValidationMessages.phone }}
          </b-form-invalid-feedback>
        </b-input-group>
        <b-form-text v-show="showPhoneHelper" class="text-center">
          Start with 7, for example 712345678.
        </b-form-text>
      </b-form-group>
      <b-form-group>
        <label for="email" class="sr-only">Email</label>
        <b-form-input
          v-model="signUpCreds.email"
          type="text"
          :state="signUpValidationResults.email"
          class="custom-dialog-input"
          placeholder="Enter email"
          id="email"
        />
        <b-form-invalid-feedback class="text-center">
          {{ signUpValidationMessages.email }}
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
        <GoogleButton text="Sign up with Google" @success:google-login="onGoogleLoginSuccess" @failure:google-login="onGoogleLoginFailure"/>
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
import { validateNamedRules } from '../views/util';
import GoogleButton from './google-button';
export default {
  name: 'sign-up-modal',
  data() {
    return {
      signUpCreds: {
        name: '',
        phone: '',
        password: '',
        confirmedPassword: '',
        email: '',
        role: 'donor'
      },
      
      signUpValidationMessages: {
        name: 'Name is required',
        phone: 'Invalid Phone number. Must start with 7 and be 9 digits long',
        password: 'Invalid password. Must range between 8 and 18 characters',
        confirmedPassword: 'Confirmed password does not match with password',
        email: 'Invalid email'
      },
      signUpValidationRules: {
        name: { test: (creds) => !!creds.name.trim().length },
        phone: { test: (creds) => /^7\d{8}$/.test(creds.phone) },
        password: { test: (creds) => /^.{8,18}$/.test(creds.password) },
        confirmedPassword: { test: (creds) => creds.confirmedPassword === creds.password },
        email: { test: (creds) => /\S+@\S+\.\S+/.test(String(creds.email))}
      },
      signUpValidationResults: { name: null, phone: null, password: null, confirmedPassword: null, email: null },
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
      return this.signUpValidationResults.phone == null && this.helper.phone;
    },
    showPasswordHelper () {
      return this.signUpValidationResults.password == null && this.helper.password;
    }
  },
  methods: {
    ...mapActions(['createUser', 'signUserIn']),
    showLoginDialog() {
      this.$bvModal.show('login');
    },
    hideDialog() {
      this.signUpCreds = {
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      this.signUpValidationResults = { name: null, phone: null, password: null, confirmedPassword: null, email: null },
      this.helper = {
        phone: false,
        password: false
      };
    },
    async signUp() {
      this.signUpValidationMessages = {
        phone: 'Invalid Phone number. Must start with 7 and be 9 digits long',
        password: 'Invalid password. Must range between 8 and 18 characters',
        confirmedPassword: 'Confirmed password does not match with password',
        name: 'Name is required',
        email: 'Invalid email'
      };
      this.helper = {
        phone: false,
        password: false
      };
      this.signUpValidationResults = validateNamedRules(this.signUpCreds, this.signUpValidationRules);

      if (!Object.values(this.signUpValidationResults).includes(false)) {
        const data = {
          name: this.signUpCreds.name.trim(),
          phone: `254${this.signUpCreds.phone}`,
          password: this.signUpCreds.password,
          email: this.signUpCreds.email,
        };
        await this.createUser(data);
        if (this.user) {
          this.signUpCreds = {
            name: '',
            phone: '',
            email: '',
            password: '',
            confirmedPassword: '',
            role: 'donor'
          },
          this.signUpValidationResults = { phone: true, password: true, confirmedPassword: true, name: true, email: true };
          this.$bvModal.hide('sign-up');
        }
      }
    },
    async onGoogleLoginSuccess(googleUser) {
        await this.signUserIn({ googleIdToken: googleUser.getAuthResponse().id_token });
        if (!this.user) {
          this.$emit('login:google', googleUser);
        }
        this.$bvModal.hide('sign-up');
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