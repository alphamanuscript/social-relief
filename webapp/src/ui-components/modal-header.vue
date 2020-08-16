<template>
  <div class="d-flex flex-column m-auto">
    <img :src="imageUrl" width="70" alt="Social Relief Logo" class="m-4">
    <h4 class="text-secondary text-center">{{ title }}</h4>
  </div>
</template>
<script>
export default {
  name: 'modal-header',
  props: {
    title: String
  },
  computed: {
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    }
  }
}
</script>