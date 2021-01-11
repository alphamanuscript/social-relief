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
            v-if="newUser"
            v-model="signUpCreds.phone" 
            type="text" 
            :state="signUpValidationResults.phone"
            class="custom-dialog-input-phone"
            placeholder="Enter phone number"
            id="phone"
            @update="helper.phone = true"
            disabled
          />
          <b-form-input
            v-else
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
          For example 712345678.
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
import { validateNamedRules, validationRules, validationMessages } from '../views/util';
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
        name: validationMessages.name,
        phone: validationMessages.phone,
        password: validationMessages.password,
        confirmedPassword: validationMessages.confirmedPassword,
        email: validationMessages.email
      },
      signUpValidationRules: {
        name: validationRules.name,
        phone: validationRules.phone,
        password: validationRules.password,
        confirmedPassword: validationRules.confirmedPassword,
        email: validationRules.email,
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
    ...mapState(['user', 'newUser', 'phoneVerificationRecord']),
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
    ...mapActions(['createUser', 'signUserIn', 'updateNewUser']),
    validateNamedRules,
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
        phone: validationMessages.phone,
        password: validationMessages.password,
        confirmedPassword: validationMessages.confirmedPassword,
        name: validationMessages.name,
        email: validationMessages.email
      };
      this.helper = {
        phone: false,
        password: false
      };
      this.signUpValidationResults = this.validateNamedRules(this.signUpCreds, this.signUpValidationRules);

      if (!Object.values(this.signUpValidationResults).includes(false)) {
        const data = {
          name: this.signUpCreds.name.trim(),
          phone: `254${this.signUpCreds.phone}`,
          password: this.signUpCreds.password,
          email: this.signUpCreds.email,
        };
        this.newUser ? await this.updateNewUser(data) : await this.createUser(data);
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
  },
  watch: {
    newUser() {
      if (this.newUser && this.newUser.roles) {
        const { name, phone, email, roles } = this.newUser;
        this.signUpCreds = {
          name,
          phone: phone.substring(3),
          password: '',
          confirmedPassword: '',
          email: !email ? '' : email,
          role: roles[0]
        }
      }
    },
    phoneVerificationRecord() {
      this.$bvModal.hide('sign-up');
    }
  }
}
</script>