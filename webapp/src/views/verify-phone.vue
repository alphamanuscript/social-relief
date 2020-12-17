<template>
  <b-container class="custom-container">
    <b-card v-if="verifying">Your phone number is being verified...</b-card>
    <b-card v-else-if="phoneVerificationRecord">
      <span v-if="phoneVerificationRecord.isVerified === 'true'" class="text-success">
        Your phone number {{ phoneVerificationRecord.phone }} has been verified
      </span>
    </b-card>
    <div v-if="displayReturnHomeButton" class="py-3 text-center">
      <b-button pill variant="primary" class="px-5" @click="handleBtnClick()">Return Home</b-button>
    </div> 
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'verify-phone',
  data() {
    return {
      verifying: true
    };
  },
  computed: {
    ...mapState(['phoneVerificationRecord']),
  },
  methods: {
    ...mapActions(['verifyPhone']),
  },
  async mounted() {
    await this.verifyPhone(this.$route.params.id);
  },
  watch: {
    async phoneVerificationRecord(record) {
      if (record && this.verifying) {
        this.verifying = false;
      }
    }
  }
}
</script>