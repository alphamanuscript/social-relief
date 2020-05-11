<template>
  <div class="container">
    <div v-if="user" class="row mb-md-5">
      <div class="col-md-5">
        <h2>Donate</h2>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="donateAmount">Amount</label>
              <input
                v-model.number="donation"
                id="donateAmount"
                type="number"
                class="form-control"
                min="100"
              >
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="submitDonation">Donate</button>
            </div>
          </div>
        </form>
      </div>
      <div class="col-md-3" style="text-align: center">
        <div style="margin: auto; display: inline-block; text-align: left">
          <h3>My Stats</h3>
          <div>
            <b>Account balance</b>: {{ totalAmountDonated - totalAmountDistributed }}
          </div>
          <div>
            <b>Total amount donated</b>: {{ totalAmountDonated }}
          </div>
          <div>
            <b>People donated to</b>: {{ peopleDonatedTo }}
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <h3>Donation history</h3>
        <ul v-if="donations.length" class="list-group">
          <li v-for="donation in donations" class="list-group-item" :key="donation._id">
            {{ donation.amount }} @ {{ getDonationDate(donation) }}
          </li>
        </ul>
        <p v-else>No donations made as of yet</p>
      </div>
    </div>
    <hr>
    <div v-if="user" class="row mb-md-5">
      <div class="col-md-5">
        <h3>Nominated beneficiaries</h3>
        <p>You can nominate up to x beneficiaries to the system</p>
        <form v-if="!isThereEnoughDonationForAnotherBeneficiary">
          <div class="form-group">
            <label for="beneficiary">Beneficiary ()</label>
            <input
              v-model="beneficiary"
              id="beneficiary"
              type="text"
              class="form-control"
              disabled
            >
          </div>
          <button 
            type="submit" 
            class="btn btn-primary" 
            @click.prevent="submitBeneficiary"
            disabled
          >
          Nominate
          </button>
        </form>
        <form v-else>
          <div class="form-group">
            <label for="beneficiary">Beneficiary</label>
            <input
              v-model="beneficiary"
              id="beneficiary"
              type="text"
              :class="getClasses('beneficiary')"
            >
            <div class="invalid-feedback">
              {{ beneficiaryMessage }}
            </div>
          </div>
          <button 
            type="submit" 
            class="btn btn-primary" 
            @click.prevent="submitBeneficiary"
          >
          Nominate
          </button>
        </form>
      </div>
      <div class="col-md-3"></div>
      <div class="col-md-4">
        <h3>Nominated beneficiaries</h3>
        <ul class="list-group">
          <li v-for="beneficiary in beneficiaries" class="list-group-item" :key="beneficiary._id">
            {{ beneficiary.phone }}
          </li>
        </ul>
      </div>
    </div>
    <hr>
    <div v-if="user" class="row">
      <div class="col-md-5">
        <h3>Appoint trusted point person</h3>
        <p>You can appoint a trusted point person and they can nominate
          beneficiaries on your behalf</p>
        <form v-if="!isThereEnoughDonationForAnotherBeneficiary">
          <div class="form-group">
            <label for="middleman">Middleman</label>
            <input
              v-model="middleman"
              id="middleman"
              type="text"
              :class="getClasses('middleman')"
              disabled
            >
            <div class="invalid-feedback">
              {{ middlemanMessage }}
            </div>
          </div>
          <button type="submit" class="btn btn-primary" @click.prevent="submitMiddleman" disabled>Appoint</button>
        </form>
        <form v-else>
          <div class="form-group">
            <label for="middleman">Middleman</label>
            <input
              v-model="middleman"
              id="middleman"
              type="text"
              :class="getClasses('middleman')"
              required
            >
            <div class="invalid-feedback">
              {{ middlemanMessage }}
            </div>
          </div>
          <button type="submit" class="btn btn-primary" @click.prevent="submitMiddleman">Appoint</button>
        </form>
      </div>
      <div class="col-md-3"></div>
      <div class="col-md-4">
        <h3>Appointed middlemen</h3>
        <ul class="list-group">
          <li v-for="middleman in middlemen" class="list-group-item" :key="middleman._id">
            <div class="row">
              <div class="col-md-4">
                {{ middleman.phone }} 
              </div>
              <div class="col-md-8">
                <button class="btn btn-primary" @click.prevent="reinvite(middleman.phone)">Resend Invitation</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import moment from 'moment';
export default {
  name: 'donor-interface',
  data() {
    return {
      creds: {
        donation: 100,
        beneficiary: '',
        middleman: '',
      },
      valdationMessages: [
        'Insufficient amount. Donations must be 100 and more',
        'Invalid Phone number. Must start with 7 and be 9 digit long',
        'Beneficiary already nominated',
        'Middleman already appointed'
      ],
      validationRules: [
        { test: (creds) => creds.donation >= 100 },
        { test: (creds) => creds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
        { test: (creds) => !creds.beneficiaries.map(beneficiary => creds.beneficiary === beneficiary).length },
        { test: (creds) => !creds.middlemen.map(middleman => creds.middleman === middleman).length }
      ],
      validationResults: [true, true, true, true],
      donation: 100,
      beneficiary: '',
      middleman: '',
      isValidMiddleman: true,
      isValidBeneficiary: true,
      beneficiaryMessage: 'Please provide a valid phone number',
      middlemanMessage: 'Please provide a valid phone number'
    }
  },
  computed: {
    ...mapGetters([
      'totalAmountDonated',
      'totalAmountDistributed',
      'peopleDonatedTo',
      'donations',
      'numberOfBeneficiariesOwed',
      'numberOfBeneficiariesNotOwed',
      'totalAmountOwedToBeneficiaries',
    ]),
    ...mapState(['user', 'beneficiaries', 'middlemen', 'invitations']),
    isThereEnoughDonationForAnotherBeneficiary() {
      if ((this.totalAmountDonated - this.totalAmountDistributed) < 2000) {
        return false;
      }
      else {
        console.log('this.totalAmountOwedToBeneficiaries: ', this.totalAmountOwedToBeneficiaries);
        console.log('this.numberOfBeneficiariesNotOwed: ', this.numberOfBeneficiariesNotOwed);
        const balanceAfterMoneyOwed = this.user.accountBalance - this.totalAmountOwedToBeneficiaries;
        if (balanceAfterMoneyOwed >= 2000 && (balanceAfterMoneyOwed / 2000 > this.numberOfBeneficiariesNotOwed)) {
          return true;
        }
        return false;
      }
    },
    isThereEnoughForADonation() {
      if ((this.totalAmountDonated - this.totalAmountDistributed) >= 100) return true;
      return false;
    }
  },
  methods: {
    ...mapActions([
      'depositToAccount', 
      'donate', 
      'nominateBeneficiary', 
      'appointMiddleman', 
      'getInvitations',
      'resendInvitation'
    ]),
    moment,
    submitDonation() {
      this.validationMessages[0] = 'Invalid Phone number. Must start with 7 and be 9 digit long';
      this.validationResults = this.validateObj(this.creds, [this.validationRules[0]]);
      if (!this.validationResults.includes(false)) {
        // this.donate({ amount: this.donation });
      }
      console.log('this.donation: ', this.donation);
    },
    submitBeneficiary() {
      if (this.beneficiary.length && !this.beneficiaries.find(bnf => bnf.phone === this.beneficiary)) {
        this.isValidBeneficiary = true;
        this.nominateBeneficiary({nominator: this.user._id, beneficiary: this.beneficiary});
        this.beneficiary = '';
      }
      else if (!this.beneficiary.length){
        this.beneficiaryMessage = 'Please provide a valid phone';
        this.isValidBeneficiary = false;
      }
      else if (this.beneficiaries.find(bnf => bnf.phone === this.beneficiary)) {
        this.beneficiaryMessage = 'Beneficiary already nominated';
        this.isValidBeneficiary = false;
      }
    },
    submitMiddleman() {
      if (this.middleman.length && !this.middlemen.find(mdm => mdm.phone === this.middleman)) {
        this.isValidMiddleman = true;
        this.appointMiddleman({ middleman: this.middleman});
        this.middleman = '';
      }
      else if(!this.middleman.length) {
        this.middlemanMessage = 'Please provide a valid phone number'
        this.isValidMiddleman = false;
      }
      else if (this.middlemen.find(mdm => mdm.phone === this.middleman)) {
        this.middlemanMessage = 'Middleman already appointed';
        this.isValidMiddleman = false;
      }
    },
    reinvite(middleman) {
      console.log('Inside resend invitation: ', middleman);
      this.resendInvitation({ middleman });
    },
    getClasses(nameOfInput) {
      return {
        'form-control': true,
        'is-invalid': nameOfInput === 'middleman' ? !this.isValidMiddleman : !this.isValidBeneficiary
      }
    },
    getDonationReceipient(donation) {
      return donation.to.length ? donation.to : 'system'
    },
    getDonationDate(donation) {
      return moment(donation.timestamp).format('MMMM Do YYYY, HH:mm:ss A')
    }
  }
}
</script>
<style lang="scss">
  .my-stats-separator {
    margin-top: 73px;
  }
</style>