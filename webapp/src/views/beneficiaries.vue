<template>
  <b-container class="mw-100 my-3 px-lg-2 px-xl-5">
    <div class="ml-lg-5">
      <div class="">
        <h3 class="text-primary">Beneficiaries</h3>
        <p>
          All nominees get up to <span class="text-secondary font-weight-bold">Ksh 2,000</span> monthly to purchase basic supplies during this trying period. Your contribution will go a long way touch the lives of <span class="text-secondary font-weight-bold">13,600+</span> people who
          are currently enlisted as beneficiaries of this system. We at Social Relief want to say a big <span class="text-secondary font-weight-bold">THANK YOU</span> for your kindness and support.
        </p>
      </div>
      <div class="">
        <h3 class="text-primary pb-3">My Nominees</h3>
        <div v-if="!beneficiaries.length" class="text-center">
          <p class="h2 font-weight-light">You don't have any beneficiaries yet...</p>
          <p class="">You can add a beneficiary directly, or nominate a middleman to add beneficiaries on your behalf.</p>
          <p> <b-link to="nominate" class="text-primary">Click here to get started.</b-link> </p>
        </div>
        <b-table v-else :items="beneficiaryItems" :fields="beneficiaryFields" striped hover stacked="sm" class="bg-white rounded shadow">
          <template v-slot:cell(index)="data">
            <span class="font-weight-bold">{{ data.index + 1 }}.</span>
          </template>
          <template v-slot:cell(progress)="data">
            <span class="text-secondary font-weight-bold"> {{ data.item.progress }} %</span>
          </template>
          <template v-slot:cell(expand)="data">
            <b-button variant="outline-primary" @click="handleExpand(data.item)" class="border-0"><i class="fas fa-expand"></i></b-button>
          </template>
          <template v-slot:table-caption>
            <span class="small">*: Progress is calculated out of Ksh 2,000 in the past 30 days</span>
          </template>
        </b-table>
      </div>
    </div>
    <b-modal
      id="beneficiary"
      :title="currentBeneficiary.name"
      size="lg"
      title-class="text-primary h3"
      centered
      hide-header-close
      header-class="border-bottom-0 pb-0 mb-0"
      hide-footer
      @hidden="hideDialog()"
      content-class="rounded p-5"
      scrollable
    >
      <p class="small">
        <span class="font-weight-bold pr-2">Added by:</span> 
        <span>{{ currentBeneficiary.addedBy }}</span>
        <br/>
        <span class="font-weight-bold pr-2">Added on:</span> 
        <span>{{ currentBeneficiary.createdAt }}</span>
        <br/>
        <span class="font-weight-bold pr-2">Total received:</span> 
        <span>Ksh {{ getTotalSuccessful }}</span>
      </p>
      <h5 class="text-secondary">
        Transaction history
      </h5>
      <b-table v-if="distributionItems.length" :items="distributionItems" thead-class="bg-secondary text-white" striped>
        <template v-slot:cell(amount)="data">
          <span class="text-secondary font-weight-bold"> {{ data.item.amount }}</span>
        </template>
        <template v-slot:cell(status)="data">
            <span v-if="data.item.status==='success'" class="text-success font-weight-bold"> {{ data.item.status }} </span>
            <span v-else-if="data.item.status==='failed'" class="text-danger font-weight-bold"> {{ data.item.status }} </span>
            <span v-else class="text-warning font-weight-bold"> {{ data.item.status }} </span>
          </template>
      </b-table>
      <p v-else class="text-center"> The transactions made to {{ currentBeneficiary.name }} will be displayed here.</p>
      <div class="mt-3 text-right">
        <b-button variant="primary" class="custom-submit-button" @click.prevent="hideDialog()">Close</b-button>
      </div>
    </b-modal>
  </b-container>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
export default {
  name: 'beneficiaries',
  data() {
    return {
      currentBeneficiary: {
        _id: '',
        name: '',
        addedBy: '',
        createdAt: '',
        progress: 0
      },
      beneficiaryFields: [
        {
          key: 'index',
          label: ''
        },
        'name',
        'addedBy',
        {
          key:'createdAt',
          label: 'Added on'
        },
        'progress',
        'expand'
      ],
      distributionFields: [
        {
          key:'updatedAt',
          label: 'Date',
        },
        {
          key:'addedBy',
          label: 'From',
        },
        'amount',
        'status'
      ]
   }
  }, 
  computed: {
    ...mapState(['beneficiaries', 'user', 'middlemen']),
    ...mapGetters(['distributions']),
    beneficiaryItems() {
      return this.beneficiaries.map(b => {
        return { 
          _id: b._id,
          name: b.name,
          addedBy: this.getNominator(b.addedBy),
          createdAt: this.getDate(b.createdAt),
          progress: this.getProgress(b._id)
        }
      });
    },
    distributionItems () {
      return this.distributions.filter( t => t.to === this.currentBeneficiary._id )
        .map( d => {
          return {
            _id: d._id,
            updatedAt: this.getDate(d.updatedAt),
            addedBy: this.getDonor(d.addedBy),
            amount: d.amount,
            status: d.status
          }
        });
    },
    getTotalSuccessful() {
      return this.distributionItems.filter(t => t.status === 'success')
        .map(t => t.amount)
        .reduce((a, b) => a + b, 0);
    }
  },
  methods: {
    ...mapActions(['getCurrentUser','refreshData']),
    handleExpand(beneficiary) {
      this.currentBeneficiary = beneficiary;
      this.$bvModal.show('beneficiary');
    },
    hideDialog() {
      this.currentBeneficiary = {
        _id: '',
        name: '',
        addedBy: '',
        createdAt: '',
        progress: 0
      };
      this.$bvModal.hide('beneficiary');
    },
    getNominator(id) {
      if (this.user) {
        if (this.user._id===id)
          return 'Me';
        else {
          const middleman = this.middlemen.find( m => m._id === id );
          if (middleman)
            return middleman.name;
          return id;
        }
      }
      return '';
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
    getDate(datetime) {
      return new Date(datetime).toLocaleDateString();
    },
    getProgress(id) {
      const monthlyMax = 2000;
      const thirtyDays = 30*24*60*60*1000;
      const thirtyDaysDistributions = this.distributions.filter(t => t.to === id && t.status === 'success' && new Date().getTime() - new Date(t.updatedAt).getTime() < thirtyDays);
      const monthTotal = thirtyDaysDistributions.map(t => t.amount).reduce((a, b) => a + b, 0);
      return monthTotal*100/monthlyMax;
    }
  },
  async created() {
    if (Auth.isAuthenticated()) {
      if (!this.user)
        await this.getCurrentUser();
      await this.refreshData();
    }
    else
      this.$router.push({ name: DEFAULT_SIGNED_OUT_PAGE });
  }
}
</script>