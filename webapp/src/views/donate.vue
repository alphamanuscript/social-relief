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
                min="2000"
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
            <b>Account balance</b>: {{ user.accountBalance }}
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
        <ul class="list-group">
          <li v-for="donation in donations" class="list-group-item" :key="donation._id">
            {{ donation.amount }} @ {{ getDonationDate(donation) }}
          </li>
        </ul>
      </div>
    </div>
    <hr>
    <div v-if="user" class="row mb-md-5">
      <div class="col-md-5">
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
      <div class="col-md-3"></div>
      <div class="col-md-4">
        <h3>Nominated beneficiaries</h3>
        <ul class="list-group">
          <li v-for="beneficiary in beneficiaries" class="list-group-item" :key="beneficiary._id">
            {{ beneficiary.phone }} ({{ beneficiary._id }})
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
            {{ middleman.phone }} ({{ middleman._id }})
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
  name: 'Donate',
  data() {
    return {
      donation: 2000,
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
      'peopleDonatedTo',
      'donations',
      'numberOfBeneficiariesOwed',
      'numberOfBeneficiariesNotOwed',
    ]),
    ...mapState(['user', 'beneficiaries', 'middlemen']),
    isThereEnoughDonationForAnotherBeneficiary() {
      if (this.user.accountBalance < 2000) {
        return false;
      }
      else {
        const balanceAfterMoneyOwed = this.user.accountBalance - this.numberOfBeneficiariesOwed;
        if (balanceAfterMoneyOwed >= 2000) {
          if (balanceAfterMoneyOwed / 2000 > this.numberOfBeneficiariesNotOwed) return true;
          return false;
        }
        return false;
      }
    },
    isThereEnoughForADonation() {
      if (this.user.accountBalance >= 100) {
        return true;
      }
      return false;
    }
  },
  methods: {
    ...mapActions(['depositToAccount', 'donate', 'nominateBeneficiary', 'appointMiddleman']),
    moment,
    submitDonation() {
      this.donate({ user: this.user, amount: this.donation });
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
      if (this.middleman.length && !this.middlemen.find(mdm => mdm.phone)) {
        this.isValidMiddleman = true;
        this.appointMiddleman({appointer: this.user._id, middleman: this.middleman});
        this.middleman = '';
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
