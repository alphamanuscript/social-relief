<template>
  <div class="logged-in-structure">
    <div class="sidebar">
      <div class="logo-container">
        <img :src="imageUrl" alt="Social Relief Logo" class="logo">
      </div>
      <div class="current-balance-container">
        <span>Current balance</span>
        <span>KSH</span>
        <span>1,500</span>
      </div>
      <ul class="vertical-navigation">
        <li class="active">Beneficiaries</li>
        <li>Middlemen</li>
        <li>My invitations</li>
        <li>History</li>
      </ul>
      <div class="policy-and-terms">
        <span>privacy policy</span>
        <span>terms of use</span>
        <span>(c)2020</span>
      </div>
    </div>
    <div class="view-content">
      <div class="top-nav">
        <div class="links">
          <span class="nominate-btn" @click="handleNominateBtnClick">Nominate</span>
          <span class="donate-btn">Donate</span>
        </div>
        <div class="account-details-and-settings">
          <div>
            <span class="user-name">John Doe</span>
            <span class="account-number">
              <span>Account Number:</span><span> 1234567</span>
            </span>
          </div>
          <i class="fas fa-user-circle"></i>
        </div>
      </div>
      <router-view />
    </div>
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
    handleNominateBtnClick() {
      this.$router.push({ name: 'nominate' });
    }
  }
}
</script>
<style lang="scss">
  .logged-in-structure {
    // border: 1px solid #000;
    display: grid;
    grid-template-rows: 100vh;
    grid-template-columns: 13rem 1fr;

    .sidebar {
      // border: 1px solid #000;
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
      // border: 1px solid #000;
      height: 100vh;
      overflow-y: scroll;
      background: #F5F5F5;
      padding: 0 2rem 0 3rem;

      .top-nav {
        // border: 1px solid #000;
        margin-top: .6rem;
        height: 2.9rem;
        display: flex;
        justify-content: space-between;

        .links {
          // border: 1px solid #000;
          width: 17rem;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;

          span {
            // border: 1px solid #000;
            font-weight: bold;

            &:hover {
              cursor: pointer;
            }
          }

          .nominate-btn {
            // border: 1px solid #000;
            width: 7.1rem;
            height: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all .5s;
            padding-left: .9rem;
            padding-right: .9rem;
            border-radius: 3rem;

            &:hover {
              color: #FFF;
              background-color: #9D1A63;
            }
          }

          .donate-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 3rem;
            width: 8rem;
            height: 2rem;
            text-align: center;
            background: #EF5A24;
            color: #fff;
            transition: all 0.5s;
            box-shadow: 0 2px 5px #E2E2E2;
            border: none;

            &:hover {
              background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
            }
          }
        }

        .account-details-and-settings {
          // border: 1px solid #000;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;

          div {
            // border: 1px solid #000;
            display: flex;
            flex-direction: column;
            font-size: .8rem;
            height: 100%;

            span {
              // border: 1px solid #000;
              height: 100%;
              display: flex;
              justify-content: flex-end;
            }

            .user-name {
              font-size: .8rem;
              align-items: flex-end;
            }

            .account-number {
              align-items: flex-start;
              span {
                &:first-child {
                  color: #EF5A24;
                  font-weight: bold;
                }

                &:last-child {
                  color: #9D1A63;
                }
              }
            }
          }

          i {
            // border: 1px solid #000;
            height: 100%;
            width: 3rem;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2.2rem;
            color: #9D1A63;
          }
        }
      }
    }
  }
</style>