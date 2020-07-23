<template>
  <b-container class="custom-container">
    <div class="ml-lg-5">
      <div class="">
        <h3 class="text-primary">Invitations</h3>
      </div>
      <div>
        <h5 class="mt-4">Invitations sent to me</h5>
        <div v-if="!invitationsReceived.length" class="text-center">
          <p class="h2 font-weight-light">You haven't received any invitations yet...</p>
          <p class="">You receive an invitation when someone nominates you as either a beneficiary or middleman</p>
        </div>
        <b-card-group v-else deck>
          <b-card 
            v-for="invitation in invitationsReceived"
            :key="invitation._id"
            class="text-center mb-3 px-0 col-sm-12" style="min-width: 18.45rem; max-height: 15rem">
            <b-card-title>{{ invitation.invitorName }}</b-card-title>
            <b-card-text>
              wants me to be a {{ invitation.inviteeRole }}
            </b-card-text>
            <template v-if="invitation.status === 'pending'" v-slot:footer>
              <b-button variant="primary" class="mr-5" @click="handleAcceptBtnClick(invitation)">Accept</b-button>
              <b-button variant="danger" class="" @click="handleRejectBtnClick(invitation)">Decline</b-button>
            </template>
            <template v-else v-slot:footer>
              Status: 
              <span :class="getClassnames(invitation.status)">{{invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) }}</span>
            </template>
          </b-card>
        </b-card-group>
      </div>
      <div>
        <h5 class="mt-4">Invitations sent by me</h5>
        <div v-if="!invitationsSent.length" class="text-center">
          <p class="h2 font-weight-light">You haven't sent any invitations yet...</p>
          <p class="">Invitations are sent when you nominate someone either as a beneficiary or middleman</p>
          <p> <b-link to="nominate" class="text-primary">Click here to get started.</b-link> </p>
        </div>
        <b-card-group v-else deck>
          <b-card 
            v-for="invitation in invitationsSent"
            :key="invitation._id"
            class="text-center mb-3 px-0 col-sm-12" 
            style="min-width: 18.45rem; max-height: 15rem">
            <b-card-body>
              Invited {{ invitation.inviteeName }} to be a {{ invitation.inviteeRole }}
            </b-card-body>
            <template v-slot:footer>
              Status: 
              <span :class="getClassnames(invitation.status)">{{invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) }}</span>
            </template>
          </b-card>
        </b-card-group>
      </div>
    </div>
    <b-modal
      v-if="currentInvitation"
      id="accept-invitation"
      title="Accept Invitation?"
      title-class="text-primary h3"
      centered
      hide-header-close
      header-class="border-bottom-0 pb-0 mb-0"
      hide-footer
      @hidden="hideDialog('accept-invitation')"
      content-class="rounded p-5"
      scrollable
    >
      <p>
        <span>You're about to accept this invitation by <span class="font-bold">{{ currentInvitation.invitorName }}</span>. </span> 
        <span v-if="currentInvitation.inviteeRole === 'middleman'">As a middleman, you will be able to add beneficiaries on <span class="font-bold">{{ currentInvitation.invitorName }}</span>'s behalf</span>
        <span v-else>As a beneficiary, you will be able to receive money from either <span class="font-bold">{{ currentInvitation.invitorName }}</span> or their donors (if they exist)</span>
      </p>
      <div class="mt-3 text-right">
        <b-button variant="primary" class="custom-submit-button mr-5" @click.prevent="handleInvitationAcceptance()">Proceed</b-button>
        <b-button variant="danger" class="custom-submit-button ml-4" @click.prevent="hideDialog('accept-invitation')">Cancel</b-button>
      </div>
    </b-modal>
    <b-modal
      v-if="currentInvitation"
      id="reject-invitation"
      title="Reject Invitation?"
      title-class="text-primary h3"
      centered
      hide-header-close
      header-class="border-bottom-0 pb-0 mb-0"
      hide-footer
      @hidden="hideDialog('reject-invitation')"
      content-class="rounded p-5"
      scrollable
    >
      <p>
        <span>You're about to reject this invitation by <span class="font-bold">{{ currentInvitation.invitorName }}</span>. </span>
        <span>Click proceed if this is what you want</span>
      </p>
      <div class="mt-3 text-right">
        <b-button variant="primary" class="custom-submit-button mr-5" @click.prevent="handleInvitationRejection()">Proceed</b-button>
        <b-button variant="danger" class="custom-submit-button ml-4" @click.prevent="hideDialog('reject-invitation')">Cancel</b-button>
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
      @hidden="hideDialog('accept-invitation-success')"
      content-class="rounded p-5"
    >
      <p>
        You have successfully accepted <span class="font-bold">{{ currentInvitation.invitorName }}</span>'s invitation to become a <span class="text-secondary">{{ currentInvitation.inviteeRole }}</span>.
      </p>
      <div class="mt-3 text-right">
        <b-button variant="secondary" class="custom-submit-button" @click.prevent="hideDialog('accept-invitation-success')">Close</b-button>
      </div>
    </b-modal>
    <b-modal
      v-if="currentInvitation"
      id="reject-invitation-success"
      title="Invitation Rejected!"
      title-class="text-primary"
      centered
      hide-header-close
      header-class="border-bottom-0"
      hide-footer
      @hidden="hideDialog('reject-invitation-success')"
      content-class="rounded p-5"
    >
      <p>
        You have successfully rejected <span class="font-bold">{{ currentInvitation.invitorName }}</span>'s invitation to become a <span class="text-secondary">{{ currentInvitation.inviteeRole }}</span>.
      </p>
      <div class="mt-3 text-right">
        <b-button variant="secondary" class="custom-submit-button" @click.prevent="hideDialog('reject-invitation-success')">Close</b-button>
      </div>
    </b-modal>
  </b-container>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
export default {
  name: 'invitations',
  data() {
    return {}
  },
  computed: {
    ...mapState(['invitations', 'message', 'currentInvitation']),
    ...mapGetters([
      'invitationsSent',
      'invitationsReceived',
    ]),
  },
  methods: {
    ...mapActions(['refreshData', 'getCurrentUser', 'getInvitation', 'acceptInvitation', 'rejectInvitation', 'createNewUserOrAssumeNewRole', 'getCurrentInvitation']),
    hideDialog(dialogId) {
      this.$bvModal.hide(dialogId);
    },
    getClassnames(status) {
      switch(status) {
        case 'pending':
          return 'font-weight-bold text-warning';
        case 'accepted': 
          return 'font-weight-bold text-success';
        case 'rejected': 
          return 'font-weight-bold text-danger';
        default: 
          return '';
      }
    },
    async handleAcceptBtnClick(invitation) {
      await this.getCurrentInvitation(invitation._id);
      if (this.message.type !== 'error') this.$bvModal.show('accept-invitation');
    },
    async handleRejectBtnClick(invitation) {
      await this.getCurrentInvitation(invitation._id);
      if (this.message.type !== 'error') this.$bvModal.show('reject-invitation');
    },
    async handleInvitationAcceptance() {
      await this.acceptInvitation(this.currentInvitation._id);
      await this.createNewUserOrAssumeNewRole(this.currentInvitation._id);
      if (this.message.type !== 'error') {
        await this.refreshData();
        this.$bvModal.hide('accept-invitation');
        this.$bvModal.show('accept-invitation-success');
      }
    },
    async handleInvitationRejection() {
      await this.rejectInvitation(this.currentInvitation._id);
      if (this.message.type !== 'error') {
        await this.refreshData();
        this.$bvModal.hide('reject-invitation');
        this.$bvModal.show('reject-invitation-success');
      }
    }
  },
  async mounted() {
    if (Auth.isAuthenticated()) {
      if (!this.user)
        await this.getCurrentUser();
      await this.refreshData();
    }
    else {
      this.$router.push({ name: DEFAULT_SIGNED_OUT_PAGE });
    }
  }
}
</script>