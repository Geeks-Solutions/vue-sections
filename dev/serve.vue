<script>
import Vue from "vue";
// Uncomment import and local "components" registration if library is not registered globally.
import { Sections } from "@/entry.esm";

export default Vue.extend({
  name: "ServeDev",
  components: {
    Sections,
  },
});
</script>

<template>
  <div id="app">
    <Sections />
  </div>
</template>
