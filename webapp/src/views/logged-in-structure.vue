<template>
  <b-container fluid>
    <b-row>
      <b-col md="3" xl="2" class="bg-white d-none d-md-block">
        <b-nav vertical class="mr-4 vh-100 pl-2" pills>
          <b-nav-text class="mb-5">
            <div class="d-flex flex-column">
              <div class="py-5">
                <img :src="imageUrl" width="75%" alt="Social Relief Logo">
              </div>
              <div class="bg-secondary text-white rounded-lg pl-3 pt-2">
                <div class="font-weight-light">Current balance</div>
                <div class="">KSH</div>
                <div class="h4">1,500</div>
              </div>
            </div>
          </b-nav-text>
          <b-nav-item active>Beneficiaries</b-nav-item>
          <b-nav-item>Middlemen</b-nav-item>
          <b-nav-item>My invitations</b-nav-item>
          <b-nav-item>History</b-nav-item>
          <b-button variant="primary" pill @click="signOut()">Sign out</b-button>
          <div class="small text-secondary mt-auto">
          <p>privacy policy</p>
          <p>terms of use</p>
          <p>&copy; {{ new Date().getFullYear() }}</p>
        </div>
        </b-nav>
      </b-col>
      <b-col>
        <router-view class="view-content" />
        <Footer class="d-md-none"/>
      </b-col>
    </b-row>
    
  </b-container>
</template>
<script>
import { mapActions } from 'vuex';
import Footer from './home/footer'
export default {
  name: 'logged-out-structure',
  data () {
    return {
      showSidebar: true
    }
  },
  components: { Footer },
  computed: {
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    }
  },
  methods: {
    ...mapActions(['signUserOut']),
    async signOut() {
      await this.signUserOut();
    }
  }
}
</script>
<style lang="scss">
  .logged-in-structure {
    display: grid;
    grid-template-rows: 100vh;
    grid-template-columns: 13rem 1fr;

    .sidebar {
      background-color: #FFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;
      padding: 0;
      box-shadow: 2px 0 5px #E2E2E2;
      z-index: 999;

      .logo-container {
        width: 30%;
        height: 3rem;
        margin: .6rem 0 0 3rem;


        img {
          width: 100%;
          height: 100%;
        }
      }

      .current-balance-container {
        background-color: #9D1A63;
        height: 5rem;
        width: 65%;
        margin: -4rem 0 0 2rem;
        border-radius: 1rem; 
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 0 2px 5px #E2E2E2;

        span {
          color:  #FFF;
          font-size: .7rem;
          display: block;
          height: 1rem;
          width: 6rem;

          &:not(:last-child) {
            margin-bottom: .15rem;
            font-weight: 400;
          }

          &:last-child {
            font-size: .9rem;
            font-weight: 500;
          }
        }
      }

      .vertical-navigation {
        width: 57%;
        margin: -5rem 0 2rem 2rem;
        padding: 0;

        li {
          list-style: none;
          padding: 0 0 0 1rem;
          margin-bottom: 1.2rem;
          font-size: .9rem;

          &:not(:first-child) {
            color: lighten(#000, 20%);
            font-weight: 500;
          }

          &:hover {
            cursor: pointer;
          }

        }

        .active {
          border-radius: 1rem;
          background-color: #9D1A63;
          color: #FFF;
          font-weight: bold;
          height: 1.5rem;
        }
      }

      .policy-and-terms {
        height: 5rem;
        width: 70%;
        color: #9D1A63;
        font-size: .7rem;
        margin: 0 0 0 2rem;

        span{
          display: block;
          margin-bottom: .3rem;
        }
      }
    }

    .view-content {
      height: 100vh;
      overflow-y: scroll;
      background: #F5F5F5;
      padding: 0 3rem 0 3rem;
    }
  }
</style>