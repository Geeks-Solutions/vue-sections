<template>
  <div class="sub-types">
    <div>
      <div class="text-video d-flex" v-show="name">
        <component :is="getComponentForm" :ref="name" />
      </div>
    </div>
    <button
      class="bg-light-blue mt-4 submit-btn"
      type="button"
      @click="sendJsonData"
      :class="{ withTabs }"
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
  },
  data() {
    return {
      withTabs: false,
    };
  },
  computed: {
    getComponentForm() {
      const path = "/forms/" + this.name + ".vue";
      return importComp(path);
    },
  },
  mounted() {
    this.$root.$on("toggleWithTabs", (val) => {
      this.withTabs = val;
    });
  },
  methods: {
    sendJsonData() {
      const valid = this.$refs[this.name].validate();
      if (!valid) {
        return;
      }
      const settings = this.$refs[this.name].settings;
      this.$emit("addStatic", settings);
    },
  },
};
</script>
<style lang="scss">
$sectionsBlue: #31a9db;
.submit-btn {
  border: none;
  font-size: 24px;

  padding: 7px;
  background: $sectionsBlue;
  color: white;
  border-radius: 16px;
  transition: 0.2s;
  width: 385px;
  height: 70px;
  text-align: center;
  &.withTabs {
    margin-left: 14%;
  }
  &:hover {
    background-color: darken($sectionsBlue, 17%);
    transition: 0.2s;
  }
}
</style>
