<template>
  <div class="container">
    <div class="row mb md-5">
      <div class="col">
        <h2>Sign Up Page</h2>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="phone">Phone</label>
              <input
                v-if="signupPhone.length"
                v-model="phone"
                id="phone"
                type="text"
                :class="getClasses('phone')"
                disabled
              >
              <input
                v-else
                v-model="phone"
                id="phone"
                type="text"
                :class="getClasses('phone')"
              >
              <div class="invalid-feedback">
                {{ phoneMessage }}
              </div>
            </div>
            <div class="col-md-12 form-group">
              <label for="email">Email</label>
              <input
                v-model="email"
                id="email"
                type="email"
                :class="getClasses('email')"
              >
              <div class="invalid-feedback">
                {{ emailMessage }}
              </div>
            </div>
            <div class="col-md-12 form-group">
              <label for="password">Password</label>
              <input
                v-model="password"
                id="password"
                type="password"
                :class="getClasses('password')"
              >
              <div class="invalid-feedback">
                {{ passwordMessage }}
              </div>
            </div>
            <div class="col-md-12 form-group">
              <label for="confirmedPassword">Confirm Password</label>
              <input
                v-model="confirmedPassword"
                id="confirmedPassword"
                type="password"
                :class="getClasses('confirmedPassword')"
              >
              <div class="invalid-feedback">
                {{ confirmedPasswordMessage }}
              </div>
            </div>
            <div class="col-md-12 form-group">
              <label for="role">Role</label>
              <select v-if="role === 'donor'" id="role" v-model="role" class="form-control">
                <option selected value="donor">Donor</option>
                <option value="middleman">Middleman</option>
              </select>
              <select v-else v-model="role" class="form-control">
                <option value="middleman">Middleman</option>
              </select>
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="signup">Sign Up</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { AccountService } from '@/services';

export default {
  name: 'sign-up',
  data() {
    return {
      phone: '',
      email: '',
      password: '',
      confirmedPassword: '',
      role: 'donor',
      phoneMessage: 'Please provide a valid phone',
      emailMessage: 'Please provide a valid email',
      passwordMessage: 'Please provide a valid password',
      confirmedPasswordMessage: 'Please provide a valid password',
      isValidPhone: true,
      isValidEmail: true,
      isValidPassword: true,
      isValidConfirmedPassword: true
    }
  },
  computed: {
    ...mapState(['signupPhone'])
  },
  methods: {
    ...mapActions(['createUser']),
    getClasses(nameOfInput) {
      switch(nameOfInput) {
        case 'phone': 
          return {
            'form-control': true,
            'is-invalid': !this.isValidPhone
          }
        case 'email': 
          return {
            'form-control': true,
            'is-invalid': !this.isValidEmail
          }
        case 'password': 
          return {
            'form-control': true,
            'is-invalid': !this.isValidPassword
          }
        case 'confirmedPassword': 
          return {
            'form-control': true,
            'is-invalid': !this.isValidConfirmedPassword
          }
        default: 
          return {}
      }
    },
    signup() {
      console.log('Phone: ', this.phone);
      console.log('Email: ', this.email);
      console.log('Password: ', this.password);
      console.log('Confirmed Password: ', this.confirmedPassword);
      console.log('Role: ', this.role);

      if (this.phone.length && this.email.length && this.password.length && this.confirmedPassword.length && 
          this.password === this.confirmedPassword && this.canSignup()) {
        console.log('All test cases pass');
        this.isValidPhone = true;
        this.isValidEmail = true;
        this.isValidPassword = true;
        this.isValidConfirmedPassword = true;
        this.createUser({ phone: this.phone, email: this.email, role: this.role });
      }
      else if (!this.phone.length) {
        console.log('Invalid phone');
        this.phoneMessage = 'Please provide a valid phone';
        this.isValidPhone = false;
      }
      else if (!this.email.length) {
        console.log('Invalid email');
        this.emailMessage = 'Please provide a valid email';
        this.isValidEmail = false;
      }
      else if (!this.password.length) {
        console.log('Invalid password');
        this.passwordMessage = 'Please provide a valid password';
        this.isValidPhone = true;
        this.isValidEmail = true;
        this.isValidPassword = false;
      }
      else if (!this.confirmedPassword.length) {
        console.log('Invalid confirmed password');
        this.confirmedPasswordMessage = 'Please provide a valid password';
        this.isValidPhone = true;
        this.isValidEmail = true;
        this.isValidPassword = true;
        this.isValidConfirmedPassword = false;
      }
      else if (this.password !== this.confirmedPassword) {
        console.log('Confirmed password does not match with password');
        this.confirmedPasswordMessage = 'Confirmed password does not match with password';
        this.isValidPhone = true;
        this.isValidEmail = true;
        this.isValidPassword = true;
        this.isValidConfirmedPassword = false;
      }
    },
    async canSignup() {
      const user = await AccountService.getUser(this.phone);
      if(!user) {
        if (this.role === 'middleman') {
          const middleman = await AccountService.getMiddleman(this.phone);
          return !middleman ? false : true;
        }
        else {
          const beneficiary = await AccountService.getBeneficiary(this.phone);
          return !beneficiary ? true : false;
        }
      }
      return true;
    }
  },
  watch: {
    async signupPhone(newVal) {
      console.log('Watching signupPhone: ', newVal);
      if(newVal) {
        this.phone = this.signupPhone;
        this.role = 'middleman';
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  
</style>