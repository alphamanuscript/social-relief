<template>
  <div class="outermost-container">
    <div class="inner-container">
      <div class="page-header">
        <h3>Nominate</h3>
        <span class="view-invitations-btn" @click="handleViewInvitationsBtnClick">View invitations</span>
      </div>
      <div class="form-container">
        <h6>Nominee information</h6>
        <form>
          <div class="row form-group">
            <label for="phone-number" class="col-sm-2 col-form-label">M-Pesa Number:</label>
            <div class="col-sm-10 form-control-container">
              <input 
                v-model="nomineeCreds.phone"
                type="text" 
                :class="getClasses('phone')"  
                id="phone-number"
                placeholder="7xxxxxxxx">
              <div class="invalid-feedback">
                {{ validationMessages[0] }}
              </div>
            </div>
          </div>
          <div class="row form-group">
            <label for="email" class="col-sm-2 col-form-label">Email:</label>
            <div class="col-sm-10 form-control-container">
              <input 
                v-model="nomineeCreds.email"
                type="email" 
                :class="getClasses('email')" 
                id="email">
              <div class="invalid-feedback">
                {{ validationMessages[1] }}
              </div>
            </div>
          </div>
          <div class="row form-group">
            <label for="role" class="col-sm-2 col-form-label">Role:</label>
            <div class="col-sm-10 form-control-container">
              <select id="role" class="input form-control" v-model="nomineeCreds.role">
                <option>Beneficiary</option>
                <option>Middleman</option>
              </select>
            </div>
          </div>
          <div class="row submit-btn-row form-group">
            <div class="col-sm-9"></div>
            <div class="col-sm-3 form-control-container">
              <button type="button" class="btn btn-primary" @click.prevent="nominate">Submit</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { validateObj } from '../views/util';

export default {
  name: 'nominate',
  props: ['show'],
  data() {
    return {
      nomineeCreds: {
        phone: '',
        email: '',
        role: 'Beneficiary'
      },
      validationMessages: [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Invalid email'
      ],
      validationRules: [
        { test: (nomineeCreds) => nomineeCreds.phone[0] === '7' && /^(?=.*\d)(?=.{9,9}$)/.test(nomineeCreds.phone) },
        { test: (nomineeCreds) => !nomineeCreds.email.length || /\S+@\S+\.\S+/.test(String(nomineeCreds.email))}
      ],
      validationResults: [true, true],
    }
  },
  methods: {
    ...mapState(['message']),
    ...mapActions(['nominateBeneficiary']),
    validateObj,
    getClasses(nameOfInput) {
      switch(nameOfInput) {
        case 'phone': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.validationResults[0]
          }
        case 'email': 
          return {
            'input': true,
            'form-control': true,
            'is-invalid': !this.validationResults[1]
          }
        default: 
          return {}
      }
    },
    async nominate() {
      this.validationMessages = [
        'Invalid phone number. Must start with 7 and be 9 digit long',
        'Invalid email'
      ];
      this.validationResults = this.validateObj(this.nomineeCreds, this.validationRules);
      // if (!this.validationResults.includes(false)) {
      //   await this.nominate({ phone: `254${this.nomineeCreds.phone}`, email: this.nomineeCreds.email, role: this.nomineeCreds.role });
      //   if (this.message.type === 'error') {
      //     this.validationMessages = [this.message.message, this.message.message];
      //     this.validationResults = [false, false];
      //   }
      //   else {
      //     this.signInCreds = {
      //       phone: '',
      //       password: ''
      //     },
      //     this.signInValidationResults = [true, true];
      //   } 
      // }
    },
    handleViewInvitationsBtnClick() {
      console.log('In here....')
    }
  }
}
</script>
<style lang="scss" scoped>
  .outermost-container {
    margin: 1rem 0 0 1rem;
    .inner-container {
      .page-header {
        display: flex;
        align-items: center;

        h3 {
          color: #EF5A24;
        }

        .view-invitations-btn {
          margin-left: 3rem;
          width: 9rem;
          height: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all .5s;
          padding-left: .9rem;
          padding-right: .9rem;
          border-radius: 3rem;
          cursor: pointer;
          font-size: .92rem;
          font-weight: 500;

          &:hover {
            color: #FFF;
            background-color: #9D1A63;
          }
        }
      }

      .form-container {
        margin-top: 1.5rem;
        border-radius: .7rem;
        background-color: #FFF;
        padding: 3rem 6rem 3rem 6rem;
        box-shadow: 0 2px 5px #E2E2E2;

        h6 {
          color: #9D1A63;
          font-weight: 500;
          font-size: .8rem;
        }

        form {
          margin-top: 2rem;
          margin-left: 4rem;

          .form-group {
            label {
              font-size: .8rem;
              font-weight: bold;
            }

            .form-control-container {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;

              .input {
                height: 1.8rem;
                border: none;
                border-bottom: 2px solid #F5F5F5;
                padding-left: .7rem;
                font-size: .7rem;

                &:focus {
                  box-shadow: none;
                }
              }

              .invalid-feedback {
                font-size: .75rem;
              }

              #role {}
            }
          }

          .submit-btn-row {
            margin-top: 7rem;

            .form-control-container {
              display: flex;
              justify-content: flex-end;
              button {
                width: 8.4rem;
                height: 1.8rem;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: all .5s;
                padding-left: .9rem;
                padding-right: .9rem;
                border-radius: 3rem;
                background-color: #9D1A63;
                border: none;
                box-shadow: 0 2px 5px #E2E2E2;
              }
            }
          }
        }
      }
    }
  }
</style>