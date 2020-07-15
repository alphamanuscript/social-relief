<template>
  <b-container class="custom-container">
    <div class="ml-lg-5">
      <p>
        <span class="h3 text-primary">Nominate</span>
        <b-link to="invitations" class="text-body ml-5">View invitations</b-link>
      </p>
      <div class="bg-white rounded p-5 shadow-sm">
        <b-form class="mx-md-2 px-md-2 mx-lg-3 px-lg-3 mx-xl-5 px-xl-5">
          <b-form-text class="pb-3">
            <span class="h5 text-secondary">Nominee information</span>
          </b-form-text>
          <b-form-row class="py-3">
            <b-col sm="12" md="4" class="text-md-right font-weight-bold">
              <label for="name">Name:</label>
            </b-col>
            <b-col>
              <b-form-input 
                v-model="nomineeCreds.name"
                type="text"
                :state="validationResults[2]" 
                class="custom-input" 
                id="name"
              />
              <b-form-invalid-feedback>
                {{ validationMessages[2] }}
              </b-form-invalid-feedback>
            </b-col>
          </b-form-row>
          <b-form-row class="py-3">
            <b-col sm="12" md="4" class="text-md-right font-weight-bold">
              <label for="phone-number">M-Pesa Number:</label>
            </b-col>
            <b-col>
              <b-input-group>
                <template v-slot:prepend >
                  <img :src="imageUrl" width="50" height="30" class="rounded-pill align-self-end" alt="Social Relief Logo">
                </template>
                <b-form-input 
                  v-model="nomineeCreds.phone"
                  type="text" 
                  :state="validationResults[0]"
                  class="custom-input"  
                  placeholder="7xxxxxxxx"
                  id="phone-number"
                />
                <b-form-invalid-feedback>
                  {{ validationMessages[0] }}
                </b-form-invalid-feedback>
              </b-input-group>
            </b-col>
          </b-form-row>
          <b-form-row class="py-3">
            <b-col sm="12" md="4" class="text-md-right font-weight-bold">
              <label for="email">Email:</label>
            </b-col>
            <b-col>
              <b-form-input 
                v-model="nomineeCreds.email"
                type="email"
                :state="validationResults[1]" 
                class="custom-input" 
                id="email"
              />
              <b-form-invalid-feedback>
                {{ validationMessages[1] }}
              </b-form-invalid-feedback>
            </b-col>
          </b-form-row>
          <b-form-row class="py-3">
            <b-col sm="12" md="4" class="text-md-right font-weight-bold">
              <label for="role">Role:</label>
            </b-col>
            <b-col>
              <b-form-select id="role" v-model="nomineeCreds.role" class="custom-input">
                <b-form-select-option value="Beneficiary">Beneficiary</b-form-select-option>
                <b-form-select-option value="Middleman">Middleman</b-form-select-option>
              </b-form-select>
            </b-col>
          </b-form-row>
          <b-form-row class="pt-3">
            <b-col>
              <b-button variant="secondary" class="custom-submit-button float-right" @click.prevent="submitNomination">Submit</b-button>
            </b-col>
          </b-form-row>
        </b-form>
      </div>
    </div>
    <b-modal
      id="nominate-success"
      title="Nomination Invitation Sent!"
      title-class="text-primary"
      centered
      hide-header-close
      header-class="border-bottom-0"
      hide-footer
      @hidden="hideDialog()"
      content-class="rounded p-5"
    >
      <p>
        A <span class="font-italic">{{ nomineeCreds.role.toLowerCase() }}</span> invitation has been successfully sent to 
        <span class="text-secondary">+254{{ nomineeCreds.phone }}</span>.
      </p>
      <div class="mt-3 text-right">
        <b-button variant="secondary" class="custom-submit-button" @click.prevent="hideDialog()">Close</b-button>
      </div>
    </b-modal>
  </b-container>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { validateObj } from '../views/util';
export default {
  name: 'nominate',
  data() {
    return {
      nomineeCreds: {
        phone: '',
        email: '',
        name: '',
        role: 'Beneficiary'
      },
      validationMessages: [
        'Invalid phone number. Must start with 7 and be 9 digits long',
        'Invalid email',
        'Name is required'
      ],
      validationRules: [
        { test: (nomineeCreds) => nomineeCreds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(nomineeCreds.phone) },
        { test: (nomineeCreds) => !nomineeCreds.email.length || /\S+@\S+\.\S+/.test(String(nomineeCreds.email))},
        { test: (nomineeCreds) => !!nomineeCreds.name.trim().length }
      ],
      validationResults: [null, null]
    }
  },
  components: { },
  computed: {
    ...mapState(['message']),
    imageUrl () {
      return require(`@/assets/Flag_of_Kenya.png`);
    }
  },
  methods: {
    ...mapActions(['nominate']),
    validateObj,
    hideDialog() {
      this.nomineeCreds = {
        phone: '',
        email: '',
        name: '',
        role: 'Beneficiary'
      },
      this.$bvModal.hide('nominate-success');
    },
    async submitNomination() {
      this.validationMessages = [
        'Invalid phone number. Must start with 7 and be 9 digits long',
        'Invalid email',
        'Name is required'
      ];
      this.validationResults = this.validateObj(this.nomineeCreds, this.validationRules);
      if (!this.validationResults.includes(false)) {
        const data = {
          nominee: `254${this.nomineeCreds.phone}`,
          name: this.nomineeCreds.name.trim(),
          role: this.nomineeCreds.role
        };

        if (this.nomineeCreds.email) {
          data.email = this.nomineeCreds.email;
        }

        await this.nominate(data);

        if (this.message.type !== 'error') {
          this.validationResults = [null, null];
          this.$bvModal.show('nominate-success');
        }
      }
    }
  }
}
</script>