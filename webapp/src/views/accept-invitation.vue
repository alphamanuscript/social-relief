<template>
  <div class="container">
    <div v-if="invitation && !hasAcceptedInvitation" class="row mb-md-5">
      <div class="col">
        <h2>Accept Invitation</h2>
        <p>You have been invited to become a middleman so that you can nominate people who can benefit from donations made by the invitor. To accept the invitation, enter the code sent to you via sms</p>
        <form>
          <div class="form-group">
            <label for="code">Invitation Code</label>
            <input
              v-model="code"
              id="code"
              type="text"
              :class="classes"
            >
            <div class="invalid-feedback">
              {{ message }}
            </div>
          </div>
          <button 
            type="submit" 
            class="btn btn-primary" 
            @click.prevent.stop="submitCode"
          >
          Accept and Proceed
          </button>
        </form>
      </div>
    </div>
    <div v-else-if="!invitation && !hasAcceptedInvitation" class="row mb-md-5">
      <div class="col">
        <h2>Invitation no longer active</h2>
        <p>Your invitation has expired. Reach out to the person who originally sent it and ask them to resend it</p>
      </div>
    </div>
    <div v-else-if="!invitation && hasAcceptedInvitation" class="row mb-md-5">
      <div class="col">
        <h2>Invitation successfully accepted</h2>
        <p>You have successfully accepted the invitation to become a middleman. 
           Proceed by <router-link :to="{ name: 'sign-up', params: { phone } }">signing up</router-link> 
           if you do not have an account yet. 
           Otherwise, <router-link :to="{ name: 'sign-in', params: { phone } }">sign in</router-link> </p>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
export default {
  name: 'accept-invitation',
  data() {
    return {
      code: '',
      message: 'Please provide a valid code',
      isValidCode: true,
      hasAcceptedInvitation: false,
      phone: '',
    }
  },
  computed: {
    ...mapState([
      'invitation',
    ]),
    classes() {
      return {
        'form-control': true,
        'is-invalid': !this.isValidCode
      }
    },
  },
  methods: {
    ...mapActions([
      'acceptInvitation',
    ]),
    submitCode() {
      console.log('this.code: ', this.code);
      if (this.code.length && this.code === this.invitation.code.toString()) {
        console.log('We have a match');
        this.isValidCode = true;
        this.acceptInvitation({ _id: this.invitation._id });
        this.code = '';
      }
      else if (!this.code.length) {
        this.message = 'Please provide a valid code';
        this.isValidCode = false;
      }
      else if (this.code !== this.invitation.code.toString()) {
        this.message = 'Invalid code';
        this.isValidCode = false;
      }

    }
  },
  watch: {
    async invitation(newVal, oldVal) {
      if(!oldVal && newVal) {
        console.log('Assigning phone number');
        this.phone = this.invitation.invitee;
      }
      else if (oldVal && !newVal) {
        this.hasAcceptedInvitation = true;
        console.log('oldVal and newVal: ', oldVal, newVal);
        console.log('Successfully accepted invitation', oldVal, newVal);
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>