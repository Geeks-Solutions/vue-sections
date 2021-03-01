<template>
  <div class="main-select">
    <div class="select base p3" :class="{ selecting: sFocused, selected }">
      <vSelect
        :class="sFocused ? 'sFocused' : 'unsFocused'"
        :options="dataFormatted"
        :value="selected"
        @input="setSelected"
        @search:focus="sFocused = true"
        @search:blur="sFocused = false"
        label="title"
        @search="search"
        :multiple="multiple"
        :placeholder="placeholder"
        ref="mySelect"
      >
        <template v-slot:no-options>
          <div class="no-result p1 p-3">No result</div>
        </template>
        <template slot="option" slot-scope="option" class="text-grey">
          {{ cap(option.pre)
          }}<b class="text-blue">{{
            option.pre !== "" ? option.search : cap(option.search)
          }}</b
          >{{ option.post }}
        </template>
      </vSelect>
      <div class="error-input p4" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import "@/assets/scss/variables.scss";

export default {
  components: {
    vSelect,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    list: {
      type: Array,
      default: () => [
        { id: 1, title: "Banana fruit" },
        { id: 2, title: "Birthday cake" },
        { id: 3, title: "Cheese burger" },
        { id: 4, title: "Large Pizza" },
        { id: 5, title: "Iphone XS" },
      ],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "Select",
    },
    error: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      selected: this.value,
      sFocused: false,
    };
  },
  computed: {
    dataFormatted() {
      return this.list.map((d) => ({
        code: d.id,
        id: d.id,
        title: d.title.toLowerCase(),
        pre: d.title,
        search: "",
        post: "",
      }));
    },
  },
  watch: {
    sFocused(value) {
      this.$emit("isSelectOpen", value);
    },
  },

  methods: {
    triggerClick() {
      this.$refs.mySelect.open = !this.$refs.mySelect.open;
      this.sFocused = !this.sFocused;
    },
    cap(s) {
      if (typeof s !== "string") return "";
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    search(s) {
      this.dataFormatted.map((d) => {
        if (s) {
          const index = d.title.indexOf(s.toLowerCase());
          const [pre, post] = [
            d.title.slice(0, index),
            d.title.slice(index + s.length),
          ];
          d.search = s;
          d.pre = pre;
          d.post = post;
        } else {
          d.search = "";
          d.pre = d.title;
          d.post = "";
        }
      });
    },

    setSelected(value) {
      if (value) {
        this.sFocused = !this.sFocused;
        this.selected = this.cap(value.title);
        this.$emit("change", value);
        //  trigger a mutation, or dispatch an action
      }
    },
  },
};
</script>

<style lang="scss">
$sectionsBlue: #31a9db;
.main-select {
  .select {
    width: 100%;
    border: none;
  }

  .selecting,
  .select.vs__dropdown-toggle {
    border-color: $sectionsBlue;
  }
  // .media-mobile(
  //   {.right {top: 30%; svg {width: 25px; height: 25px;}} .select {width: 100%;}}
  // );
  .no-result {
    padding-top: 10px;
    padding-left: 15px;
    font-style: italic;
    color: $darkGrey;
    text-align: left;
  }

  @keyframes moveright {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
  .selecting,
  .selected {
    .vs__dropdown-toggle {
      border: none;
      border: 2px solid $sectionsBlue;

      position: relative;
    }
  }
  .text-blue {
    color: #262626;
  }
  .select {
    border: none;
    .v-select.sFocused .vs__dropdown-toggle {
      border-color: $sectionsBlue;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  ::-webkit-scrollbar {
    overflow: hidden;
    width: 4px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: $sectionsBlue;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: $black;
    overflow: hidden;
  }

  ul.vs__dropdown-menu {
    max-height: 200px;
    border: 1px solid $sectionsBlue;
    border-radius: 0 0 16px 16px;
  }
  .vs__dropdown-option {
    white-space: inherit;
  }
  .vs__dropdown-option--highlight {
    background: $sectionsBlue;
    .text-blue {
      color: white;
      font-weight: bold;
    }
  }
}
</style>
