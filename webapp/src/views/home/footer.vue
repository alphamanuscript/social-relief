<template>
  <div class="text-center text-white small bg-secondary py-5 px-0 m-0 w-100 position-absolute">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
    <p> privacy policy • terms of use </p>
    <p> Copyright &copy; {{ new Date().getFullYear() }} </p>
  </div> 
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'footer',
  components: { }, 
  computed: {
    ...mapState(['user'])
  }
}
</script>

<style>

</style>