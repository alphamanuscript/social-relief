<template>
  <b-container class="vh-100 custom-container">
    <div class="ml-lg-5">
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
      <b-row v-if="!transactions.length" class="text-center ">
        <b-col>
          <p class="h2 font-weight-light">No transaction history as of yet...</p>
          <p> To get started, make a donation <b-link class="text-primary" @click="handleDonateBtn">here</b-link> </p>
        </b-col>
      </b-row>
      <b-table v-else :items="transactions" :fields="fields" striped hover stacked="sm" class="mt-3 shadow bg-white rounded">
        <template v-slot:cell(index)="data">
          <span class="font-weight-bold">{{ data.index + 1 }}.</span>
        </template>
        <template v-slot:cell(updatedAt)="data">
          <span class=""> {{ getDate(data.item.updatedAt) }}</span>
        </template>
      </b-table>
    </div>
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
          key: 'index',
          label: ''
        },
        {
          key: 'updatedAt',
          label: 'Date',
          formatter: this.getDate()
        },
        {
          key: 'expectedAmount',
          label: 'Amount (Ksh)'
        },
        {
          key: '_id',
          label: 'Transaction code'
        }
      ],
    }
  },
  computed: {
    ...mapState(['transactions', 'user']),
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
  },
}
</script>
<style lang="scss">
</style>