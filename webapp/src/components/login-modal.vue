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
          Start with 7, for example 712345678
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
        <i class="fab fa-google text-primary"></i>
        <GoogleLogin :params="params" :onSuccess="onSuccess" :onFailure="onFailure" class="bg-white border-0 text-secondary">Sign in with Google</GoogleLogin>
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
import { GoogleLogin } from 'vue-google-login';
import { validateObj } from '../views/util';
import { GOOGLE_CLIENT_ID } from '../api-urls';
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
    hideDialog() {
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
        'Invalid phone number. Must start with 7 and be 9 digits long',
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
    async onSuccess(googleUser) {
      if (googleUser) {
        await this.signUserIn({ googleIdToken: googleUser.getAuthResponse().id_token }); 
        if (!this.user) {
          this.$emit('login:google', googleUser);
        }
      }
      else {
        this.$bvToast.toast('Please try again later.', {
          title: 'Problem connecting to Google',
          variant: 'warning',
          solid: true
        });
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