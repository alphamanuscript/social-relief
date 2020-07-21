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
            <b-card-title>{{ invitation.nominator }}</b-card-title>
            <b-card-text>
              wants me to be a {{ invitation.role }}
            </b-card-text>
            <template v-slot:footer>
              <b-button variant="primary" class="mr-5">Accept</b-button>
              <b-button variant="danger" class="">Decline</b-button>
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
            <template v-if="invitation.status === 'pending'" v-slot:footer>
              <b-button variant="warning" class="" style="background-color: yellow">Pending</b-button>
            </template>
            <template v-else-if="invitation.status === 'accepted'" v-slot:footer>
              <b-button variant="" class="" style="background-color: green">Accepted</b-button>
            </template>
            <template v-else-if="invitation.status === 'rejected'" v-slot:footer>
              <b-button variant="danger" class="">Rejected</b-button>
            </template>
          </b-card>
        </b-card-group>
      </div>
    </div>
  </b-container>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
export default {
  name: 'invitations',
  computed: {
    ...mapState(['invitations']),
    ...mapGetters([
      'invitationsSent',
      'invitationsReceived',
    ]),
  },
  methods: {
    ...mapActions(['refreshData', 'getCurrentUser', 'getInvitation']),
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