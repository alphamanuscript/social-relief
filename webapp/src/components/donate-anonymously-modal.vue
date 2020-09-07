<template>
  <b-modal
    id="donate-anonymously"
    size="sm" 
    centered
    hide-header-close
    header-class="border-bottom-0"
    hide-footer
    no-stacking
    @hidden="hideDialog()"
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
      <b-form-group>
        <label for="name" class="sr-only">Name (Required by payment provider)</label>
        <b-form-input
          v-model="donationInputs.name"
          type="text"
          :state="validationResults.name"
          class="custom-dialog-input"
          placeholder="Enter name"
          id="name"
        />
        <b-form-invalid-feedback class="text-center">
          {{ validationMessages.name }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-form-group>
        <b-input-group>
          <b-input-group-prepend>
            <b-button disabled class="custom-dialog-input-phone-prepend">+254</b-button>
          </b-input-group-prepend>
          <label for="phone" class="sr-only">Phone Number (Required by payment provider)</label>
          <b-form-input
            v-model="donationInputs.phone" 
            type="text" 
            :state="validationResults.phone"
            class="custom-dialog-input-phone"
            placeholder="Enter phone number"
            id="phone"
            @update="helper.phone = true"
          />
          <b-form-invalid-feedback class="text-center">
            {{ validationMessages.phone }}
          </b-form-invalid-feedback>
        </b-input-group>
        <b-form-text v-show="showPhoneHelper" class="text-center">
          For example 712345678.
        </b-form-text>
      </b-form-group>
      <b-form-group>
        <label for="email" class="sr-only">Email</label>
        <b-form-input
          v-model="donationInputs.email"
          type="text"
          :state="validationResults.email"
          class="custom-dialog-input"
          placeholder="Enter email"
          id="email"
        />
        <b-form-invalid-feedback class="text-center">
          {{ validationMessages.email }}
        </b-form-invalid-feedback>
      </b-form-group>
      <div class="text-center">
        <b-button type="submit" size="sm" variant="primary" class="custom-submit-button" @click.prevent="donate">Submit</b-button>
      </div>
    </b-form>
  </b-modal>
</template>
<script>
import { validateNamedRules, validationRules, validationMessages } from '../views/util';
import { mapState, mapActions } from 'vuex';
export default {
  name: 'donate-anonymously',
  data() {
    return {
      donationInputs: {
        amount: 1000,
        name: '',
        phone: '',
        email: '',
        role: 'donor'
      },
      validationMessages: {
        amount: validationMessages.amount,
        name: validationMessages.name,
        phone: validationMessages.phone,
        email: validationMessages.email
      },
      validationRules: {
        amount: validationRules.amount,
        name: validationRules.name,
        phone: validationRules.phone,
        email: validationRules.email,
      },
      validationResults: { amount: null, name: null, phone: null, email: null },
      helper: {
        phone: false
      }
    }
  },
  computed: {
    ...mapState(['user', 'message']),
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
    showPhoneHelper () {
      return this.validationResults.phone == null && this.helper.phone;
    },
  },
  methods: {
    ...mapActions(['donateAnonymously']),
    hideDialog() {
      this.donationInputs = {
        amount: 1000,
        name: '',
        phone: '',
        email: '',
        role: 'donor'
      },
      this.validationResults = { amount: null, name: null, phone: null, email: null },
      this.helper = {
        phone: false,
      };
    },
    async donate() {
      this.validationMessages = {
        amount: validationMessages.amount,
        name: validationMessages.name,
        phone: validationMessages.phone,
        email: validationMessages.email
      };
      this.donationInputs.amount = Number(this.donationInputs.amount);
      this.validationResults = validateNamedRules(this.donationInputs, this.validationRules);

      if (!Object.values(this.validationResults).includes(false)) {
        await this.donateAnonymously({
          ...this.donationInputs,
          phone: `254${this.donationInputs.phone}`
        });
        if (this.message.type !== 'error') {
          this.donationInputs = {
            amount: 1000,
            name: '',
            phone: '',
            email: '',
            role: 'donor'
          },
          this.validationResults = this.validationResults = { amount: null, name: null, phone: null, email: null };
          this.$bvModal.hide('donate-anonymously');
          this.$bvModal.show('confirm-donation');
        }
      }
    }
  },
}
</script>
<style lang="scss" scoped>

</style>