<template>
  <b-container class="custom-container">
    <div class="ml-lg-5">
      <p>
        <span class="h3 text-primary">Nominate people</span>
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
                :state="validationResults.name" 
                class="custom-input" 
                id="name"
              />
              <b-form-invalid-feedback>
                {{ validationMessages.name }}
              </b-form-invalid-feedback>
            </b-col>
          </b-form-row>
          <b-form-row class="py-3">
            <b-col sm="12" md="4" class="text-md-right font-weight-bold">
              <label for="phone-number">M-Pesa Number:</label>
            </b-col>
            <b-col>
              <b-input-group>
                <b-input-group-prepend>
                  <b-button disabled class="custom-dialog-input-phone-prepend">+254</b-button>
                </b-input-group-prepend>
                <b-form-input 
                  v-model="nomineeCreds.phone"
                  type="text" 
                  :state="validationResults.phone"
                  class="custom-input"  
                  placeholder="xxxxxxxxx"
                  id="phone-number"
                />
                <b-form-invalid-feedback>
                  {{ validationMessages.phone }}
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
                :state="validationResults.email" 
                class="custom-input" 
                id="email"
              />
              <b-form-invalid-feedback>
                {{ validationMessages.email }}
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
import { Auth } from '../services';
import { DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
import { validateNamedRules, validationRules, validationMessages } from '../views/util';
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
      validationMessages: {
        name: validationMessages.name,
        phone: validationMessages.phone,
        email: validationMessages.email,
      },
      validationRules: {
        name: validationRules.name,
        phone: validationRules.phone,
        email: { test: (creds) => !creds.email.length || /\S+@\S+\.\S+/.test(String(creds.email))},
      },
      validationResults: { name: null, phone: null, email: null },
    }
  },
  components: { },
  computed: {
    ...mapState(['user', 'message']),
  },
  methods: {
    ...mapActions(['nominate', 'getCurrentUser','refreshData']),
    validateNamedRules,
    hideDialog() {
      this.nomineeCreds = {
        phone: '',
        email: '',
        name: '',
        role: 'Beneficiary'
      },
      this.validationResults = { name: null, phone: null, email: null },
      this.$bvModal.hide('nominate-success');
    },
    async submitNomination() {
      this.validationMessages = {
        name: validationMessages.name,
        phone: validationMessages.phone,
        email: validationMessages.email
      };
      this.validationResults = this.validateNamedRules(this.nomineeCreds, this.validationRules);
      if (!Object.values(this.validationResults).includes(false)) {
        const data = {
          nominee: `254${this.nomineeCreds.phone}`,
          name: this.nomineeCreds.name.trim(),
          role: this.nomineeCreds.role.toLowerCase()
        };

        if (this.nomineeCreds.email) {
          data.email = this.nomineeCreds.email;
        }

        await this.nominate(data);

        if (this.message.type !== 'error') {
          this.validationResults = { name: true, phone: true, email: true };
          this.$bvModal.show('nominate-success');
        }
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