<template>
  <div>
    <h4>Adding section...</h4>
  </div>
</template>

<script>
export default {
  props: {
    props: {
      type: Object,
      default: {},
    },
    savedView: {
      type: Object,
      default: {},
    },
    headers: {
      type: Object,
      default: {},
    },
  },
  computed: {
    id() {
      if (this.savedView.id) {
        return this.savedView.id;
      }
      return "id-" + Date.now();
    },
    weight() {
      if (this.savedView.weight) {
        return this.savedView.weight;
      }
      return null;
    },
  },
};
</script>
