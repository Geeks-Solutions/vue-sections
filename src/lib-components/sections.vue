<template>
    <SectionsMain
      :admin="admin"
      :pageName="pageName"
      :variations="variations"
      :lang="lang"
    />
</template>

<script>
import "../assets/scss/variables.scss"
import SectionsMain from "../base/index.vue";
export default {
  name: "Sections",
  props: {
    pageName: {
      type: String,
      default: "",
    },
    lang: {
      type: String,
      default: "en",
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SectionsMain,
  },
};
</script>
