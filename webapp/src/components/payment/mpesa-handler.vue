<template>
  <b-modal
    v-if="transaction"
    id="confirm-payment"
    title="Confirmation sent!"
    title-class="text-primary"
    centered
    hide-header-close
    header-class="border-bottom-0"
    hide-footer
    @hidden="hideDialog()"
    content-class="rounded p-5"
  >
    <p>
      A payment confirmation pop-up for <strong>KES {{transaction.expectedAmount}}</strong> has been sent to
      <strong>+{{ user ? user.phone : '' }}</strong>.
      Kindly confirm to finalize the payment. 
    </p>
    <div class="mt-3 text-right">
      <b-button variant="secondary" class="custom-submit-button" @click.prevent="hideDialog()">Close</b-button>
    </div>
  </b-modal>
</template>

<script>
  import { mapState } from 'vuex';
  export default {
    name: 'mpesa-handler',
    props: {
      transaction: Object
    },
    computed: {
      ...mapState(['user']),
    },
    methods: {
      hideDialog() {
        this.$bvModal.hide('confirm-payment');
      },
      handlePaymentRequest() {
        this.$bvModal.show('confirm-payment');
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>