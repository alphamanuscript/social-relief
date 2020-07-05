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
                <b-nav-item to="nominate" exact exact-active-class="active" class="col-sm-12 col-md-3 col-xl-2">Nominate</b-nav-item>
                <div class="col-sm-12 text-center d-md-none">
                  <b-nav-item to="beneficiaries" exact exact-active-class="active">Beneficiaries</b-nav-item>
                  <b-nav-item to="middlemen" exact exact-active-class="active">Middlemen</b-nav-item>
                  <b-nav-item to="invitations" exact exact-active-class="active">Invitations</b-nav-item>
                  <b-nav-item to="history" exact exact-active-class="active">History</b-nav-item>
                  <b-nav-item to="account" exact exact-active-class="active">My Account</b-nav-item>
                  <b-nav-item href="#" @click="signOut()">Sign Out</b-nav-item>
                </div>
                <b-nav-text>
                  <b-button variant="primary" class="custom-submit-button">Donate</b-button>
                </b-nav-text>
                <b-nav-item-dropdown class="ml-auto d-none d-md-block">
                  <template v-slot:button-content>
                    <b-avatar></b-avatar>
                  </template>
                  <b-dropdown-item to="account">My Account</b-dropdown-item>
                  <b-dropdown-item href="#" @click="signOut()">Sign Out</b-dropdown-item>
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
import { mapActions } from 'vuex';
import Footer from './home/footer';
export default {
  name: 'logged-out-structure',
  components: { Footer },
  computed: {
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    ...mapActions(['signUserOut']),
    async signOut() {
      await this.signUserOut();
    }
  }
}
</script>
<style lang="scss">
  
</style>