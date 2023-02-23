<template>
  <div class="container containerWidth text-center">

    <div class="flex d-inline-flex w-full justify-center ml-2 md:ml-0">
      <div class="bg-info px-2 h-45px flex justify-center items-center rounded-tl-lg" :class="currentTab === 'config' ? 'bg-info' : 'bg-light border border-Blue'" style="border-top-left-radius: 10px 10px;" @click="currentTab = 'config';">
        <div
            class="font-light mt-2 mb-2"
            :class="currentTab === 'config' ? 'text-white' : 'text-info'"
            style="cursor: pointer"
        >
          <div class="text-capitalize ">{{ formatName(props.name) }}</div>
        </div>
      </div>
      <div v-if="showCustomFormTab === true" class="bg-info px-2 h-45px flex justify-center items-center rounded-br-lg" :class="currentTab === 'custom' ? 'bg-info' : 'bg-light border border-Blue'" style="border-bottom-right-radius: 10px 10px;" @click="currentTab = 'custom';">
        <div
            class="font-light mt-2 mb-2"
            :class="currentTab === 'custom' ? 'text-white' : 'text-info'"
            style="cursor: pointer"
        >
          {{ $t('Custom form') }}
        </div>
      </div>
    </div>

    <div v-show="currentTab === 'config'">
      <div class="text-danger">
        {{ errorMessage }}
      </div>
      <div class="form-group">
        <form>
          <div
              class=" d-flex flex-column justify-content-between"
          >
            <div
                class="element p2 d-inline-block"
                :key="idx"
                v-for="(field, idx) in props.fields"
                :class="getType(field.type) !== 'file' ? '' : ''"
            >
              <!-- <div v-if="field.type === 'file' && options[idx][fields[idx]['name']]" class="file-text">
                Selected file :
                <a class="text-light-blue" :href="options[idx][fields[idx]['name']]">
                {{formatFileName(options[idx][fields[idx]['name']])}}
                </a>
              </div> -->
              <div
                  v-if="field.name && field.type !== 'hidden'"
                  class="text-capitalize text-left p2"
              >
                {{ field.name.replace("_", " ") }}
              </div>
              <div v-if="field.type === 'wysiwyg'">
                <div class="input">
                  <quill-editor v-model="optionsData[field.key]" :ref="field.type+'Editor'" class="wyzywig" @change="onEditorChange($event, idx, field.key)" />
                </div>
              </div>
              <div v-else-if="field.type === 'textarea'">
                <textarea
                    v-model="optionsData[field.key]"
                    class="d-input form-control"
                    :name="field.name"
                    @change="changeFieldValue($event, idx, field.type, field.key)"
                />
              </div>
              <div v-else>
                <div v-if="field.type === 'media' && optionsData[field.key] && optionsData[field.key].files">
                  <img
                      v-if="optionsData[field.key].files[0].url"
                      :src="optionsData[field.key].files[0].url"
                      alt="image"
                      class="w-95px h-63px object-contain"
                  />
                </div>
                <div v-else-if="field.type === 'media' && previewMedia">
                  <img
                      :src="previewMedia"
                      alt="image"
                      class="w-95px h-63px object-contain"
                  />
                </div>
                <component
                    :value="optionsData[field.key]"
                    class="d-input form-control"
                    :id="field.key"
                    :is="getTag(field.type, field.name)"
                    :type="getType(field.type)"
                    :name="field.name"
                    :title="'choose'"
                    @input="changeFieldValue($event, idx, field.type, field.key)"
                >
                  <option value="no-value">Select a value</option>
                  <option
                      v-for="option in optionValues.option_values"
                      :selected="
                  parseInt(option.id) === parseInt(options[idx].effect)
                "
                      :key="option.id"
                      :value="option.id"
                  >{{ option.title }}</option
                  >
                </component>
              </div>
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
          <button class="form-control bg-info text-white" type="button" @click="addConfigurable()">
            Submit data
          </button>
        </form>
      </div>
    </div>

    <div v-show="currentTab === 'custom'" class="sub-types">
      <div>
        <div class="text-video d-flex" v-show="formatName(props.name)">
          <component :is="getComponentForm" :ref="formatName(props.name)" :section-settings="props" @whitelistIdUpdated="updateWhitelistId" @load="(value) => $emit('load', value)" @customFormLoaded="showCustomFormTab = true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import {formatName, base64Img, sectionHeader, importComp} from "../helpers";
import axios from "axios";
import { quillEditor } from "vue-quill-editor";
import {globalFileUpload} from "@/lib-components";

export default {
  components: {
    quillEditor,
  },
  props: {
    props: {
      type: Object,
      default: () => {},
    },
    savedView: {
      type: Object,
      default: {},
    },
    headers: {
      type: Object,
      default: {},
    },
    html: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      errorMessage: "",
      settings: {},
      options: [{}],
      optionValues: {},
      currentTab: 'config',
      optionsData: {},
      showCustomFormTab: false,
      previewMedia: ""
    };
  },
  watch: {
    settings() {
      this.$emit('settingsUpdate', this.settings)
    },
    html() {
      this.settings = this.html
    }
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
    },
    getComponentForm() {
      let path = "";
      if (this.props.name.includes(":")) {
        path = "/forms/" + this.props.name.split(":")[1];
      } else {
        path = "/forms/" + this.props.name;
      }
      return importComp(path);
    },
  },
  mounted() {
    // edit
    if (this.savedView.fields) {
      const options = [];
      const fields = [];
      let savedViewData = {};
      if (this.savedView.render_data) {
        savedViewData = this.savedView.render_data
      } else {
        savedViewData = this.savedView.renderData
      }
      savedViewData.map((rdata) => {
        const keys = Object.keys(rdata.settings);
        const obj = {};
        keys.map((key) => {
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
      Object.assign(this.optionsData, this.options[0])
      this.props.fields = [...fields[0]];
      return;
    } else {
      this.props.fields.forEach((field) => {
        this.options[0][field.key] = "";
      });
    }

    if (this.savedView.settings) {
      this.settings.data = this.savedView.settings;
    }

    const ob = this.props.fields[0].length;
    if (this.props.multiple && !ob) {
      this.props.fields = [this.props.fields];
    }

    if (this.props.dynamic_options || this.savedView.dynamic_options){
      this.$emit("loading");
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const URL =
        this.$sections.serverUrl +
        `/project/${this.$sections.projectId}/section/${this.props.name}/options`;
      
      axios
        .get(URL, config)
        .then((res) => {
          //TODO this should be updated to iterate over all the elements of the data array 
          //and key the result by the `field` key in the object
          this.optionValues = res.data[0]
          this.$emit("loading");
        })
        .catch((err) => {
          this.$emit("loading");
          this.showToast("Error", "danger", err.response.data.message.toString());
        });
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
      const value = type === "file" || type === "media" ? e : e.target.value;
      const name = type === "file" || type === "media" ? fieldname : e.target.name;
      if (type === "file" || type === "media") {
        await this.mediaUpload(e, idx, name);
      } else if(type === 'integer') {
        this.options[0][name] = parseInt(value);
      } else if(type === 'textarea') {
        this.options[0][name] = value;
      } else {
        this.options[0][name] = value;
      }
    },
    async mediaUpload(e, idx, name) {
      const media = {
        id: "",
        files: [
          {
            filename: "",
            url: ""
          }
        ]
      };
      await globalFileUpload(e, this.options[0][name]).then(
          (result) => {
            media.files[0].url = result.data.files[0].url;
            media.files[0].filename = result.data.files[0].filename;
            media.id = result.data.id;
            this.previewMedia = media.files[0].url;
            this.options[0][name] = media;
          }
      )
    },
    onEditorChange({ quill, html, text }, idx, fieldname) {
      this.options[0][fieldname] = html;
    },
    addAnother() {
      this.errorMessage = "";
      let errorMessage = "";

      this.options.map((opt) => {
        const fields = this.props.fields[0];
        fields.map((field) => {
          if (!opt[field.name] || opt[field.name] === "no-value") {
            errorMessage =
              "You must fill your current fields before adding a new one";
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
        case "integer":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "input";
        case "file":
          return "b-form-file";
        case "media":
          return "b-form-file";
        case "string":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "input";
        case "textfield":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "input";
        case "textarea":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "textarea";
      }
    },
    getType(type) {
      switch (type) {
        case "file":
          return "file";
        case "media":
          return "file";
        case "string":
          return "text";
        case "integer":
          return "text";
        case "textfield":
          return "text";
        case "textarea":
          return "text";
      }
    },
    addConfigurable() {
      this.errorMessage = "";
      let errorMessage = "";
      Object.keys(this.options[0]).map((key, i) => {
        const fields = this.props.fields[i];
        if (!this.options[0][key] || this.options[0][key][fields.key] === "no-value") {
          errorMessage =
              "You must fill your current fields before submitting.";
        }
      });
      if (errorMessage) {
        this.errorMessage = errorMessage;
        return;
      }
      this.$emit("load", true);

      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const options = JSON.stringify(this.options)

      const variables = {
        section: {
              name: this.props.name.includes(":") ? this.props.name : `${this.savedView.application_id}:${this.props.name}`,
              weight: 1,
              options: this.options
            }
      };
      const URL =
        this.$sections.serverUrl +
        `/project/${this.$sections.projectId}/section/render`;

      axios
        .post(URL, variables, config)
        .then((res) => {
          this.$emit("load", false);
          if (res.data && res.data.error) {
            this.$emit('errorAddingSection', {
              closeModal: false,
              title: "Error adding "+ this.props.name,
              message: res.data.error
            })
            return;
          }
          this.$emit('addSectionType', {
            name: this.props.name.split(":")[1],
            nameID: this.props.name.includes(":") ? this.props.name : `${this.savedView.application_id}:${this.props.name}`,
            type: 'configurable',
            settings: this.options[0],
            id: this.id,
            weight: this.weight,
            render_data: res.data.render_data
          })
        })
        .catch(() => {
          this.$emit("load", false);
          this.$emit('errorAddingSection', {
              closeModal: false,
              title: "Error adding "+ this.props.name,
              message: "We couldn't save your changes, try again later"
            })
        });
    },
    showToast(title, variant, message) {
      const inBrowser = typeof window !== 'undefined';
      if(inBrowser){
        this.$bvToast.toast(message, {
          title,
          variant,
          solid: true,
          toaster: "b-toaster-top-right",
        });
      } else {
        console.log(`## ${variant} ## ${title}: ${message}`)
      }
    },
    updateWhitelistId(id) {
      this.optionsData['whitelist_id'] = id;
      this.options[0]['whitelist_id'] = id;
    }
  },
};
</script>

<style lang="scss" scoped>
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

.containerWidth {
  min-width: 800px;
}
</style>
