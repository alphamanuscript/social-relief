<template>
  <div class="text-center text-white small bg-secondary p-5 w-100 position-absolute">
    <p>
      <b-link href="#" class="text-white" @click="handlePrivacyPolicy()">privacy policy</b-link> • 
      <b-link href="#" class="text-white" @click="handleTermsOfUse()">terms of use</b-link>
    </p>
    <p> Copyright &copy; {{ new Date().getFullYear() }} </p>
  </div> 
</template>

<script>
export default {
  name: 'home-footer',
  methods: {
    handlePrivacyPolicy() {
      this.$bvModal.show('privacy-policy')
    },
    handleTermsOfUse() {
      this.$bvModal.show('terms-of-use')
    }
  }
}
</script>