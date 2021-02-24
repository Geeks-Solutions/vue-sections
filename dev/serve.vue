<script>
import Vue from "vue";
// Uncomment import and local "components" registration if library is not registered globally.

export default Vue.extend({
  name: "ServeDev",
  components: {},
});
</script>

<template>
  <div id="app">
    <Sections :admin="true" :pageName="'contact_us'" :variations="[]" />
  </div>
</template>
