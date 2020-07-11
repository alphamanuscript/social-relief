<template>
  <b-container class="mw-100 my-3 px-lg-2 px-xl-5">
    <div class="ml-lg-5">
      <h3 class="text-primary pb-3">My Middlemen</h3>
      <div v-if="!middlemanItems.length" class="text-center">
        <p class="h2 font-weight-light">You don't have any middlemen yet...</p>
        <p class="">You can nominate a middleman to add beneficiaries on your behalf.</p>
        <p> <b-link to="nominate" class="text-primary">Click here to get started.</b-link> </p>
      </div>
      <b-table v-else :items="middlemanItems" :fields="middlemanFields" striped hover stacked="sm" class="bg-white rounded shadow">
        <template v-slot:cell(index)="data">
          <span class="font-weight-bold">{{ data.index + 1 }}.</span>
        </template>
        <template v-slot:cell(beneficiaries)="data">
          <span class="text-secondary font-weight-bold"> {{ data.item.beneficiaries.length }} </span>
          <span v-if="data.item.beneficiaries.length">: {{ data.item.beneficiaries.join(", ") }} </span>
        </template>
      </b-table>
    </div>
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
      middlemanFields: [
        {
          key: 'index',
          label: ''
        },
        'name',
        {
          key:'createdAt',
          label: 'Added on'
        },
        {
          key:'beneficiaries',
          label: 'Beneficiaries added'
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
          createdAt: this.getDate(m.createdAt),
          beneficiaries: this.getBeneficiariesAdded(m._id)
        }
      });
    }
  },
  methods: {
    ...mapActions(['getCurrentUser','refreshData']),
    getDate(datetime) {
      return new Date(datetime).toLocaleDateString();
    },
    getBeneficiariesAdded(id) {
      return this.beneficiaries.filter(b => b.addedBy === id).map(b => b.name );
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