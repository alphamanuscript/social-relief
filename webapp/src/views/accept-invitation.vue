<template>
  <b-container fluid="sm" class="w-md-75 mb-6" style="margin-bottom: 8.5rem">
    <section class="my-5">
      <div v-if="currentInvitation && currentInvitation.status === 'pending'" class="" align="center">
        <h3 class="text-secondary">
            Accept Invitation
        </h3>
        <div class="py-3">
          <p>
            <span class="text-black font-weight-bold">{{ currentInvitation.invitorName }}</span> has invited you to be their {{currentInvitation.inviteeRole}}. <br>
            <span v-if="currentInvitation.inviteeRole === 'middleman'">As a middleman, you will be able to appoint/nominate other people on {{ currentInvitation.invitorName }}'s behalf.<br></span>
            <span v-else-if="currentInvitation.inviteeRole === 'beneficiary'">As a beneficiary, you will receive money from {{ currentInvitation.invitorName }} or their donors.<br></span>
            To accept this invitation, click the button below
          </p>
          <div class="text-center mt-4">
            <b-button type="submit" size="sm" variant="primary" class="custom-submit-button mr-4" @click="handleAcceptBtnClick()">Accept</b-button>
          </div>
        </div>
      </div>
      <div v-else align="center">
        <h3 class="text-secondary">
          Something went wrong
        </h3>
        <div class="py-3">
          One of two things could be the reason. Either the invitation is no longer valid or has already been accepted. 
        </div>
      </div>
    </section>
    <b-modal
      v-if="currentInvitation"
      id="confirm-invitation-acceptance"
      title="Accept Invitation?"
      title-class="text-primary h3"
      centered
      hide-header-close
      header-class="border-bottom-0 pb-0 mb-0"
      hide-footer
      @hidden="hideDialog('confirm-invitation-acceptance')"
      content-class="rounded p-5"
      scrollable
    >
      <p>
        <span>You're about to accept this invitation by <span class="font-bold">{{ currentInvitation.invitorName }}</span>.<br></span> 
        <span>Click proceed if this is what you want</span>
      </p>
      <div class="mt-3 text-right">
        <b-button variant="primary" class="custom-submit-button mr-5" @click.prevent="handleInvitationAcceptance()">Proceed</b-button>
        <b-button variant="danger" class="custom-submit-button ml-4" @click.prevent="hideDialog('confirm-invitation-acceptance')">Cancel</b-button>
      </div>
    </b-modal>
    <b-modal
      v-if="currentInvitation"
      id="accept-invitation-success"
      title="Invitation Accepted!"
      title-class="text-primary"
      centered
      hide-header-close
      header-class="border-bottom-0"
      hide-footer
      no-close-on-backdrop
      @hidden="hideDialog('accept-invitation-success')"
      content-class="rounded p-5"
    >
      <p>
        You have successfully accepted <span class="font-bold">{{ currentInvitation.invitorName }}</span>'s invitation to become a <span class="text-secondary">{{ currentInvitation.inviteeRole }}</span>.
        Close this dialog so that you can be redirected to the signup page where you will be able to provide both your name, email, and password
      </p>
      <div class="mt-3 text-right">
        <b-button variant="secondary" class="custom-submit-button" @click.prevent="handleCloseBtnClick('accept-invitation-success')">Close</b-button>
      </div>
    </b-modal>
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'accept-invitation',
  computed: {
    ...mapState(['currentInvitation', 'newUser', 'message']),
  },
  methods: {
    ...mapActions(['getCurrentInvitation', 'acceptInvitation', 'createNewUser']),
    handleAcceptBtnClick() {
      this.$bvModal.show('confirm-invitation-acceptance');
    },
    hideDialog(dialogId) {
      this.$bvModal.hide(dialogId);
    },
    handleCloseBtnClick(dialogId) {
      this.$bvModal.hide(dialogId);
      this.$router.push(`/signup/new/${this.newUser._id}`);
    },
    async handleInvitationAcceptance() {
      await this.acceptInvitation(this.currentInvitation._id);
      await this.createNewUser(this.currentInvitation._id);
      if (this.message.type !== 'error') {
        await this.getCurrentInvitation(this.currentInvitation._id);
        this.$bvModal.hide('confirm-invitation-acceptance');
        this.$bvModal.show('accept-invitation-success');
      }
    }
  },
  async mounted() {
    await this.getCurrentInvitation(this.$route.params.id);
  }
}
</script>