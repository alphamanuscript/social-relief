<template>
  <b-container class="custom-container">
    <div class="ml-lg-5">
      <div class="bg-white rounded p-5 shadow-sm">
        <b-form class="mx-md-2 px-md-2 mx-lg-3 px-lg-3 mx-xl-5 px-xl-5">
          <b-form-text class="pb-3">
            <span class="h5 text-secondary">Phone Verification</span>
          </b-form-text>
          <div v-if="phoneVerificationRecord && !phoneVerificationRecord.isVerified">
            <b-form-row class="py-3">
              <span>Please enter the 6-digit phone verification code sent to 254...</span>
            </b-form-row>
            <b-form-row class="py-3">
              <b-col sm="12" md="4" class="text-md-right font-weight-bold">
                <label for="code">Code:</label>
              </b-col>
              <b-col>
                <b-form-input
                  v-model="input.code" 
                  type="number"
                  :state="validationResults.code"
                  class="custom-input"
                  placeholder="xxxxxx"
                  size="2px"
                  id="code"
                />
                <b-form-invalid-feedback>
                  {{ validationMessages.code }}
                </b-form-invalid-feedback>
              </b-col>
            </b-form-row>
            <b-form-row class="pt-3">
              <b-col>
                <b-button variant="secondary" class="custom-submit-button float-right" @click.prevent="submitCode">Submit</b-button>
              </b-col>
            </b-form-row>
          </div>
          <div v-else-if="formSubmitted && phoneVerificationRecord && phoneVerificationRecord.isVerified">
            <b-card>
              <span v-if="phoneVerificationRecord.isVerified" class="text-success">
                Your phone number {{ phoneVerificationRecord.phone }} has been verified
              </span>
            </b-card>
          </div>
          <div v-else-if="!formSubmitted && !phoneVerificationRecord">
            <b-card>
              <span class="text-failure">
                {{ phoneVerificationErrorMessage }}
              </span>
            </b-card>
          </div>
        </b-form>
      </div>
    </div>
    <div class="py-3 text-center">
      <b-button pill variant="primary" class="px-5" @click="handleBtnClick()">Return Home</b-button>
    </div>
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import store from '@/store';
import { validateNamedRules, validationRules, validationMessages } from '../views/util';
export default {
  name: 'verify-phone',
  data() {
    return {
      formSubmitted: false,
      input: {
        code: ''
      },
      validationMessages: {
        code: validationMessages.code
      },
      validationRules: {
        code: validationRules.code,
      },
      validationResults: { code: null },
    };
  },
  computed: {
    ...mapState(['phoneVerificationRecord', 'phoneVerificationErrorMessage']),
  },
  methods: {
    ...mapActions(['getPhoneVerificationRecord', 'verifyPhone']),
    validateNamedRules,
    handleBtnClick() {
      store.commit('unsetPhoneVerificationErrorMessage');
      this.$router.push({ name: 'home' });
    },
    async submitCode() {
      this.validationMessages = { 
        code: validationMessages.code
      }
      this.validationResults = await this.validateNamedRules(this.input, this.validationRules);
      if (!Object.values(this.validationResults).includes(false)) {
        await this.verifyPhone({id: this.phoneVerificationRecord._id, code: Number.parseInt(this.input.code) });
      }
    }
  },
  async mounted() {
    await this.getPhoneVerificationRecord(this.$route.params.id);
  },
  watch: {
    async phoneVerificationRecord(record) {
      if (record && record.isVerified) {
        this.validationResults = { code: true };
        this.formSubmitted = true;
      }
    },
  }
}
</script>