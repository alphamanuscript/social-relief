<template>
  <div >
    <b-container fluid="md" class="w-lg-75">
      <b-navbar toggleable="sm" variant="light" sticky>
        <b-navbar-brand to="#">
          <img :src="imageUrl" width="150" alt="Social Relief Logo">
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="h6 w-100" fill>
            <b-nav-item to="/#beneficiaries" ><span class="text-body">How it works</span></b-nav-item>
            <b-nav-item to="/#about-us"><span class="text-body">About Us</span></b-nav-item>
            <b-nav-item to="/#contact-us"><span class="text-body">Contact Us</span></b-nav-item>
            <b-nav-item to="#" @click="handleLoginAndSignUpBtnClick">
              <b-button size="sm" pill variant="primary">Login / Sign Up</b-button>
            </b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <router-view class="view-content" />
    </b-container>
    <Footer />
    </div>

</template>
<script>
import Footer from './home/footer'

export default {
  name: 'logged-out-structure',
  components: { Footer },
  computed: {
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    handleLoginAndSignUpBtnClick() {
      this.$emit('show:login-dialog');
    }
  }
}
</script>
<style lang="scss">

</style>