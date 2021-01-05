<template>
  <b-container class="custom-container">
    <b-card v-if="verifying">Your phone number is being verified...</b-card>
    <b-card v-else-if="phoneVerificationRecord">
      <span v-if="phoneVerificationRecord.isVerified" class="text-success">
        Your phone number {{ phoneVerificationRecord.phone }} has been verified
      </span>
    </b-card>
    <b-card v-else-if="errorOccurred">
      <span class="text-failure">
        {{ errorMessage }}
      </span>
    </b-card>
    <div class="py-3 text-center">
      <b-button pill variant="primary" class="px-5" @click="handleBtnClick()">Return Home</b-button>
    </div> 
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import store from '@/store';

export default {
  name: 'verify-phone',
  data() {
    return {
      verifying: true,
      errorOccurred: false,
      errorMessage: '',
    };
  },
  computed: {
    ...mapState(['phoneVerificationRecord', 'phoneVerificationErrorMessage', 'message']),
  },
  methods: {
    ...mapActions(['verifyPhone']),
    handleBtnClick() {
      store.commit('unsetPhoneVerificationErrorMessage');
      this.$router.push({ name: 'home' });
    }
  },
  async mounted() {
    await this.verifyPhone(this.$route.params.id);
  },
  watch: {
    async phoneVerificationRecord(record) {
      if (record && this.verifying) {
        this.verifying = false;
      }
    },
    async phoneVerificationErrorMessage(message) {
      if (message.length) {
        this.verifying = false;
        this.errorOccurred = true;
        this.errorMessage = message;
      }
    }
  }
}
</script>