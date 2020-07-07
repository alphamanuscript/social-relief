<template>
  <div>
    <b-container fluid>
      <b-row>
        <b-col md="3" xl="2" class="bg-white d-none d-md-block">
          <b-nav vertical class="mr-4 vh-100 pl-2" pills>
            <b-nav-text class="mb-5">
              <div class="d-flex flex-column">
                <div class="py-5">
                  <img :src="imageUrl" width="75%" alt="Social Relief Logo">
                </div>
                <div class="bg-secondary text-white rounded-lg pl-3 pt-2">
                  <div class="font-weight-light">Current balance</div>
                  <div class="">KSH</div>
                  <div class="h4">1,500</div>
                </div>
              </div>
            </b-nav-text>
            <b-nav-item to="beneficiaries" exact exact-active-class="active">Beneficiaries</b-nav-item>
            <b-nav-item to="middlemen" exact exact-active-class="active">Middlemen</b-nav-item>
            <b-nav-item to="invitations" exact exact-active-class="active">Invitations</b-nav-item>
            <b-nav-item to="history" exact exact-active-class="active">History</b-nav-item>
            <div class="small text-secondary mt-auto">
            <p>privacy policy</p>
            <p>terms of use</p>
            <p>&copy; {{ new Date().getFullYear() }}</p>
          </div>
          </b-nav>
        </b-col>
        <b-col>
          <b-navbar toggleable="sm" variant="light" sticky>
            <b-navbar-brand to="#" class="d-md-none">
              <img :src="imageUrl" width="150" alt="Social Relief Logo">
            </b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
              <b-nav class="h6 w-100 text-center" pills>
                <b-nav-item to="nominate" exact exact-active-class="active" class="col-sm-12 col-md-4 col-xl-2">Nominate</b-nav-item>
                <div class="col-sm-12 text-center d-md-none">
                  <b-nav-item to="beneficiaries" exact exact-active-class="active">Beneficiaries</b-nav-item>
                  <b-nav-item to="middlemen" exact exact-active-class="active">Middlemen</b-nav-item>
                  <b-nav-item to="invitations" exact exact-active-class="active">Invitations</b-nav-item>
                  <b-nav-item to="history" exact exact-active-class="active">History</b-nav-item>
                  <b-nav-item to="account" exact exact-active-class="active">My Account</b-nav-item>
                  <b-nav-item href="#" @click="signOut()"> <span class="text-secondary">Sign Out</span></b-nav-item>
                </div>
                <b-button variant="primary" class="custom-submit-button m-auto m-md-0" @click="handleDonateBtn">Donate</b-button>
              </b-nav>
              <b-nav class="ml-auto d-none d-md-block">
                <b-nav-item-dropdown dropleft no-caret>
                    <template v-slot:button-content>
                        <b-avatar></b-avatar>
                    </template>
                    <b-dropdown-header>
                      <p>
                        <span class="h5 text-body">John Doe</span> <br/>
                        <span class="text-primary small">Phone Number: </span> <span class="text-secondary small">+{{ user ? user.phone : '' }}</span>
                      </p>
                    </b-dropdown-header>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item to="account">My Account</b-dropdown-item>
                    <b-dropdown-item href="#" @click="signOut()"><span class="text-secondary">Sign Out</span></b-dropdown-item>
                  </b-nav-item-dropdown>
              </b-nav>
            </b-collapse>
          </b-navbar>
          <router-view />
        </b-col>
      </b-row>
    </b-container>
    <Footer class="d-md-none"/>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
import Footer from './home/footer';
export default {
  name: 'logged-in-structure',
  components: { Footer },
  computed: {
    ...mapState(['user']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    ...mapActions(['signUserOut', 'getCurrentUser']),
    async signOut() {
      await this.signUserOut();
    },
    handleDonateBtn() {
      this.$bvModal.show('donate');
    }
  },
  async mounted() {
    if (Auth.isAuthenticated() && !this.user) {
      await this.getCurrentUser();
    }
    else if (!Auth.isAuthenticated()) this.$router.push({ name: DEFAULT_SIGNED_OUT_PAGE });
  },
}
</script>
<style lang="scss">
  
</style>