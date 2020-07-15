<template>
  <b-container class="custom-container">
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
      <b-table v-else :items="transactionItems" :fields="transactionFields" striped hover stacked="lg" class="mt-3 shadow bg-white rounded">
        <template v-slot:cell(index)="data">
          <span class="font-weight-bold">{{ data.index + 1 }}.</span>
        </template>
        <template v-slot:cell(amount)="data">
          <span v-if="data.item.type === 'Distribution'" class="font-weight-bold text-secondary">- {{  data.item.status === 'Success' ? data.item.amount : data.item.expectedAmount }}</span>
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
        <template v-slot:cell(expand)="data">
          <b-button variant="outline-primary" @click="handleExpand(data.item)" class="border-0"><i class="fas fa-expand"></i></b-button>
        </template>
      </b-table>
    </div>
    <b-modal
      id="transaction"
      title="Transaction details"
      title-class="text-primary h3"
      centered
      hide-header-close
      header-class="border-bottom-0 pb-0 mb-0"
      hide-footer
      @hidden="hideDialog()"
      content-class="rounded p-5"
      scrollable
    >
      <p>
        <span class="font-weight-bold pr-2">Transaction ID:</span> 
        <span>{{ currentTransaction._id }}</span>
        <br/>
        <span class="font-weight-bold pr-2">Created:</span> 
        <span>{{ currentTransaction.createdAt }}</span>
        <br/>
        <span class="font-weight-bold pr-2">Last updated:</span> 
        <span>{{ currentTransaction.updatedAt }}</span>
        <br/>
        <span class="font-weight-bold pr-2">Type:</span> 
        <span v-if="currentTransaction.type === 'Distribution'" class="font-weight-bold text-secondary"> {{ currentTransaction.type }}</span>
          <span v-else class="font-weight-bold text-primary"> {{ currentTransaction.type }}</span>
        <br/>
        <span class="font-weight-bold pr-2">Amount (Ksh):</span> 
        <span v-if="currentTransaction.type === 'Distribution'" class="font-weight-bold text-secondary">-{{  currentTransaction.status === 'Success' ? currentTransaction.amount : currentTransaction.expectedAmount }}</span>
        <span v-else class="font-weight-bold text-primary">+{{  currentTransaction.status === 'Success' ? currentTransaction.amount : currentTransaction.expectedAmount }}</span>
        <br/>
        <span v-if="currentTransaction.type === 'Distribution'">
          <span class="font-weight-bold pr-2">From:</span> 
          <span>{{ currentTransaction.from }}</span>
          <br/>
          <span class="font-weight-bold pr-2">To:</span> 
          <span>{{ currentTransaction.to }}</span>
          <br/>
        </span>
        <span class="font-weight-bold pr-2">Status:</span> 
        <span v-if="currentTransaction.status==='Success'" class="text-success font-weight-bold"> {{ currentTransaction.status }} </span>
        <span v-else-if="currentTransaction.status==='Failed'" class="text-danger font-weight-bold"> {{ currentTransaction.status }} </span>
        <span v-else class="text-warning font-weight-bold"> {{ currentTransaction.status }} </span>
        <br/>
        <span v-if="currentTransaction.status==='Failed' && currentTransaction.failureReason" class="font-weight-bold pr-2">Failure reason:</span>
        <span v-if="currentTransaction.status==='Failed' && currentTransaction.failureReason">{{ currentTransaction.failureReason }}</span> 
      </p>
      <div class="mt-3 text-right">
        <b-button variant="primary" class="custom-submit-button" @click.prevent="hideDialog()">Close</b-button>
      </div>
    </b-modal>
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
      currentTransaction: {
        _id: '',
        createdAt: '',
        updatedAt: '',
        status: '',
        expectedAmount: 0,
        amount: 0,
        from: '',
        to: '',
        type: '',
        failureReason: ''
      },
      transactionFields: [
        {
          key: 'index',
          label: ''
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
        {
          key: 'expand',
          label: 'Details'
        }
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
          from: this.getDonor(t.from, t.type),
          to: this.getRecipient(t.to, t.type),
          type: this.formatType(t.type),
          failureReason: t.failureReason
        }
      });
    }
  },
  methods: {
    ...mapActions(['getCurrentUser', 'refreshData']),
    handleDonateBtn() {
      this.$bvModal.show('donate');
    },
    handleExpand(transaction) {
      this.currentTransaction = transaction;
      this.$bvModal.show('transaction');
    },
    hideDialog() {
      this.currentTransaction = {
        _id: '',
        createdAt: '',
        updatedAt: '',
        status: '',
        expectedAmount: 0,
        amount: 0,
        from: '',
        to: '',
        type: '',
        failureReason: ''
      };
      this.$bvModal.hide('transaction');
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
    getDonor(id, type) {
      if (type === 'distribution' && this.user) {
        if (this.user._id===id)
          return 'Me';
        else {
          return 'Other donor';
        }
      }
      return '';
    },
    getRecipient(id, type) {
      if (type === 'distribution') {
        const beneficiary = this.beneficiaries.find( b => b._id  === id);
        if (beneficiary)
          return beneficiary.name;
        return id;
      }
      return '';
    }
  },
  async mounted() {
    if (Auth.isAuthenticated()) {
      if (!this.user)
        await this.getCurrentUser();
      await this.refreshData();
    }
    else {
      this.$router.push({ name: DEFAULT_SIGNED_OUT_PAGE });
    }
  }
}
</script>