<template>
  <b-container class="vh-100 custom-container">
    <b-row>
      <b-col>
        <h4 class="text-primary">
            Contribution History
        </h4>
      </b-col>
      <b-col>
        <span align="end" class="d-block font-weight-bold">Total amount donated in this platform</span>
        <span align="end" class="d-block font-weight-bold">Ksh 45,670</span>
      </b-col>
  </b-row>
  <b-row class="mt-3 shadow bg-white rounded">
    <b-col sm="12">
      <b-table striped hover :items="items" :fields="fields"></b-table>
    </b-col>
    <b-col>
      <b-row align-h="between" align-v="center">
        <b-col sm="12" md="6">
          1 of 3 pages
        </b-col>
        <b-col sm="12" md="6">
          <b-pagination
            align="fill"
           
            v-model="currentPage"
            :total-rows="rows"
            :per-page="perPage"
            first-text="First"
            prev-text="Prev"
            next-text="Next"
            last-text="Last"
            class="mb-0 mr-0"
            @input="paginate(currentPage)">
          </b-pagination>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'history',
  data() {
    return {
      fields: [
        {
          key: 'last_name',
          sortable: true
        },
        {
          key: 'first_name',
          sortable: true
        },
        {
          key: 'age',
          label: 'Person age',
          sortable: true,
        }
      ],
      items: [
        { isActive: true, age: 40, 'first_name': 'Dickerson', 'last_name': 'Macdonald' },
        { isActive: false, age: 21, 'first_name': 'Larsen', 'last_name': 'Shaw' },
        { isActive: false, age: 89, 'first_name': 'Geneva', 'last_name': 'Wilson' },
        { isActive: true, age: 38, 'first_name': 'Jami', 'last_name': 'Carney' }
      ],
      currentPage: 1,
      rows: 1,
      perPage: 3,
    }
  },
  computed: {
    ...mapState(['transactions', 'user'])
  },
  methods: {
    ...mapActions(['getTransactions']),
    // async mounted() {
    //   await this.getTransactions();
    //   // if (this.user) {
    //   //   await this.getTransactions();
    //   // }
    // }
  },
  watch: {
    transactions: function (values) {
      console.log('transactions: ', values);
    },
    user: async function () {
      if (this.user) {
        console.log('this.$route.name: ', this.$route.name);
        await this.getTransactions();
      }
    }
  }
}
</script>
<style lang="scss">
  .custom-container {
    // border: 1px solid #000;
  }
</style>