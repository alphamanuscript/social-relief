<template>
  <div class="outermost-container">
    <div class="inner-container">
      <div class="top-nav">
        <div class="links">
          <span class="nominate-btn">Nominate</span>
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
      <div class="page-intro">
        <h3>Beneficiaries</h3>
        <p>
          <span>All nominees get <span class="max-amount-per-month">Ksh 3,500</span> to purchase basic supplies during this trying period. Your contribution will go a long way touch the lives of <span class="beneficiary-count">13,600 +</span> people who </span>
          <span>are currently enlisted as beneficiaries of this system. We at social relief want to say a big <span class="thank-you-span">THANK YOU</span> for your kindness and support.</span>
        </p>
      </div>
      <div class="my-nominees">
        <h3>My Nominees</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <td></td>
                <td>Name</td>
                <td>Middleman</td>
                <td>Host</td>
                <td>Location</td>
                <td>Progress</td>
                <td>Status</td>
                <td>Date</td>
                <td>Expand</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.</td>
                <td>Mama Yake</td>
                <td>N/a</td>
                <td>N/a</td>
                <td>Mukuru</td>
                <td>100%</td>
                <td class="status">Completed</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>2.</td>
                <td>Mama Yake 2</td>
                <td>Baba Yake</td>
                <td>Baba Yake</td>
                <td>Kibera</td>
                <td>75%</td>
                <td class="status">Ongoing</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>3.</td>
                <td>Mama Yake</td>
                <td>N/a</td>
                <td>N/a</td>
                <td>Mukuru</td>
                <td>100%</td>
                <td class="status">Completed</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>4.</td>
                <td>Mama Yake 2</td>
                <td>Baba Yake</td>
                <td>Baba Yake</td>
                <td>Kibera</td>
                <td>75%</td>
                <td class="status">Ongoing</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>5.</td>
                <td>Mama Yake</td>
                <td>N/a</td>
                <td>N/a</td>
                <td>Mukuru</td>
                <td>100%</td>
                <td class="status">Completed</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>6.</td>
                <td>Mama Yake 2</td>
                <td>Baba Yake</td>
                <td>Baba Yake</td>
                <td>Kibera</td>
                <td>75%</td>
                <td class="status">Ongoing</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>7.</td>
                <td>Mama Yake</td>
                <td>N/a</td>
                <td>N/a</td>
                <td>Mukuru</td>
                <td>100%</td>
                <td class="status">Completed</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>8.</td>
                <td>Mama Yake 2</td>
                <td>Baba Yake</td>
                <td>Baba Yake</td>
                <td>Kibera</td>
                <td>75%</td>
                <td class="status">Ongoing</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>9.</td>
                <td>Mama Yake</td>
                <td>N/a</td>
                <td>N/a</td>
                <td>Mukuru</td>
                <td>100%</td>
                <td class="status">Completed</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
              <tr>
                <td>10.</td>
                <td>Mama Yake 2</td>
                <td>Baba Yake</td>
                <td>Baba Yake</td>
                <td>Kibera</td>
                <td>75%</td>
                <td class="status">Ongoing</td>
                <td>12-04-2020</td>
                <td><i class="fas fa-expand"></i></td>
              </tr>
            </tbody>
          </table>
          <div class="table-nav">
            <span class="page-count">1 of 3 pages</span>
            <span class="more-btn">More ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'beneficiaries',
  components: { }, 
  computed: {
    ...mapState(['user'])
  }
}
</script>
<style lang="scss" scoped>
  .outermost-container {
    // border: 1px solid #000;
    .inner-container {
      // border: 1px solid #000;

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
            height: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
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

      .page-intro {
        // border: 1px solid #000;
        margin-top: .6rem;

        h3 {
          color: #EF5A24;
        }

        p {
          margin-top: 1rem;
          // border: 1px solid #000;
          font-size: .8rem;

          span {
            // border: 1px solid #000;
            display: block;
            margin-bottom: .1rem;

            &:first-child {
              span {
                display: inline-block;
                color: #9D1A63;
              }
            }

            &:last-child {
              span {
                display: inline-block;
                color: #9D1A63;
              }
            }
          }
        }
      }

      .my-nominees {
        margin-top: 1.0rem;
        // border: 1px solid #000;
        h3 {
          color: #EF5A24;
        }

        .table-container {
          // border: 1px solid #000; 
          background-color: #FFF;
          height: 25rem;
          border-radius: .8rem;
          box-shadow: 0 2px 5px #E2E2E2;

          table {
            // border: 1px solid green;
            border-radius: .8rem;
            width: 100%;
            border-collapse: collapse;
            text-align: left;

            thead {
              // border: 1px solid #000;
              font-weight: bold;
              font-size: .9rem;

              tr {
                height: 2.5rem;

                td {
                  white-space: nowrap;

                  &:first-child{
                    width: 3rem;
                  }

                  &:nth-child(2){
                    padding-left: 2rem; 
                  }

                  &:nth-child(6) {
                    text-align: right;
                    padding-right: 2rem;
                  }

                  &:last-child {
                    text-align: center;
                  }
                }
              }
            }

            tbody {
              // border: 1px solid red;
              font-size: .9rem;
              font-weight: 400;

              tr {
                &:nth-child(odd) {
                  background-color: #F5F5F5;
                  height: 1.8rem;

                  .status {
                    color: #34A20B
                  }
                }

                &:nth-child(even) {
                  height: 2.2rem;
                  .status {
                    color: #EF5A24
                  }
                }

                td {
                  &:first-child{
                    text-align: right; 
                  }

                  &:nth-child(2){
                    padding-left: 2rem; 
                  }

                  &:nth-child(6) {
                    text-align: right;
                    padding-right: 2rem;
                    color: #9D1A63;
                  }

                  &:last-child {
                    text-align: center;
                    color: #EF5A24
                  }
                }
              }
            }
          }

          .table-nav {
            // border: 1px solid #000;
            width: 91%;
            margin: auto;
            height: 2.4rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: .7rem;

            .page-count {
              // border: 1px solid #000;
              color: #9D1A63;
            }

            .more-btn {
              // border: 1px solid #000;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 3rem;
              width: 7rem;
              height: 1.7rem;
              text-align: center;
              background: #EF5A24;
              color: #fff;
              transition: all 0.5s;
              box-shadow: 0 2px 5px #E2E2E2;
              border: none;
              font-weight: bold;

              &:hover {
                background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
              }
            }

          }
        }
      }
    }
  }
</style>