<template>
  <div class="sub-types">
    <div>
      <div class="text-video" v-if="name">
        <component :is="getComponentForm" :ref="name" />
      </div>
    </div>
    <button
      class="bg-light-blue mt-4 submit-btn"
      type="button"
      @click="sendJsonData"
    >
      Submit data
    </button>
  </div>
</template>

<script>
import { importComp } from "../base/helpers";

export default {
  props: {
    name: {
      type: String,
      default: "",
    },
    compType: {
      type: String,
      default: "",
    },
  },
  methods: {
    sendJsonData() {
      const settings = this.$refs[this.name].settings;
      this.$emit("addStatic", settings);
    },
  },
  computed: {
    getComponentForm() {
      const path = "/forms/" + this.name;
      return importComp(path, this.compType);
    },
  },
};
</script>
<style lang="scss">
.submit-btn {
  border: none;
  font-size: 16px;
  padding: 7px;
  background: palevioletred;
  color: white;
  border-radius: 3px;
}
</style>
