<template>
  <div id="app">
    <SectionsMain
      :admin="admin"
      :pageName="'contact_us'"
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
      default: "default",
    },
    admin: {
      type: Boolean,
      default: true,
    },
    project_id: {
      type: String,
      default: "5f5ef6682a4e7d1a619112b7",
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
