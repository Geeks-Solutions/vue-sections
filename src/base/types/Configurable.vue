<template>
  <div class="container text-center">
    <div class="h3 text-capitalize ">{{ formatName(props.name) }}</div>
    <div class="text-danger">
      {{ errorMessage }}
    </div>
    <div class="form-group">
      <form>
        <div
          v-for="(fields, idx) in props.fields"
          :key="idx"
          class=" d-flex justify-content-between"
        >
          <div
            class="element p2"
            :style="{ width: 100 / props.fields.length + '%' }"
            :key="i"
            v-for="(field, i) in fields"
            :class="getType(field.type) !== 'file' ? '' : ''"
          >
            <!-- <div v-if="field.type === 'file' && options[idx][fields[idx]['name']]" class="file-text">
              Selected file : 
              <a class="text-light-blue" :href="options[idx][fields[idx]['name']]">
              {{formatFileName(options[idx][fields[idx]['name']])}}
              </a>
            </div> -->
            <div
              v-if="field.name && options[idx]"
              class="text-capitalize text-left p2"
            >
              {{ field.name.replace("_", " ") }}
            </div>
            <component
              class="d-input"
              :id="field.name"
              :is="getTag(field.type, field.name)"
              :type="getType(field.type)"
              :name="field.name"
              :title="'choose'"
              @input="changeFieldValue($event, idx, field.type, field.name)"
              v-if="options[idx]"
            >
              <option value="no-value">Select a value</option>
              <option
                v-for="option in optionValues.optionValues"
                :selected="
                  parseInt(option.id) === parseInt(options[idx].effect)
                "
                :key="option.id"
                :value="option.id"
                >{{ option.title }}</option
              >
            </component>
            <a
              v-if="field.type === 'file' && savedFile(options, field, idx)"
              :href="savedFile(options, field, idx)"
              target="_blank"
              class="mt-3 text-left d-block text-primary"
              >file : ...{{
                savedFile(options, field, idx).substr(
                  savedFile(options, field, idx).length - 13
                )
              }}
            </a>
          </div>
          <div
            v-if="options[idx] && props.fields && props.fields.length > 1"
            class="deleteRow p1 clickable"
            @click="removeRow(idx)"
          >
            X
          </div>
        </div>
        <div class="text-right" v-if="props.multiple || savedView.multiple">
          <button type="button" @click="addAnother()" class="btn btn-primary">
            Add another
          </button>
        </div>
        <button class="bg-light-blue" type="button" @click="addConfigurable()">
          Submit data
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { formatName } from "../functions";
import { base64Img } from "../helpers";

export default {
  props: {
    props: {
      type: Object,
      default: {}
    },
    savedView: {
      type: Object,
      default: {}
    },
    headers: {
      type: Object,
      default: {}
    }
  },
  apollo: {
    // getSectionOptions: {
    //   query: getSectionOptions,
    //   variables() {
    //     return {
    //       type: this.props.name
    //     }
    //   },
    //   skip() {
    //     return !this.props.dynamicOptions && !this.savedView.dynamicOptions
    //   },
    //   result({ data }) {
    //     const optionValues = data.getSectionOptions[0]
    //     this.optionValues = optionValues
    //   }
    // }
  },
  data() {
    return {
      errorMessage: "",
      settings: {},
      options: [{}],
      optionValues: {}
    };
  },
  computed: {
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
    }
  },
  mounted() {
    // edit
    if (this.savedView.fields) {
      const options = [];
      const fields = [];
      this.savedView.renderData.map((rdata) => {
        const keys = Object.keys(rdata.settings);
        const obj = {};
        keys.map(key => {
          obj[key] = rdata.settings[key];
        });
        options.push(obj);
        const fieldGroup = this.savedView.fields;
        if (fieldGroup[0][0]) {
          fields.push(...fieldGroup);
        } else {
          fields.push(fieldGroup);
        }
      });
      this.options = options;
      this.props.fields = [...fields];
      return;
    }
    if (this.savedView.settings) {
      this.settings.data = this.savedView.settings;
    }
    const ob = this.props.fields[0].length;
    if (this.props.multiple && !ob) {
      this.props.fields = [this.props.fields];
    }
  },
  methods: {
    savedFile(options, field, idx) {
      if (options.length && options[idx]) {
        const filename = options[idx][field.name];
        if (filename && filename.includes("http")) {
          return filename;
        }
        return false;
      }
      return false;
    },
    formatFileName(name) {
      if (!name) {
        return "Choose a file...";
      }
      return "..." + name.substr(name.length - 8);
    },
    removeRow(idx) {
      this.options.splice(idx, 1);
      this.props.fields.splice(idx, 1);
    },
    async changeFieldValue(e, idx, type, fieldname) {
      const value = type === "file" ? e : e.target.value;
      const name = type === "file" ? fieldname : e.target.name;
      if (type === "file") {
        const newfile = await base64Img(e);
        this.options[idx][name] = newfile.base64;
      } else {
        this.options[idx][name] = value;
      }
    },
    addAnother() {
      this.errorMessage = "";
      let errorMessage = "";

      this.options.map(opt => {
        const fields = this.props.fields[0];
        fields.map(field => {
          if (!opt[field.name] || opt[field.name] === "no-value") {
            errorMessage =
              "You must fill your current fields before adding new one";
          }
        });
      });
      if (errorMessage) {
        this.errorMessage = errorMessage;
      } else {
        this.props.fields.push(this.props.fields[0]);
        this.options.push({});
      }
    },
    formatName,
    getTag(type, name) {
      switch (type) {
        case "file":
          return "b-form-file";
        case "string":
          if (
            this.optionValues.field === name &&
            this.optionValues.optionValues
          ) {
            return "select";
          }
          return "input";
      }
    },
    getType(type) {
      switch (type) {
        case "file":
          return "file";
        case "string":
          return "text";
      }
    },
    addConfigurable() {
      this.errorMessage = "";
      let errorMessage = "";
      this.options.map(opt => {
        const fields = this.props.fields[0];
        fields.map(field => {
          if (!opt[field.name] || opt[field.name] === "no-value") {
            errorMessage =
              "You must fill your current fields before submitting.";
          }
        });
      });
      if (errorMessage) {
        this.errorMessage = errorMessage;
        return;
      }
      this.$emit("loading");

      // const options = JSON.stringify(this.options)

      // this.$apollo
      //   .mutate({
      //     mutation: renderSection,
      //     variables: {
      //       settings: {
      //         name: this.props.name,
      //         weight: 0,
      //         options
      //       }
      //     },
      //     context: {
      //       headers: this.headers
      //     }
      //   })
      //   .then(res => {
      //     this.$emit('addSectionType', {
      //       name: this.props.name,
      //       type: 'configurable',
      //       settings: this.options,
      //       id: this.id,
      //       weight: this.weight,
      //       renderData: res.data.renderSection.renderData
      //     })

      //   }).catch(()=>{
      //     this.errorMessage = 'Something went wrong, please try again later'
      //     this.$emit('loading')
      //   })
    }
  }
};
</script>

<style lang="less" scoped>
.element {
  margin: 15px;
  flex-direction: column;
  align-items: flex-start;
  display: flex;
  text-align: left;
  select {
    width: 100%;
    padding: 9px 19px;
    border-radius: 6px;
  }
}

.deleteRow {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 130px;
}

.btn-primary {
  min-width: 100px;
}
</style>
