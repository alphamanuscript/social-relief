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
          <b>Account balance</b>: {{ accountBalance }}
        </div>
        <div>
          <b>Amount donated</b>: {{ amountDonated }}
        </div>
        <div>
          <b>People donated to</b>: {{ peopleDonatedTo }}
        </div>
      </div>
    </div>
    <div v-if="user" class="row">
      <div class="col-md-8">
        <hr>
        <h2>Donate</h2>
        <form>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="donateAmount">Amount</label>
              <input
                v-model.number="donation.amount"
                id="donateAmount"
                type="number"
                class="form-control"
                min="200"
                :max="accountBalance"
              >
            </div>
            <div class="col-md-6">
              <button type="submit" class="btn btn-primary" @click.prevent="submitDonation">Donate</button>
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
    <div v-if="user" class="row">
      <div class="col-md-8">
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
              class="form-control"
            >
          </div>
          <button type="submit" class="btn btn-primary" @click.prevent="submitMiddleman">Appoint</button>
        </form>
      </div>
      <div class="col-md-4">
        <hr class="donation-history-separator">
        <h3>Appointed point person(s)</h3>
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

export default {
  name: 'Donate',
  data() {
    return {
      deposit: 0,
      donation: {
        amount: 200,
        to: 'beneficiaryid'
      },
      beneficiary: '',
      middleman: ''
    }
  },
  computed: {
    ...mapGetters([
      'amountDonated',
      'accountBalance',
      'peopleDonatedTo',
      'donations'
    ]),
    ...mapState(['user', 'beneficiaries', 'middlemen'])
  },
  methods: {
    ...mapActions(['depositToAccount', 'donate', 'nominateBeneficiary', 'appointMiddleman']),
    submitDeposit() {
      this.depositToAccount({ accountId: this.user._id, amount: this.deposit });
    },
    submitDonation() {
      this.donation.from = this.user._id;
      console.log('donation', this.donation);
      this.donate({ from: this.user._id, to: this.donation.to, amount: this.donation.amount })
      // this.depositToAccount(this.user.accountId, this.donation);
    },
    submitBeneficiary() {
      console.log('beneficiary', this.beneficiary);
      if (this.beneficiary.length) {
        this.nominateBeneficiary({nominator: this.user._id, beneficiary: this.beneficiary});
      }
    },
    submitMiddleman() {
      console.log('middleman', this.middleman);
      if (this.middleman.length) {
        this.appointMiddleman({appointer: this.user._id, middleman: this.middleman});
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
