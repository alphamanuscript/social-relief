<template>
  <div >
    <b-container fluid="md" class="w-lg-75 pt-5" :style="styleObject">
      <b-navbar toggleable="sm" variant="light" sticky>
        <b-navbar-brand to="#">
          <img :src="imageUrl" width="150" alt="Social Relief Logo">
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="h6 w-100" fill>
            <b-nav-item to="/#testimonials" >Testimonials</b-nav-item>
            <b-nav-item to="/#beneficiaries" >FAQ</b-nav-item>
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
    <HomeFooter />
    </div>
</template>
<script>
import HomeFooter from '../components/home-footer'
import { mapState, mapActions } from 'vuex';
import { Auth, AnonymousUser } from '../services';
import { DEFAULT_SIGNED_IN_PAGE } from '../router/defaults';
export default {
  name: 'logged-out-structure',
  components: { HomeFooter },
  computed: {
    ...mapState(['user', 'message']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
    styleObject() {
      if (this.$route.name === 'post-payment-flutterwave' && AnonymousUser.isSet()) {
        return { "padding-bottom": "11rem" }
      }
      return {};
    }
  },
  methods: {
    ...mapActions(['resetMessage']),
    handleLoginAndSignUpBtnClick() {
      this.$bvModal.show('login');
    }
  },
  async created() {
    if (Auth.isAuthenticated() && this.$route.name === 'accept-invitation') {
      this.$router.push({ name: 'invitations' });
    }
    else if (Auth.isAuthenticated()) {
      this.$router.push({ name: DEFAULT_SIGNED_IN_PAGE });
    }
  },
  watch: {
    message() {
      switch (this.message.type) {
        case '':
          break;
        case 'error':
          this.$bvToast.toast(this.message.message, {
            title: this.message.type.toUpperCase(),
            variant: 'danger',
            solid: true
          });
          this.resetMessage();
          break;
        default:
          this.$bvToast.toast(this.message.message, {
            title: this.message.type.toUpperCase(),
            variant: 'info',
            solid: true
          });
          this.resetMessage();
      }
    }
  }
}
</script>