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
                <div class="bg-secondary text-white rounded pl-3 pt-2">
                  <div class="font-weight-light">Current balance</div>
                  <div class="">KSH</div>
                  <div class="h4">{{ formatWithCommaSeparator(accountBalance) }}</div>
                </div>
              </div>
              <RefundButton />
            </b-nav-text>

            <b-nav-item to="/beneficiaries" exact exact-active-class="active">Beneficiaries</b-nav-item>
            <b-nav-item to="/middlemen" exact exact-active-class="active">Middlemen</b-nav-item>
            <b-nav-item to="/invitations" exact exact-active-class="active">Invitations</b-nav-item>
            <b-nav-item to="/history" exact exact-active-class="active">Transaction history</b-nav-item>
            <div class="small text-secondary mt-auto">
            <p><b-link href="#" class="text-secondary" @click="handlePrivacyPolicy()">privacy policy</b-link></p>
            <p><b-link href="#" class="text-secondary" @click="handleTermsOfUse()">terms of use</b-link></p>
            <p>&copy; {{ new Date().getFullYear() }}</p>
          </div>
          </b-nav>
        </b-col>
        <b-col>
          <b-navbar toggleable="sm" variant="light" sticky style="margin-bottom: 1.5rem">
            <b-navbar-brand to="#" class="d-md-none">
              <img :src="imageUrl" width="150" alt="Social Relief Logo">
            </b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
              <b-nav class="h6 w-100 text-center" pills>
                <b-nav-item v-if="user && (user.roles.length > 1 || user.roles[0] !== 'beneficiary')" to="/nominate" exact exact-active-class="active" class="col-sm-12 col-md-4 col-xl-3">Nominate people</b-nav-item>
                <div class="col-sm-12 text-center d-md-none">
                  <b-nav-item to="/beneficiaries" exact exact-active-class="active">Beneficiaries</b-nav-item>
                  <b-nav-item to="/middlemen" exact exact-active-class="active">Middlemen</b-nav-item>
                  <b-nav-item to="/invitations" exact exact-active-class="active">Invitations</b-nav-item>
                  <b-nav-item to="/history" exact exact-active-class="active">History</b-nav-item>
                  <b-nav-item to="/account" exact exact-active-class="active">My Account</b-nav-item>
                  <b-nav-item href="#" @click="signOut()"> <span class="text-secondary">Sign Out</span></b-nav-item>
                </div>
                <b-button
                  v-if="isEligibleDonor"
                  variant="primary" class="custom-submit-button m-auto m-md-0"
                  @click="handleDonateBtn"
                  >Donate</b-button>
              </b-nav>
              <b-nav class="ml-auto d-none d-md-block">
                <b-nav-item-dropdown dropleft no-caret>
                    <template v-slot:button-content>
                        <b-avatar></b-avatar>
                    </template>
                    <b-dropdown-header>
                      <p>
                        <span class="h5 text-body">{{ user && user.name }}</span>
                      </p>
                      <p>
                        <span class="text-primary">Phone Number: </span> <span class="text-secondary">+{{user && user.phone }}</span> <br/>
                        <span class="text-primary ">Email: </span> <span class="text-secondary">{{ user && user.email }}</span>
                      </p>
                    </b-dropdown-header>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item to="/account">My Account</b-dropdown-item>
                    <b-dropdown-item href="#" @click="signOut()"><span class="text-secondary">Sign Out</span></b-dropdown-item>
                  </b-nav-item-dropdown>
              </b-nav>
            </b-collapse>
          </b-navbar>
          <div
            v-if="areTransactionsPermanentlyBlocked"
            class="alert alert-warning"
          >
            This account is blocked from making donations. Reason: {{ user.transactionsBlockedReason }}
          </div>
          <router-view />
        </b-col>
      </b-row>
    </b-container>
    <HomeFooter class="d-md-none"/>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import HomeFooter from '../components/home-footer';
import RefundButton from '../components/refund-button';
import { formatWithCommaSeparator } from '../views/util';
export default {
  name: 'logged-in-structure',
  components: { HomeFooter, RefundButton },
  computed: {
    ...mapState(['user', 'beneficiaries', 'middlemen', 'message']),
    ...mapGetters([
      'accountBalance',
      'totalAmountDonated',
      'totalAmountDistributed',
    ]),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
    isEligibleDonor() {
      return this.user && this.user.roles.includes('donor') && !this.areTransactionsPermanentlyBlocked;
    },
    areTransactionsPermanentlyBlocked() {
      return this.user && this.user.transactionsBlockedReason === 'maxRefundsExceeded';
    }
  },
  methods: {
    ...mapActions(['signUserOut', 'getCurrentUser', 'refreshData', 'resetMessage']),
    formatWithCommaSeparator,
    async signOut() {
      await this.signUserOut();
    },
    handleDonateBtn() {
      this.$bvModal.show('donate');
    },
    handlePrivacyPolicy() {
      this.$bvModal.show('privacy-policy')
    },
    handleTermsOfUse() {
      this.$bvModal.show('terms-of-use')
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