<template>
  <div class="custom-dialog" @click="handleClick('custom-dialog', $event)" :style="getStyleObject()">
    <div class="backdrop" @click="handleClick('backdrop', $event)">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: ['show'],
  computed: {
    imageUrl () {
      return require(`@/assets/Social Relief Logo_1.svg`);
    }
  },
  methods: {
    getStyleObject() {
      return { visibility: this.show ? 'visible' : 'hidden' };
    },
    handleClick(clickedDiv, event) {
      if (clickedDiv === 'custom-dialog') {
        this.$emit('updated:show', false);
      } 
      else event.stopPropagation();
    },
  }
}
</script>
<style lang="scss">
  .custom-dialog {
    width: 100vw;
    height: 100vh;
    background-color: rgba(#000, 60%);
    top: 0;
    overflow: auto;
    position: fixed;
    z-index: 99999;
    visibility: hidden;

    .backdrop {
      min-height: 57%;
      max-height: 92%;
      width: 22%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: .8rem;
      background-color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }
  }
</style>