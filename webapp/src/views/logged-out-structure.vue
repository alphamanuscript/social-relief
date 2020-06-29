<template>
  <div class="logged-out-structure">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mt-3 mb-5">
      <a class="navbar-brand" href="#">
        <img :src="imageUrl" alt="Social Relief Logo" class="logo">
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <router-link class="nav-link" to="/about">About Us</router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="#">Contact Us</router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="/beneficiaries">Nominate</router-link>
          </li>
          <li class="nav-item active" @click="handleLoginAndSignUpBtnClick">
            <router-link class="nav-link login-and-sign-up-btn" to="#">Login / Sign Up</router-link>
          </li>
        </ul>
      </div>
    </nav>
    <router-view class="view-content" />
  </div>
</template>
<script>
export default {
  name: 'logged-out-structure',
  components: {},
  computed: {
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    },
  },
  methods: {
    handleLoginAndSignUpBtnClick() {
      this.$emit('show:login-dialog');
    }
  }
}
</script>
<style lang="scss">
  .logged-out-structure {
      nav {
        width: 68%;
        margin: 0 auto;
        height: 7rem;
        background-color: #F5F5F5 !important;

        .navbar-brand {
          width: 7rem;
          height: 12rem;
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: inherit;
            height: inherit;
          }
        }

        #navbarSupportedContent {
          width: 5px;
          margin-left: 4rem;


          .navbar-nav {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;

            li {
              font-weight: 500;
            }

            .login-and-sign-up-btn {
              border-radius: 3rem;
              width: 7.3rem;
              height: 2.2rem;
              text-align: center;
              background: darken(#EF5A24, .9);
              color: #fff;
              transition: all 0.5s;
              box-shadow: 0 2px 5px #E2E2E2;
              font-size: .75rem;
              border: none;

              &:hover {
                background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
              }
            }
          }
        }
    }

    .view-content {}
  }
</style>