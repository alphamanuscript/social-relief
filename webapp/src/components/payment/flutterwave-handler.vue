<template>
  <div></div>
</template>
<script>
export default {
  name: 'flutterwave-handler',
  props: {
    transaction: Object
  },
  methods: {
    handlePaymentRequest(trx) {
      if (trx && trx.metadata && trx.metadata.paymentUrl) {
        window.location = trx.metadata.paymentUrl;
      }
    }
  }
}
</script>