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
    content-class="rounded"
    >
    <template v-slot:modal-header>
    <div class="d-flex flex-column m-auto">
        <img :src="imageUrl" width="70" alt="Social Relief Logo" class="m-4">
        <h4 class="text-secondary text-center">Sign Up</h4>
    </div>
    </template>
    <div v-if="googleUser" class="text-center text-secondary">
        <h5>Welcome <span class="text-primary">{{ googleUser.getBasicProfile().getName() }}</span>,</h5>
        <p>please enter your phone number to finish creating your account.</p>
    </div>
    <b-form>
      <b-form-group>
        <b-input-group>
          <b-input-group-prepend>
            <b-button disabled class="custom-dialog-input-phone-prepend">+254</b-button>
          </b-input-group-prepend>
          <label for="phone" class="sr-only">Phone Number</label>
          <b-form-input 
            v-model="signUpCreds.phone" 
            type="text" 
            :state="signUpValidationResults[0]"
            class="custom-dialog-input-phone"
            placeholder="Enter phone number"
            id="phone"
            @update="helper.phone = true"
          />
          <b-form-invalid-feedback class="text-center">
            {{ signUpValidationMessages[0] }}
          </b-form-invalid-feedback>
        </b-input-group>
        <b-form-text v-show="showPhoneHelper" class="text-center">
          For example 712345678
        </b-form-text>
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
import { validateNamedRules, validationRules, validationMessages } from '../views/util';
export default {
  name: 'google-sign-up-modal',
  props: {
    googleUser: {
      type: Object,
      required: false
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
      
      signUpValidationMessages: {
        phone: validationMessages.phone
      },
      signUpValidationRules: {
        phone: validationRules.phone,
      },
      signUpValidationResults: { phone: null },
      helper: {
        phone: false,
      }
    }
  },
  computed: {
    ...mapState(['user']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
    showPhoneHelper () {
      return this.signUpValidationResults.phone == null && this.helper.phone;
    }
  },
  methods: {
    ...mapActions(['createUser']),
    validateNamedRules,
    showLoginDialog() {
      this.$bvModal.show('login');
    },
    hideDialog() {
      this.signUpCreds = {
        phone: '',
        role: 'donor'
      },
      this.signUpValidationResults = { phone: null };
       this.helper = {
        phone: false
      };
    },
    async signUp() {
      this.signUpValidationMessages = {
        phone: validationMessages.phone,
      }
      this.helper = {
        phone: false,
        password: false
      };
      this.signUpValidationResults = this.validateNamedRules(this.signUpCreds, this.signUpValidationRules);
      if (this.googleUser && !Object.values(this.signUpValidationResults).includes(false)) {
        await this.createUser({ 
          phone: `254${this.signUpCreds.phone}`,
          googleIdToken: this.googleUser.getAuthResponse().id_token 
        });
        if (!this.user) {
          this.signUpValidationMessages = {
            phone: validationMessages.phone
          }
          this.signUpValidationResults = { phone: false };
        }
        else {
          this.signUpCreds = {
            phone: '',
            role: 'donor'
          },
          this.signUpValidationResults = { phone: true };
          this.$bvModal.hide('google-sign-up');
        }
      }
    }
  }
}
</script>