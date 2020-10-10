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
      <ModalHeader title="Donate" />
    </template>
    <b-form>
      <b-form-group>
        <label for="amount">Amount to donate</label>
        <b-form-input 
          v-model="donationInputs.amount" 
          type="number" 
          :state="validationResults.amount"
          class="custom-dialog-form-input"
          placeholder="Enter amount (Kshs)"
          id="amount"
          :value="donationInputs.amount"
        />
        <b-form-invalid-feedback class="text-center">
          {{ validationMessages.amount }}
        </b-form-invalid-feedback>
        <div class="text-center">
          <span class="small">A transaction fee may be charged by the provider</span>
        </div>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="submitDonation">Submit</b-button>
      </div>
    </b-form>
</b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ModalHeader from '../ui-components/modal-header';
import { validateNamedRules, validationRules, validationMessages } from '../views/util';

export default {
  name: 'login-modal',
  components: { ModalHeader },
  data() {
    return {
      donationInputs: {
        phone: '',
        amount: 2000
      },
      validationMessages: {
        phone: validationMessages.phone,
        amount: validationMessages.amount
      },
      validationRules: {
        phone: validationRules.phone,
        amount: validationRules.amount
      },
      validationResults: { phone: null, amount: null }
    }
  },
  computed: {
    ...mapState(['user', 'message'])
  },
  methods: {
    ...mapActions(['donate']),
    validateNamedRules,
    showDonateDialog() {
      this.donationInputs = {
        phone: '',
        amount: 2000
      },
      this.validationResults = { phone: null, amount: null };
      this.$bvModal.show('sign-up');
    },
    hideDialog() {
      this.donationInputs = {
        phone: '',
        amount: 2000
      },
      this.validationResults = { phone: null, amount: null };
    },
    setModalData() {
      if (this.user) {
        this.donationInputs.phone = this.user.phone.substring(3);
      }
    },
    async submitDonation() {
      this.validationMessages = {
        phone: validationMessages.phone,
        amount: validationMessages.amount
      }
      this.donationInputs.amount = Number(this.donationInputs.amount);
      this.validationResults = this.validateNamedRules(this.donationInputs, this.validationRules);

      if (!Object.values(this.validationResults).includes(false)) {
        await this.donate({ amount: this.donationInputs.amount });
        if (this.message.type !== 'error') {
          this.donationInputs = {
            phone: '',
            amount: 2000
          },
          this.validationResults = { phone: null, amount: null };
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