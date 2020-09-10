<template>
  <div class="text-center text-white small bg-secondary p-5 w-100 position-absolute" :style="styleObject">
    <p> privacy policy • terms of use </p>
    <p> Copyright &copy; {{ new Date().getFullYear() }} </p>
  </div> 
</template>

<script>
import { Anonymous } from '../services';
export default {
  name: 'home-footer',
  computed: { 
    styleObject() {
      if (this.$route.name === 'post-payment-flutterwave' && Anonymous.isSet()) {
        return { "margin-top": "16rem" }
      }
      return {};
    }
  }
}
</script>