<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8">
        <h2>Donate</h2>
        <form>
          <div class="form-group">
            <label for="donateAmount">Amount</label>
            <input
              v-model.number="donation.amount"
              id="donateAmount"
              type="number"
              class="form-control"
              min="100"
            >
          </div>
          <button type="submit" class="btn btn-primary" @click.prevent="submitDonation">Donate</button>
        </form>
        <hr>
        <h3>Nominated beneficiaries</h3>
        <p>You can nominate up to x beneficiaries to the system</p>
        <form>
          <div class="form-group">
            <label for="beneficiary">Beneficiary</label>
            <input
              v-model="beneficiary"
              id="beneficiary"
              type="text"
              class="form-control"
            >
          </div>
          <button type="submit" class="btn btn-primary" @click.prevent="submitBeneficiary">Nominate</button>
        </form>
        <hr>
        <h3>Appoint trusted point person</h3>
        <p>You can appoint a trusted point person and they can nominate
          beneficiaries on your behalf</p>
      </div>
      <div class="col-md-4">
        <h3>My Stats</h3>
        <div>
          <b>Account balance</b>: {{ accountBalance }}
        </div>
        <div>
          <b>Amount donated</b>: {{ amountDonated }}
        </div>
        <div>
          <b>People donated to</b>: {{ peopleDonatedTo }}
        </div>
        <hr class="my-stats-separator">
        <h3>Donation history</h3>
        <ul class="list-group">
          <li v-for="donation in donations" class="list-group-item" :key="donation._id">
            {{ donation.amount }} to {{ donation.to }}
          </li>
        </ul>
        <hr class="donation-history-separator">
        <h3>Nominated beneficiaries</h3>
        <ul class="list-group">
          <li v-for="beneficiary in beneficiaries" class="list-group-item" :key="beneficiary._id">
            {{ beneficiary._id }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Donate',
  data() {
    return {
      donation: {
        amount: 0
      },
      beneficiary: ''
    }
  },
  computed: {
    ...mapGetters([
      'amountDonated',
      'accountBalance',
      'peopleDonatedTo',
      'donations',
      'beneficiaries'
    ]),
  },
  methods: {
    ...mapActions(['depositToAccount', 'nominateBeneficiary']),
    submitDonation() {
      console.log('donation', this.donation);
      this.depositToAccount(this.donation);
    },
    submitBeneficiary() {
      console.log('beneficiary', this.beneficiary);
      if (this.beneficiary.length) {
        this.nominateBeneficiary(this.beneficiary);
      }
    }
  }
}
</script>
<style lang="scss">
  .my-stats-separator {
    margin-top: 73px;
  }
  
</style>
