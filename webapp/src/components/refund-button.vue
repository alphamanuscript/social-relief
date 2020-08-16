<template>
   <div>
    <b-button
      v-if="!areTransactionsBlocked"
      class="mt-2 form-control"
      variant="danger"
      @click="showDialog()"
    >Request refund</b-button>

    <div
      v-if="isRefundPending"
      class="font-italic mt-2"
      >Refund is pending...</div>
    
    <b-modal
      id="refundDialog"
      size="sm" 
      centered
      hide-header-close
      header-class="border-bottom-0"
      hide-footer
      no-stacking
      content-class="rounded"
    >
      <template v-slot:modal-header>
        <ModalHeader title="Request Refund" />
      </template>
      
      <p>
        This will
      transfer to your registered M-Pesa number
      the balance that has not been distributed to beneficiaries.
      </p>
      <p>
        <small>If you exceed 2 refunds, you will no longer be allowed to make donations
        on the platform.</small>
      </p>

      <div class="mt-3 d-flex flex-row-reverse justify-content">
        <b-button variant="primary" class="mx-2" @click.prevent="handleProceed()">Proceed</b-button>
        <b-button variant="danger" class="mx-2" @click.prevent="hideDialog()">Cancel</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ModalHeader from '../ui-components/modal-header';

export default {
  name: 'refund-button',
  components: { ModalHeader },
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
    handleProceed() {
      this.initiateRefund();
      this.hideDialog();
    },
    showDialog() {
      this.$bvModal.show('refundDialog');
    },
    hideDialog() {
      this.$bvModal.hide('refundDialog');
    }
  }

}
</script>