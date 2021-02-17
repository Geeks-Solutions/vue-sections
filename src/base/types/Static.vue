<template>
  <div class="text-center">
    <div class="element-type">
      <h3>{{ props.name }}</h3>
      <form>
        <div>
          <subType :path="props.path" :name="props.name" @addStatic="addStatic">
            <slot />
          </subType>
        </div>
      </form>
    </div>
    <!-- get access to the imported static component -->
    <component :is="component" v-show="false" ref="importedComponent" />
  </div>
</template>

<script>
import subType from "../subType.vue";
export default {
  components: {
    subType,
  },
  props: {
    props: {
      type: Object,
      default: () => {},
    },
    savedView: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      myHtml: "",
      elements: [],
      imported: false,
    };
  },
  computed: {
    component() {
      console.log("Static.vue: ", this.props);
      const path = this.props.path + "/views/" + this.props.name + ".vue";
      return import(path);
    },
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

  mounted() {
    if (this.savedView.settings) {
      this.settings.data = this.savedView.settings.data;
    }
    setTimeout(() => {
      this.elements = this.$refs.importedComponent.fields;
    }, 10);
  },
  methods: {
    addStatic(settings) {
      this.$emit("addSectionType", {
        name: this.props.name,
        type: "static",
        settings,
        id: this.id,
        weight: this.weight,
      });
    },
  },
};
</script>

<style lang="scss">
.dashboard {
  button {
    background: black;
    margin: 10px;
    width: auto;
    height: auto;
    max-height: auto;
    padding: 5px;
    min-width: 0;
    max-width: 1000px;
  }
}
</style>
