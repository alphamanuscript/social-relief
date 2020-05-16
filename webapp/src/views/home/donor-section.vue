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
                v-model.number="input.donation"
                id="donateAmount"
                type="number"
                :class="getClasses('donation')"
                min="100"
              >
              <div class="invalid-feedback">
                {{ validationMessages[0] }}
              </div>
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
        <form>
          <div class="form-group">
            <label for="beneficiary">Beneficiary (7xxxxxxxx)</label>
            <input
              v-model="input.beneficiary"
              id="beneficiary"
              type="text"
              :class="getClasses('beneficiary')"
            >
            <div class="invalid-feedback">
              {{ !validationResults[1] ? validationMessages[1] : validationMessages[2] }}
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
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import moment from 'moment';
import { validateObj } from '../util';

export default {
  name: 'donor-interface',
  data() {
    return {
      input: {
        donation: 100,
        beneficiary: '',
        middleman: '',
      },
      validationMessages: [
        'Insufficient amount. Donations must be 100 and more',
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Beneficiary already nominated',
        'Middleman already appointed'
      ],
      validationRules: [
        { test: (input) => input.donation >= 100 },
        { test: (input) => input.beneficiary[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(input.beneficiary) },
        { test: (input) => input.middleman[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(input.middleman) },
        { test: (input) => !input.beneficiaries.filter(beneficiary => beneficiary.phone === `254${input.beneficiary}`).length },
        { test: (input) => !input.middlemen.filter(middleman => middleman.phone === `254${input.middleman}`).length }
      ],
      validationResults: [true, true, true, true, true],
    }
  },
  computed: {
    ...mapGetters([
      'totalAmountDonated',
      'totalAmountDistributed',
      'peopleDonatedTo',
      'donations',
    ]),
    ...mapState(['user', 'beneficiaries', 'middlemen'])
  },
  methods: {
    ...mapActions([
      'donate', 
      'nominateBeneficiary', 
      'appointMiddleman',
    ]),
    moment,
    validateObj,
    submitDonation() {
      this.validationResults = [
        this.validateObj(this.input, [this.validationRules[0]])[0],
        true,
        true,
        true,
        true
      ]
      if (!this.validationResults.includes(false)) {
        this.donate({ amount: this.input.donation });
      }
    },
    submitBeneficiary() {
      this.validationResults = [
        true,
        this.validateObj(this.input, [this.validationRules[1]])[0],
        true,
        this.validateObj({ ...this.input, beneficiaries: this.beneficiaries }, [this.validationRules[3]])[0],
        true
      ]
      if (!this.validationResults.includes(false)) {
        this.nominateBeneficiary({nominator: this.user._id, beneficiary: `254${this.input.beneficiary}`});
        this.input.beneficiary = '';
      }
    },
    getClasses(nameOfInput) {
      switch(nameOfInput) {
        case 'donation': 
          return {
            'form-control': true,
            'is-invalid': !this.validationResults[0]
          }
        case 'beneficiary': 
          return {
            'form-control': true,
            'is-invalid': !this.validationResults[1] || !this.validationResults[3]
          }
        case 'middleman': 
          return {
            'form-control': true,
            'is-invalid': !this.validationResults[2] || !this.validationResults[4]
          }
        default: 
          return {}
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