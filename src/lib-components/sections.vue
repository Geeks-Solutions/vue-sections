<template>
  <div id="app">
    <SectionsMain
      :admin="admin"
      :pageName="pageName"
      :variations="variations"
    />
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import SectionsMain from "../base/index.vue";
export default {
  name: "Sections",
  props: {
    pageName: {
      type: String,
      default: "",
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SectionsMain,
  },
  computed: {
    variations() {
      return [];
    },
  },
};
</script>
