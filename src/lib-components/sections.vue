<template>
  <div id="app">
    <SectionsMain
      :admin="admin"
      :pageName="pageName"
      :variations="variations"
      :lang="lang"
      @load="loaded"
    />
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
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
  computed: {
    variations() {
      return [];
    },
  },
  methods: {
    loaded(e) {
      this.$emit('finishLoad', e)
    },
  },
}
</script>
