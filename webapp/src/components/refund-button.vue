<template>
   <div>
    <b-button
      class="mt-2 form-control"
      variant="danger"
      @click="requestRefund"
    >Request refund</b-button>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'refund-button',
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['initiateRefund']),
    requestRefund() {
      this.initiateRefund();
    }
  }

}
</script>