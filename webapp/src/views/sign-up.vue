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
                v-model="phone"
                id="phone"
                type="text"
                class="form-control"
              >
            </div>
            <div class="col-md-12 form-group">
              <label for="password">Password</label>
              <input
                v-model="password"
                id="password"
                type="password"
                class="form-control"
              >
            </div>
            <div class="col-md-12 form-group">
              <label for="confirmed_password">Confirm Password</label>
              <input
                v-model="confirmed_password"
                id="confirmed_password"
                type="password"
                class="form-control"
              >
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
export default {
  name: 'sign-up',
  data() {
    return {
      phone: '',
      password: '',
      confirmedPassword: '',
      phoneMessage: 'Please provide a valid phone',
      passwordMessage: 'Please provide a valid password',
    }
  },
}
</script>
<style lang="scss" scoped>
  
</style>