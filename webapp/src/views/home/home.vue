<template>
  <div class="outermost-container">
    <section class="section__home">
      <h3>All donations are geared towards helping</h3>
      <h3>those most affected by the covide-19 pandemic.</h3>
      <span class="call-to-action-msg">Click the button below to make your contribution</span>
      <button type="button" class="btn btn-danger btn-donate">Donate</button>
      <div class="stats">
        <h5>Some stats</h5>
        <div class="stats-container">
          <div class="stat">
            <span class="figure">6,563</span>
            <span class="label">Contributors so far</span>
          </div>
          <div class="stat">
            <span class="figure">2.5M+</span>
            <span class="label">Money shared so far</span>
          </div>
          <div class="stat">
            <span class="figure">36,563</span>
            <span class="label">Beneficiaries so far</span>
          </div>
        </div>
      </div>
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
      <h1>Contact Us</h1>
    </section>
  </div>
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
  //  border: 1px solid green;
   width: 100%;
   padding: 0;
   margin: 3.5rem 0 0 0;

   .section__home {
    width: 67rem;
    padding: 0 4rem 0 4rem;
    // border: 1px solid #000;
    margin: 0 auto;


    h3 {
      margin: 0 1.5rem .5rem 1.5rem;
      color: #9D1A63;
      //  border: 1px solid #000;
      font-size: 1.5rem;
    }

    .call-to-action-msg {
      display: block;
      margin: 1.5rem 1.5rem 2rem 1.5rem;
      font-size: .7rem;
      color: #EF5A24;
      font-weight: bold;
      //  border: 1px solid #000;
    }

    .btn-donate {
      //  border: 1px solid #000;
      margin: 0 1.5rem 3rem 1.5rem;
      //  margin-bottom: 3rem;
      width: 12rem;
      border-radius: .5rem;
      background: darken(#ED1C24, .9);
      color: #fff;
      font-weight: bold;
      font-size: 1.2rem;
      transition: all 0.5s;
      box-shadow: 0 2px 5px #E2E2E2;

      &:hover {
        background-image: linear-gradient(to bottom, #ED1C24, #9D1A63);
      }
    }

    .stats {
      //  border: 1px solid #000;

      h5 {
        margin: 0 1.5rem 1rem 1.5rem;
        color: #ED1C24;
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
            color: #ED1C24
          }

          .label {
            margin-top: -.7rem;
            font-size: 1rem;
          }
        }
      }
    }
   }

   .section__about-us {
     width: 67rem;
    //  border: 1px solid #000;
     padding: 0 4rem 0 4rem;
     margin: 0 auto;

     h1 {
       margin: 2rem 1.5rem 1rem 1.5rem;
       color: #ED1C24; 
     }

     p {
      //  border: 1px solid #000;
       margin: 1.5rem 1.5rem 2rem 1.5rem;

       span {
        //  border: 1px solid #000;
         display: block;
         font-size: .9rem;
         font-weight: 400;
       }
     }

     .partners {
      //  border: 1px solid #000;
       margin: 4rem 0;

       h5 {
        //  border: 1px solid #000;
         margin: 0 1.5rem 2rem 1.5rem;
         color: #9D1A63;
       }

       .partner-container {
        //  border: 1px solid #000;
         height: 4.2rem;
         display: flex;
         border-radius: .7rem;
         box-shadow: 0 2px 5px #E2E2E2;

         .partner {
            // border: 1px solid #000;
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
              // border: 1px solid #000;
              background-color: #9D1A63;
            }
         }
       }
     }
   }

   .section__contact-us {
    //  border: 1px solid #000;
     height: 30rem;
     width: 67rem;
     margin: 0 auto;
     padding: 0 4rem 0 4rem;

     h1 {
       margin: 2rem 1.5rem 1rem 1.5rem;
       color: #ED1C24; 
     }
   }
 }
</style>