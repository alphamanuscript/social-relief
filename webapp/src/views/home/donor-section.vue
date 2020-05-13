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
        <form v-if="!isThereEnoughDonationForAnotherBeneficiary">
          <div class="form-group">
            <label for="beneficiary">Beneficiary (7xxxxxxxx)</label>
            <input
              v-model="input.beneficiary"
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
            <label for="beneficiary">Beneficiary (7xxxxxxxx)</label>
            <input
              v-model="input.beneficiary"
              id="beneficiary"
              type="text"
              :class="getClasses('beneficiary')"
            >
            <div class="invalid-feedback">
              {{ !validationResults[1] ? validationMessages[1] : validationMessages[3] }}
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
            <label for="middleman">Middleman (7xxxxxxxx)</label>
            <input
              v-model="input.middleman"
              id="middleman"
              type="text"
              :class="getClasses('middleman')"
              disabled
            >
          </div>
          <button type="submit" class="btn btn-primary" @click.prevent="submitMiddleman" disabled>Appoint</button>
        </form>
        <form v-else>
          <div class="form-group">
            <label for="middleman">Middleman (7xxxxxxxx)</label>
            <input
              v-model="input.middleman"
              id="middleman"
              type="text"
              :class="getClasses('middleman')"
              required
            >
            <div class="invalid-feedback">
              {{ !validationResults[2] ? validationMessages[1] : validationMessages[3] }}
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
        { test: (input) => !input.beneficiaries.map(beneficiary => beneficiary.phone === `254${input.beneficiary}`).length },
        { test: (input) => !input.middlemen.map(middleman => middleman.phone === `254${input.middleman}`).length }
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
      'numberOfBeneficiariesOwed',
      'numberOfBeneficiariesNotOwed',
      'totalAmountOwedToBeneficiaries',
    ]),
    ...mapState(['user', 'beneficiaries', 'middlemen', 'invitations']),
    isThereEnoughDonationForAnotherBeneficiary() {
      // if ((this.totalAmountDonated - this.totalAmountDistributed) < 2000) {
      //   return false;
      // }
      // else {
      //   console.log('this.totalAmountOwedToBeneficiaries: ', this.totalAmountOwedToBeneficiaries);
      //   console.log('this.numberOfBeneficiariesNotOwed: ', this.numberOfBeneficiariesNotOwed);
      //   const balanceAfterMoneyOwed = this.user.accountBalance - this.totalAmountOwedToBeneficiaries;
      //   if (balanceAfterMoneyOwed >= 2000 && (balanceAfterMoneyOwed / 2000 > this.numberOfBeneficiariesNotOwed)) {
      //     return true;
      //   }
      //   return false;
      // }
      return true;
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
        console.log('this.input.donation: ', this.input.donation);
        console.log('Validation for donation passed')
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
        console.log('Validation for middleman passed')
        // this.nominateBeneficiary({nominator: this.user._id, beneficiary: `254${this.input.beneficiary}`});
        this.input.beneficiary = '';
      }
    },
    submitMiddleman() {
      this.validationResults = [
        true,
        true,
        this.validateObj(this.input, [this.validationRules[2]])[0],
        true,
        this.validateObj({ ...this.input, middlemen: this.middlemen }, [this.validationRules[4]])[0]
      ]
      if (!this.validationResults.includes(false)) {
        console.log('Validation for middleman passed')
        // this.appointMiddleman({ middleman: this.middleman});
        // this.input.middleman = '';
      }
    },
    reinvite(middleman) {
      console.log('Inside resend invitation: ', middleman);
      this.resendInvitation({ middleman });
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