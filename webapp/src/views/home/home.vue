<template>
    <b-container fluid="sm" class="w-md-75">
      <section class="my-5">
        <div>
          <h3 class="text-secondary">
              The SocialRelief campaign aims to transfer 2,000Ksh per month to people
              financially affected by Covid-19
              between October and December 2020.<br>
              Testing 1, 2, 3...
              Coming right after you,
              Baby you're gonna get it now
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
            <b-col sm="12" md="3">
              <p class="text-secondary display-4 mb-0">{{stats ? formatWithCommaSeparator(stats.numContributors) : 0}}</p>
              <p>Contributors so far</p>
            </b-col>
            <b-col sm="12" md="3">
              <p class="text-primary display-4 mb-0">{{stats ? (formatWithCommaSeparator(stats.totalContributed)) : 0}}</p>
              <p>Total amount contributed</p>
            </b-col>
            <b-col sm="12" md="3">
              <p class="text-primary display-4 mb-0">{{stats ? (formatWithCommaSeparator(stats.totalDistributed)) : 0}}</p>
              <p>Total amount distributed</p>
            </b-col>
            <b-col sm="12" md="3">
              <p class="text-primary display-4 mb-0">{{stats ? formatWithCommaSeparator(stats.numRecipients) : 0}}</p>
              <p>Recipients so far</p>
            </b-col>
          </b-row>
        </div>
      </section>


      <b-container fluid class="px-4 pt-4 pb-3 gallery">
        <img v-for="(imageUrl, index) in beneficiaryImages" :key="index" :src="imageUrl" width="100%" alt="Beneficiary Image">
      </b-container>

      <section class="my-5 pt-5 text-center" id="how-it-works">
        <p>
          Social Relief aims to send <span class="text-secondary font-weight-bold">Ksh 2,000</span> 
          per month to each beneficiary on the platform between October and December 2020.<br/>
          This amount will help those in need to address their basic needs and get back on their feet following
          the negative impact of the Covid-19 pandemic.
        </p>
        <p>Your contribution will go a long to touch the lives of</p>
        <p class="text-primary display-4">{{ stats ? (formatWithCommaSeparator(stats.numBeneficiaries)) : 0 }}</p>
        <p>people who are currently enlisted as beneficiaries in this system.</p>
      </section>

      <section class="my-5 pt-5 text-center" id="testimonials">
        <h1 class="text-primary mb-5">Testimonials</h1>
        <p>
          We at Social Relief want to say a big <span class="text-secondary font-weight-bold">thank you</span> 
          for your kindness and support!
        </p>
        <p>
          Here is what some of the recipients of the donations have to say:
        </p>

        <div style="min-height:50px">
          <b-carousel
            id="testimonial-carousel"
            fade
            controls
            img-height="450"
            background="#e7e7e7"
            style="text-shadow: 1px 1px 2px #333;"
            :interval="4000"
          >
            <b-carousel-slide
              v-for="(testimonial, index) in testimonials" :key="index"
              img-height="450"
              :caption="testimonial.name"
              :text="testimonial.message"
            >
              <!-- this empty p element serves as the background of the slide, without it, the text does not get displayed -->
              <p slot="img" style="height:200px;border-radius:10px"></p>
              <p><em>{{ testimonial.date.toDateString() }}</em></p>
            </b-carousel-slide>
          </b-carousel>
        </div>
      </section>

      <section class="accordion text-center my-5 pt-5 mx-auto col-sm-12 col-md-9" role="tablist" id="faq">
        <h1 class="text-primary mb-5">Frequently Asked Questions</h1>
        <b-card v-for="(faq, index) in faqs" :key="index" no-body class="mb-1 mx-auto">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-button no-shadow block v-b-toggle="`faq-${index}`" style="color: black; outline: none; box-shadow: none; background: transparent; border: 1px solid transparent; font-weight: bold; text-decoration: underline">{{ faq.question }}</b-button>
          </b-card-header>
          <b-collapse :id="`faq-${index}`" visible accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-card-text>{{ faq.answer }}</b-card-text>
            </b-card-body>
          </b-collapse>
        </b-card>
      </section>

      <section class="my-5 pt-5" id="about-us">
        <div class="text-center" align-h="start">
          <h1 class="text-primary mb-5">About Us</h1>
          <p>
            Social Relief was conceived by <a href="https://manuscript.live" target="_blank">Alpha Manuscript Limited</a>, 
            a tech startup based in Nairobi, in the wake of the lockdown and other restrictons imposed in the country to slow the spread of the Covid-19.
            The platform was developed with the aim of distributing funds from donors to beneficiaries transparently, credibly and directly,
            ensuring that each shilling contributed by donors reaches the beneficiaries.
          </p>
        </div>
      </section>

      <section class="my-5 pt-5" id="contact-us">
        <div class="text-center">
            <h1 class="text-primary mb-5">Contact Us</h1>
            <b-card>
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
    ...mapState(['newUser', 'message', 'stats', 'testimonials', 'faqs']),
    beneficiaryImages() {
      return [
        require(`@/assets/beneficiary1.jpeg`),
        require(`@/assets/beneficiary2.jpeg`),
        require(`@/assets/beneficiary3.jpeg`)
      ];
    },
  },
  methods: {
    ...mapActions(['getNewUser', 'getStats']),
    formatWithCommaSeparator,
    handleDonateBtn() {
      this.$bvModal.show('donate-anonymously');
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
<style lang="scss" scoped>
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
</style>