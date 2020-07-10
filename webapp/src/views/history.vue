<template>
  <b-container class="vh-100 custom-container">
    <div class="ml-lg-5">
      <b-row>
        <b-col>
          <h4 class="text-primary">
              Transaction History
          </h4>
        </b-col>
        <b-col>
          <div  align="end">
            <span class="font-weight-bold">Total amount contributed: </span> <span class="font-weight-bold text-primary">Ksh {{ totalAmountDonated }}</span>
          </div>
          <div  align="end">
            <span class="font-weight-bold">Total amount distributed: </span><span class="font-weight-bold text-secondary">Ksh {{ totalAmountDistributed * -1 }}</span>
          </div>
        </b-col>
      </b-row>
      <b-row v-if="!transactions.length" class="text-center ">
        <b-col>
          <p class="h2 font-weight-light">No transaction history as of yet...</p>
          <p> To get started, make a donation <b-link class="text-primary" @click="handleDonateBtn">here</b-link> </p>
        </b-col>
      </b-row>
      <b-table v-else :items="transactions" :fields="fields" striped hover stacked="xl" class="mt-3 shadow bg-white rounded">
        <template v-slot:cell(index)="data">
          <span class="font-weight-bold">{{ data.index + 1 }}.</span>
        </template>
        <template v-slot:cell(amount)="data">
          <span class="font-weight-bold">{{ data.item.type === 'distribution' ? data.item.amount * -1 : data.item.amount }}</span>
        </template>
        <template v-slot:cell(createdAt)="data">
          <span class=""> {{ getDate(data.item.createdAt) }}</span>
        </template>
        <template v-slot:cell(updatedAt)="data">
          <span class=""> {{ getDate(data.item.updatedAt) }}</span>
        </template>
        <template v-slot:cell(type)="data">
          <span class=""> {{ formatType(data.item.type) }}</span>
        </template>
      </b-table>
    </div>
  </b-container>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
export default {
  name: 'history',
  data() {
    return {
      fields: [
        {
          key: 'index',
          label: ''
        },
        {
          key: '_id',
          label: 'Transaction code'
        },
        {
          key: 'expectedAmount',
          label: 'Amount (Ksh)',
        },
        {
          key: 'type',
          label: 'Type',
          formatter: this.formatType
        },
        {
          key: 'status',
          label: 'Status',
          formatter: this.formatStatus
        },
        {
          key: 'createdAt',
          label: 'Created',
          formatter: this.getDate()
        },
        {
          key: 'updatedAt',
          label: 'Last updated',
          formatter: this.getDate
        },
      ],
    }
  },
  computed: {
    ...mapState(['transactions', 'user']),
    ...mapGetters([
      'totalAmountDonated',
      'totalAmountDistributed',
    ]),
  },
  methods: {
    ...mapActions(['getTransactions']),
    handleDonateBtn() {
      this.$bvModal.show('donate');
    },
    getDonor(id) {
      if (this.user._id===id)
        return 'Me';
      else {
        return 'Other donor';
      }
    },
    getDate(datetime) {
      return new Date(datetime).toLocaleDateString();
    },
    formatType(type) {
      if (type === 'donation') return 'Contribution';
      return type.charAt(0).toUpperCase() + type.substring(1);
    },
    formatStatus(status) {
      switch(status) {
        case 'paymentRequested': 
          return 'Payment Requested';
        case 'pending': 
          return 'Pending';
        case 'paymentQueued': 
          return 'Payment Queued';
        case 'failed': 
          return 'Failed';
        case 'success': 
          return 'Success';
        default: 
          return '';
      }
    }
  },
}
</script>