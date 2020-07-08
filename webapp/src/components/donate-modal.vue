<template>
  <b-modal
    id="donate"
    size="sm" 
    centered
    hide-header-close
    header-class="border-bottom-0"
    hide-footer
    no-stacking
    @show="setModalData"
    @hidden="hideDialog"
    content-class="rounded"
   >
    <template v-slot:modal-header>
      <div class="d-flex flex-column m-auto">
        <img :src="imageUrl" width="70" alt="Social Relief Logo" class="m-4">
        <h4 class="text-secondary text-center">Donate</h4>
      </div>
    </template>
    <b-form>
      <b-form-group>
        <label for="phone" class="sr-only">Phone Number</label>
        <b-form-input
          v-model="donationInputs.phone" 
          type="text"
          :state="validationResults[0]"
          class="custom-dialog-input-phone"
          id="phone"
          :value="donationInputs.phone"
          disabled
        />
      </b-form-group>
      <b-form-group>
        <label for="amount" class="sr-only">Amount</label>
        <b-form-input 
          v-model="donationInputs.amount" 
          type="number" 
          :state="validationResults[1]"
          class="custom-dialog-form-input"
          placeholder="Enter amount (Kshs)"
          id="amount"
          :value="donationInputs.amount"
        />
        <b-form-invalid-feedback class="text-center">
          {{ validationMessages[1] }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="submitDonation">Submit</b-button>
      </div>
    </b-form>
</b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { validateObj } from '../views/util';
export default {
  name: 'login-modal',
  data() {
    return {
      donationInputs: {
        phone: '',
        amount: 100
      },
      validationMessages: [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Insufficient amount. Donations must be at least of the amount 100',
      ],
      validationRules: [
        { test: (donationInputs) => donationInputs.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(donationInputs.phone) },
        { test: (donationInputs) => donationInputs.amount >= 100 },
      ],
      validationResults: [null, null],
    }
  },
  computed: {
    ...mapState(['user', 'message']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    }
  },
  methods: {
    ...mapActions(['donate']),
    validateObj,
    showDonateDialog() {
      this.donationInputs = {
        phone: '',
        amount: 100
      },
      this.validationResults = [null, null];
      this.$bvModal.show('sign-up');
    },
    hideDialog() {
      this.donationInputs = {
        phone: '',
        amount: 100
      },
      this.validationResults = [null, null];
    },
    setModalData() {
      if (this.user) {
        this.donationInputs.phone = this.user.phone.substring(3);
      }
    },
    async submitDonation() {
      this.validationMessages = [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Insufficient amount. Donations must be at least of the amount 100',
      ];
      this.donationInputs.amount = Number(this.donationInputs.amount);
      this.validationResults = this.validateObj(this.donationInputs, this.validationRules);

      if (!this.validationResults.includes(false)) {
        await this.donate({ amount: this.donationInputs.amount });
        if (this.message.type === 'error') {
          this.validationMessages = [this.message.message, this.message.message];
          this.validationResults = [false, false];
        }
        else {
          this.donationInputs = {
            phone: '',
            amount: 100
          },
          this.validationResults = [null, null];
          this.$bvModal.hide('donate');
          this.$bvModal.show('confirm-donation');
        }
      }
    }
  }
}
</script>

<style>

</style>