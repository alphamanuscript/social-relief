<template>
  <div >
    <b-container fluid="md" class="w-lg-75 pt-5">
      <b-navbar toggleable="sm" variant="light" sticky>
        <b-navbar-brand to="#">
          <img :src="imageUrl" width="150" alt="Social Relief Logo">
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="h6 w-100" fill>
            <b-nav-item to="/#beneficiaries" >How it works</b-nav-item>
            <b-nav-item to="/#about-us">About Us</b-nav-item>
            <b-nav-item to="/#contact-us">Contact Us</b-nav-item>
            <b-nav-item to="#" @click="handleLoginAndSignUpBtnClick">
              <b-button size="sm" pill variant="primary">Login / Sign Up</b-button>
            </b-nav-item>
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
      this.$bvModal.show('login');
    }
  }
}
</script>
<style lang="scss">

</style>