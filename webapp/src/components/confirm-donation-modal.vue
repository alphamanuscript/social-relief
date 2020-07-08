<template>
  <b-modal
    id="confirm-donation"
    title="Confirmation sent!"
    title-class="text-primary"
    centered
    hide-header-close
    header-class="border-bottom-0"
    hide-footer
    @hidden="hideDialog()"
    content-class="rounded p-5"
  >
    <p>
      A confirmation sms has been sent to <span class="text-secondary">+{{ user ? user.phone : '' }}</span>. Kindly confirm to finalize the donation. 
    </p>
    <div class="mt-3 text-right">
      <b-button variant="secondary" class="custom-submit-button" @click.prevent="hideDialog()">Close</b-button>
    </div>
  </b-modal>
</template>

<script>
  import { mapState } from 'vuex';
  export default {
    computed: {
      ...mapState(['user']),
    },
    methods: {
      hideDialog() {
        this.$bvModal.hide('confirm-donation');
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>