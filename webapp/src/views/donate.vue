<template>
  <div class="container">
    <div v-if="user" class="row">
      <div class="col-md-8">
        <h2>Deposit</h2>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="depositAmount">Amount</label>
              <input
                v-model.number="deposit"
                id="depositAmount"
                type="number"
                class="form-control"
                min="100"
              >
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="submitDeposit">Deposit</button>
            </div>
          </div>
        </form>
      </div>
      <div class="col-md-4">
        <h3>My Stats</h3>
        <div>
          <b>Account balance</b>: {{ user.accountBalance }}
        </div>
        <div>
          <b>Donation balance</b>: {{ user.donationBalance }}
        </div>
        <div>
          <b>Total amount donated</b>: {{ totalAmountDonated }}
        </div>
        <div>
          <b>People donated to</b>: {{ peopleDonatedTo }}
        </div>
      </div>
    </div>
    <div v-if="user" class="row">
      <div class="col-md-8">
        <hr>
        <h3>Nominated beneficiaries</h3>
        <p>You can nominate up to x beneficiaries to the system</p>
        <form v-if="!isThereEnoughDonationForAnotherBeneficiary">
          <div class="form-group">
            <label for="beneficiary">Beneficiary</label>
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
      <div class="col-md-4">
        <hr class="donation-history-separator">
        <h3>Nominated beneficiaries</h3>
        <ul class="list-group">
          <li v-for="beneficiary in beneficiaries" class="list-group-item" :key="beneficiary._id">
            {{ beneficiary.phone }} ({{ beneficiary._id }})
          </li>
        </ul>
      </div>
    </div>
    <div v-if="user" class="row">
      <div class="col-md-8">
        <hr>
        <h3>Appoint trusted point person</h3>
        <p>You can appoint a trusted point person and they can nominate
          beneficiaries on your behalf</p>
        <form>
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
      <div class="col-md-4">
        <hr class="donation-history-separator">
        <h3>Appointed middlemen</h3>
        <ul class="list-group">
          <li v-for="middleman in middlemen" class="list-group-item" :key="middleman._id">
            {{ middleman.phone }} ({{ middleman._id }})
          </li>
        </ul>
      </div>
    </div>
    <div v-if="user" class="row">
      <div class="col-md-8">
        <hr>
        <h2>Donate</h2>
        <form v-if="isThereEnoughForADonation">
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="donateAmount">Amount</label>
              <input
                v-model.number="donation.amount"
                id="donateAmount"
                type="number"
                class="form-control"
                min="200"
                :max="user.accountBalance"
              >
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="submitDonation">Donate</button>
            </div>
          </div>
        </form>
        <form v-else>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="donateAmount">Amount</label>
              <input
                v-model.number="donation.amount"
                id="donateAmount"
                type="number"
                class="form-control"
                min="200"
                :max="user.accountBalance"
                disabled
              >
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="submitDonation" disabled>Donate</button>
            </div>
          </div>
        </form>
      </div>
      <div class="col-md-4">
        <hr>
        <h3>Donation history</h3>
        <ul class="list-group">
          <li v-for="donation in donations" class="list-group-item" :key="donation._id">
            {{ donation.amount }} to {{ donation.to }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex';

export default {
  name: 'Donate',
  data() {
    return {
      deposit: 100,
      donation: {
        amount: 200,
        to: ''
      },
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
      'accountBalance',
      'peopleDonatedTo',
      'donations'
    ]),
    ...mapState(['user', 'beneficiaries', 'middlemen']),
    isThereEnoughDonationForAnotherBeneficiary() {
      if (this.user.donationBalance === 0) {
        return true;
      }
      return this.user.donationBalance / (this.beneficiaries.length + 1) >= 100; 
    },
    isThereEnoughForADonation() {
      if (this.user.accountBalance && this.beneficiaries.length * 200 <= this.user.accountBalance) {
        return true;
      }
      return false;
    }
  },
  methods: {
    ...mapActions(['depositToAccount', 'donate', 'nominateBeneficiary', 'appointMiddleman']),
    submitDeposit() {
      this.depositToAccount({ user: this.user, amount: this.deposit });
    },
    submitDonation() {
      this.donation.from = this.user._id;
      console.log('donation', this.donation);
      this.donate({ user: this.user, donation: this.donation });
      // this.donate({ from: this.user._id, to: this.donation.to, amount: this.donation.amount });
      // this.depositToAccount(this.user.accountId, this.donation);
    },
    submitBeneficiary() {
      console.log('beneficiary', this.beneficiary);
      if (this.beneficiary.length && !this.beneficiaries.find(bnf => bnf.phone === this.beneficiary)) {
        this.isValidBeneficiary = true;
        this.nominateBeneficiary({nominator: this.user._id, beneficiary: this.beneficiary});
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
      console.log('middleman', this.middleman);
      if (this.middleman.length && !this.middlemen.find(mdm => mdm.phone)) {
        this.isValidMiddleman = true;
        this.appointMiddleman({appointer: this.user._id, middleman: this.middleman});
      }
      else if(!this.middleman.length) {
        this.middlemanMessage = 'Please provide a valid phone number'
        this.isValidMiddleman = false;
      }
      else if (this.middlemen.find(mdm => mdm.phone)) {
        this.middlemanMessage = 'Middleman already appointed';
        this.isValidMiddleman = false;
      }
    },
    getClasses(nameOfInput) {
      return {
        'form-control': true,
        'is-invalid': nameOfInput === 'middleman' ? !this.isValidMiddleman : !this.isValidBeneficiary
      }
    },
  }
}
</script>
<style lang="scss">
  .my-stats-separator {
    margin-top: 73px;
  }
  
</style>
