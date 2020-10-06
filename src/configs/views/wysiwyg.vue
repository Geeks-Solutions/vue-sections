<template>
  <div v-html="html" />
</template>

<script>
export default {
  props: {
    section: {
      type: Object,
      default: {}
    }
  },
  computed: {
    html() {
      if (this.section.settings) {
        return this.section.settings;
      }
      return "not found";
    }
  }
};
</script>

<style></style>
