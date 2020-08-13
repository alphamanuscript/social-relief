<template>
    <b-container fluid="sm" class="w-md-75">
      <section class="my-5">
        <div>
          <h3 class="text-secondary">
              All donations are geared towards helping those most affected by the covid-19 pandemic.
          </h3>
          <div class="py-3">
            <h6 class="text-primary">Click the button below to make your contribution.</h6>
          </div>
          <div class="pb-3">
            <b-button pill variant="primary" class="px-5" @click="handleDonateBtn()">Donate</b-button>
          </div>
        </div>
      
        <div class="my-3 font-weight-bold">
          <h4 class="text-primary">Some stats</h4>
          <b-row class="text-center shadow bg-white rounded px-4 pt-4 pb-3">
            <b-col sm="12" md="4">
              <p class="text-secondary display-4 mb-0">{{stats ? formatWithCommaSeparator(stats.numContributors) : 0}}</p>
              <p>Contributors so far</p>
            </b-col>
            <b-col sm="12" md="4">
              <p class="text-primary display-4 mb-0">{{stats ? (formatWithCommaSeparator(stats.totalContributed) + '+') : 0}}</p>
              <p>Money shared so far</p>
            </b-col>
            <b-col sm="12" md="4">
              <p class="text-primary display-4 mb-0">{{stats ? formatWithCommaSeparator(stats.numBeneficiaries) : 0}}</p>
              <p>Beneficiaries so far</p>
            </b-col>
          </b-row>
        </div>
      </section>

      <section class="my-5 pt-5 text-center" id="beneficiaries">
        <h1 class="text-primary mb-5">The Beneficiaries</h1>
        <p>
          All beneficiaries get <span class="text-secondary font-weight-bold">Ksh 2,000</span> 
          to get basic supplies during this trying period. <br/>
          Here are some of the people whom your contribution will go along to help.
        </p>
        <p>Your contribution will go a long to touch the lives of</p>
        <p class="text-primary display-4">{{ stats ? (formatWithCommaSeparator(stats.numBeneficiaries) + '+') : 0 }}</p>
        <p>people who are currently enlisted as beneficiaries in this system.</p>
        <p>
          We at Social Relief want to say a big <span class="text-secondary font-weight-bold">thank you</span> 
          for your kindness and support!
        </p>
      </section>

      <section class="my-5 pt-5" id="about-us">
        <div class="text-center">
          <h1 class="text-primary mb-5">About Us</h1>
          <p>
            Social Relief is the baby product of Alpha Manuscript Limited, <br>
            an up-and-coming small company based in Nairobi, Kenya, with a diverse team <br>
            comprising of driven employees
            from around the globe, including Kenya, Germany, France, and South Africa.
          </p>
          <p>
            Our mission is to build software that solves everyday problems <br>
            and improves the wellness and well-being of the people.
          </p>
        </div>
        
        <div class="my-5">
          <h4 class="text-secondary">Our Partners</h4>
          <div class="d-flex flex-row flex-wrap justify-content-between text-center shadow bg-white rounded px-4 pt-4 pb-3">
            <div>
              <b-avatar></b-avatar>
            </div>
            <div>
              <b-avatar></b-avatar>
            </div>
            <div>
              <b-avatar></b-avatar>
            </div>
            <div>
              <b-avatar></b-avatar>
            </div>
            <div>
              <b-avatar></b-avatar>
            </div>
          </div>
        </div>
      </section>

      <section class="my-5 pt-5" id="contact-us">
        <div class="text-center">
            <h1 class="text-primary mb-5">Contact Us</h1>
            <b-card
            >
              <b-card-text>
                Contact us at <a href="mailto:socialrelief@manuscript.live">socialrelief@manuscript.live</a> 
              </b-card-text>
            </b-card>
          </div> 
      </section>
    </b-container>
</template>
<script>
import { formatWithCommaSeparator } from '../../views/util';
import { mapState, mapActions } from 'vuex';
export default {
  name: 'home',
  computed: {
    ...mapState(['newUser', 'message', 'stats']),
  },
  methods: {
    ...mapActions(['getNewUser', 'getStats']),
    formatWithCommaSeparator,
    handleDonateBtn() {
      this.$bvModal.show('login');
    }
  },
  async mounted(){
    if (this.$route.name === 'signup-new-user' && this.$route.params.id && this.$route.params.id.length) {
      await this.getNewUser(this.$route.params.id);
      if (this.message.type !== 'error') this.$bvModal.show('sign-up');
    }
    else await this.getStats();
  } 
}
</script>