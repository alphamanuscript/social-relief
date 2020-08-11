<template>
   <div>
    <b-button
      v-if="!areTransactionsBlocked"
      class="mt-2 form-control"
      variant="danger"
      @click="requestRefund"
    >Request refund</b-button>

    <div
      v-if="isRefundPending"
      class="font-italic mt-2"
      >Refund is pending...</div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'refund-button',
  computed: {
    ...mapState(['user']),
    areTransactionsBlocked() {
      return this.user && this.user.transactionsBlockedReason;
    },
    isRefundPending() {
      return this.user && this.user.transactionsBlockedReason === 'refundPending';
    }
  },
  methods: {
    ...mapActions(['initiateRefund']),
    requestRefund() {
      this.initiateRefund();
    }
  }

}
</script>