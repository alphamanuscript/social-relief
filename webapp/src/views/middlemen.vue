<template>
  <b-container class="custom-container">
    <div class="ml-lg-5">
      <h3 class="text-primary pb-3">My Middlemen</h3>
      <div v-if="!middlemanItems.length" class="text-center">
        <p v-if="user && (user.roles.length > 1 || user.roles[0] !== 'beneficiary')" class="h2 font-weight-light">You don't have any middlemen yet...</p>
        <p v-else class="h2 font-weight-light">You do not qualify to have or nominate middlemen</p>
        <p v-if="user && (user.roles.length > 1 || user.roles[0] !== 'beneficiary')" class="">You can nominate a middleman to add beneficiaries on your behalf.</p>
        <p v-if="user && (user.roles.length > 1 || user.roles[0] !== 'beneficiary')"> <b-link to="nominate" class="text-primary">Click here to get started.</b-link> </p>
      </div>
      <b-table v-else :items="middlemanItems" :fields="middlemanFields" striped hover stacked="sm" class="bg-white rounded shadow">
        <template v-slot:cell(index)="data">
          <span class="font-weight-bold">{{ data.index + 1 }}.</span>
        </template>
        <template v-slot:cell(phone)="data">
          <span> +{{ data.item.phone}} </span>
        </template>
        <template v-slot:cell(beneficiaries)="data">
          <span class="text-secondary font-weight-bold"> {{ data.item.beneficiaries.length }} </span>
        </template>
        <template v-slot:cell(expand)="data">
          <b-button variant="outline-primary" @click="handleExpand(data.item)" class="border-0"><i class="fas fa-expand"></i></b-button>
        </template>
      </b-table>
    </div>
    <b-modal
      id="middleman"
      :title="currentMiddleman.name"
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
        <span class="font-weight-bold pr-2">Phone Number:</span> 
        <span>+{{ currentMiddleman.phone }}</span>
        <br/>
        <span class="font-weight-bold pr-2">Added on:</span> 
        <span>{{ currentMiddleman.createdAt }}</span>
      </p>
      <h5 class="text-secondary">
        Beneficiaries added <span class="">({{ currentMiddleman.beneficiaries.length }})</span>
      </h5>
      <p v-if="currentMiddleman.beneficiaries.length"> {{ currentMiddleman.beneficiaries.join(", ") }} </p>
      <p v-else> The beneficiaries added for you by {{ currentMiddleman.name }} will be displayed here.</p>
      <div class="mt-3 text-right">
        <b-button variant="primary" class="custom-submit-button" @click.prevent="hideDialog()">Close</b-button>
      </div>
    </b-modal>
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
export default {
  name: 'beneficiaries',
  data() {
    return {
      currentMiddleman: {
        _id: '',
        name: '',
        phone: '',
        createdAt: '',
        beneficiaries: []
      },
      middlemanFields: [
        {
          key: 'index',
          label: ''
        },
        'name',
        {
          key:'phone',
          label: 'Phone Number'
        },
        {
          key:'beneficiaries',
          label: 'Beneficiaries added'
        },
        {
          key: 'expand',
          label: 'Details'
        }
      ]
   }
  }, 
  computed: {
    ...mapState(['beneficiaries', 'user', 'middlemen']),
    middlemanItems() {
      return this.middlemen.map(m => {
        return { 
          _id: m._id,
          name: m.name,
          phone: m.phone,
          createdAt: this.getDate(m.createdAt),
          beneficiaries: this.getBeneficiariesAdded(m._id)
        }
      });
    }
  },
  methods: {
    ...mapActions(['getCurrentUser', 'refreshData']),
    handleExpand(middleman) {
      this.currentMiddleman = middleman;
      this.$bvModal.show('middleman');
    },
    hideDialog() {
      this.currentMiddleman = {
        _id: '',
        name: '',
        phone: '',
        createdAt: '',
        beneficiaries: []
      };
      this.$bvModal.hide('middleman');
    },
    getDate(datetime) {
      return new Date(datetime).toLocaleDateString();
    },
    getBeneficiariesAdded(id) {
      return this.beneficiaries.filter(b => b.addedBy === id).map(b => b.name );
    }
  },
  async mounted() {
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