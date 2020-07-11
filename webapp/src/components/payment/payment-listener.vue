<template>
  <div>
    <MpesaHandler ref="africastalking-mpesa" :transaction="lastPaymentRequest" />
    <FlutterwaveHandler ref="flutterwave" :transaction="lastPaymentRequest" />
  </div>
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
      if (trx) {
        this.$refs[trx.provider].handlePaymentRequest(trx);
      }
    }
  }
}
</script>