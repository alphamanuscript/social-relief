<template>
  <b-button class="bg-white border-0 text-secondary" @click="handleGoogleButton">
      <i class="fab fa-google text-primary mr-2"></i>
      <span >{{ text }}</span>
  </b-button>
</template>

<script>
import { googleSignIn } from '../store/util';
export default {
    name: 'google-button',
    props: {
        text: {
            type: String,
            required: true
        }
    },
    methods: {
        async handleGoogleButton() {
            await googleSignIn()
            .then( (user) => {
                this.$emit('success:google-login', user);
            })
            .catch( (err) => {
                this.$emit('failure:google-login', err.error);
            })
        }
    }
}
</script>
