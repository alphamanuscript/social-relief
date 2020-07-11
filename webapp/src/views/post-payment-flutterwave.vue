<template>
  <b-container>
    <b-card v-if="verifying">Your transaction is being verified...</b-card>
    <b-card v-else-if="transaction">
      <span v-if="transaction.status === 'success'" class="text-success">
        Your payment of KES {{ transaction.amount }} was successfully received!
      </span>
      <span v-else-if="transaction.status === 'failed'" class="text-danger">
        Transaction failed. Reason: {{ transaction.failureReason }}
      </span>
      <span v-else>
        Your transaction is being verified.
        Your account will be updated and you will receive a confirmation email when the process is complete.
      </span>
    </b-card>
    <b-card v-else-if="cancelled">
      The transaction was cancelled.
    </b-card>
    <b-card v-else>
      <span class="text-danger">Transaction not found</span>
    </b-card>
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';

export default {
  name: 'post-payment-flutterwave',
  data() {
    return {
      verifying: true,
      working: false,
      transaction: null,
      cancelled: false
    };
  },
  computed: {
    ...mapState(['transactions'])
  },
  methods: {
    ...mapActions(['getTransaction', 'refreshData']),
    async created() {
      if (Auth.isAuthenticated()) {
      if (!this.user)
        await this.getCurrentUser();
        await this.refreshData();
      }
      else {
        this.$router.push({ name: DEFAULT_SIGNED_OUT_PAGE });
      }
    },
    async verifyTransaction() {
      this.verifying = true;
      this.working = true;

      const txRef = this.checkTransactionAndStatus();
      if (this.cancelled) {
        this.finishVerification();
        return;
      }

      const tx = this.transactions.find(t => t.provider === 'flutterwave' && t.providerTransactionId === txRef);

      if (!tx) {
        this.finishVerification();
        return;
      }
      
      if (tx.status === 'failed' || tx.status === 'success') {
        // final transaction status is known
        this.transaction = tx;
        this.finishVerification();
        return;
      }

      // transaction still pending, try to fetch status from server
      await this.getTransaction(tx._id);
      const updatedTx = this.transactions.find(t => t._id === tx._id);
      this.transaction = updatedTx;
      this.finishVerification();
    },

    checkTransactionAndStatus() {
      const query = this.$route.query;
      if (query.status === 'cancelled') {
        this.cancelled = true;
      }

      if (query.tx_ref) {
        return query.tx_ref;
      }

      if (query.resp) {
        try {
          const response = JSON.parse(query.resp);
          const txRef = response?.tx?.txRef;
          return txRef;
        }
        catch (e) {} // eslint-disable-line no-empty
      }
    },

    finishVerification() {
      this.verifying = false;
      this.working = false;
    }
  },
  watch: {
    async transactions(transactions) {
      // the working flag is used to prevent calling the method while it's still in progress
      if (transactions && transactions.length && this.verifying && !this.working) {
        await this.verifyTransaction();
      }
    }
  }
}
</script>