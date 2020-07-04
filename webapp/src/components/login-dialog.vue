<template>
  <CustomDialog :show='show' @updated:show="hideDialog">
    <div class="logo-container">
      <img :src="imageUrl" alt="Social Relief Logo" class="logo">
    </div>
    <h4>Login</h4>
    <form class="login-form">
      <div class="row form-group">
        <input 
          v-model="signInCreds.phone" 
          type="text" 
          :class="getClassesForSignInDialog('phone')"
          placeholder="Enter phone number"
        />
        <div class="invalid-feedback">
          {{ signInValidationMessages[0] }}
        </div>
      </div>
      <div class="row form-group">
        <input 
          v-model="signInCreds.password" 
          type="password" 
          :class="getClassesForSignInDialog('password')" 
          placeholder="Enter password"
        />
        <div class="invalid-feedback">
          {{ signInValidationMessages[1] }}
        </div>
      </div>
      <button type="button" class="submit-btn" @click.prevent="signIn">Submit</button>
    </form>
    <p>Don't have an account yet? <span @click="showSignUpDialog()">Sign Up.</span></p>
  </CustomDialog>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import CustomDialog from '../ui-components/dialog.vue';
import { validateObj } from '../views/util';
export default {
  name: 'login-dialog',
  props: ['show'],
  components: { CustomDialog },
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
      signInValidationResults: [true, true],
    }
  },
  computed: {
    ...mapState(['user', 'transactions']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    ...mapActions([
      'signUserIn', 'getBeneficiaries',
      'getCurrentUser', 'signUserOut', 'createUser'
    ]),
    validateObj,
    getClassesForSignInDialog(nameOfInput) {
      switch(nameOfInput) {
        case 'phone': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signInValidationResults[0]
          }
        case 'password': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.signInValidationResults[1]
          }
        default: 
          return {}
      }
    },
    showSignUpDialog() {
      this.signInCreds = {
        phone: '',
        password: ''
      },
      this.signInValidationResults = [true, true];
      this.$emit('show:sign-up');
    },
    hideDialog() {
      this.signInCreds = {
        phone: '',
        password: ''
      },
      this.signInValidationResults = [true, true];
      this.$emit('hide');
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
          this.$emit('hide');
        } 
      }
    }
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

      .login-form {
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