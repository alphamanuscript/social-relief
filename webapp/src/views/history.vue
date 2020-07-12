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
            <span class="font-weight-bold">Total amount distributed: </span><span class="font-weight-bold text-secondary">Ksh {{ totalAmountDistributed }}</span>
          </div>
        </b-col>
      </b-row>
      <b-row v-if="!transactionItems.length" class="text-center ">
        <b-col>
          <p class="h2 font-weight-light">No transaction history as of yet...</p>
          <p> To get started, make a donation <b-link class="text-primary" @click="handleDonateBtn">here</b-link> </p>
        </b-col>
      </b-row>
      <b-table v-else :items="transactionItems" :fields="transactionFields" striped hover stacked="xl" class="mt-3 shadow bg-white rounded">
        <template v-slot:cell(index)="data">
          <span class="font-weight-bold">{{ data.index + 1 }}.</span>
        </template>
        <template v-slot:cell(amount)="data">
          <span v-if="data.item.type === 'Distribution'" class="font-weight-bold text-secondary">-{{  data.item.status === 'Success' ? data.item.amount : data.item.expectedAmount }}</span>
          <span v-else class="font-weight-bold text-primary">+{{  data.item.status === 'Success' ? data.item.amount : data.item.expectedAmount }}</span>
        </template>
        <template v-slot:cell(type)="data">
          <span v-if="data.item.type === 'Distribution'" class="font-weight-bold text-secondary"> {{ data.item.type }}</span>
          <span v-else class="font-weight-bold text-primary"> {{ data.item.type }}</span>
        </template>
        <template v-slot:cell(status)="data">
          <span v-if="data.item.status==='Success'" class="text-success font-weight-bold"> {{ data.item.status }} </span>
          <span v-else-if="data.item.status==='Failed'" class="text-danger font-weight-bold"> {{ data.item.status }} </span>
          <span v-else class="text-warning font-weight-bold"> {{ data.item.status }} </span>
        </template>
      </b-table>
    </div>
  </b-container>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
export default {
  name: 'history',
  data() {
    return {
      transactionFields: [
        {
          key: 'index',
          label: ''
        },
        {
          key: '_id',
          label: 'Transaction code'
        },
        {
          key: 'type',
          label: 'Type'
        },
        {
          key: 'amount',
          label: 'Amount (Ksh)'
        },
        {
          key: 'status',
          label: 'Status'
        },
        {
          key: 'createdAt',
          label: 'Created'
        },
        {
          key: 'updatedAt',
          label: 'Last updated'
        },
      ],
    }
  },
  computed: {
    ...mapState(['transactions', 'user', 'beneficiaries']),
    ...mapGetters([
      'totalAmountDonated',
      'totalAmountDistributed',
    ]),
    transactionItems() {
      return this.transactions.map(t => {
        return {
          _id: t._id,
          createdAt: this.getDate(t.createdAt),
          updatedAt: this.getDate(t.updatedAt),
          status: this.formatStatus(t.status),
          expectedAmount: t.expectedAmount,
          amount: t.amount,
          from: this.getDonor(t.from),
          to: this.getRecipient(t.to),
          type: this.formatType(t.type),
        }
      });
    }
  },
  methods: {
    ...mapActions(['getCurrentUser','getTransactions', 'getBeneficiaries']),
    handleDonateBtn() {
      this.$bvModal.show('donate');
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
    },
    getDonor(id) {
      if (this.user) {
        if (this.user._id===id)
          return 'Me';
        else {
          return 'Other donor';
        }
      }
      return '';
    },
    getRecipient(id) {
      const beneficiary = this.beneficiaries.find( b => b._id  === id);
      if (beneficiary)
        return beneficiary.name;
      return id;
    }
  },
  async mounted() {
    if (Auth.isAuthenticated()) {
      if (!this.user)
        await this.getCurrentUser();
      await this.getBeneficiaries();
      await this.getTransactions();
    }
    else {
      this.$router.push({ name: DEFAULT_SIGNED_OUT_PAGE });
    }
  }
}
</script>