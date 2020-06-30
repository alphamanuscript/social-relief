<template>
  <b-container fluid="md">
    <section>
      <div>
        <h3 class="text-secondary">
            All donations are geared towards helping those most affected by the covid-19 pandemic.
        </h3>
        <div class="py-3">
          <h6 class="text-primary">Click the button below to make your contribution.</h6>
        </div>
        <div class="pb-3">
          <b-button pill variant="primary" class="px-5 btn-donate">Donate</b-button>
        </div>
      </div>
    
      <div class="my-3">
        <h4 class="text-primary">Some stats</h4>
        <b-row class="shadow bg-white rounded px-4 pt-4 pb-3">
          <b-col sm="12" md="4">
            <p class="text-secondary font-weight-bold text-center h1 mb-0 ">6,563</p>
            <p class="font-weight-bold text-center">Contributors so far</p>
          </b-col>
          <b-col sm="12" md="4">
            <p class="text-primary font-weight-bold text-center h1 mb-0">2.5M+</p>
            <p class="font-weight-bold text-center">Money shared so far</p>
          </b-col>
          <b-col sm="12" md="4">
            <p class="text-primary font-weight-bold text-center h1 mb-0">36,563</p>
            <p class="font-weight-bold text-center">Beneficiaries so far</p>
          </b-col>
        </b-row>
      </div>
    </section>
  </b-container>
  <!-- <div class="outermost-container">
    
    <section class="section__beneficiaries">
      <h1>The Beneficiaries</h1>
      <p>
        <span>All nominees get <span class="max-amount-per-month">Ksh 3,500</span> to get basic supplies during this trying period</span>
        <span>Here are some of the people that your contribution will go along to</span>
        <span>help them</span>
      </p>
      <p>
        <span>Your contribution will go a long to touch the lives of</span>
        <span class="beneficiary-figure">13,600+</span>
        <span>people who are currently enlisted as beneficiaries from this system</span>
      </p>
      <p>
        We at social relief want to say a big <span>thank you</span> for your kindness and support
      </p>
    </section>
    <section class="section__about-us">
      <h1>About Us</h1>
      <p>
        <span>All nominees get kshs*** to get basic supplies during this</span>
        <span>trying period.  Here are some of the people that your contribution will </span>
        <span>go a long way to help them.</span>
      </p>
      <p>
        <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span>
        <span>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</span>
      </p>
      <div class="partners">
        <h5>Our partners</h5>
        <div class="partner-container">
          <div class="partner">
            <span class="partner-img-container"></span>
          </div>
          <div class="partner">
            <span class="partner-img-container"></span>
          </div>
          <div class="partner">
            <span class="partner-img-container"></span>
          </div>
          <div class="partner">
            <span class="partner-img-container"></span>
          </div>
          <div class="partner">
            <span class="partner-img-container"></span>
          </div>
          <div class="partner">
            <span class="partner-img-container"></span>
          </div>
        </div>
      </div>
    </section>
    <section class="section__contact-us">
      <div class="contact-us-form-container">
        <h1>Contact Us</h1>
        <div class="map-and-form">
          <div class="map-container"></div>
          <div class="form-container"></div>
        </div>
      </div>
      <div class="footer">
        <span>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</span>
        <span>privacy policy • terms of use	</span>
        <span>(c)2020</span>
      </div>
    </section>
  </div> -->
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'home',
  components: { }, 
  computed: {
    ...mapState(['user'])
  }
}
</script>
<style lang="scss" scoped> 
 .outermost-container {
   width: 100%;
   padding: 0;
   margin: 0;

   .section__home {
    width: 67rem;
    padding: 0 4rem 0 4rem;
    margin: 0 auto;


    h3 {
      margin: 0 1.5rem .5rem 1.5rem;
      color: #9D1A63;
      font-size: 1.5rem;
    }

    .call-to-action-msg {
      display: block;
      margin: 1.5rem 1.5rem 2rem 1.5rem;
      font-size: .7rem;
      color: #EF5A24;
      font-weight: bold;
    }

    .btn-donate {
      margin: 0 1.5rem 3rem 1.5rem;
      width: 12rem;
      border-radius: .5rem;
      background: darken(#EF5A24, .9);
      color: #fff;
      font-weight: bold;
      font-size: 1.2rem;
      transition: all 0.5s;
      box-shadow: 0 2px 5px #E2E2E2;
      border: none;

      &:hover {
        background-image: linear-gradient(to bottom, #EF5A24, #9D1A63);
      }
    }

    .stats {
      //  border: 1px solid #000;

      h5 {
        margin: 0 1.5rem 1rem 1.5rem;
        color: #EF5A24;
        font-weight: bold;
      }

      .stats-container {
        display: flex;
        border-radius: .7rem;
        box-shadow: 0 2px 5px #E2E2E2;

        .stat {
          flex-grow: 1; 
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 9.7rem;

          &:first-child {
              border-radius: 0.7rem 0 0 0.7rem;
              span:first-child {
                color: #9D1A63
              }
          }

          &:last-child {
              border-radius: 0 0.7rem 0.7rem 0;
              span:first-child {
                color: #EF5A24
              }
          }

          .figure {
            font-size: 3rem;
            font-weight: 500;
            color: #EF5A24;
          }

          .label {
            margin-top: -.7rem;
            font-size: 1rem;
          }
        }
      }
    }
   }

   .section__beneficiaries {
     width: 67rem;
    //  border: 1px solid #000;
     padding: 0 4rem 0 4rem;
     margin: 0 auto;
     text-align: center;

     h1 {
       display: inline-block;
      //  border: 1px solid #000;
       margin: 2rem 0 1rem 0;
       color: #EF5A24;
       font-weight: bold;
     }

     p {
       margin: 1.5rem 1.5rem 3rem 1.5rem;
       font-size: .9rem;

       span {
         display: block;
       }

       .max-amount-per-month {
         display: inline-block;
         font-weight: bold;
         color: #9D1A69;
       }

       .beneficiary-figure {
         font-size: 4rem;
         font-weight: bold;
         color: #ED1C24; 
       }

       &:last-child {
         span {
           display: inline-block;
           color: #9D1A63;
         }
       }
     }
   }

   .section__about-us {
     width: 67rem;
     padding: 0 4rem 0 4rem;
     margin: 0 auto;

     h1 {
       margin: 2rem 1.5rem 1rem 1.5rem;
       color: #EF5A24; 
     }

     p {
       margin: 1.5rem 1.5rem 2rem 1.5rem;

       span {
         display: block;
         font-size: .9rem;
         font-weight: 400;
       }
     }

     .partners {
       margin: 4rem 0;

       h5 {
         margin: 0 1.5rem 2rem 1.5rem;
         color: #9D1A63;
       }

       .partner-container {
         height: 4.2rem;
         display: flex;
         border-radius: .7rem;
         box-shadow: 0 2px 5px #E2E2E2;

         .partner {
            flex-grow: 1; 
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            &:first-child {
              border-radius: 0.7rem 0 0 0.7rem;
            }

            &:last-child {
              border-radius: 0 0.7rem 0.7rem 0;
            }

            span {
              width: 2.7rem;
              height: 2.7rem;
              border-radius: 50%;
              background-color: #9D1A63;
            }
         }
       }
     }
   }

   .section__contact-us {
     height: 45rem;
     margin: 0 auto;
    position: relative;

    .contact-us-form-container {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%);
      width: 67rem;
      z-index: 999;

      h1 {
        margin: 2rem 4rem 1rem 4rem;
        padding: 0 1.5rem 0 1.5rem;
        color: #EF5A24;
      }

      .map-and-form {
        border-radius: .7rem;
        height: 30rem;

        .map-container {}

        .form-container {}
      }
    }

    .footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 15rem;
      background-color: #9D1A63;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding-bottom: 1.5rem;

      span {
        display: block;
        color: #F5F5F5;
        font-size: .9rem;
        margin-bottom: .4rem;

        &:first-child, &:last-child {
          font-weight: bold;
        }
      }

    }
   }
 }
</style>