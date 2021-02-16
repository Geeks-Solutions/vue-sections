<template>
  <div id="app">
    <SectionsMain
      :admin="admin"
      :pageName="pageName"
      :variations="variations"
      :project_id="project_id"
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
    project_id: {
      type: String,
      default: "",
    },
    configsPath: {
      type: String,
      default: "",
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
