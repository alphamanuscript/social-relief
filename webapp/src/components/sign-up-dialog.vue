<template>
  <CustomDialog :show='show' @updated:show="hideDialog">
    <div class="logo-container">
      <img :src="imageUrl" alt="Social Relief Logo" class="logo">
    </div>
    <h4>Sign Up</h4>
    <form class="sign-up-form">
      <div class="row form-group">
        <input 
          v-model="signUpCreds.phone" 
          type="text" 
          :class="getClassesForSignUpDialog('phone')"
          placeholder="Enter phone number"
        />
        <div class="invalid-feedback">
          {{ signUpValidationMessages[0] }}
        </div>
      </div>
      <div class="row form-group">
        <input 
          v-model="signUpCreds.password" 
          type="password" 
          :class="getClassesForSignUpDialog('password')" 
          placeholder="Enter password"
        />
        <div class="invalid-feedback">
          {{ signUpValidationMessages[1] }}
        </div>
      </div>
      <div class="row form-group">
        <input
          v-model="signUpCreds.confirmedPassword"
          id="confirmedPassword"
          type="password"
          :class="getClassesForSignUpDialog('confirmedPassword')"
          placeholder="Confirm password"
        >
        <div class="invalid-feedback">
          {{ signUpValidationMessages[2] }}
        </div>
      </div>
      <button type="button" class="submit-btn" @click.prevent="signUp">Submit</button>
    </form>
    <p>I have an account. <span @click="showLoginDialog">Login.</span></p>
  </CustomDialog>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import CustomDialog from '../ui-components/dialog.vue';
import { validateObj } from '../views/util';
export default {
  name: 'sign-up-dialog',
  props: ['show'],
  components: { CustomDialog },
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
        'Invalid password. Must range between 8 and 18 characters and have at least one uppercase, lowercase, digit, and special character',
        'Confirmed password does not match with password'
      ],
      signUpValidationRules: [
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?=.{8,18}).*$/.test(creds.password) },
        { test: (creds) => creds.confirmedPassword === creds.password }
      ],
      signUpValidationResults: [true, true, true],
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
    getClassesForSignUpDialog(nameOfInput) {
      switch(nameOfInput) {
        case 'phone': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signUpValidationResults[0]
          }
        case 'password': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signUpValidationResults[1]
          }
        case 'confirmedPassword': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signUpValidationResults[2]
          }
        default: 
          return {}
      }
    },
    showLoginDialog() {
      this.signUpCreds = {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      this.signUpValidationResults = [true, true, true];
      this.$emit('show:login');
    },
    hideDialog() {
      this.signUpCreds = {
        phone: '',
        password: '',
        confirmedPassword: '',
        role: 'donor'
      },
      this.signUpValidationResults = [true, true, true];
      this.$emit('hide');
    },
    async signUp() {
      this.signUpValidationMessages[0] = 'Invalid Phone number. Must start with 7 and be 9 digit long';
      this.signUpValidationResults = this.validateObj(this.signUpCreds, this.signUpValidationRules);

      if (!this.signUpValidationResults.includes(false)) {
        await this.createUser({ phone: `254${this.signUpCreds.phone}`, password: this.signUpCreds.password });
        if (!this.user) {
          this.signUpValidationMessages = [
            'Sign-up failed. Phone number already assigned to existing account',
            'Sign-up failed. Phone number already assigned to existing account',
            'Sign-up failed. Phone number already assigned to existing account',
          ];
          this.signUpValidationResults = [false, false, false];
        }
        else {
          this.signUpCreds = {
            phone: '',
            password: '',
            confirmedPassword: '',
            role: 'donor'
          },
          this.signUpValidationResults = [true, true, true];
          this.$emit('hide');
        }
      }
    },
  }
}
</script>
<style lang="scss">
  .custom-dialog {
    .backdrop {
      .logo-container {
        width: 17%;
        height: 2.5rem;
        margin-top: 1rem;

        img {
          width: 100%;
          height: 100%;
        }
      }

      h4 {
        margin-top: .5rem;
        color: #9D1A63;
        font-weight: 450;
      }

      .sign-up-form {
        width: 80%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        .row {
          width: 100%;

          .input {
            width: 100%;
            height: 2.2rem;
            border-radius: .8rem;
            text-align: center;
            font-size: .8rem;
            box-shadow: 0 2px 5px #E2E2E2; 
            font-weight: 300;
            background-color: #F5F5F5;
            border: none;

            &:focus {
              outline: none;
            }
          }

          .invalid-feedback {
            font-size: .75rem;
            text-align: center;
          }
        }

        .submit-btn {
          border-radius: 3rem;
          width: 7rem;
          height: 1.7rem;
          text-align: center;
          background: darken(#EF5A24, .9);
          color: #fff;
          box-shadow: 0 2px 5px #E2E2E2;
          font-size: .75rem;
          border: none;
          font-weight: bold;
          outline: none;
          margin-bottom: .3rem;

          &:hover {
            background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
          }
        }

      }

      p {
        color: #9D1A63;
        font-size: .75rem;
        
        span {
          color: #EF5A24;
          cursor: pointer;
        }
      }
    }
  }
</style>