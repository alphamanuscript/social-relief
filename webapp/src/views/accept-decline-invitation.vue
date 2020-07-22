<template>
  <b-container fluid="sm" class="w-md-75">
    <section class="my-5">
      <div class="" align="center">
        <h3 class="text-secondary">
            Accept Invitation
        </h3>
        <div class="py-3">
          <!-- <h6 class="text-primary">Click the button below to make your contribution.</h6> -->
          <p>
            <span class="text-black font-weight-bold">John Doe</span> has invited you to be their middleman/beneficiary. <br>
            As a middleman, you will be able to appoint/nominate other people on John Doe's behalf.<br>
            As a beneficiary, you will receive money from John Doe or their donors.<br>
            To accept this invitation, enter the code sent to <span class="text-secondary font-weight-bold">+254749200282</span> and hit submit
          </p>
          <b-form class="col-lg-5">
            <b-form-group>
              <label for="password" class="sr-only">Code</label>
              <b-form-input 
                type="text" 
                class="custom-dialog-input"
                placeholder="Enter code (xxxx)"
                id="code"
              />
              <b-form-text v-show="false" class="text-center">
                4 numeric characters
              </b-form-text>
              <b-form-invalid-feedback class="text-center">
              </b-form-invalid-feedback>
            </b-form-group>
            <div class="text-center">
              <b-button type="submit" size="sm" variant="primary" class="custom-submit-button mr-4" >Submit</b-button>
            </div>
          </b-form>
        </div>
      </div>
    </section>
  </b-container>
</template>
<script>
export default {
  
}
</script>