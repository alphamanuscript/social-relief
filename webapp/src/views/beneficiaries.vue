<template>
  <b-container class="mw-100 my-3 px-lg-2 px-xl-5">
    <div class="ml-lg-5">
      <div class="small">
        <h3 class="text-primary">Beneficiaries</h3>
        <p>
          All nominees get <span class="text-secondary font-weight-bold">Ksh 2,000</span> to purchase basic supplies during this trying period. Your contribution will go a long way touch the lives of <span class="text-secondary font-weight-bold">13,600+</span> people who
          are currently enlisted as beneficiaries of this system. We at Social Relief want to say a big <span class="text-secondary font-weight-bold">THANK YOU</span> for your kindness and support.
        </p>
      </div>
      <div class="">
        <h3 class="text-primary pb-3">My Nominees</h3>
        <b-table :items="items" :fields="fields" striped hover stacked="sm" class="bg-white rounded shadow">
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
      title-class="text-primary h3"
      centered
      hide-header-close
      header-class="border-bottom-0"
      hide-footer
      @hidden="hideDialog()"
      content-class="rounded p-5"
    >
      <p class="text-secondary h5">
        Transaction history
      </p>
      <div class="mt-3 text-right">
        <b-button variant="primary" class="custom-submit-button" @click.prevent="hideDialog()">Close</b-button>
      </div>
    </b-modal>
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'beneficiaries',
  data() {
    return {
      currentBeneficiary: {
        _id: '',
        name: '',
        addedBy: '',
        createdAt: '',
      },
      fields: [
        {
          key: 'index',
          label: ''
        },
        {
          key: 'name',
          label: 'Name',
          formatter: (value) => {
            if (!value)
              return "John Doe";
            return value;
          }
        },
        {
          key:'addedBy',
          label: 'Added by',
          formatter: (value) => { 
            if (this.user._id===value)
              return "Me";
            return value;
           }
        },
        {
          key:'createdAt',
          label: 'Added on',
          formatter: (value) => { 
            return new Date(value).toLocaleDateString(); 
          }
        },
        {
          key: 'progress',
          label: 'Progress*',
        },
        'expand'
      ],
      items: [
        {
          name: 'Mama Yake', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: '605ffc7344792a551722d5903ba7463a', progress: 0
        },
        {
          name: 'Mama Yake 2', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: '605ffc7344792a551722d5903ba7463a', progress: 50
        },
        {
          name: 'Mama Yake 3', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: 'Middleman John Doe', progress: 75
        },
        {
          name: 'Mama Yake 4', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: 'Middleman John Doe', progress: 100
        },
        {
          name: 'Mama Yake', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: '605ffc7344792a551722d5903ba7463a', progress: 0
        },
        {
          name: 'Mama Yake 2', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: '605ffc7344792a551722d5903ba7463a', progress: 50
        },
        {
          name: 'Mama Yake 3', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: 'Middleman John Doe', progress: 75
        },
        {
          name: 'Mama Yake 4', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: 'Middleman John Doe', progress: 100
        },
        {
          name: 'Mama Yake', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: '605ffc7344792a551722d5903ba7463a', progress: 0
        },
        {
          name: 'Mama Yake 2', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: '605ffc7344792a551722d5903ba7463a', progress: 50
        },
        {
          name: 'Mama Yake 3', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: 'Middleman John Doe', progress: 75
        },
        {
          name: 'Mama Yake 4', createdAt: '2020-07-06T11:23:29.068+00:00', addedBy: 'Middleman John Doe', progress: 100
        }
      ]
    }
  }, 
  computed: {
    ...mapState(['beneficiaries', 'user'])
  },
  methods: {
    ...mapActions(['getTransactions', 'getBeneficiaries']),
    handleExpand(beneficiary) {
      this.currentBeneficiary = beneficiary;
      this.$bvModal.show('beneficiary');
    },
    hideDialog() {
      this.$bvModal.hide('beneficiary');
    },
  },
  async mounted() {
    await this.getBeneficiaries();
    await this.getTransactions();
  }
}
</script>