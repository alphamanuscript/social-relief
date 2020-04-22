<template>
  <div class="container">
    <div class="row mb-md-5">
      <div class="col">
        <h2>Accept Invitation Page</h2>
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
            @click.prevent="submitCode"
          >
          Accept and Proceed
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex';
export default {
  name: 'accept-invitation',
  data() {
    return {
      code: '',
      message: 'Please provide a valid code',
      isValidCode: true
    }
  },
  computed: {
    ...mapGetters([
      'invitation',
    ]),
    classes() {
      return {
        'form-control': true,
        'is-invalid': !this.isValidCode
      }
    },
  },
  method: {
    ...mapActions([
      'deleteInvitation',
    ]),
    submitCode() {
      console.log('this.code: ', this.code);
      if (this.code.length && this.code === this.invitation.code.toString()) {
        this.isValidCode = true;
        this.deleteInvitation(this.invitation._id);
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
  }
}
</script>
<style lang="scss" scoped>
  .container {
    border: 1px solid #000;
  }
</style>