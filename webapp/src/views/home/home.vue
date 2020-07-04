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
            <b-button pill variant="primary" class="px-5">Donate</b-button>
          </div>
        </div>
      
        <div class="my-3 font-weight-bold">
          <h4 class="text-primary">Some stats</h4>
          <b-row class="text-center shadow bg-white rounded px-4 pt-4 pb-3">
            <b-col sm="12" md="4">
              <p class="text-secondary display-4 mb-0">6,563</p>
              <p>Contributors so far</p>
            </b-col>
            <b-col sm="12" md="4">
              <p class="text-primary display-4 mb-0">2.5M+</p>
              <p>Money shared so far</p>
            </b-col>
            <b-col sm="12" md="4">
              <p class="text-primary display-4 mb-0">36,563</p>
              <p>Beneficiaries so far</p>
            </b-col>
          </b-row>
        </div>
      </section>

      <section class="my-5 pt-5 text-center" id="beneficiaries">
        <h1 class="text-primary mb-5">The Beneficiaries</h1>
        <p>
          All nominees get <span class="text-secondary font-weight-bold">Ksh 2,000</span> 
          to get basic supplies during this trying period. <br/>
          Here are some of the people whom your contribution will go along to help.
        </p>
        <p>Your contribution will go a long to touch the lives of</p>
        <p class="text-primary display-4">13,600+</p>
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
              img-src="https://picsum.photos/600/300/?image=25"
            >
              <b-card-text>
                Some quick example text to build on the card title and make up the bulk of the card's content.
              </b-card-text>

              <b-button href="#" variant="primary">Go somewhere</b-button>
            </b-card>
          </div> 
      </section>
    </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { Auth } from '../../services';

export default {
  name: 'home',
  components: { }, 
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['getCurrentUser']),
  },
  async mounted() {
    if (Auth.isAuthenticated() && !this.user) {
      this.$router.push({ name: 'beneficiaries' });
    }
  }
}
</script>
<style lang="scss" scoped>

</style>