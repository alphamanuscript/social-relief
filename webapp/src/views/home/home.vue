<template>
  <div class="container">
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
 .container {
   margin-top: 1rem;
   width: 67rem;
  //  border: 1px solid #000;
   padding: 0 2.7rem 0 2.7rem;

   h3 {
     margin-bottom: .5rem;
     color: #9D1A63;
    //  border: 1px solid #000;
     font-size: 1.5rem;
   }

   .call-to-action-msg {
     display: block;
     margin: 2rem 0 2rem 0;
     font-size: .7rem;
     color: #EF5A24;
     font-weight: bold;
    //  border: 1px solid #000;
   }

   .btn-donate {
    //  border: 1px solid #000;
     margin-bottom: 3rem;
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
</style>