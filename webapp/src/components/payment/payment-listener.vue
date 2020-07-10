<template>
  <div v-if="!lastPaymentRequest"></div>
  <MpesaHandler v-else-if="lastPaymentRequest.provider === 'africastalking-mpesa'" :transaction="lastPaymentRequest" />
  <FlutterwaveHandler v-else-if="lastPaymentRequest.provider === 'flutterwave'" :transaction="lastPaymentRequest" />
</template>
<script>
import { mapState } from 'vuex';
import MpesaHandler from './mpesa-handler.vue';
import FlutterwaveHandler from './flutterwave-handler';

export default {
  name: 'payment-listener',
  components: {
    MpesaHandler,
    FlutterwaveHandler
  },
  computed: {
    ...mapState(['lastPaymentRequest'])
  },
  watch: {
    lastPaymentRequest(trx) {
      console.log('New transaction', trx);
    }
  }
}
</script>