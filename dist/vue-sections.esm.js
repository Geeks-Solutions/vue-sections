import VueI18n from 'vue-i18n';
import axios from 'axios';
import { BAlert, BModal, ToastPlugin } from 'bootstrap-vue';
import draggable from 'vuedraggable';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import VueCookies from 'vue-cookies';

function loadLocaleMessages() {
  const en = require("../src/lang/en.json");

  const fr = require("../src/lang/fr.json");

  return {
    "en": en,
    "fr": fr
  };
}

var initI18n = new VueI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: loadLocaleMessages()
});

const base64Img = file => {
  const reader = new FileReader();
  return new Promise(resolve => {
    reader.onload = e => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(",")[1];
      resolve({
        base64,
        name: file.name,
        size: file.size,
        type: file.type,
        raw: dataUrl
      });
    };

    reader.readAsDataURL(file);
  });
}; // name for the section time when you choose one in the popup

function formatName(name) {
  switch (name) {
    default:
      return name.split(":")[name.split(":").length - 1].replace(/_/g, " ") || "unlabled";
  }
}
const importComp = path => {
  return () => import(`@/sections${path}.vue`).catch(err => import(`../src/configs${path}.vue`).catch(err => {
    throw new Error(`vue-sections: can't find the file in your filesystem: @/sections${path}.vue`);
  }));
};
const sectionHeader = header => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000 + 1);
  const header_key = `project-id-${timestamp}-${random}`;
  header[header_key] = "a3b2cd1";

  if (header.origin) {
    header['access-control-request-headers'] = header_key;
  }

  return header;
};

//
var script$9 = {
  props: {
    name: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      withTabs: false
    };
  },

  computed: {
    getComponentForm() {
      const path = "/forms/" + this.name;
      return importComp(path);
    }

  },

  mounted() {
    this.$root.$on("toggleWithTabs", val => {
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
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__$9 = script$9;
/* template */

var __vue_render__$k = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "sub-types"
  }, [_c('div', [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.name,
      expression: "name"
    }],
    staticClass: "text-video d-flex"
  }, [_c(_vm.getComponentForm, {
    ref: _vm.name,
    tag: "component"
  })], 1)]), _vm._v(" "), _c('button', {
    staticClass: "bg-light-blue mt-4 submit-btn",
    class: {
      withTabs: _vm.withTabs
    },
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.sendJsonData
    }
  }, [_vm._v("\n    Submit data\n  ")])]);
};

var __vue_staticRenderFns__$k = [];
/* style */

const __vue_inject_styles__$k = function (inject) {
  if (!inject) return;
  inject("data-v-1e35f122_0", {
    source: ".submit-btn{border:none;font-size:24px;padding:7px;background:#31a9db;color:#fff;border-radius:16px;transition:.2s;width:385px;height:70px;text-align:center}.submit-btn.withTabs{margin-left:14%}.submit-btn:hover{background-color:#1b759a;transition:.2s}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__$k = undefined;
/* module identifier */

const __vue_module_identifier__$k = undefined;
/* functional template */

const __vue_is_functional_template__$k = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$k = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$k,
  staticRenderFns: __vue_staticRenderFns__$k
}, __vue_inject_styles__$k, __vue_script__$9, __vue_scope_id__$k, __vue_is_functional_template__$k, __vue_module_identifier__$k, false, createInjector, undefined, undefined);

//
var script$8 = {
  components: {
    subType: __vue_component__$k
  },
  props: {
    props: {
      type: Object,
      default: () => {}
    },
    savedView: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      myHtml: "",
      elements: [],
      imported: false
    };
  },

  computed: {
    component() {
      const path = `/views/${this.props.name}_${this.props.type}`;
      return importComp(path);
    },

    id() {
      if (this.savedView.id) {
        return this.savedView.id;
      }

      return "id-" + Date.now();
    },

    weight() {
      if (this.savedView.weight === 0 || this.savedView.weight) {
        return this.savedView.weight;
      }

      return "null";
    }

  },

  mounted() {
    if (this.savedView && this.savedView.settings) {
      setTimeout(() => {
        this.$refs.viewSaved.$refs[this.props.name].settings = this.savedView.settings;
      }, 500);
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
        weight: this.weight
      });
    }

  }
};

/* script */
const __vue_script__$8 = script$8;
/* template */

var __vue_render__$j = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "text-center"
  }, [_c('div', {
    staticClass: "element-type"
  }, [_c('h3', {
    staticClass: "pb-4"
  }, [_vm._v(_vm._s(_vm.$formatText(_vm.props.name, " / ")))]), _vm._v(" "), _c('form', [_c('div', [_c('subType', {
    ref: "viewSaved",
    attrs: {
      "name": _vm.props.name
    },
    on: {
      "addStatic": _vm.addStatic
    }
  }, [_vm._t("default")], 2)], 1)])]), _vm._v(" "), _c(_vm.component, {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: false,
      expression: "false"
    }],
    ref: "importedComponent",
    tag: "component",
    attrs: {
      "section": _vm.props
    }
  })], 1);
};

var __vue_staticRenderFns__$j = [];
/* style */

const __vue_inject_styles__$j = function (inject) {
  if (!inject) return;
  inject("data-v-35ba7d5c_0", {
    source: ".dashboard button{background:#000;margin:10px;width:auto;height:auto;max-height:auto;padding:5px;min-width:0;max-width:1000px}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__$j = undefined;
/* module identifier */

const __vue_module_identifier__$j = undefined;
/* functional template */

const __vue_is_functional_template__$j = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$j = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$j,
  staticRenderFns: __vue_staticRenderFns__$j
}, __vue_inject_styles__$j, __vue_script__$8, __vue_scope_id__$j, __vue_is_functional_template__$j, __vue_module_identifier__$j, false, createInjector, undefined, undefined);

//
var script$7 = {
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
    this.renderSection(this.props.name);
  },

  methods: {
    renderSection(name) {
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token
      };
      const config = {
        headers: sectionHeader(header)
      };
      const variables = {
        section: {
          name,
          weight: 1
        }
      };
      const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/section/render`;
      axios.post(URL, variables, config).then(res => {
        if (res.data && res.data.error) {
          this.$emit('errorAddingSection', {
            closeModal: true,
            title: "Error adding " + this.props.name,
            message: res.data.error
          });
          this.loading = false;
          return;
        }

        this.$emit('addSectionType', {
          name: this.props.name,
          type: 'dynamic',
          id: this.id,
          weight: this.weight,
          renderData: res.data.renderSection.renderData
        });
        this.loading = false;
      }).catch(() => {
        this.$emit('errorAddingSection', {
          closeModal: true,
          title: "Error adding " + this.props.name,
          message: "We couldn't save your changes, try again later"
        });
        this.loading = false;
      });
    }

  }
};

/* script */
const __vue_script__$7 = script$7;
/* template */

var __vue_render__$i = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  _vm._self._c || _h;

  return _vm._m(0);
};

var __vue_staticRenderFns__$i = [function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', [_c('h4', [_vm._v("Adding section...")])]);
}];
/* style */

const __vue_inject_styles__$i = undefined;
/* scoped */

const __vue_scope_id__$i = undefined;
/* module identifier */

const __vue_module_identifier__$i = undefined;
/* functional template */

const __vue_is_functional_template__$i = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$i = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$i,
  staticRenderFns: __vue_staticRenderFns__$i
}, __vue_inject_styles__$i, __vue_script__$7, __vue_scope_id__$i, __vue_is_functional_template__$i, __vue_module_identifier__$i, false, undefined, undefined, undefined);

//
var script$6 = {
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
      this.savedView.renderData.map(rdata => {
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

    if (this.props.dynamic_options || this.savedView.dynamic_options) {
      this.$emit("loading");
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token
      };
      const config = {
        headers: sectionHeader(header)
      };
      const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/section/${this.props.name}/options`;
      axios.get(URL, config).then(res => {
        //TODO this should be updated to iterate over all the elements of the data array 
        //and key the result by the `field` key in the object
        this.optionValues = res.data[0];
        this.$emit("loading");
      }).catch(err => {
        this.$emit("loading");
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
            errorMessage = "You must fill your current fields before adding a new one";
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
          if (this.optionValues.field === name && this.optionValues.option_values) {
            return "select";
          }

          return "input";

        case "file":
          return "b-form-file";

        case "string":
          if (this.optionValues.field === name && this.optionValues.option_values) {
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

        case "integer":
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
            errorMessage = "You must fill your current fields before submitting.";
          }
        });
      });

      if (errorMessage) {
        this.errorMessage = errorMessage;
        return;
      }

      this.$emit("loading");
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token
      };
      const config = {
        headers: sectionHeader(header)
      };
      const options = JSON.stringify(this.options);
      const variables = {
        section: {
          name: this.props.name,
          weight: 1,
          options
        }
      };
      const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/section/render`;
      axios.post(URL, variables, config).then(res => {
        if (res.data && res.data.error) {
          this.$emit("loading");
          this.$emit('errorAddingSection', {
            closeModal: false,
            title: "Error adding " + this.props.name,
            message: res.data.error
          });
          return;
        }

        this.$emit("loading");
        this.$emit('addSectionType', {
          name: this.props.name,
          type: 'configurable',
          settings: this.options,
          id: this.id,
          weight: this.weight,
          renderData: res.data.renderSection.renderData
        });
      }).catch(() => {
        this.$emit("loading");
        this.$emit('errorAddingSection', {
          closeModal: false,
          title: "Error adding " + this.props.name,
          message: "We couldn't save your changes, try again later"
        });
      });
    }

  }
};

/* script */
const __vue_script__$6 = script$6;
/* template */

var __vue_render__$h = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "container text-center"
  }, [_c('div', {
    staticClass: "h3 text-capitalize "
  }, [_vm._v(_vm._s(_vm.formatName(_vm.props.name)))]), _vm._v(" "), _c('div', {
    staticClass: "text-danger"
  }, [_vm._v("\n    " + _vm._s(_vm.errorMessage) + "\n  ")]), _vm._v(" "), _c('div', {
    staticClass: "form-group"
  }, [_c('form', [_vm._l(_vm.props.fields, function (fields, idx) {
    return _c('div', {
      key: idx,
      staticClass: " d-flex justify-content-between"
    }, [_vm._l(fields, function (field, i) {
      return _c('div', {
        key: i,
        staticClass: "element p2",
        class: _vm.getType(field.type) !== 'file' ? '' : '',
        style: {
          width: 100 / _vm.props.fields.length + '%'
        }
      }, [field.name && _vm.options[idx] ? _c('div', {
        staticClass: "text-capitalize text-left p2"
      }, [_vm._v("\n            " + _vm._s(field.name.replace("_", " ")) + "\n          ")]) : _vm._e(), _vm._v(" "), _vm.options[idx] ? _c(_vm.getTag(field.type, field.name), {
        tag: "component",
        staticClass: "d-input",
        attrs: {
          "id": field.name,
          "type": _vm.getType(field.type),
          "name": field.name,
          "title": 'choose'
        },
        on: {
          "input": function ($event) {
            return _vm.changeFieldValue($event, idx, field.type, field.name);
          }
        }
      }, [_c('option', {
        attrs: {
          "value": "no-value"
        }
      }, [_vm._v("Select a value")]), _vm._v(" "), _vm._l(_vm.optionValues.option_values, function (option) {
        return _c('option', {
          key: option.id,
          domProps: {
            "selected": parseInt(option.id) === parseInt(_vm.options[idx].effect),
            "value": option.id
          }
        }, [_vm._v(_vm._s(option.title))]);
      })], 2) : _vm._e(), _vm._v(" "), field.type === 'file' && _vm.savedFile(_vm.options, field, idx) ? _c('a', {
        staticClass: "mt-3 text-left d-block text-primary",
        attrs: {
          "href": _vm.savedFile(_vm.options, field, idx),
          "target": "_blank"
        }
      }, [_vm._v("file : ..." + _vm._s(_vm.savedFile(_vm.options, field, idx).substr(_vm.savedFile(_vm.options, field, idx).length - 13)) + "\n          ")]) : _vm._e()], 1);
    }), _vm._v(" "), _vm.options[idx] && _vm.props.fields && _vm.props.fields.length > 1 ? _c('div', {
      staticClass: "deleteRow p1 clickable",
      on: {
        "click": function ($event) {
          return _vm.removeRow(idx);
        }
      }
    }, [_vm._v("\n          X\n        ")]) : _vm._e()], 2);
  }), _vm._v(" "), _vm.props.multiple || _vm.savedView.multiple ? _c('div', {
    staticClass: "text-right"
  }, [_c('button', {
    staticClass: "btn btn-primary",
    attrs: {
      "type": "button"
    },
    on: {
      "click": function ($event) {
        return _vm.addAnother();
      }
    }
  }, [_vm._v("\n          Add another\n        ")])]) : _vm._e(), _vm._v(" "), _c('button', {
    staticClass: "bg-light-blue",
    attrs: {
      "type": "button"
    },
    on: {
      "click": function ($event) {
        return _vm.addConfigurable();
      }
    }
  }, [_vm._v("\n        Submit data\n      ")])], 2)])]);
};

var __vue_staticRenderFns__$h = [];
/* style */

const __vue_inject_styles__$h = function (inject) {
  if (!inject) return;
  inject("data-v-0bb560a4_0", {
    source: ".element[data-v-0bb560a4]{margin:15px;flex-direction:column;align-items:flex-start;display:flex;text-align:left}.element select[data-v-0bb560a4]{width:100%;padding:9px 19px;border-radius:6px}.deleteRow[data-v-0bb560a4]{display:flex;align-items:center;justify-content:center;height:130px}.btn-primary[data-v-0bb560a4]{min-width:100px}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__$h = "data-v-0bb560a4";
/* module identifier */

const __vue_module_identifier__$h = undefined;
/* functional template */

const __vue_is_functional_template__$h = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$h = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$h,
  staticRenderFns: __vue_staticRenderFns__$h
}, __vue_inject_styles__$h, __vue_script__$6, __vue_scope_id__$h, __vue_is_functional_template__$h, __vue_module_identifier__$h, false, createInjector, undefined, undefined);

//
//
//
//
//
//
var script$5 = {
  props: {
    props: {
      type: Object,
      default: {}
    },
    savedView: {
      type: Object,
      default: {}
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

      return 0;
    }

  },

  mounted() {
    // add a little time for the user to see the popup and know that the section is adding
    setTimeout(() => {
      this.$emit("addSectionType", {
        name: this.props.name,
        type: "local",
        id: this.id,
        weight: this.weight
      });
    }, 500);
  }

};

/* script */
const __vue_script__$5 = script$5;
/* template */

var __vue_render__$g = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  _vm._self._c || _h;

  return _vm._m(0);
};

var __vue_staticRenderFns__$g = [function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', [_c('h4', [_vm._v("Adding section...")])]);
}];
/* style */

const __vue_inject_styles__$g = undefined;
/* scoped */

const __vue_scope_id__$g = undefined;
/* module identifier */

const __vue_module_identifier__$g = undefined;
/* functional template */

const __vue_is_functional_template__$g = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$g = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$g,
  staticRenderFns: __vue_staticRenderFns__$g
}, __vue_inject_styles__$g, __vue_script__$5, __vue_scope_id__$g, __vue_is_functional_template__$g, __vue_module_identifier__$g, false, undefined, undefined, undefined);

//
var script$4 = {
  props: {
    title: {
      type: String,
      default: ""
    },
    active: {
      type: Boolean,
      default: true
    },
    base: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getIcon() {
      const path = "/type-icons/" + this.title.replace(/ /g, "_");
      return importComp(path);
    },

    getIconBase() {
      const path = "/type-icons/" + this.title.replace(/ /g, "_");
      return importComp(path);
    }

  }
};

/* script */
const __vue_script__$4 = script$4;
/* template */

var __vue_render__$f = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "item text-center",
    class: {
      active: _vm.active
    }
  }, [_c('div', {
    staticClass: "card-content"
  }, [_c('div', {
    staticClass: "icon"
  }, [_c(!_vm.base ? _vm.getIcon : _vm.getIconBase, {
    tag: "component"
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "p3 text-capitalize px-1"
  }, [_vm._v("\n      " + _vm._s(_vm.$formatText(_vm.title, " ")) + "\n    ")])])]);
};

var __vue_staticRenderFns__$f = [];
/* style */

const __vue_inject_styles__$f = function (inject) {
  if (!inject) return;
  inject("data-v-1cee5ad1_0", {
    source: ".item[data-v-1cee5ad1]{color:#fff;display:flex;align-items:center;justify-content:center;width:100%;height:100%;cursor:pointer;background:#adadad}.item.active[data-v-1cee5ad1]{background:#31a9db;transition:.2s}.item.active[data-v-1cee5ad1]:hover{transition:.2s;background:#208cb9}.icon svg[data-v-1cee5ad1]{color:#fff;fill:#fff;min-width:60px;height:60px}.card-content[data-v-1cee5ad1]{display:flex;align-items:center;justify-content:space-between;flex-direction:column;line-height:1.85}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__$f = "data-v-1cee5ad1";
/* module identifier */

const __vue_module_identifier__$f = undefined;
/* functional template */

const __vue_is_functional_template__$f = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$f = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$f,
  staticRenderFns: __vue_staticRenderFns__$f
}, __vue_inject_styles__$f, __vue_script__$4, __vue_scope_id__$f, __vue_is_functional_template__$f, __vue_module_identifier__$f, false, createInjector, undefined, undefined);

/* script */

/* template */
var __vue_render__$e = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "width": "32",
      "height": "32",
      "viewBox": "0 0 32 32"
    }
  }, [_c('title', [_vm._v("edit")]), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M29.535 20.102c-0.44 0-0.797 0.357-0.797 0.797v7.076c-0.002 1.32-1.071 2.39-2.391 2.391h-22.362c-1.32-0.001-2.389-1.071-2.391-2.391v-20.768c0.002-1.32 1.071-2.389 2.391-2.391h7.076c0.44 0 0.797-0.357 0.797-0.797s-0.357-0.797-0.797-0.797h-7.076c-2.2 0.002-3.982 1.785-3.985 3.985v20.768c0.003 2.2 1.785 3.982 3.985 3.985h22.362c2.2-0.003 3.982-1.785 3.985-3.985v-7.076c0-0.44-0.357-0.797-0.797-0.797z"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M30.016 1.172c-1.401-1.401-3.671-1.401-5.072 0l-14.218 14.218c-0.097 0.097-0.168 0.218-0.205 0.351l-1.87 6.75c-0.077 0.277 0.001 0.573 0.204 0.776s0.5 0.281 0.776 0.205l6.75-1.87c0.133-0.037 0.253-0.107 0.351-0.205l14.218-14.219c1.398-1.402 1.398-3.67 0-5.072zM12.462 15.908l11.637-11.637 3.753 3.753-11.637 11.637zM11.713 17.412l2.998 2.999-4.147 1.149zM29.824 6.052l-0.845 0.845-3.753-3.753 0.846-0.845c0.778-0.778 2.039-0.778 2.817 0l0.936 0.935c0.777 0.779 0.777 2.039 0 2.818z"
    }
  })]);
};

var __vue_staticRenderFns__$e = [];
/* style */

const __vue_inject_styles__$e = undefined;
/* scoped */

const __vue_scope_id__$e = undefined;
/* module identifier */

const __vue_module_identifier__$e = undefined;
/* functional template */

const __vue_is_functional_template__$e = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$e = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$e,
  staticRenderFns: __vue_staticRenderFns__$e
}, __vue_inject_styles__$e, {}, __vue_scope_id__$e, __vue_is_functional_template__$e, __vue_module_identifier__$e, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$d = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "width": "32",
      "height": "32",
      "viewBox": "0 0 32 32"
    }
  }, [_c('title', [_vm._v("drag-01")]), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M31.712 15.325l-5.231-4.925c-0.269-0.25-0.663-0.319-1-0.175s-0.556 0.481-0.556 0.85v2.156h-6.156v-6.156h2.156c0.369 0 0.7-0.219 0.85-0.556 0.144-0.338 0.075-0.731-0.175-1l-4.925-5.231c-0.175-0.181-0.419-0.287-0.675-0.287s-0.5 0.106-0.675 0.287l-4.925 5.231c-0.25 0.269-0.319 0.662-0.175 1s0.481 0.556 0.85 0.556h2.156v6.156h-6.156v-2.156c0-0.369-0.219-0.7-0.556-0.85-0.338-0.144-0.731-0.075-1 0.175l-5.231 4.925c-0.181 0.175-0.287 0.419-0.287 0.675s0.106 0.5 0.287 0.675l5.231 4.925c0.269 0.25 0.662 0.319 1 0.175s0.556-0.481 0.556-0.85v-2.156h6.156v6.156h-2.156c-0.369 0-0.7 0.219-0.85 0.556s-0.075 0.731 0.175 1l4.925 5.231c0.175 0.188 0.419 0.288 0.675 0.288s0.5-0.106 0.675-0.288l4.925-5.231c0.25-0.269 0.319-0.663 0.175-1s-0.481-0.556-0.85-0.556h-2.156v-6.156h6.156v2.156c0 0.369 0.219 0.7 0.556 0.85 0.337 0.144 0.731 0.075 1-0.175l5.231-4.925c0.188-0.175 0.288-0.419 0.288-0.675s-0.106-0.5-0.288-0.675z"
    }
  })]);
};

var __vue_staticRenderFns__$d = [];
/* style */

const __vue_inject_styles__$d = undefined;
/* scoped */

const __vue_scope_id__$d = undefined;
/* module identifier */

const __vue_module_identifier__$d = undefined;
/* functional template */

const __vue_is_functional_template__$d = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$d = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$d,
  staticRenderFns: __vue_staticRenderFns__$d
}, __vue_inject_styles__$d, {}, __vue_scope_id__$d, __vue_is_functional_template__$d, __vue_module_identifier__$d, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$3 = {};

/* script */
const __vue_script__$3 = script$3;
/* template */

var __vue_render__$c = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "width": "32",
      "height": "32",
      "viewBox": "0 0 32 32"
    }
  }, [_c('title', [_vm._v("trash")]), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M24.8 3.2h-5.6v-0.8c0-1.323-1.077-2.4-2.4-2.4h-3.2c-1.323 0-2.4 1.077-2.4 2.4v0.8h-5.6c-1.323 0-2.4 1.077-2.4 2.4v1.6c0 1.043 0.669 1.932 1.6 2.262v20.138c0 1.323 1.077 2.4 2.4 2.4h16c1.323 0 2.4-1.077 2.4-2.4v-20.138c0.931-0.33 1.6-1.22 1.6-2.262v-1.6c0-1.323-1.077-2.4-2.4-2.4zM12.8 2.4c0-0.441 0.359-0.8 0.8-0.8h3.2c0.441 0 0.8 0.359 0.8 0.8v0.8h-4.8v-0.8zM23.2 30.4h-16c-0.441 0-0.8-0.359-0.8-0.8v-20h17.6v20c0 0.441-0.359 0.8-0.8 0.8zM25.6 7.2c0 0.441-0.359 0.8-0.8 0.8h-19.2c-0.441 0-0.8-0.359-0.8-0.8v-1.6c0-0.441 0.359-0.8 0.8-0.8h19.2c0.441 0 0.8 0.359 0.8 0.8v1.6z"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M20 11.2c-0.442 0-0.8 0.358-0.8 0.8v16c0 0.442 0.358 0.8 0.8 0.8s0.8-0.358 0.8-0.8v-16c0-0.442-0.358-0.8-0.8-0.8z"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M15.2 11.2c-0.442 0-0.8 0.358-0.8 0.8v16c0 0.442 0.358 0.8 0.8 0.8s0.8-0.358 0.8-0.8v-16c0-0.442-0.358-0.8-0.8-0.8z"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M10.4 11.2c-0.442 0-0.8 0.358-0.8 0.8v16c0 0.442 0.358 0.8 0.8 0.8s0.8-0.358 0.8-0.8v-16c0-0.442-0.358-0.8-0.8-0.8z"
    }
  })]);
};

var __vue_staticRenderFns__$c = [];
/* style */

const __vue_inject_styles__$c = undefined;
/* scoped */

const __vue_scope_id__$c = undefined;
/* module identifier */

const __vue_module_identifier__$c = undefined;
/* functional template */

const __vue_is_functional_template__$c = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$c = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$c,
  staticRenderFns: __vue_staticRenderFns__$c
}, __vue_inject_styles__$c, __vue_script__$3, __vue_scope_id__$c, __vue_is_functional_template__$c, __vue_module_identifier__$c, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$b = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    staticStyle: {
      "enable-background": "new 0 -128 1024 1024"
    },
    attrs: {
      "version": "1.1",
      "id": "Capa_1",
      "xmlns": "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      "x": "0px",
      "y": "0px",
      "viewBox": "0 -128 1024 1024",
      "xml:space": "preserve"
    }
  }, [_c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M334.9,36.5c14.4-14.4,37-14.4,51.4,0c13.9,13.9,13.9,37,0,50.8L125.8,347.8h859.3c20,0,36.5,15.9,36.5,36\n\tc0,20-16.4,36.5-36.5,36.5H125.8l260.4,259.9c13.9,14.4,13.9,37.5,0,51.4c-14.4,14.4-37,14.4-51.4,0l-322-322\n\tc-13.9-13.9-13.9-37,0-50.8L334.9,36.5z"
    }
  })]);
};

var __vue_staticRenderFns__$b = [];
/* style */

const __vue_inject_styles__$b = undefined;
/* scoped */

const __vue_scope_id__$b = undefined;
/* module identifier */

const __vue_module_identifier__$b = undefined;
/* functional template */

const __vue_is_functional_template__$b = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$b = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$b,
  staticRenderFns: __vue_staticRenderFns__$b
}, __vue_inject_styles__$b, {}, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$a = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    staticStyle: {
      "enable-background": "new 0 0 1024 1024"
    },
    attrs: {
      "version": "1.1",
      "id": "Capa_1",
      "xmlns": "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      "x": "0px",
      "y": "0px",
      "viewBox": "0 0 1024 1024",
      "xml:space": "preserve"
    }
  }, [_c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M951.6,439.6H584.4V72.4C584.4,32.6,551.8,0,512,0c-39.8,0-72.4,32.6-72.4,72.4v367.1H72.4C32.6,439.6,0,472.2,0,512\n\tc0,39.8,32.6,72.4,72.4,72.4h367.1v367.1c0,39.8,32.6,72.4,72.4,72.4c39.8,0,72.4-32.6,72.4-72.4V584.4h367.1\n\tc39.8,0,72.4-32.6,72.4-72.4C1024,472.2,991.4,439.6,951.6,439.6z"
    }
  })]);
};

var __vue_staticRenderFns__$a = [];
/* style */

const __vue_inject_styles__$a = undefined;
/* scoped */

const __vue_scope_id__$a = undefined;
/* module identifier */

const __vue_module_identifier__$a = undefined;
/* functional template */

const __vue_is_functional_template__$a = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$a = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$a,
  staticRenderFns: __vue_staticRenderFns__$a
}, __vue_inject_styles__$a, {}, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$9 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    staticStyle: {
      "enable-background": "new 0 0 1024 1024"
    },
    attrs: {
      "version": "1.1",
      "id": "Layer_1",
      "xmlns": "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      "x": "0px",
      "y": "0px",
      "viewBox": "0 0 1024 1024",
      "xml:space": "preserve"
    }
  }, [_c('g', [_c('g', [_c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M1003.9,156.8c-19.8-19.8-51.9-19.8-71.6,0L325.1,763.9L91.9,530.6c-19.8-19.8-51.9-19.8-71.6,0\n\t\t\tc-19.8,19.8-19.8,51.9,0,71.6l269.2,269.2c19.8,19.8,51.9,19.8,71.6,0l642.9-642.9C1023.7,208.8,1023.6,176.6,1003.9,156.8z"
    }
  })])])]);
};

var __vue_staticRenderFns__$9 = [];
/* style */

const __vue_inject_styles__$9 = undefined;
/* scoped */

const __vue_scope_id__$9 = undefined;
/* module identifier */

const __vue_module_identifier__$9 = undefined;
/* functional template */

const __vue_is_functional_template__$9 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$9 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$9,
  staticRenderFns: __vue_staticRenderFns__$9
}, __vue_inject_styles__$9, {}, __vue_scope_id__$9, __vue_is_functional_template__$9, __vue_module_identifier__$9, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$8 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "width": "32",
      "height": "32",
      "viewBox": "0 0 32 32"
    }
  }, [_c('title', [_vm._v("cancel-3")]), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M27.313 4.687c-3.024-3.024-7.037-4.687-11.313-4.687s-8.29 1.663-11.313 4.687-4.687 7.037-4.687 11.313 1.663 8.29 4.687 11.313 7.037 4.687 11.313 4.687 8.29-1.663 11.313-4.687 4.687-7.037 4.687-11.313-1.663-8.29-4.687-11.313zM26.027 26.027c-2.68 2.68-6.242 4.155-10.027 4.155s-7.347-1.475-10.027-4.155c-5.529-5.529-5.529-14.525 0-20.054 2.68-2.68 6.242-4.155 10.027-4.155s7.347 1.475 10.027 4.155c5.529 5.529 5.529 14.525 0 20.054z"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M23.050 8.95c-0.357-0.357-0.929-0.357-1.286 0l-5.764 5.764-5.764-5.764c-0.357-0.357-0.929-0.357-1.286 0s-0.357 0.929 0 1.286l5.764 5.764-5.764 5.764c-0.357 0.357-0.357 0.929 0 1.286 0.175 0.175 0.411 0.269 0.64 0.269s0.465-0.088 0.64-0.269l5.764-5.764 5.764 5.764c0.175 0.175 0.411 0.269 0.64 0.269 0.236 0 0.465-0.088 0.64-0.269 0.357-0.357 0.357-0.929 0-1.286l-5.751-5.764 5.764-5.764c0.357-0.357 0.357-0.929 0-1.286z"
    }
  })]);
};

var __vue_staticRenderFns__$8 = [];
/* style */

const __vue_inject_styles__$8 = undefined;
/* scoped */

const __vue_scope_id__$8 = undefined;
/* module identifier */

const __vue_module_identifier__$8 = undefined;
/* functional template */

const __vue_is_functional_template__$8 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$8 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$8,
  staticRenderFns: __vue_staticRenderFns__$8
}, __vue_inject_styles__$8, {}, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$7 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "version": "1.1",
      "xmlns": "http://www.w3.org/2000/svg",
      "width": "32",
      "height": "32",
      "viewBox": "0 0 32 32"
    }
  }, [_c('title', [_vm._v("reload")]), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M7.329 6.346c4.724-4.274 11.795-4.339 16.584-0.438l-3.797 0.144c-0.49 0.020-0.869 0.425-0.849 0.915 0.020 0.477 0.412 0.849 0.882 0.849 0.013 0 0.020 0 0.033 0l5.829-0.216c0.477-0.020 0.849-0.405 0.849-0.882v-0.065c0-0.013 0-0.020 0-0.033v-0.007l-0.216-5.763c-0.020-0.49-0.431-0.869-0.915-0.849-0.49 0.020-0.869 0.425-0.849 0.915l0.137 3.614c-2.372-1.941-5.293-3.065-8.416-3.221-3.868-0.196-7.587 1.13-10.455 3.731-3.947 3.574-5.62 9.011-4.365 14.186 0.098 0.405 0.457 0.673 0.856 0.673 0.072 0 0.137-0.007 0.209-0.026 0.47-0.118 0.765-0.595 0.647-1.065-1.098-4.548 0.366-9.325 3.836-12.461z"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "fill": "currentColor",
      "d": "M30.219 12.776c-0.118-0.47-0.595-0.765-1.065-0.647s-0.765 0.595-0.647 1.065c1.104 4.548-0.366 9.325-3.836 12.461-2.437 2.202-5.495 3.287-8.541 3.287-2.908 0-5.809-0.987-8.148-2.934l3.842-0.346c0.484-0.046 0.843-0.47 0.797-0.961s-0.47-0.843-0.961-0.797l-5.809 0.523c-0.484 0.046-0.843 0.47-0.797 0.961l0.523 5.809c0.039 0.457 0.425 0.804 0.876 0.804 0.026 0 0.052 0 0.078-0.007 0.484-0.046 0.843-0.47 0.797-0.961l-0.314-3.535c2.372 1.921 5.28 3.039 8.384 3.195 0.248 0.013 0.497 0.020 0.738 0.020 3.601 0 7.025-1.32 9.717-3.751 3.947-3.574 5.62-9.005 4.365-14.186z"
    }
  })]);
};

var __vue_staticRenderFns__$7 = [];
/* style */

const __vue_inject_styles__$7 = undefined;
/* scoped */

const __vue_scope_id__$7 = undefined;
/* module identifier */

const __vue_module_identifier__$7 = undefined;
/* functional template */

const __vue_is_functional_template__$7 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$7 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$7,
  staticRenderFns: __vue_staticRenderFns__$7
}, __vue_inject_styles__$7, {}, __vue_scope_id__$7, __vue_is_functional_template__$7, __vue_module_identifier__$7, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$6 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "version": "1.1",
      "id": "Capa_1",
      "xmlns": "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      "x": "0px",
      "y": "0px",
      "width": "300px",
      "height": "300px",
      "viewBox": "0 0 300 300",
      "enable-background": "new 0 0 300 300",
      "xml:space": "preserve"
    }
  }, [_c('g', {
    attrs: {
      "transform": "translate(1 1)"
    }
  }, [_c('g', [_c('g', [_c('path', {
    attrs: {
      "d": "M123.372,227.658l-35.35,35.35c-14.656,14.656-38.389,14.656-53.032,0.003c-14.646-14.646-14.646-38.382-0.003-53.025\n\t\t\t\tl70.713-70.713c14.643-14.644,38.379-14.644,53.022,0c4.882,4.881,12.796,4.881,17.678,0s4.882-12.796,0-17.678\n\t\t\t\tc-24.407-24.407-63.971-24.407-88.378,0l-70.712,70.712c-24.407,24.407-24.407,63.972,0,88.379\n\t\t\t\tc24.404,24.42,63.971,24.42,88.391,0l35.351-35.351c4.881-4.882,4.881-12.796,0-17.678S128.253,222.775,123.372,227.658z"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M280.691,17.305c-24.406-24.407-63.984-24.407-88.391,0l-42.412,42.413c-4.882,4.881-4.882,12.796,0,17.678\n\t\t\t\tc4.881,4.881,12.796,4.881,17.678,0l42.412-42.413c14.644-14.644,38.392-14.644,53.035,0s14.644,38.379,0,53.022l-77.775,77.776\n\t\t\t\tc-14.644,14.644-38.379,14.644-53.022,0c-4.881-4.882-12.796-4.882-17.678,0c-4.881,4.881-4.881,12.796,0,17.678\n\t\t\t\tc24.407,24.406,63.972,24.406,88.378,0l77.775-77.775C305.099,81.277,305.099,41.711,280.691,17.305z"
    }
  })])])])]);
};

var __vue_staticRenderFns__$6 = [];
/* style */

const __vue_inject_styles__$6 = undefined;
/* scoped */

const __vue_scope_id__$6 = undefined;
/* module identifier */

const __vue_module_identifier__$6 = undefined;
/* functional template */

const __vue_is_functional_template__$6 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$6 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$6,
  staticRenderFns: __vue_staticRenderFns__$6
}, __vue_inject_styles__$6, {}, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$5 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "width": "11",
      "height": "11",
      "viewBox": "0 0 11 11",
      "fill": "none",
      "xmlns": "http://www.w3.org/2000/svg"
    }
  }, [_c('path', {
    attrs: {
      "d": "M9.64122 0C9.29 0 8.94475 0.137672 8.67985 0.402002L4.13195 4.93325L4.03095 5.03421L4.0034 5.17785L3.68662 6.78402L3.54429 7.4577L4.2178 7.31544L5.82467 6.99879L5.96837 6.97126L6.06937 6.8703L10.6026 2.32436C10.7924 2.13392 10.9217 1.89157 10.974 1.62785C11.0263 1.36413 10.9994 1.09084 10.8966 0.842391C10.7938 0.593946 10.6197 0.381469 10.3963 0.231727C10.1729 0.0819845 9.91019 0.00167572 9.64122 0.000917747V0ZM9.64122 0.890279C9.74911 0.890279 9.85424 0.945348 9.95708 1.04768C10.1618 1.25236 10.1618 1.47355 9.95708 1.67868L5.50927 6.12365L4.7196 6.28152L4.878 5.4922L9.32581 1.04631C9.42819 0.943972 9.53333 0.888903 9.64122 0.888903V0.890279ZM0 1.82186V11H9.18211V4.94793L8.2639 5.86575V10.0822H0.918211V2.73967H5.13647L6.05468 1.82186H0Z",
      "fill": "currentColor"
    }
  })]);
};

var __vue_staticRenderFns__$5 = [];
/* style */

const __vue_inject_styles__$5 = undefined;
/* scoped */

const __vue_scope_id__$5 = undefined;
/* module identifier */

const __vue_module_identifier__$5 = undefined;
/* functional template */

const __vue_is_functional_template__$5 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$5 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$5,
  staticRenderFns: __vue_staticRenderFns__$5
}, __vue_inject_styles__$5, {}, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$4 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "width": "9",
      "height": "9",
      "viewBox": "0 0 9 9",
      "fill": "none",
      "xmlns": "http://www.w3.org/2000/svg"
    }
  }, [_c('circle', {
    attrs: {
      "cx": "4.5",
      "cy": "4.5",
      "r": "4.5",
      "fill": "currentColor"
    }
  }), _vm._v(" "), _c('circle', {
    attrs: {
      "cx": "4.5",
      "cy": "4.5",
      "r": "4.5",
      "fill": "currentColor"
    }
  }), _vm._v(" "), _c('circle', {
    attrs: {
      "cx": "4.5",
      "cy": "4.5",
      "r": "4.5",
      "fill": "currentColor"
    }
  })]);
};

var __vue_staticRenderFns__$4 = [];
/* style */

const __vue_inject_styles__$4 = undefined;
/* scoped */

const __vue_scope_id__$4 = undefined;
/* module identifier */

const __vue_module_identifier__$4 = undefined;
/* functional template */

const __vue_is_functional_template__$4 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$4 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$4,
  staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, {}, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, false, undefined, undefined, undefined);

/* script */

/* template */
var __vue_render__$3 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('svg', {
    attrs: {
      "width": "46",
      "height": "48",
      "viewBox": "0 0 46 48",
      "fill": "none",
      "xmlns": "http://www.w3.org/2000/svg"
    }
  }, [_c('path', {
    attrs: {
      "d": "M16.4443 11.2168L26.6137 21.3862L36.7832 31.5557L19.3648 38.8046L1.94653 46.0534L9.1954 28.6351L16.4443 11.2168Z",
      "fill": "#39AAD9"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M27.625 23.2061L16.0495 11.6128L8.52555 29.3062L1 46.9996L27.625 23.2061Z",
      "fill": "#39AAD9"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M7.58057 31.5272L16.53 40.4767L12.0553 42.2978L5.74731 35.9898L7.58057 31.5272Z",
      "fill": "#ECECEC"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M9.29492 39.5873L12.0553 42.2975L16.5292 40.4764L12.6459 36.5923L9.29492 39.5873Z",
      "fill": "#ECECEC"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M12.0956 20.9111L17.5128 26.3284L26.9784 35.794L21.9026 38.1102L15.2921 31.4988L9.94763 26.1552L12.0956 20.9111Z",
      "fill": "#ECECEC"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M16.7331 32.9399L21.9028 38.1095L26.9778 35.7933L20.6366 29.4521L16.7331 32.9399Z",
      "fill": "#ECECEC"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M19.7733 8.18161C20.6669 8.18161 21.3914 7.46769 21.3914 6.58702C21.3914 5.70635 20.6669 4.99243 19.7733 4.99243C18.8797 4.99243 18.1553 5.70635 18.1553 6.58702C18.1553 7.46769 18.8797 8.18161 19.7733 8.18161Z",
      "fill": "#D93939"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M44.0441 11.4178C44.9377 11.4178 45.6621 10.7039 45.6621 9.82323C45.6621 8.94256 44.9377 8.22864 44.0441 8.22864C43.1505 8.22864 42.426 8.94256 42.426 9.82323C42.426 10.7039 43.1505 11.4178 44.0441 11.4178Z",
      "fill": "#F1E043"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M41.617 28.4073C42.5106 28.4073 43.2351 27.6934 43.2351 26.8127C43.2351 25.9321 42.5106 25.2181 41.617 25.2181C40.7234 25.2181 39.999 25.9321 39.999 26.8127C39.999 27.6934 40.7234 28.4073 41.617 28.4073Z",
      "fill": "#D93939"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M36.2516 31.8146L36.3876 31.9506L18.6942 39.4745L1 47L8.52393 29.3067L16.0487 11.6133",
      "stroke": "black",
      "stroke-width": "0.5",
      "stroke-miterlimit": "10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M16.1376 11.7006L26.2181 21.781L36.2524 31.8145",
      "stroke": "black",
      "stroke-width": "0.5",
      "stroke-miterlimit": "10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M16.0496 11.6122L16.1377 11.7004",
      "stroke": "black",
      "stroke-width": "0.5",
      "stroke-miterlimit": "10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M32.8754 0.850586C33.0656 1.21384 33.2015 1.6135 33.2719 2.04228C33.6367 4.26467 32.1012 6.42234 29.8424 6.86164",
      "stroke": "black",
      "stroke-width": "0.5",
      "stroke-miterlimit": "10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M29.9979 6.84485C29.5776 6.87709 29.1651 6.97651 28.7763 7.13933C26.6979 8.00661 25.6801 10.4507 26.5029 12.6003",
      "stroke": "black",
      "stroke-width": "0.5",
      "stroke-miterlimit": "10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M45.2561 16.5052C45.1735 16.9183 45.0251 17.3154 44.8168 17.6816C43.7068 19.6418 41.1576 20.3594 39.1237 19.2834",
      "stroke": "black",
      "stroke-width": "0.5",
      "stroke-miterlimit": "10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  }), _vm._v(" "), _c('path', {
    attrs: {
      "d": "M39.2538 19.3684C38.9065 19.1302 38.5233 18.9491 38.1188 18.832C35.9563 18.2026 33.6295 19.4687 32.9232 21.658",
      "stroke": "black",
      "stroke-width": "0.5",
      "stroke-miterlimit": "10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }
  })]);
};

var __vue_staticRenderFns__$3 = [];
/* style */

const __vue_inject_styles__$3 = undefined;
/* scoped */

const __vue_scope_id__$3 = undefined;
/* module identifier */

const __vue_module_identifier__$3 = undefined;
/* functional template */

const __vue_is_functional_template__$3 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$3 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$3,
  staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, {}, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
//
//
var script$2 = {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    loadingNum: {
      type: Number,
      default: 0
    }
  }
};

var img = "data:image/gif;base64,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MzMzOTk5PDw8Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pz8/Pz8/Pz8/QEBARUVFTU1NU1NTWFhYWlpaWlpaWlpaWlpaWlpaWlpaW1tbW1tbW1tbXFxcXV1dXV1dXl5eX19fYWFhZGRkZ2dna2trbm5ucHBwc3NzdnZ2d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3eHh4eHh4eHh4eHh4eXl5e3t7fX19gICAhYWFioqKjY2NkpKSk5OTk5OTk5OTk5OTlJSUlZWVlpaWmJiYmpqanZ2dn5+foaGhpaWlqampqqqqrKysrq6ur6+vsLCwsLCwsLCwsLCwsLCwsbGxsbGxsbGxtLS0t7e3u7u7vb29wcHBxMTEycnJzMzMzc3Nzc3Nzc3Nzc3Nzc3Nzs7Ozs7Oz8/Pz8/P0NDQ0NDQ0dHR09PT1NTU1tbW2NjY2tra3d3d39/f4eHh5OTk5ubm6Ojo6enp6enp6urq6urq6urq6urq6urq6+vr7Ozs7e3t7e3t7u7u7u7u7+/v8PDw8fHx8vLy8/Pz9PT09fX19vb29vb29/f39/f3+Pj4+Pj4+vr6/f39/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AaQkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gUS46M6bsmDOLwnKFVMXFibdw37qoAkmtVVFj4urVO0aUXamQfOwdDNdH3b9OF7EgzPgEi7SIl0Ja3Jgxi8ORj4oSXLmxD7+ZjYrp3FlM6KKQSHe+fHpoFdWdq7QW6hZ2Yxez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oqKioqKjo6Ojo6OkpKSnp6erq6uurq6zs7O2tra6urq8vLy+vr6/v7+/v7+/v7/AwMDAwMDAwMDAwMDAwMDBwcHBwcHCwsLExMTHx8fJycnKysrMzMzOzs7Q0NDR0dHS0tLU1NTW1tbY2Nja2trb29vc3Nzc3Nzc3Nzd3d3d3d3d3d3d3d3d3d3d3d3d3d3e3t7e3t7e3t7f39/g4ODh4eHj4+Pl5eXn5+fo6Ojp6enq6urs7Ozt7e3v7+/w8PDy8vL09PT19fX29vb39/f5+fn5+fn5+fn6+vr6+vr5+fn5+fn5+fn5+fn5+fn5+fn4+Pj4+Pj39/f39/f39/f29vb4+Pj5+fn5+fn6+vr6+vr6+vr7+/v8/Pz8/Pz8/Pz8/Pz9/f39/f3+/v7+/v7////+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gCjCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2BVlmLEqFTYr5zIOMHBtq2TOJzOYi0Vpq3du2HMyp1q567fu3b2Rq37tzDbMIKdEjZsGHFipX0ZSw78+GgpyZhx6K1MVEpmyY45C+X0GXNc0UHHlJYcB3XQJqsZO3ENNLZk2j4v2za8GXdORrsNM/K9E3jwv8OJ59R9/G5v5Tab+4WuE7Z0tk0yjpLz5UmQJlDE/uBxVVnSoTt2Cjkin1H1dRytLc5hQaG+/ftAHMl9NMZJkf8AFgFGIBiR9t5pEzHiw30M3tfBFKp8RYoYAVYI4BPJVbTYcaFJBEcIDYZoXwoZatVIExam+N8cz1TE3HHPOdSKEyLWWF8I8WU1iIo8FiGGRZEFR5lEX9hoJAiJZOUIEz3yCIdFG67WIURyGGnlCZ9cNYp/TfKYB5S2TfkQKiRYaeUPV13RZY9MRFhRkJkNKVEUZpp5SFWPrNmkHBfRhVleFbUCYp1G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y8vOzs7Pz8/R0dHU1NTW1tbY2Nja2trd3d3f39/h4eHj4+Pj4+Pk5OTk5OTk5OTk5OTk5OTk5OTl5eXm5ubo6Ojp6enq6urr6+vt7e3u7u7v7+/v7+/w8PDw8PDx8fHy8vLz8/P19fX29vb39/f5+fn6+vr7+/v8/Pz8/Pz9/f3+/v79/f39/f39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////8I/gDZCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDil1pjRYhNEXSFkFDiJa1sVgXPVFLV+2TSXCp9ppSt6/aKb3yQiU116/hJ6QENyVluLHaxIqT9irs+HDgyEelVK48BbPRRZs3L/I81Brl0IffkgZKC/VmWquBEnJdmVDsn2doO0Zz26fuyr17/nYcnOfwxsV3HjecXGfu5XTPNM85G7pa2xmBlepkCBGoWqox/vfqhY1ja+tpYVsEFodHi/fw30M5BBdbLUNi8uuPE8oZRtPoPRGeRNoUckN8CMLXgylhlbKGfhBCmIh/FoFm3WgU/dJEghzCx0Y2XWETR4Qk6rfGZRVptpwUFY2CQ4cwttDEL1sJ82CJOIqhHkWTHfcEihHhYkOMMSYxYFXY3JgjjrlYxNhwkEn0Sw5EEnnFNliNuGSOawjj5GmbIZZilVVuclUpW26JXUW9qLiZFEBGhAqZVepwJFRJprllnBPJ5dgTGFLUzYZ0EllIVbTouaUhGZVFyHNpndHWnRHVUmiVOVSFn6JL8lTIpVUiQxWne+60BqhEljIqqTmqqpMU/qjGmMhUvbCaYyg7uRdrh2tCVautJeKq04G7csjGVNgAG+xOThTL4aFTKUsinzVd4WyCnlAFh7QQUkjdtQg2OVUo3OYHB0+WgvueDuBQ5Uy5YriqkzYvqntsVYlw24ZPhKjbgrjuKmkrwDtZU6+za2D1q62cADUKDc7u8ExWibI6a1CHFIsDL1vlIvCWDQ/VRqw07KiVMISk2QbBQiUCag66gNXLpiTCIa9RpOxApxTAwNVLKaEE3Yu3SnFCaIdY1DIdUsps0gYUOOyAxSCmXLP01VhnrfXWXHft9ddghy322GSXbfbZaKet9toESYMKKnLI8bY0bMskjSFFOKD3/t56F2EI3XWvJI0cHfBt+N4dyAF4T8ykksokk6RiCzO35dLC4Zjv/S9PqRiyx+egf26ILaSBUnjmqHcASk7MeB7666JTrhgoqNe+9+o25QL77qCzHFYup9ueuu8v6c778cR3Jc3lwtvewuIwMXP89HvIHlYczTcfx0yuU787o2FJE3z2qUPfUireT086WIWQ3zy0L3WfPuzgf+WD+8L7EP3801vPlTT4a575VII+/vFufV05RQCFd4qXFNCAsEvFVxS4wNo10CWLgODuOvEV7FUQdfBjSQY1+DoOesWDH8RcCFfyQBJ+ToJeoWAKD3fBltjChaFDIFdkOEO+1ZAl/tLD4ef8txUA9tBwA1SJ/DRYP6/c74h60x9MbohDHXalfVB0wApbskT+NdEr4oNiB5K4kiBqkIgnhOL2ZmI8AybvfyXoYQnI2JI2pu+NXQFeCjuAx5a0znuGQKNYaPdB3OHEFl0UnRUFY7oAqo5xtkhFJzohOUEqJhdxJF8J+hi4jkgjDuPLXAfiQMdOhkQahXji4XxQiFKakiTSOMUpClEIWbrylbjMpS53ycte+vKXwAymMIdJzGIa85jITKYyEWINaCzTI8y4xScgBzlOnMIXz7wINEhBzW5S8xPYZEo2pNGMcjrDGt2Aiy+8yU5qKi0p10iGMOZJz3k2A0tg/llnO/cpiqOA4xn1DCg9reYVZOzzoJN451DAsQyBOlQY1OiKNjiB0IOGUygAfahDCaoVWlT0oJ8YyjU0+lBktCsr2vgoQi/6E3mS1KG3dIo+VdrOH/YkGy8taUdpus+Q/UQaOX0oPq/CTZ62MyjNCKpDy4OVohrVm878SVKVGtCINvWp7KRUTqZKVXpalahY9WZQnNHVeoIIK7cI6zeDYo2y0jOdWDGoWidxi6B0w63CWMZWKKpWS+qEq1TlKFZm+tQoAWUbZdUrV0SBVU5ElSPcoIZkqcENkIxUqcgYqlaswVeesjQjzNCFK0ZLWl341SJAzWlmvwKNzn70sxd5+8YtSEtb0t7iqxu5BjJIugzNdsUajK0oJ0S1kWTU9rikPS1FwCGN3QZ0GYINiy9c601aaIMjxkWudpVbkW1gQ7LZgKtiokmK8pKCFr64Lkeeod32ugK32VTIbN2L3LrGdyHMoG97uZtN0eoXuTG7L0K48d/2VlbABqFGgbULXwSzQ8ELPm6DEQzhCNN2wgKusIVHi+H7EnjDpD2wgwni3w0HeMQEyS+I+ZvN+UbYviguiIYL3OERq7jALBbwjembYwq7uL41jnGKS1zaHguZHZGdrIiPzOQmO/nJUI6ylKdM5Spb+cpYzrKWt8zlLnv5y2AOs5jHTOYyazkgACH5BAkDAKkALAAAAADIAMgAhwAAAAEBASAgICQkJCQkJCUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJScnJysrKzg4OD8/Pz8/Pz8/Pz8/Pz8/Pz8/P0BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEFBQUNDQ0ZGRkxMTFBQUFFRUVNTU1VVVVhYWFpaWltbW1xcXFxcXFxcXFxcXFxcXFxcXF1dXV1dXV1dXV5eXmFhYWNjY2pqanBwcHNzc3V1dXd3d3h4eHh4eHl5eXl5eXl5eXl5eXl5eXp6en19fYGBgYSEhIiIiI2NjZGRkZSUlJWVlZWVlZWVlZaWlpaWlpaWlpaWlpeXl5eXl5mZmZqamp6enqSkpKqqqq+vr7KysrKysrKysrOzs7Ozs7Ozs7Ozs7Ozs7Ozs7W1tbe3t7q6ur6+vsLCwsbGxsrKysvLy83Nzc7Ozs/Pz8/Pz8/Pz8/Pz8/Pz8/Pz9DQ0NDQ0NDQ0NPT09bW1tvb293d3d7e3uDg4OLi4uPj4+Xl5ebm5ujo6Onp6erq6uvr6+vr6+vr6+vr6+vr6+zs7Ozs7Ozs7Ozs7O3t7e/v7/Dw8PLy8vT09PX19fb29vf39/j4+Pj4+Pn5+fn5+fr6+vr6+vv7+/z8/Pz8/P39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AFMJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKZTmojJIjRIgcUVJm0NiseI7ImEu37hE8b6lGklu3r91IeaHyIeK3MF0ifAI35YPDsGMZOBIrThqJ8GPHRABPPsr3suMjm43i8ewZb+ihnUkbBn066CDVnt22/lkG9uUys38msf04SW6fqXn3Zf17p2XhfokU53kceV3ly3UGdy6DePSbu6nX9X0dZ23tdHH+Z/yDxguWLGbYTOpu8TX4ubIrNmKSIoP9+/ZxZMn7x4wVIz8EaEUWpmE0nXDWSbRJFiTg5+B9NtwRlh5WBGjhhT8gwQZGo4FXoESN4PDgiPddwYlXWWCoooVKrGfRgbAlCJEbJpBoYwY5PLLVJBWu6KMRf1hUmXOZUeRHgzfaiEMmWvXo44+NWMTHDcLdIJlEjrCQZJLcXZXik2C2KGVzniFWERJbbqnGVXqA6eYPZly0l2pHaDbRHiGkmaQNJ1bl5Js+RnlRXI/ddVESeqpZ1R+AuumFRmUlgZZaSbSFUSY1Jnpjl1KZ0WiYPKmhaZImMDnVn5+qKGhOWIya5JX+UQGYqo967LSEqze2QdWsT9aqExG42hjnVLzSupOIwY64H7HFquhrTmgm+yAaVKHabJA6VSHtg3lQ9WWzASLBkxnb4jcCJFTdAa6Fy+oESbn37WAVEuv+8KxOyJbb7lRrrGuFT+SWS8KqVCnRrBEEH1suFlhNIuusawDFB5LBLpnVHw83GnFQaeSJKwoJW/WHwYAasbFQrbo6QrdcTeKpm1aEDBQbJWiKg8xZNeIFyRcakcW9RQXyg54Mv9WIHkjrgS1TadxwYxFLs0eUzkwcoQMRSFyRhotSd+3112CHLfbYZJdt9tlop6322my37fbbcH+NRxppfBh3TGYckUH+AXz3ncERadztUhok9G344SQEDtQfdKyxBh1Rn/YIDodXfjgOOu70RxlPdO5552VEHtiRlpfeNwl+5FTJFp+37nkZlUzmhwSm116ABKnbRMgVrvf+BBaEBPZI4bbXTkLmM+3uu+9XBP8W5cXbjgNNlfC+vO9YxC5WGtFHr3hMWlx/vXhhEd997SvI9If44ou+lRnnex8T5+wvT75XR8RfvIwr1S9+WBPQn+0yAJP1+W957suKAIsHEzoccHl20woeFmi73LVkDQ/03cm4wj0Kmu57LMFgBl23wa100IOWA+FKHDjC1kUQLigsnQVZYsAWei6BWImh5WJiw88BUIf+hpvA/Hr4hPt1JX9A5Bv/VFLDFuIQK/BLYgFU2BL6jdCIXjFfDNMnk0pYYYTZG8sJY0hFlxDiiwe0gvPGAj0UTq8mZ/Qf8ISnRQEe7yaVsKL9tDc62i0QdzrZnO9CdxrS6Q91PvkDHhyHhyfmZXLxw5zgUpKGFRRvBWWcZEnScIQAHm4CgNNkTPxAtxmK8pSoTKUqV8nKVrrylbCMpSxnScta2vKWuMylLmMyCT+soTxeMEMa9IC8XVIkE3kogxeWyUxmbs0pm6jEJCZxCU880gzNzGYz+6CUT0AiEeAMZyIawbWvPEKZ2kynF1hmlEw0QpzwTMQjrOmVc6rzntz+LMok4snPRpiKK8C8pzrLCZRM8POgjfgEV/ogUIGW0CefeOdB+Ymu9zVUoMX0yTcnetBLaOURFxUo0HrC0YlWFCt6COk9M5mTTZT0oI7QSh5Uqs5h/aQSLz2oVtZAU3UGZZ85jec/reKGnqbzp0GN5yayMlOjNpOlOLlEUuGpFYY6lZkP3YknphrOjFYlE1dlZj6BItGpSsKEYS3DUH0C1KQ2gp5ZSURY2RmUR0yVoFi5g1PNsNaNcKJPIPFEWUvq1awENKRlKKxFIKFIOjiWDo08KUfc+dJHKNQrmTisQBPLkUvs4bGgfSwfPNoRb06UnGPRa0PRgFeLTOIOoY3dLR3u0FqMXAISg32EJOAqlkSkoaZj1cgkZEtcOtRWI5lYamgy0Yc83GENedDDcStyCdgWN7Z3IK0xGfLZ68oWVttFCCS8W9zphtcP5CWuKcNbEDykV7YvZK9A3ktc+R6EE/SVLWDtKxD85je0++VvKv4bWgG3l8COja980Yvg9fJ3vAg2b3j5QGDwGjgV1c1vdi9skOHSV8L2fS15acvhhFyCwsUdbYkX0kv3PhYPfgDxigfy1xnb+MY4zrGOd8zjHvv4x0AOspCHTOQiG/nISE6ykpfM5CY7+cnXCQgAIfkECQMAswAsAAAAAMgAyACHAAAAHh4eKysrKysrKysrLCwsLCwsLCwsLCwsLCwsLCwsLS0tLi4uLy8vLy8vMjIyNzc3Pz8/QUFBRUVFR0dHR0dHR0dHR0dHR0dHSEhISEhISEhISEhISEhISEhISEhISEhISkpKUFBQWFhYXl5eYGBgYWFhYmJiY2NjZGRkZGRkZGRkZGRkZWVlZWVlZWVlZWVlZWVlZWVlZWVlZmZmZ2dnampqbGxscHBwcnJydXV1eHh4eXl5enp6e3t7fHx8fn5+gICAgICAgICAgICAgYGBgYGBgYGBgYGBgYGBgYGBg4ODh4eHkZGRmpqanJycnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnp6enp6enp6en5+foKCgoaGhpKSkp6enqamprKysr6+vsLCwsrKys7Oztra2uLi4ubm5ubm5ubm5ubm5ubm5urq6urq6urq6urq6u7u7vLy8vb29v7+/wsLCxsbGy8vLz8/P0tLS1NTU1tbW1tbW19fX19fX19fX19fX19fX19fX19fX19fX2dnZ29vb3t7e4eHh5OTk5+fn6urq7e3t7+/v8fHx8vLy8vLy8vLy8vLy8/Pz8/Pz8/Pz8/Pz9PT09PT09PT09fX19vb29/f3+Pj4+Pj4+fn5+vr6+/v7/Pz8/f39/f39/f39/f39/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AZwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4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YmJkZGRmZmZpaWlqampra2tra2tra2tsbGxsbGxsbGxsbGxsbGxsbGxsbGxtbW10dHSBgYGHh4eIiIiIiIiIiIiJiYmJiYmJiYmJiYmLi4uPj4+VlZWcnJyhoaGkpKSlpaWlpaWlpaWlpaWlpaWlpaWmpqampqampqanp6eoqKiqqqqrq6uurq6wsLCxsbGysrK0tLS3t7e7u7u+vr7AwMDBwcHBwcHBwcHBwcHBwcHBwcHCwsLCwsLCwsLCwsLDw8PFxcXGxsbIyMjJycnKysrMzMzPz8/S0tLV1dXY2Nja2trc3Nzd3d3e3t7f39/f39/f39/f39/f39/f39/f39/g4ODh4eHi4uLj4+Pk5OTm5ubn5+fp6enr6+vt7e3u7u7x8fHz8/P29vb39/f39/f39/f39/f39/f39/f4+Pj4+Pj4+Pj5+fn5+fn5+fn6+vr6+vr6+vr6+vr6+vr7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v8/Pz8/Pz8/Pz9/f39/f3+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBfCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDim3JiE4XLVq60GE0dusaIjHiyo1LhE1bq3R0zN0rVwedu1K78B0stwvgp0cIK46B5DBTwYsVG3aMlE7kyH8pG9V7WbEOzUXXdI68BvRQuKMVEzEdlFHqyGxZ+7T8WnFm2Twh1x5cGjdPLbsJa/H9O/jg4cR16jZeOLlO2szl3nZu03V0ubGp30QdfTVGRmuK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2trb29vb29vc3Nzd3d3e3t7f39/g4ODh4eHj4+Pl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXm5ubm5ubm5ubm5ubn5+fo6Ojq6urr6+vr6+vs7Ozt7e3u7u7v7+/w8PDw8PDx8fHz8/P09PT19fX39/f4+Pj6+vr8/Pz9/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBxCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDinX5qZDZQp/Gcv0EJgiNt3CDgEmrtuqnKnDz6q1Cty7URT/0Cob7Y5Hfp3gGK4aL5zDTRYsj0zDsGOmnwJIV/+hbmSiVzJGpdC76CbRkzqN/gjEdGUxqoW5ZKw7yGmhp2YtN1fZJCPdiQrt79vY9GHjwncOJ6zV+PGdy5XCZN795Gzpc3dNzxrZOO3vO1dZp/rjOSArNlCZBhDyx0qeypkJq1PRRdGpjdeioJ/IBcqK/f/8sPJFfV6OQ8UQSCCaYRBiFaPQZdKJZZAh//1Xo3wpTkPLVKWQo6GGCVmiC0WXKbWYRHy1YqKJ/QYxC4BQfxpjEEw1eBBlxlFFEhgor9niCC4ZsNcqBMsrY3kWJ4dZYRYiw4KOPQKCS1SkwFinjEyLaiFlmhVm0CgxPPllFVmNYaWUUGX3yYGgDQjRGmE+usMlVo5hpphoasbVdXHNhNEqKcPooxFVl2lnkEx2ZQsiihGCXkRiBhpmJVUQaKqMiPQUR6ZNlVKWJpVbiyZMLm/ooRVWFgFpkGDypwmOp/isOSpUaqspo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9fb29vf39/f39/j4+Pj4+Pn5+fn5+fr6+vv7+/z8/P39/f7+/v7+/v7+/v7+/v////7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AHEJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKhQkK1FivquA80WGjrQ0dT+CoOnsVDlu3eNvqgEN3qqofeQO7/TG3r9NGdwUL7tHIMFNViRUvLuwYKWDJmH9URgoHs2cbfDcThfwZsw7KooF2Lo05dGqgT1hjnvI6aGTZeXXUBoob826foHpLNvt7Z3DhgokX14lc8HKet5Hrfq4zdnO3tKnnXH0dtMZUaqL+FOHRg0kVQZsbqW/EiiPp66cxIuIRor59+ymgiBrL6o+VIgAGKEUao2jEHXKuUdTID/c1eF8KVaQC1iBPBGihhWm0h9FlwmlmESMtOCiifT1oyNUZF6YoYIEXvYcbD6hJBEcKI9YYwg2QcCWFijwWwUQkGDXCw4uNVSQJCzba6MNWKPbI4xMmVvQXa4RdRF+SNqKR1SBOOmmFgdHhtRdGemCZ5AoxSsVKhV32yIhGaU0RmQ5TyIURLC+YmWQUV/3RppNkfFRWR23omaQKrlj13589RpmTE4YmiV5VjDo5SE87RGqjGVUxUmmPbfSUp6YjUtHppzyGyhONpIrIxKn+qKao5U6otDpiD7DGaqGqO61gq4NOVMWKrhf+0VMMvzZ4hVU7Egsgizsxkex9eliFhrNFBNtTodOGkEIsVo2C7aU9oVJCt7heda2u2voE6bSBYMVKs6gC+ZMqKiTrIVaRMIEquUABQoKtLkDLrxOVAhwUGq2q4EhXrCzqpBP2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////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AiQkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7blpDdVkvz4kaTKm0llryKqsrau3R9VEMWdmuWu37pc9j5NRfev4SqpBDOlYrgxXsVK+zpuvAXyUUSTJ+u1TJRx5sZVOA+d9HkyXNFA35R2/AY1UM+r/1Jx/VNtbNm0fd5unLvnbsO9edr+XXd2cJ2wif8wfhynauVrWzfHSRr6j9MZOdFho4XLm0GiW/59TL6b+cUuQmKoXx/DRpI6ZTG9ufKk/pMqawptxKx8c0VabtzA3oDrGeGfV5hsYd+C9l2hX0ZbEFeZRbJUQeCF6tUQx1eDMOihfWuIhxF5n5k3ESfpYaiiFl2t8eGLT2AhokWpkOgYFYlZlISKPMYAx1YdwvjiGRpF+NmEFmXRI481LJIVJkIKuWFGiNhY3IEUUbJkj0HQgpWCUb5YxYwYnUWFZ2e+pdETW/Y4ZVVQhgmjdDylUkObPCJx1RtywniFT3HgyaMNsFhFX58vctKTkoKq6GRViMKInU5sNorhm1NF+iIdPRFhKYaBUdWKph9impOAnxKIhVWkejhpTv5HpEpgG1ZV0eqCr+JUqazrcVqVi7fe51MavLKXiVVB3rqGT5gUq54QWB3aaq45eVosrVclq+myP9lR7A2zZAVspFeQ2Smv2GLVChaRVoGJUJagamkSsmzVihh9XvHuUJDIi+cR9XYVh61ChmhUJj8IWkW4X7Uyn4f4USvUqFvawEZZnExCRxyTSGwUJEioaAMWoUxnVCtxYKHEEUhUoYUhJscs88w012zzzTjnrPPOPPfs889ABy300EQXbfTRT00yx9JzeIz0SXIYYUIGVFdtghFyPK2SHDdU7fXXN2T9kyyTHGL2IZMELFoSX7f9dRI9ZTKHGHTXTfccm1jGif4ObvddtQ6K5iSI3YTXLQhkOfiteAY64CTLG4VHLsYbapPF9uKKh2YT5JJHTudYcmCOudgzDd655IeT1bXoit9AUyann563WKGzvjjpMMkRe+e4f1WE7YsXIZMsu59euVclAK+4CTJFUnznloQ1ifKLO33SIc9LfkhYtVPfd+8sYZ994duD1b33bYO/kvjj213+V+ej77X6KrHfPt3vexW//FTTn5Lz96tb9MAyPf59zXomIV4A6Xa8riTPgFQrwUx0F0D/aeV3EMyA8GQCuwDOjnsZzIAFVWK68aVuLKvjn+tqwrnnfY52EBzhSh7nwgaG5XLo09xNSti5E+4lcf7e22BONkHBwsnhg4LhBBCBl4PA7UQWljjbISxhQ8HgUHQ61NpIuIa5sGkRJXIowgO9VoIiyPCLIJmEHNYoBwSi8Y1wjKMc50jHOtrxjnjMox73yMc++pE2m0hEHOgQiT9qJBVZuEEECMDIRpKgCG4wJEW2IIFGWvKSJniQJBtiiBJc8pOWdAARnLhJhFBiBKBMZSODUEWszCITi/iDLP+giEqw4ih0qKQqdzmDHHEFE4OYpTBlSYlCDSUVJNilMglgBK7MIpbDjOYgbhmUWdhgmctE0lVmoYhoelOW1PxJF7C5zAhoIiuQ+OY3B8GwntAimeRUpp6uogl1qtONMv6JQzyXOQGsHMKe6jQmT4ywz2XCrCqsAKg6K+ETERRUmUqwCiYU+k1F9AQWDnjoLmtglXRS1Js9uYRGdynBqkDzo8PsSR1GqkoRWOWkKJ1lTxzB0lSSwCqViGlKecKKmoIyBlbJhE5nCQmfPMCnl1whVWAxVFkeqycxQKolrXAVmH6UnT6xglQbeYmrMFWn++qJJbZKgJJeRagofdRPrinVLmhlEh9NRDs/QgsvcSQSEEAqULeCVntCYq4bocUrWBGKwoaCFa+wK0aw4NMIFJIrsLDqLA9BSo7IwrCYNWwrI5IDljYgDWCBhSYqsYhFTAIT4fQIYTPL2tRWBBae1MdoRIO2Wta2NiOyuEFBHxAqoF3WtsDdLESWsEhsjsBUPaMFcJcbCsVeJBVK0GUqS9DboL2CucB9RUfacAMSVBICFigBErBEW+za1rWlNIh5gZvehCh3vax1bnsH8l74Yla+8xWIfTOb34PU1r7o7e919xsK7fa3IPW1L34P/Fv4Cne+/2VugA88kAifl8ILabBtH4xhwf4XsQvGsELqKuISm/jEKE6xilfM4ha7+MUwjrGMZ0zjGtv4xjjOsY53zOMe+/jHQgsIACH5BAkDAOEALAAAAADIAMgAhwAAAA4ODi0tLTQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDU1NTU1NTU1NTU1NTU1NTU1NTY2Njg4ODk5OTo6Ojw8PD8/P0BAQEBAQEFBQUJCQkNDQ0ZGRkhISEtLS01NTVBQUFFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVJSUlJSUlNTU1ZWVllZWVxcXGNjY2pqamxsbG1tbW1tbW1tbW1tbW5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm9vb3BwcHNzc3V1dXd3d3l5eXt7e35+fn9/f4GBgYODg4aGhoeHh4mJiYmJiYqKioqKioqKioqKioqKioqKioqKioqKiouLi4uLi4uLi4uLi42NjZWVlZ+fn6Wlpaampqampqenp6enp6enp6enp6enp6enp6ioqKioqKmpqaurq66urrGxsbS0tLq6ur29vb6+vr+/v8HBwcLCwsPDw8PDw8PDw8PDw8PDw8TExMTExMTExMTExMTExMTExMTExMXFxcXFxcbGxsbGxsjIyMnJycvLy8/Pz9LS0tbW1tra2tzc3N7e3t/f39/f3+Dg4ODg4ODg4ODg4ODg4OHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eLi4uPj4+Xl5ebm5ufn5+jo6Onp6erq6uvr6+zs7O3t7e7u7u/v7/Dw8PDw8PHx8fHx8fLy8vPz8/T09PT09PX19fX19fb29vb29vf39/f39/j4+Pj4+Pn5+fn5+fn5+fn5+fr6+vr6+vv7+/v7+/v7+/z8/Pz8/Pz8/P39/f39/f39/f39/f39/f39/f39/f39/f39/fz8/Pz8/Pz8/Pz8/Pz8/P39/f39/f39/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AMMJHEiwoMGDCBMqXMiw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V1hYWFlZWVlZWVlZWVlZWVlZWVpaWlpaWlpaWlpaWlpaWlpaWlxcXF9fX2dnZ29vb3Nzc3V1dXV1dXV1dXZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnh4eHp6ent7e319fX9/f4GBgYKCgoODg4WFhYeHh4iIiIuLi42NjZCQkJGRkZKSkpKSkpKSkpKSkpKSkpKSkpOTk5SUlJeXl5ubm5+fn6KioqWlpaioqKurq62tra6urq6urq6urq+vr6+vr6+vr7CwsLKysrW1tbi4uL29vcLCwsbGxsfHx8jIyMnJycrKysvLy8vLy8zMzMzMzMzMzMzMzMzMzM7OztHR0dXV1djY2Nra2t7e3uDg4OHh4ePj4+Xl5ebm5ufn5+fn5+fn5+fn5+jo6Ojo6Ojo6Ojo6Ojo6Onp6erq6uvr6+3t7e7u7u/v7+/v7/Dw8PHx8fLy8vPz8/T09PX19fb29vf39/j4+Pj4+Pn5+fr6+vr6+vv7+/v7+/z8/P7+/v7+/v7+/v39/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AG0JHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUvWpSU+cdLG4WOpbFY+X7DInSv3Cx+3VB+Joct3rphHeKH+2dK3MJYtggI3/WO4MZbEipM+Iuy48BbAkY+GqdxYTGajfDg7vvt5aFzRhr+UFmoJtWNOq4GGdm2YdOyecWgbjnPbZ27dfXn35vkbOF3hw3UWNy4XeXKcs5nLtf38ZmvpcmFX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yMjMzMzOzs7Pz8/R0dHS0tLT09PT09PT09PT09PU1NTV1dXX19fa2trd3d3g4ODk5OTn5+fo6Ojq6urs7Ozu7u7v7+/v7+/w8PDw8PDw8PDv7+/w8PDw8PDw8PDw8PDw8PDw8PDw8PDx8fHx8fHz8/Pz8/P09PT19fX29vb4+Pj4+Pj5+fn6+vr7+/v7+/v8/Pz9/f3+/v7+/v7////////////////////////////////+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gAbCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1L9mUbNWbMqGlTViufK0iAyJ2L5AqftlQHXZnLt++VQXih8lnSt/DcJXcDM+VjxLBjIEYSK0Y6iPBjx0sATz669/JjLJuN8vHsWXLooJ1JO75yemhc1Y6RtA7aBvZltrN9qrH9WE1un2Z4Ozbzu+cX4YaJF9+5G3lf38t11nbOF3f0nK+py76uM7Vz1txz/o6mDsT0RTVXihRZQaMIki1uAq9JmzaNoY7eeYPOeMbGiv8ABrhEfGIJ4oUVUySo4BRZWIfRIEogp4RmFgmyXoAYBrjfV2Ys6KGCWdyXEWO8GUFhRWrkkOGKAC7hlSFefCjjFHZpxEeEqk2IkSD+seiji1zFOKOMVoj4YH6GYXFiRSr66OSGWJEx5JBQYvRW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/f39/f39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBNCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LFuajPHkeleWqRoySt3DFzFlrdc4UuHjhTplLN2qZvIDhlun7tErgw0qqEGb6F/HhwYuRznHsmG9koo/uUj485XLRyZsRW/YM1G3ow2JICz3tWDXQR6wRq3XdM0/sw3lo174dOLfunbB55539W6fwvMV5mj6eOrlONcffjnZ+UzPvzhsDrSGjuQoZ33QD/vHZg4fPH4+geU+v2KeKjvfw4QMhUxbPGTD485dhE4hj49iQYURGfATGJwR4Xu1RRn4M5kdGHRwZxppiGAXiXoEYvpfGV3c06GF+aWyy0X+UBXjRFBmmqMOGXHX44YtocGSXY3tphIWKKiJ41R4v9ggGGx3NsVxc61VkB44qCrHVgj6+yMdHZ6XlkRJIqkgfVng02WOMP+VRpYpAZHWfli/259ONX6aoo1SBkNkjHj8VkWaKV1bFh5svQujTnClSWBWPeHrIYk98ZqjEVVkG2iCXhBZa4KFW3akog3o26mh8Ulz1x6SU/iTEpfHVWRWTnJ7n04Wg6rAGVmpwCoaJ/jytkep7WQVCBqdw/hQIEKn6eVUdk54hVBqgAtHHVmkESoaIQhFxqRlcbYKGm2SYKlQgn/Lp61ZsaHkGs0Tlke2XUpjpFR/TflhGrkcF4myVWJAVCB51pIFGHXVYq1Qa42KohB3UEaVdFf0SgcWaASes8MIMN+zwwxBHLPHEFFds8cUYZ6zxxhx37PHHIIcsMkN7aGHFyVZoscfIKgFixQwsxCxzzDNYAQjLJaEB88w808xoT3/sccfQd+yhb2RI9Ky0zEj05EcdbkQtddR1+HGZEEtnzcIQOm2Sx9RgS50HuGslrXXWTd+0iR1ht+2GHWSPhcbZZ/8809dut43w/leA7Ez30jPcTJMfeedtNVlW/H22FTVBXXjblYrlt+JK60DTH4/nfXSClJ+9skx7ZO7252Fl0bnWWcx0h+ht3zFW4qcvzbhMq7MOtutiwR57z7PHVLvtUuMelu67z9w7TL8D74bwYBFffMzHvxS68lGTDpbpz8+cukyYU+/G5l3tkf3M1sPkOPCRhzV58TfURLjyh78+PgvRx4Q363t71Xf2gdu0Nutwo8vcnme3mXgtc2MjjNlil7acPM1tVbta7JQENKERzWiqWeDfGoizj+iMbjMoYAc74rIbLO0GNhuhSfaQBZRZIQvlU6EMZ0jDGtrwhjjMoQ53yMMe+vCH/kAMohCHSBo9mAELUqCCGNJgLiI+hA9GYIEGpkjFKc7gCk5sCCCIUMUuVpEEzcniQfrwAi+akYpCgERZNhG3o+SBBGeMowZ+EBZIPOIRjchjHh/RxqAAogRylGMQvrIJPRpSj8QRyiZkEMhAbgsreDykJB+hRqFQoZGBBIEethJJSU5SKI0YASYDGaasFNKTqExkT7AwykB+IH5WQaUsG9HHnMyglYGM11VOOctP+iQQH8ClHGkAyV56UpU6QYMw5TiCYhpTkj8BwzLlWMunPNOT1azJJad5xhhG5ZqSzCZNrsDNMx7LKp0EZyN+UoZymrGSVeElOJGZEzW4s4vN/tylOvfYES0AgQQiGMAAREACIIABI48AwT2paDlnghOeF/GDECIg0IpadAAREAIsJaKDhU5RVFWBhDrF+RAtUPSiKBVoBLRQkTR4lAQkdYo8Z0nPifwgpTitKAUncst76lIrMz2mRmaQ06IOYAYUqcM9YdoVO8oypg25qVGLutOIIKGcIVgVITdxx0bcEaoN0cJUp8pSiUCip8sEqcP8cNKx5jQCG3XII4AgzBDA6mFCcOtUqxqRKrSSBOmDWFv1itMIWCQPjJTjB5BQ04aJlbBGLWtFziAEOHZRBlJgF8WkCtmc0jEj81LDHLxJMRJ0tqgkGGJAT4tTEQyRtUV9hS1scara2aLUtUI0rW0tmlohcna3A/hsEB8L3AFINoiDna1hiZhX4PIViGzdLVyzSFzYHpeIv+3sc4lI1NMiVYwEaS5htytGk7p1peBFiESTe9GMxjW9BdHCDwAqUIL+4Lrwza9+98vf/vr3vwAOsIAHTOACG/jACE6wghfM4AY7+ME/DAgAIfkECQMAnAAsAAAAAMgAyACHAAAACgoKGBgYGhoaGhoaGhoaGhoaGhoaGxsbGxsbGxsbGxsbGxsbHR0dJSUlLy8vNjY2Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4QkJCTExMUVFRU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTVFRUVFRUVVVVVlZWWFhYWlpaW1tbXV1dXl5eYGBgY2NjZmZmaWlpbW1tcHBwcHBwcHBwcHBwcHBwcHBwcXFxcXFxcXFxc3NzdHR0eHh4fn5+g4ODh4eHi4uLi4uLi4uLjIyMjIyMjIyMjY2Nj4+PkZGRlZWVnZ2dpKSkp6enqKioqKioqKioqKioqampqqqqq6urra2tr6+vs7Ozt7e3urq6u7u7vLy8vr6+v7+/v7+/wcHBwsLCw8PDxMTExcXFxcXFxcXFxcXFxcXFxcXFxsbGycnJy8vLzc3Nzs7Oz8/P0dHR09PT1NTU1tbW2dnZ2tra29vb3d3d3t7e39/f4ODg4ODg4eHh4eHh4eHh4eHh4uLi4uLi4uLi4+Pj4+Pj5eXl5+fn6enp6+vr7Ozs7u7u8PDw8fHx8/Pz9fX1+fn5+vr6/Pz8/v7+/v7+/v7+/////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AOQkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7asWZWR6pDRwlYLmTqRzlaNtLatXbZkKMmN+ueu37Z/9jrN87ewljyCl/Y1XDhw4qORGDPW+7hoXcl/yVQmGhmz4bibg9bxbBhxaKCXSd/VfPqnasOtXb/+G9vnbNq1ed72m5tn6tuse+ccvZutaeE4OxcHjRznb9XBNUrCs6b6mj6VElOSdOkjpeKUM/7iocKkvPnyXg6VlcRnjvXqehx1XPzaMcZDU87rN28lO9hKerwn4BpzQMIRYaoddxEe+zVYXhTyeUWJHANWyAhH9Elm30VzOOghhF1RUuGIa6i3ESXP2ZWXRgx6+KF/WVVCIYkVRrhRWqmRkQdzGFUShYsuWrEVdTRWKEd3qAEJpIlXSVIkiUz2VImSQHqRFR9PjjgHUC1S6SGMVbmXZYXh8QSGly72gdWYI9rIkxVoerhGk2xWGOVO5MXZ4JxWOVmngHfqlJ+e+/FZ1SV/CnihT3ASqp+hVSX6niQ/NeqoeXhgFaCkkPLU4aXmUXqVI5zqAZQkoJZHhVZi/glmT/6WOpppVpAkuqFPh4A6BVeM1GkHUWRcGuhVf4xpB5JDxerlrF05MiOJtwpVibJAbgnWJYe0+p4er1pGZRRqkkWJI4ccwoioTDlC7XlrdNucT5LM4YUVU1BhBRh4uPvuvvz26++/AAcs8MAEF2zwwQgnrPDCDDfs8MMQRyzxxAX30ccZZ1hMMUt9VFEEECCHXEQV4W5MkiJShKzyylIoAhQm2z3yiCSUYBKaHB+vrDPIRcjR0yXklit0uY8gu5ccOycdss86TTL000KXaRbSSlfN9E2QQK31IQaepUjOVSddhMs2Ob211lKLlXLYVUthE7Znb210WH2wzXbJMgUdN/7Uj5RVhd1hV0ET3HtrbfNYYAO+cxE0UVL41ml3VbfiVeP9kiSPa40uWJNTnrTlLj2SOd9jleG50mXMJProQ/ctlumn75y6TJizLvTmX3Ueu8qgt+S47eVGzpXuu4PcO0uE2364WInvzjhNeo/u+lh/Fw+y4IMDPzfn1htfNuvCf7X27m5jnXnXZn3tPNk3mR13+GFRffrVOF2yOt/bTz2/TzBLIjPNy3sMzgDXM5OJBGVsa5kBSdKx5gFhZMdbIEgsVoYyaEyCGMygBjfIwQ568IMgDKEIR0jCEprwhCUMAxKAQAMY4MAIVEAfCiHSByI4AAE4zGEOZfAFp1iiEf578IMMw2KHG+jwiEcEwRcCSJQ8TCEHLIiiFI3QhUaAJQ03RKIWc3gEo+ShCFIMYxhfIAUeZQUMDdiiGnFYhEwI5RJSEKMcwzgDa2VlDmlc4xq7CJRIgHGOgIziFtxIrAfo8ZCr8skl/hjIQHYBKy845CEdwL6dxLGRjXQBHaziBUlKEgc9qQMmR2kDfTHFEhDwpCQ3uRMgjHKUWqBKJ1V5SFDqJA+vJCUho4IDWk7SEjq5ZC4bqSAfZtGXa+wUTTJhg2FisnxQ6QMyDxmFnETCmZh8HlTWME098vEmf8BmI3MglVl2c4s6GI44A0kDqZDhnGrUpk32sE5A2kAqef6A5xaZkBNH1HOORJCKI/SpxVjixBL/lOM3n5IJQxJUh6ysyCS+MAUcWBQHU/jCJDJChISG0aBRKcJDc/iAXUqEDjO4gEpXytIZRJQiXfCoFCv5lHeOFAHyhMgecMDSnvYUB3uoSCRiINOFQgUTIBhpA4IqkTKAwKdQXSkIZjcRKsh0EFWxKUGNMJEvRPWrK+3hRCpBg4Q+4Soi1ScINhqRMoD1rRegakTk8IJ64oCthxIBPB0QwYTs4alw/SoImCqRM6yzBlbEyiMcOs0xTISngQWrLSdyhxk4swhmtEojkupLB6BhInSILFxfGhFFGCGXieRKJWxAywv0VSEyEODtWydLkS82Ugpu6goZOLtGB0gBmBOZhGzhiteK4KcIN2ABDXJgBDAUNyxfKMIFkPiAG1Bhel0d7lvFqjBF2GEOf3huRaagXbDuCoWQLS9UaVvC9Kr3pzN073tXyl4Syne+F6jvCMmLX5ae94Re7W9YZyhcAatUvCSMrYD1S8LQCpi0J7yvdhlcwr/Od7AzLIhb3yvXDAskwNrlrocJ4lTZTnXECNlpZIGKYoXQQcFRxQGEW3yQiVb0ohlFMI13zOMe+/jHQA6ykIdM5CIb+chITrKSl8zkJjv5yVCOspEDAgAh+QQJAwDGACwAAAAAyADIAIcAAAALCwsVFRUgICAhISEiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIkJCQlJSUsLCwyMjI7Ozs9PT09PT0+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz9AQEBDQ0NGRkZOTk5SUlJXV1dZWVlaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpbW1tbW1tbW1tbW1tbW1tdXV1gYGBpaWltbW1wcHBzc3N1dXV3d3d3d3d3d3d3d3d3d3d4eHh4eHh4eHh4eHh4eHh5eXl7e3t+fn5/f3+CgoKFhYWIiIiKioqMjIyOjo6Pj4+QkJCRkZGSkpKSkpKTk5OTk5OTk5OTk5OTk5OTk5OUlJSUlJSUlJSUlJSUlJSWlpaYmJibm5uenp6goKChoaGjo6OmpqapqamsrKyurq6vr6+vr6+wsLCwsLCwsLCwsLCwsLCwsLCwsLCxsbGxsbGxsbGxsbGysrK1tbW3t7e4uLi5ubm6urq7u7u+vr7CwsLFxcXJycnMzMzNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Ozs7Ozs7Pz8/Q0NDS0tLU1NTV1dXV1dXX19fZ2dnb29vd3d3e3t7g4ODh4eHi4uLj4+Pk5OTl5eXm5ubm5ubn5+fo6Ojo6Ojp6enp6enp6enp6enp6enp6enq6urq6urq6urq6urq6urs7Ozt7e3u7u7w8PDx8fHy8vLz8/P09PT19fX19fX29vb39/f39/f4+Pj4+Pj6+vr8/Pz+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gCNCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqxZlb9ANSLEllAjUL/OVv1Vic+du3jv8qkUVy7UWXbzCtY7y69TToEHD+bDyfBSwIoj3+FT2PHRX4klDwbU1zLRSpo1V/JMFHNoyXw6k/4J6rRmUKuDNnItuVFsoIRoRyZ0+2du3YN59+75G3he4cN3Fjd+F3nynLOZ47X9XGdr6XdhV89pWnrq7TpB/ksf3XHVp0qYPtECb7E7cM4bPQUq46W+fTSDepUFFiuTpEYAWiKKLh1BphtlGtHCh30MMlhGIWOJAgmAFFaoiX4bIUYbH9phtAp9DYZYnxsYdgVMJRWmSCEktnBkoGaAVIaRJyLWWN8aJWp1ooo8AigLR3Rlltdeqln0oY02utEVij3yCAmBQKrVlltwcbQGkkhCqJUoTTZpiVCTYIlkGTlWBcyEXfYYS1BoiJllVqWk2SQmQNHiJpJrZIWJnE0C8xMkdyK53lX/8cljiz4VEqiNnmBlaI+I9uTGojXSedWjh/40KaUhTuIopilGytMgnIbY6FWWgFphmTopWiqD/qtgxaWqjZDnE42v1ldGVrrQ2kgpQYH4aiBaaaIqJH4C5eqrp2LVC5qP/hhUL8JSSuxWtmDaCVFhckpmV7JA2+W2RS17ZxmxeqVLqk1CIq1R5mJZRrNfxbJnipWUkixSk1RboxqDjgWMLQTbwipSvRTi732eskeUJ4UM4oYbhUASsMMYZ6zxxhx37PHHIIcs8sgkl2zyySinrPLKLLfs8sswxyZLJpm8G3NKshBSBhE891wGITbfHJIugTTR89E9NxEIlED9ggsuRVoGyhNIV92zFR3uhIssq3TttSy4eIaJ0VaX3UTWNwHDtddsdy3LvmeBQnbZZqNN0y5t5+31/i5y6UI13YBbwTRNwOht+CpwjxUI4IwTcW1Nax/edtBhyTJ341Y3QflLuEhueNhkEYI5487FFLnnbG/uVRWjA74rTagbXlbrjNP0S+x6Rw0u7YAPzjnueYMeFia8021pTJ0Dz7bwYBFfvNXHw3S78l7rzpUsz1utOkvUez179khD3v32XO0MPs+vz5S88syHJfr5RJRuuvLkX8/E+Uz4HlPhwCcu1uLge1xN8BY7vp1FF6x7XhX0NxO1Se5thgHF/XjHBLvZZGt5A5tnJEi7CjbtadbzCygS2LgqWFBoGiHaBMvGhKWhcCQ5M9/RfsbAF4ZEFpjARP1syMMe+vCH/kAMohCHSMQiGvGISEyiEpeYMlgMog30UcMfvsREiazCCSYogBa3qMUJ9MAQVWxIL8ggAS6akYs9OOG0GmEGJuxgBjnogRPaEL2uiOIEZ8zjFiUwCKP04g46mIEgB0lIIlCHK5KggB4XWQAIoGEovwjEGwlJSUI2wVZYyUQZGcnINAhFEDiopCgHyYNMZKUWJeAkJyOgJZ/0YZSwFGQORIGVHqhSlRWohU8iEcte9uBiUoHELW/5hJ7oIpC9jCUWrILHYa6SXjhZQzKTSUWpNMKZxNzJKnIwzV46gSpPwKYqT7ATNnQzmZ+YSjPFyUg1xsQJ5+xlH6USAXZyUhA6/uFBPGP5yKjMwp6c3ENOgBHKfY5ymVG5BEAZaYacyMKgsPxmVEqx0EV6Eie9gOgoixmVXtSzomf8g064qVFKjmEqEwDpGQ95kx6UlJJ5kkoOVMrFCIiKIpZggxl2agY2VPMiY3gpIcEolTTQdIs5sMjUUtCBpjq1qSl4gjsbAgmhClIHIVSKKI6qxYtKpBZmeKpYxWoGXVIEGEmwakynsoOjUuCmDgFFDsZKV6fmYKoKMYRQc1DDpnhikyAVqEQscYK6GrYDJ/hpRKjw0nlWhQ0qTapEQFHYwxr2BHhFyC30CdGT1rKiFZDRQ2oxV8seNgdmlcglIOqDg0lFF1m0/mcEIjGRsJrWsg2lSCaQ2U0o9FUqtJipOCkgiYmA4ramxWxFZBGFaeaADV9pAjZRQMuJOAG5ppVoRSzxBFjqwAw7rAomegABTqJAgBJhKnYPm4KM3IIQaxjDE6JQhjY0jCylMMM6t0iBJ9wXp+s1rWJH9olIHCITwKwIGwJsWegu0bYMrmtulQjhCI91wkmssIWfimEkanjDTe3wERcMYrE6WImWKLFYB3xE9aq4vVW8roo7oN0lHlfFJsisED/MYBErkbQgRm0YBwIKE1g4x0MmiCWMHGATsDiMcl3vXZN8ELDe1gRlpXJCQOEEF4s1BU7QMZVzytOePlnLaE6zIJrXzOY2u/nNcI6znOdM5zrb+c54zrOe98znPvt5zgEBACH5BAkDAL8ALAAAAADIAMgAhwAAAA8PDykpKSkpKSkpKSkpKSkpKSoqKioqKioqKioqKioqKioqKiwsLC0tLTAwMDExMTo6Oj8/P0FBQUNDQ0REREVFRUZGRkZGRkZGRkZGRkZGRkZGRkdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0pKSk9PT1dXV1paWl9fX2BgYGJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmNjY2NjY2NjY2RkZGZmZmdnZ2pqanBwcHR0dHh4eHt7e3x8fH5+fn9/f39/f39/f39/f4CAgICAgICAgICAgICAgIODg4WFhYuLi5KSkpaWlpiYmJmZmZqampqampqampqampubm5ubm5ubm5ycnJ2dnZ+fn6GhoaKioqWlpaenp6mpqaysrK6urrGxsbOzs7S0tLW1tba2tre3t7e3t7e3t7e3t7e3t7e3t7i4uLi4uLi4uLi4uLi4uLm5ubu7u8HBwcbGxsrKys3NzdDQ0NLS0tPT09TU1NTU1NTU1NTU1NXV1dXV1dXV1dXV1dbW1tjY2Nra2tvb293d3d7e3uDg4OHh4eLi4uTk5Ofn5+rq6u7u7vDw8PHx8fHx8fLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vPz8/T09PX19fb29vb29vf39/f39/f39/j4+Pj4+Pj4+Pr6+vv7+/39/f39/f7+/v7+/v7+/v7+/v7+/v39/f39/f39/fz8/Pz8/P39/f7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AH8JHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmVoxgl0qMnEaNRZ69KugOnrt26dyTFlboqz92/dvOs2uuUEh7AiOHgoUR46arDiRHjGdwYqd/IifNUPioJM2a9m4nS9ZwYT+iho0hjhnsa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i5CQkJaWlpycnKCgoKKioqKioqKioqKioqKioqKioqKioqOjo6Ojo6Ojo6Ojo6SkpKampqenp6mpqaurq62tra+vr7KysrOzs7W1tbi4uLq6ur29vb+/v7+/v7+/v7+/v7+/v7+/v8DAwMDAwMDAwMHBwcLCwsTExMXFxcfHx8jIyMnJycrKyszMzM7OztDQ0NHR0dLS0tTU1NXV1dfX19jY2NnZ2dra2tvb29zc3Nzc3Nzc3N3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d7e3t/f3+Dg4OPj4+bm5ujo6Onp6evr6+zs7O3t7e7u7u/v7/Dw8PDw8PHx8fLy8vT09PT09PX19fX19fb29vf39/f39/j4+Pn5+fn5+fn5+fr6+vr6+vr6+vr6+vr6+vn5+fn5+fn5+fr6+vr6+vr6+vr6+vr6+vz8/P39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AL8JHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rFmWqEJ58hQK1VmssRwB2kO3LiBHsd5O9VS3r19Pep/icuS3cF1HuAIzbWS48R5HipXyddwYcGSjsShTznuZKGPNjRt1JjoXtGFAo4WiMu3YbeqfoVg3DvX652TZf2v7vI27rmXdO2P37ksb+M7Vw+uyMs6z9HDUzHd+Hi46us7Mzzlbz8mb9W+Nogr+zSFDfs2cRsvNGnt1qlSoU6kSe5xuujr48eTz6w+UPiyuUZUEKGCAocjSES70UdaIfBkVot+D+q0hSliseDLghQGO4lF3hn2HUSAQhpifJF+xguGJlRTHUSyNOGdXI9plBKKINE7IlYkonqjhR2mt1ZZHoNAo5Br9YYWLhTmeWKRPtawhpJCBbAVgkid+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4+Pj4+Pj4+Pj4+Pj5OTk5OTk5OTk5OTk5OTk5OTk5OTk5ubm5+fn6Ojo6enp6+vr7Ozs7e3t7u7u7+/v8PDw8fHx8fHx8/Pz9PT09PT09fX19fX19vb29/f3+Pj4+fn5+vr6/Pz8/Pz8/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AvwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7asWZbNhKkV1uxs1l2kLsmdS2qXW6q/Ps3dO/eTsLtQc/EdPNcuYKaCCSs2fBjpL8WQL/1tfFRvZMKfKBvddRkyY81B43YmTAq00GajIbc1/VNYasWTWfd0/XpwbNk7adfeext3Tt275fb2fRN18LmriesUHby08p2cj39+jtNy7czUcwcffpEZKk6Jwv4nAjWdrLNlapMl7xg9dXmLzDjhmU+ffiBUZY/tisW/f6xg0XjU3mXvVRRLIPUlSJ8hxYTVzH7+RRjLMR4JYx1m3FWEioIczhcIMF81I+GIsWR4EVyD1dXRhh12GEiDXIlI4ogUfpTWWutpBEyLPBrSFYQzSujMUInwyCN+Wh0TJIm8CLWLkTwGslUuS5I4JFDyQdligVE5UyWJxAQ1iJYtYnfVMl+O6EtQZLaYSFbCpClhkz8V02aHb2IVp5z+0enTjncqmOdVyfDZJ5uBJjioVTIaWmJQCCZKHydaOcrfMkExIil9SGIVjKO5CMXipsxoFY2jNYq5qZlZKSnnL/5EjXpnIKVy9emXuwRIVJZ3xvKVq0H+omtRhtzZqVfO8EJiLqkexWuUx4LlDDG+8GKtMJgyhcqYboKYnaiMRDrfIJ9w+e1PwMB47rrstuvuu/DGK++89NZr77345qvvvvz26++/ABcUjCOOfPEFwcEEvFIwbeigwMMQP6xDGwkrTFIwX2QQ8cYQZ/BF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////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AqwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7asWZfLlp3d6quUp0twL3kq5Wst1WOh4uqNK+qYXajCOu0dfKmTsL9NhRFefOkw4qTHBDMe3Mnv46N5JxMWddmoL82MHXcWSgr0YlKjh741PdhTaqGsF78Guiw2YbWze9a2vRd3bp689/72uTq46+E8Swe/hBr5zs/LRTvPKSo45+k7I9uu7DEXqE+RKP59GpUM8bLyIRXHlp5xVCJA8OPDd+SqbDNfu1zpd2WLl+WOgYFmGEe5LCLfgfF1MpYwtOznoH68ROPRMdUx1heBiCCoISCLoNdVNPk9KKItHnIkDCnFyUUKexjlkuGGGi7yVYgiikhLMyKlBVIy78G4oYJcCVPjkK7sQtQnPvpYn1bNNEhkjSzyJMyLSWroCFtPDkmLUKJU6WOJVtGY5YM4AhWJlzBeh9WYQ4LJk4FoavhJVsuwCWVQcf6YVTJ2ihilTnlqGIlWfT5YTFA9BhrfnFnZUuh+vvnUiKLygaIVL4/qJxSSlML3p1THZBqMULl0CkgiXGHapy0SCjUppf5qZhWNo3a66ZMwlMrYVTJOZvlpT13mecivVTUj5oi2BsWpl4fkIhaDNQbTKlLBJpmIs2Q1k4wwwhQTqVLCvKrhIZ8ki91O3jXSYyORiELsufDGK++89NZr77345qvvvvz26++/AAcs8MAEF2wwUp088giQB7OECBktWCDxxC2Q8UjDJz1Cw8Qcd0zDxRiHlMsSHZfc8RLYXlYKJ5FEwkkpPo2ysck0S0zDKIiVckgbPPfM8yEw5zTKBzUXbcEHOJ9VDB8+N93zIYfalMvMRtdMQ8pjpWKH01y3gUcqNpFctdFLlKV1113bAfZMj4w9NshhFbM12l3jEXVMVLtdc/4OYzFNN9qHyISI3m+HVcrffwf90hiEVz1GWDsjDnhMIjRudAthSf53TJZXDdbhmqOtOEuddG500l1xEjrax7XUtuk1w81VJKt3PahLr8Nusuxb0V6707e3VLruJqPOleq/N916S8Sb/HnyTY/OUuXNTyxC5tD3HBPj1Uv8OFiRQx84TIN3bwHvXIEOvfQt5a0732KFX/v4MeVOPPpdyf273TSJrXvZZDlb6NRWk6np7mpmESDivnaToZkOaWsphvy6BjWhuW9sN8vZBJ/GPqn5b2woG41bWjaXoDwiB1XLAf5C5pFHjIF6HBPBGFbIQpGMQmHGq6EOd8jDHvrwh/5ADKIQh0jEIhrxiEhM4lqE4Yg7nCELTSDDGgCxJSVOpBRfaIEWt8jFJTTCKaUAhRhBUUWxHOMOMeCiGrmYhVMkBRR6EEMW5khHNRiijF2hxRLWyMct1kASRimFHehIyEIm4l1RoUQN+sjIFsAgD9MCiiTkWMhKzlENeLzKKWzQyE5CQiiSsKQo5yiGDkqFGEroZCdnwCifhHKUoxQDIpdyB1WqcgmR1EkpKAlLUarhKr6ggS1VyQifDLKXsARkVfgwTFU2oSegQGYvz2CVJjSzkzEABk/0IM1eMiwqwUjjNRuJqp3wspuW1ANVOjHOTtZhJ6VAJyzfORVGtLORZv7YSTTlOUqqMPOefXymTvbJT0tSJREA7WMY9FlQUVIFEgnl4y8H2tBKLnQqn4joGvGwE1pUtJD0lEoyZqBRLn5yJ2r4KB3LOZUwlFSLNTDXQ1CBiDSUwQteKEMaEIEKjQBCpXM0ZVMm8dIWhJQinihDEJbK1KaWYXkU8ahKjzoVL5SUBnWhCDCU2tSuOlWbFkmESi1llYxq9A4VCYUXvMpWpnohFBYRRkobqk6s1CGiS5ilQUKxhLb6NQhLgGtFShGGglK1WEwAKA3cOBFgrPWvfvUCWClCWHnWQa9MsQUn23klinAVsn4tw0Xk2s26cmUZa7gmEzIJEU+AFrRQneOIJJ44yjqQ9SuSSOUq9fCtiHz2tW0VbUY6oYc60DEMdUiEULmih8TyUQdrYG1EUAFc0PbUX8KQBCLygAdDNMIUGkFEdSGLCCsOJA3j/WsazCuQ36a3q8I172Pf61UvsLca86VvU+3LXvfqNwjxtSJ6/9vU9bJXvARmannZS90EL/W6/XVwgM3r2gTH1or+He+E2etY/Ur2vgXh63sDC+K95he0by3xQbYK3DJMVsUGSepfnwpjhtDUpjjVKU9rzOMe+/jHQA6ykIdM5CIb+chITrKSl8zkJjv5yVCOspSnbN6AAAAh+QQJAwDLACwAAAAAyADIAIcAAAABAQEODg4pKSkqKiorKysrKysrKysrKysrKysrKysrKysrKysrKyssLCwsLCwsLCwsLCwsLCwsLCwsLCwtLS00NDQ9PT1DQ0NGRkZHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dISEhISEhISEhISEhISEhKSkpOTk5XV1ddXV1hYWFjY2NkZGRkZGRkZGRkZGRkZGRlZWVlZWVlZWVlZWVlZWVlZWVmZmZnZ2dsbGxubm5wcHBycnJ0dHR2dnZ4eHh7e3t+fn6AgICAgICAgICAgICAgICAgICBgYGBgYGDg4OEhISGhoaJiYmOjo6UlJScnJydnZ2dnZ2dnZ2enp6enp6enp6enp6fn5+hoaGlpaWoqKirq6utra2vr6+xsbGysrKzs7O0tLS1tbW2tra4uLi5ubm6urq6urq6urq6urq6urq6urq6urq8vLy/v7/ExMTJycnLy8vLy8vMzMzNzc3Pz8/Q0NDS0tLT09PU1NTV1dXW1tbW1tbW1tbX19fX19fX19fX19fX19fY2Nja2trc3Nzf39/i4uLk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vr6+vs7Ozt7e3u7u7v7+/w8PDx8fHx8fHy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLz8/Pz8/P09PT09PT29vb29vb4+Pj5+fn6+vr7+/v8/Pz8/Pz9/f39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gCXCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLF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Tk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5PT09PT09RUVFTU1NUVFRZWVleXl5lZWVnZ2dpaWlra2tra2tra2tra2tra2tra2tsbGxsbGxsbGxsbGxsbGxsbGxubm5xcXF4eHh7e3t+fn6BgYGEhISFhYWHh4eIiIiIiIiIiIiIiIiIiIiIiIiIiIiJiYmJiYmKioqMjIyNjY2Pj4+UlJSampqenp6kpKSlpaWlpaWlpaWlpaWmpqampqanp6eoqKirq6utra2vr6+xsbG0tLS1tbW3t7e6urq8vLy/v7/BwcHBwcHBwcHBwcHCwsLCwsLCwsLDw8PExMTExMTGxsbHx8fIyMjJycnKysrNzc3Q0NDS0tLU1NTW1tbX19fY2NjY2NjZ2dna2trc3Nzd3d3e3t7e3t7e3t7e3t7f39/f39/f39/f39/f39/f39/f39/f39/g4ODg4ODg4ODh4eHj4+Pk5OTm5ubo6Ojp6enr6+vt7e3v7+/w8PDx8fHy8vLz8/P09PT19fX29vb29vb39/f4+Pj5+fn6+vr6+vr6+vr6+vr6+vr7+/v7+/v6+vr6+vr6+vr7+/v7+/v7+/v7+/v8/Pz8/Pz+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gB/CRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2hJmuqEyZIlTJ1Mpa1KyhKiu3jvWiI1N6qmvIDxaurrFFPgw4gyEV6aCTHiwYuPknLsmG/konYpH7Z0magpzY7ldg7aCTTiTqODGjYdWHHqn5lZ5+X82mds2Xpr+1yN+y4m3T1L976LGvjO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oqWlpaenp6mpqaurq62tra2tra2tra2tra2tra6urq6urq6urq6urq6urrCwsLOzs7a2tri4uLy8vMDAwMLCwsTExMXFxcfHx8fHx8jIyMjIyMnJycnJycnJycnJycrKysvLy87OztDQ0NPT09fX19nZ2dra2tra2tzc3N7e3uDg4OLi4uTk5OXl5ebm5ubm5ubm5ubm5ubm5ufn5+rq6uzs7O3t7e3t7e7u7u7u7u/v7/Dw8PDw8PDw8PHx8fHx8fLy8vPz8/T09PX19fb29vf39/f39/n5+fv7+/v7+/39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AJ8JHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaEv6ysU2l6+0VonNOkW3Lt1ZxOBG7cXKrt9TrHrpddrrr+FTggcrLXzYMDDFSIn1bfy3FeSjcykbznW5qObDrDoP9fX5cDDRQXOVNvwW9U/Vq/1ydu0Tduy6s2nztH37VGvdGE1xyhSKlkfSvemeBk6xFZ0aGaJLFwFmE8fkgJlP7JSEg/Tv323+KNKY+XZu7Q03GQHPHnwNRMsrSr5tGb3DWDfa65ceghJGxqs9Zh9Dn5iw34EZfMDHf6sl1tEtoWxCyYSUcFLKb1sBkx+CB4IQCkbAtEJZKwJyxEsnFKZIYSjxZcUEhxzK4EpGuUxmFyvnbdSKijxOyAkvWj0CI4xfbBTMWm61yNGOPfaYCZBY5TAkhyCE5tMtTWbJiZJSfTIljHL8JGGWTX5olRxfcmiDT6WQSSaGUtmQJodW7sSJm1mWUlUwHsyJ4Hg7+YKnllW14ieCePCE5aBNVsXJoQeWwRMrjDZKFSOQ7qcFT21WymNVpGSq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1tbW19fX2NjY2dnZ2dnZ2tra29vb3d3d39/f4ODg4uLi5OTk5ubm6Ojo6urq6+vr7e3t7u7u7u7u7u7u7u7u7u7u7u7u7u7u7+/v8PDw8fHx8fHx8vLy8/Pz8/Pz8/Pz9PT09PT09fX19vb29vb29/f3+Pj4+fn5+fn5+vr6+/v7+/v7+/v7+/v7/Pz8/Pz8/Pz8/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4ArwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNoTT47duxZWqzFdNl6RfeVLV3F3kqNtquu37rAoul1yuzW38OvbjEbvDSaYcSHbwlmjLQvZMTAKB8tdvlyXs1EdXWGrAs00bmjD9syLfRZashuWf/k/PrwZ9k9adf2exv3Tte7/cb2zRN18NXEK+JCFKYHCxQiVPCAkicVR9HBX5VOLjGYmRMiwv6LHy/iySmNunf35t5QUQry8Men0Wi5dmb2D+uYiM8//JNgGDlWm2T4OfRFfwiKwAMuGBWWmmIfFeOKKaRY8gkpqDD41R0JJrjEYhdFA0xngXnEzCqWpKiiip+40lUj+3WIYBjoyeXXXetpFMwnK/aoIiogYjXMezIm+AhHzxRTzHAeBdOJj1BaMkqQVrFRZIc9AMXMk1FCiQpW0RB5JYKc/FRhl1G6aBUkY3Zohk++oNnlJ1eJ0WaCKviEipxd3mJVD3cm+EpPnPAZ5ZdVqRAognTuxIyhUZJSVTSLIrgIT3FC6mOjUw1TaX9+YKqpj2VWBd6n8DXCUzCj9ihpVf4soApfKD21uqIpVkEh63gn5HiTKbamqCZVeewq3hM+uRKsJb4+lYqx4eHxE4+troKVE8aioGFPmWr6CZVUgWKsGkEpCyknAGYVhawp3AeUuXKiu9UrilZ6giNE+UJt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9PT09PT09PT09fX19fX19fX19fX19vb29vb29/f39/f39/f3+Pj4+Pj4+fn5+vr6+vr6+/v7+/v7+/v7+/v7+/v7/Pz8/f39/f39/v7+/v7+/f39/f39/f39/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////CP4A1QkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNoT1arljZrNWXFfsn9VUwZ27ZSm83dO7cZXqhx+Qou9rdpYMGDCyvVi7ixX8VGqzWe/Osu5KHKKDdWdpnoYc17CXcWCrrx6KCSSwu2fJpnatV7WbfeCZvv7J+fVYu+TfEXojJHZMAoEYOIlkGxOGau/Yszb4nI3AwvQb26dS2wNL6GLfs5Q0kyrP6LFw/DDbKMjFU/9u6Q0Ivx8K1zkZYx9+Td7Bm2ic+/upVb9YGGX0fF0CJLK63MYssyYB3S34MldKFReoit15Etqoii4YYatsIgV5+8B2F/b2gHV2h2fTTNKxy2uKEtXA0x4oMvtNLRWiJNw4qLPIoii1aGzAghF0G10mOPMGKFhJAQzvITLUce+WFVtDAJoSA+TXNKlD3aaJUgVj7ohE+2cCmlVVyE2R8MPhlpJo9JUuWEmv0NiNObPTpZFRF08udKT3jy6CVV0/U5XiaABtrioFMZYSh8tCSq6IbJVZXFo+K9MKVOO06qYaRVuYGpdUT4NIunGtoJVSajVteGT/7FoKrKVdUUiimiPsXiKS5Y7TfqEPT5tMyWgb6S1S229ilJULHiyco0WvmBKRJDFUNslK1Aq1UzWhgaw59DLaNrj6eAylUzV9D57VHFzNKphq/Yoq1X0qRpZRE/5oeTqEJqMYy+OsXChoj8KbEJwD3ZIsgR48nQxioIC/UKJ5m0wmvEGGes8cYcd+zxxyCHLPLIJJds8skop6xyS7Fs4vImla6skiZtILHDzTgj0YYmMpukyRY4By30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QkhISE9PT1JSUlRUVFZWVlhYWFlZWVlZWVlZWVpaWlpaWlpaWlpaWlpaWlpaWl1dXWNjY2tra3R0dHV1dXV1dXV1dXV1dXZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnh4eHp6ent7e39/f4KCgoiIiIyMjI+Pj5GRkZKSkpKSkpKSkpKSkpKSkpKSkpKSkpOTk5OTk5SUlJaWlpiYmJqampycnJ+fn6GhoaOjo6enp6mpqaurq62tra6urq6urq+vr6+vr6+vr6+vr6+vr6+vr7GxsbS0tLa2tri4uLq6ur29vcLCwsTExMXFxcfHx8jIyMrKysvLy8zMzMzMzMzMzMzMzM7OztHR0dTU1NbW1tfX19nZ2dvb29zc3N3d3d/f3+Dg4OPj4+Tk5OXl5ebm5ufn5+jo6Ojo6Ojo6Ojo6Onp6evr6+3t7e/v7+/v7/Dw8PHx8fLy8vPz8/T09PX19fb29vb29vf39/j4+Pn5+fr6+vz8/P7+/v7+/v7+/v39/f39/fz8/Pz8/Pz8/Pz8/Pz8/Pz8/P39/f39/f7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AEsJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q1eQes6IPaPnq9kpLRoIWMu2QQsqZrVOocC2rl0KcONSRbTBrl+7GxDpjRpH7d/DaxvEGey0MOLHAhQzXorIMGTEDQRPRtr3MuQNm49O8ex5SuiiEEhfpnB66GjVl023BtoC9uUWs4Fa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m56enqGhoaOjo6SkpKWlpaampqenp6mpqaurq6ysrK6urrCwsLGxsbOzs7S0tLW1tbW1tbW1tbW1tbW1tba2tra2tra2trm5uby8vMHBwcrKys7OztHR0dLS0tLS0tLS0tPT09PT09TU1NbW1tfX19ra2tvb293d3eDg4OLi4uPj4+bm5ujo6Orq6uzs7O3t7e7u7u/v7/Dw8PDw8PDw8PDw8O/v7/Dw8PDw8PDw8PHx8fLy8vT09PX19fX19fX19fb29vb29vb29vb29vf39/j4+Pr6+vv7+/v7+/z8/Pz8/Pz8/P39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AEMJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q1eRdux8HSvwTZMQA9KqDdHkDdmsdtCqnTs3hNi3VHvQ3Uu3B96ohuTyHTwghKG/TQ15IMx4gIfDiJUKbjw4ROSkeik39nu5qB3Nmu92FjoZdOXRQt+YDo0aaJPVlJu0/rkYNmPLs3vappxb927GvXd+/k1YdHCbqokPNn68pvLBzXM+5xs9Yx45bu4k0lj6Oe7qEun+NIFRobx5ED/KXHw9Xa1s8BARATFPvz4MOhWTtx/AHL5CMh/UJ6B5HCwBCUXd/QaDfw5NscGAEJZnAyITDTddfxdhoslfTUToYQUvHChRZspxhtEkkCDix4qHIBLJhl6V8eGHPCCo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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

/* script */
const __vue_script__$2 = script$2;

var __vue_render__$2 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _vm.loading || _vm.loadingNum > 0 ? _c('div', {
    staticClass: "load_container"
  }, [_c('div', {
    staticClass: "load_overlay"
  }), _vm._v(" "), _vm._m(0)]) : _vm._e();
};

var __vue_staticRenderFns__$2 = [function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "load_image"
  }, [_c('img', {
    attrs: {
      "src": img
    }
  })]);
}];
/* style */

const __vue_inject_styles__$2 = function (inject) {
  if (!inject) return;
  inject("data-v-69199822_0", {
    source: ".load_container{position:fixed;width:100vw;height:100vh;top:0;left:0;z-index:9999}.load_container .load_overlay{position:fixed;background:#fff;width:100%;height:100%;opacity:.5;z-index:100}.load_container .load_image{display:flex;justify-content:center;align-items:center;width:100%;height:100%}.load_container .load_image img{z-index:999;width:100px}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__$2 = undefined;
/* module identifier */

const __vue_module_identifier__$2 = undefined;
/* functional template */

const __vue_is_functional_template__$2 = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$2 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$2,
  staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, createInjector, undefined, undefined);

//
var script$1 = {
  i18n: initI18n,
  layout: "dashboard",
  components: {
    Loading: __vue_component__$2,
    SyncIcon: __vue_component__$7,
    Static: __vue_component__$j,
    Dynamic: __vue_component__$i,
    Local: __vue_component__$g,
    Configurable: __vue_component__$h,
    SectionItem: __vue_component__$f,
    EditIcon: __vue_component__$e,
    DragIcon: __vue_component__$d,
    TrashIcon: __vue_component__$c,
    BackIcon: __vue_component__$b,
    PlusIcon: __vue_component__$a,
    CheckIcon: __vue_component__$9,
    CloseIcon: __vue_component__$8,
    draggable,
    LinkIcon: __vue_component__$6,
    CreateIcon: __vue_component__$5,
    DotIcon: __vue_component__$4,
    CelebrateIcon: __vue_component__$3,
    "b-alert": BAlert,
    "b-modal": BModal
  },
  props: {
    pageName: {
      type: String,
      default: ""
    },
    admin: {
      type: Boolean,
      default: false
    },
    variations: {
      type: Array,
      default: () => []
    },
    headers: {
      type: Object,

      default() {
        return {};
      }

    },
    reactiveTrigger: {
      type: String,
      default: ""
    },
    lang: {
      type: String,
      default: "en"
    },
    viewsBgColor: {
      type: String,
      default: "transparent"
    }
  },

  data() {
    return {
      staticSuccess: false,
      sectionTypeName: "",
      staticModal: false,
      sectionInPage: [],
      pageNotFound: false,
      dismissCountDown: 0,
      editMode: false,
      selectedVariation: this.pageName,
      types: [],
      sectionTypes: [],
      originalVariations: {},
      // current visible views
      views: {},
      getSections: [],
      loading: false,
      dragging: false,
      currentSection: null,
      isModalOpen: false,
      isDeleteModalOpen: false,
      synched: false,
      savedView: {},
      // all saved variations
      displayVariations: {
        [this.pageName]: {
          name: this.pageName,
          views: {},
          altered: false
        }
      },
      selectedSectionTypeName: "",
      selectedSectionTypeIndex: ""
    };
  },

  // Server-side only
  // This will be called by the server renderer automatically
  serverPrefetch() {
    const config = {
      headers: sectionHeader({
        origin: this.$sections.projectUrl
      })
    };
    const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/page/${this.pageName}`;
    return axios.options(URL, config).then(res => {
      console.log(`Options API Call success`);
      return axios.post(URL, {}, config);
    }).then(res => {
      const sections = res.data.sections;
      const views = {};
      sections.map(section => {
        this.trackSectionComp(section.name, section.type);
        if (section.settings) section.settings = JSON.parse(section.settings);

        if (section.id) {
          views[section.id] = section;
        } else {
          views["test"] = section;
        }
      });
      this.$set(this.displayVariations, this.activeVariation.pageName, {
        name: this.activeVariation.pageName,
        views: { ...views
        }
      });
      this.selectedVariation = this.activeVariation.pageName;
      this.loading = false;
    }).catch(error => {
      this.showToast("Error", "danger", "Couldn't load the page in server prefetch: " + error.response.data.error);
      this.loading = false;
      this.pageNotFound = true;
    });
  },

  computed: {
    activeVariation() {
      // If variation true return its page name
      const activeVar = this.variations.filter(variation => variation.active);
      if (activeVar.length === 1) return activeVar[0];else if (activeVar.length > 1) {
        return activeVar[0];
      } // otherwise return the default pageName prop
      else return {
          name: "default",
          pageName: this.pageName
        };
    },

    currentViews: {
      get() {
        let views = [];
        views = Object.values(this.displayVariations[this.selectedVariation].views);
        views = views.sort(function (a, b) {
          return a.weight - b.weight;
        });
        return views;
      },

      set(newValue) {
        for (let index = 0; index < newValue.length; index++) {
          const replacement = newValue[index];
          replacement.weight = index;
          this.$set(this.displayVariations[this.selectedVariation].views, newValue[index].id, replacement);
        }
      }

    }
  },

  mounted() {
    initI18n.locale = this.lang;
    this.loading = true;
    this.checkToken(); // We check if this is running in the browser or not
    // because during SSR no cors preflight request is sent

    const inBrowser = typeof window !== 'undefined';
    const config = {
      headers: sectionHeader(inBrowser ? {} : {
        origin: this.$sections.projectUrl
      })
    };
    const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/page/${this.pageName}`;
    axios.post(URL, {}, config).then(res => {
      const sections = res.data.sections;
      const views = {};
      sections.map(section => {
        this.trackSectionComp(section.name, section.type);
        if (section.settings) section.settings = JSON.parse(section.settings);

        if (section.id) {
          views[section.id] = section;
        } else {
          views["test"] = section;
        }
      });
      this.$set(this.displayVariations, this.activeVariation.pageName, {
        name: this.activeVariation.pageName,
        views: { ...views
        }
      });
      this.selectedVariation = this.activeVariation.pageName;
      this.loading = false;
      this.$emit("load", true);
    }).catch(error => {
      this.showToast("Error", "danger", "Couldn't load the page: " + error.response.data.error);
      this.loading = false;
      this.pageNotFound = true;
      this.$emit("load", false);
    });
  },

  methods: {
    addNewStaticType() {
      if (this.sectionTypeName != "") {
        const token = this.$cookies.get("sections-auth-token");
        const config = {
          headers: sectionHeader({
            token
          })
        };
        const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/section-types/${this.sectionTypeName}`;
        this.loading = true;
        axios.post(URL, {}, config).then(() => {
          this.types = [];
          this.getSectionTypes();
          this.staticSuccess = true;
          this.loading = false;
        }).catch(error => {
          this.showToast("Error", "danger", "Couldn't create the new section type: " + error.response.data.message);
          this.loading = false;
        });
      } else {
        this.showToast("Error", "danger", "Please enter the name of the section");
      }
    },

    openStaticSection() {
      this.staticModal = true;
    },

    trackSectionComp(sectionName, sectionType) {
      if (!this.sectionInPage.includes(sectionName)) {
        this.sectionInPage.push(sectionName);
        const name = upperFirst(camelCase( // Gets the file name regardless of folder depth
        sectionName.split("/").pop().replace(/\.\w+$/, "")));
        const path = `/views/${sectionName}_${sectionType}`;
        this.$options.components[name] = importComp(path);
      }
    },

    createNewPage() {
      // pageName
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token
      };
      const config = {
        headers: sectionHeader(header)
      };
      const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/page/${this.pageName}`;
      axios.put(URL, {
        variations: [],
        sections: []
      }, config).then(res => {
        this.showToast("Success", "success", "Congratulations on successfully creating a new page on sections. Start adding some content to it.");
      }).catch(err => {
        this.showToast("Error creating page", "danger", "We are unable to create a new sections page for " + this.pageName + "\n" + err.response.data.message);
      });
    },

    showToast(title, variant, message) {
      const inBrowser = typeof window !== 'undefined';

      if (inBrowser) {
        this.$bvToast.toast(message, {
          title,
          variant,
          solid: true,
          toaster: "b-toaster-top-center"
        });
      } else {
        console.log(`## ${variant} ## ${title}: ${message}`);
      }
    },

    checkToken() {
      const auth_code = this.$route.query.auth_code;

      if (auth_code) {
        const config = {
          headers: sectionHeader({})
        };
        const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/token/${auth_code}`;
        axios.get(URL, config).then(res => {
          const token = res.data.token;
          this.$cookies.set("sections-auth-token", token, "7d");
          this.$router.push(this.$route.path);
          this.loading = false;
        }).catch(err => {
          this.loading = false;
        });
      }
    },

    getSectionTypes() {
      if (this.types && this.types.length) {
        return;
      }

      this.loading = true;
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader({
          token
        })
      };
      const url = this.$sections.serverUrl + `/project/${this.$sections.projectId}/section-types`;
      axios.get(url, config).then(res => {
        res.data.data.map(d => {
          this.trackSectionComp(d.name, d.type);
          this.types.push({
            name: d.name,
            type: d.type,
            access: d.access,
            application: d.application,
            dynamic_options: d.dynamic_options,
            fields: d.fields,
            multiple: d.multiple
          });
        });
        this.types = [...this.types, ...this.addSystemTypes()];
        this.loading = false;
      }).catch(error => {
        this.loading = false;
        this.showToast("Error", "danger", error);
      });
    },

    addSystemTypes() {
      let staticTypes = [];

      const internal_types = require.context("../src/configs/views", false);

      let external_types = {};
      let external_path = "";

      try {
        external_types = require.context(`@/sections/views`, false);
        external_path = `@/sections/views`;
      } catch (error) {
        throw new Error("vue-sections: Your project contains no @/sections folder");
      }

      staticTypes = this.build_comp(staticTypes, { ...external_types
      }, "external", external_path);
      staticTypes = this.build_comp(staticTypes, internal_types, "internal", "internal:path");
      return [...new Set(staticTypes)];
    },

    build_comp(staticTypes, types, compType, path) {
      let names = staticTypes.map(obj => {
        return obj.name;
      });
      types.keys().forEach(fileName => {
        const splitName = fileName.split("_");
        const type = splitName[1];
        const mainName = splitName[0];

        if (type) {
          if (type == "local") {
            const name = camelCase( // Gets the file name regardless of folder depth
            mainName.split("/").pop().replace(/\.\w+$/, ""));

            if (!names.includes(name)) {
              this.trackSectionComp(name, "local");
              staticTypes.push({
                name,
                type,
                compType
              });
              names.push(name);
            }
          }
        } else {
          if (fileName.includes(".vue")) {
            console.error(`vue-sections: ${fileName} in ${path} can't be registered! You should follow the naming convention of any registered component '{Section Name}_{Section Type}.vue'`);
          }
        }
      });
      return staticTypes;
    },

    openEditMode() {
      this.getSectionTypes();

      if (!this.originalVariations[this.selectedVariation]) {
        this.originalVariations = JSON.parse(JSON.stringify(this.displayVariations));
      }

      this.editMode = !this.editMode;
    },

    formatName,

    editable(sectionType) {
      switch (sectionType) {
        case "local":
        case "dynamic":
          return false;

        case "static":
        case "configurable":
          return true;
      }
    },

    synch() {
      this.synched = true; // get all existing linked to

      const currentVariationView = this.displayVariations[this.selectedVariation].views; // remove all existing linked to

      const withoutLinkedToValueList = Object.values(currentVariationView).filter(view => !view.linkedTo); // get default original values from the main

      let defaultVariationViews = Object.values( // we use an intermediary json object to deep clone the array
      JSON.parse(JSON.stringify(this.displayVariations[this.pageName].views))); // update the cloned list with a linkedTo id

      defaultVariationViews = defaultVariationViews.map(view => {
        view.linkedTo = view.id;
        view.id = "id-" + view.id;
        return view;
      }); // get the new added sections to this variation

      const finalSections = [...withoutLinkedToValueList, ...defaultVariationViews];
      const finalViews = {};
      finalSections.map(section => {
        finalViews[section.id] = section;
      });
      this.$set(this.displayVariations[this.selectedVariation], "views", finalViews);
      setTimeout(() => {
        this.synched = false;
      }, 1000);
    },

    addSectionType(section) {
      try {
        if (this.savedView.linkedTo) {
          const confirmed = window.confirm("This section is linked to a main section, editing it will break the link, are you sure you want to proceed ?");

          if (!confirmed) {
            return;
          }
        }

        if (section.weight === "null") {
          section.weight = Object.keys(this.displayVariations[this.selectedVariation].views).length;
        }

        section.linkedTo = "";
        this.$set(this.displayVariations[this.selectedVariation].views, section.id, section);

        if (this.selectedVariation === this.pageName) {
          // We check if there are variations that contains a section linked to the one we just edited
          // If there are, we edit them too so they stay in sync
          this.variations.map(variation => {
            const newViews = Object.values(this.displayVariations[variation.pageName].views).map(sectionVariation => {
              if (sectionVariation.linkedTo === section.id) sectionVariation.settings = section.settings;
              return sectionVariation;
            });
            this.$set(this.displayVariations[variation.pageName], "views", { ...newViews
            });
          });
        }

        this.currentViews = this.displayVariations[this.selectedVariation].views;
        this.displayVariations[this.selectedVariation].altered = true;
        this.isModalOpen = false;
        this.savedView = {};
        this.loading = false;
        this.showToast("Success", "info", "This sections was successfully added to your page but is now only visible to you.");
      } catch (e) {
        this.showToast("Error", "danger", "We are unable to preview your section, try again later");
      }
    },

    mutateVariation(variationName) {
      const sections = [];
      let views = this.displayVariations[variationName].views;
      views = Object.values(views);
      views.map(view => {
        const refactorView = {
          id: view.id,
          weight: view.weight,
          name: view.name,
          type: view.type,
          linkedTo: view.linkedTo
        };

        if (view.settings) {
          refactorView.options = JSON.stringify(view.settings);
        }

        if (!view.settings && view.type === "configurable") {
          const options = [];
          view.renderData.map(rData => {
            options.push(rData.settings);
          });
          refactorView.options = JSON.stringify(options);
        }

        if (refactorView.id.startsWith("id-")) {
          delete refactorView.id;
        }

        sections.push({ ...refactorView
        });
      });
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token
      };
      const config = {
        headers: sectionHeader(header)
      };
      const variables = {
        page: variationName,
        variations: [],
        sections
      };
      const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/page/${variationName}`;
      axios.put(URL, variables, config).then(res => {
        if (res.data && res.data.error) {
          this.showToast("error", "danger", res.data.error);
          return;
        }

        this.displayVariations[variationName].altered = false;
        this.loading = false;
        this.showToast("Success", "success", "You have successfully saved your changes and they are now visible to your visitors");
      }).catch(error => {
        this.showToast("Error saving your changes", "danger", error.response.data.message);
        this.loading = false;
      });
    },

    saveVariation() {
      this.loading = true; // intialise the new views

      this.mutateVariation(this.pageName);
      this.variations.map(variation => {
        this.mutateVariation(variation.pageName);
      });
    },

    edit(view) {
      this.types.map(type => {
        if (type.name === view.name) {
          view.fields = type.fields;
          view.multiple = type.multiple;

          if (type.dynamicOptions) {
            view.dynamicOptions = true;
          }
        }
      });
      this.currentSection = view;
      this.savedView = view;
      this.isModalOpen = true;
    },

    restoreVariations() {
      this.displayVariations = JSON.parse(JSON.stringify(this.originalVariations));
      this.showToast("Revert Successful", "info", "You have successfully reverted your page to how it is currently showing to your visitors");
    },

    deleteView(id) {
      if (this.selectedVariation === this.pageName) {
        // We check if there are variations that contains a section linked to the one we are about to delete
        // If there are, we unlink them
        this.variations.map(variation => {
          const newViews = Object.values(this.displayVariations[variation.pageName].views).map(section => {
            if (section.linkedTo === id) section.linkedTo = "";
            return section;
          });
          this.$set(this.displayVariations[variation.pageName], "views", { ...newViews
          });
        });
      } // Then we remove the variation we want to delete


      this.$delete(this.displayVariations[this.selectedVariation].views, id);
      this.showToast("Deletet", "info", "Your section has been removed, save your page to display this change to your visitors");
    },

    errorAddingSection(error) {
      this.isModalOpen = !error.closeModal;
      this.showToast(error.title, "danger", error.message);
    },

    deleteSectionType(sectionTypeName, index) {
      this.isDeleteModalOpen = false;
      this.loading = true;
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader({
          origin: this.$sections.projectUrl,
          token
        })
      };
      const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/section-types/${sectionTypeName}`;
      axios.delete(URL, config).then(res => {
        this.showToast("Success", "info", res.data.message);
        this.types.splice(index, 1);
        this.loading = false;
        this.$emit("load", false);
      }).catch(error => {
        this.showToast("Error", "danger", "Couldn't delete section type: " + error);
        this.loading = false;
        this.$emit("load", false);
      });
    },

    openDeleteSectionTypeModal(sectionTypeName, index) {
      this.selectedSectionTypeName = sectionTypeName;
      this.selectedSectionTypeIndex = index;
      this.isDeleteModalOpen = true;
    }

  }
};

/* script */
const __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "sections-config justify-content-center"
  }, [!_vm.pageNotFound ? _c('div', [_vm.admin ? _c('button', {
    staticClass: "bg-blue control-button hide-mobile",
    on: {
      "click": function ($event) {
        return _vm.openEditMode();
      }
    }
  }, [_vm._v("\n      " + _vm._s(!_vm.editMode ? _vm.$t("Edit page") : _vm.$t("View page")) + "\n    ")]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "bg-light-grey-hp hide-mobile section-wrapper"
  }, [_vm.admin && _vm.editMode ? _c('div', {
    staticClass: "p3 text-center mainmsg pt-3"
  }, [_vm._v("\n        Your changes will be published when the page is saved.\n      ")]) : _vm._e(), _vm._v(" "), _vm.admin && _vm.editMode ? _c('div', {
    staticClass: "pb-3 pt-1 d-flex justify-content-center part1 hide-mobile"
  }, [_c('button', {
    staticClass: "hp-button create-static-section",
    on: {
      "click": _vm.openStaticSection
    }
  }, [_c('div', {
    staticClass: "btn-icon check-icon"
  }, [_c('CreateIcon')], 1), _vm._v(" "), _c('div', {
    staticClass: "btn-text"
  }, [_vm._v(_vm._s(_vm.$t("Create static section")))])]), _vm._v(" "), _c('button', {
    staticClass: "hp-button",
    on: {
      "click": function ($event) {
        _vm.currentSection = null, _vm.isModalOpen = true, _vm.savedView = {};
      }
    }
  }, [_c('div', {
    staticClass: "btn-icon plus-icon"
  }, [_c('PlusIcon')], 1), _vm._v(" "), _c('div', {
    staticClass: "btn-text"
  }, [_vm._v(_vm._s(_vm.$t("Add")))])]), _vm._v(" "), _c('button', {
    staticClass: "hp-button",
    on: {
      "click": _vm.saveVariation
    }
  }, [_c('div', {
    staticClass: "btn-icon check-icon"
  }, [_c('CheckIcon')], 1), _vm._v(" "), _c('div', {
    staticClass: "btn-text"
  }, [_vm._v(_vm._s(_vm.$t("Save")))])]), _vm._v(" "), _c('button', {
    staticClass: "hp-button grey",
    on: {
      "click": _vm.restoreVariations
    }
  }, [_c('div', {
    staticClass: "btn-icon back-icon"
  }, [_c('BackIcon')], 1), _vm._v(" "), _c('div', {
    staticClass: "btn-text"
  }, [_vm._v(_vm._s(_vm.$t("Restore")))])]), _vm._v(" "), _vm.admin ? _c('button', {
    staticClass: "bg-blue control-button",
    staticStyle: {
      "right": "0px",
      "left": "auto",
      "background": "black",
      "font-size": "13px",
      "border-radius": "5px",
      "padding": "3px 6px"
    },
    on: {
      "click": function ($event) {
        _vm.$cookies.remove('sections-auth-token'), _vm.admin = false;
      }
    }
  }, [_vm._v("\n          " + _vm._s(_vm.$t("Logout")) + "\n        ")]) : _vm._e()]) : _vm._e()]), _vm._v(" "), _vm.admin && _vm.editMode ? _c('div', {
    staticClass: "bg-light-grey-hp p-3 d-flex justify-content-center part2 hide-mobile"
  }, [_c('b-alert', {
    attrs: {
      "show": _vm.dismissCountDown,
      "variant": "warning"
    },
    on: {
      "dismissed": function ($event) {
        _vm.dismissCountDown = 0;
      },
      "dismiss-count-down": function (countDownChanged) {
        _vm.dismissCountDown = countDownChanged;
      }
    }
  }, [_c('p', [_vm._v("Save the main section before editing a variation")]), _vm._v(" "), _c('b-progress', {
    attrs: {
      "variant": "warning",
      "max": "4",
      "value": _vm.dismissCountDown,
      "height": "4px"
    }
  })], 1), _vm._v(" "), _c('button', {
    staticClass: "hp-button ",
    class: _vm.selectedVariation === _vm.pageName ? 'danger' : 'grey',
    on: {
      "click": function ($event) {
        _vm.selectedVariation = _vm.pageName;
      }
    }
  }, [_c('div', {
    staticClass: "btn-text"
  }, [_vm._v(_vm._s(_vm.pageName + " " + "Main"))])]), _vm._v(" "), _vm._l(_vm.variations, function (v, idx) {
    return _c('div', {
      key: idx
    }, [_c('button', {
      staticClass: "hp-button",
      class: _vm.selectedVariation === v.pageName ? 'danger' : 'grey',
      on: {
        "click": function ($event) {
          if (_vm.displayVariations[_vm.pageName].altered) {
            _vm.dismissCountDown = 4;
          } else {
            _vm.selectedVariation = v.pageName;
          }
        }
      }
    }, [_c('div', {
      staticClass: "btn-text"
    }, [_vm._v(_vm._s(v.name))])]), _vm._v(" "), _vm.selectedVariation === v.pageName ? _c('div', {
      staticClass: "sync d-flex p4  justify-content-center",
      on: {
        "click": function ($event) {
          return _vm.synch();
        }
      }
    }, [_c('div', {
      staticClass: "icon",
      class: {
        synched: _vm.synched
      }
    }, [_c('SyncIcon')], 1), _vm._v(" "), _c('span', [_vm._v(_vm._s(_vm.$t("Synchronise")))])]) : _vm._e()]);
  })], 2) : _vm._e(), _vm._v(" "), _c('b-modal', {
    ref: "modal",
    staticClass: "modal",
    attrs: {
      "centered": ""
    },
    model: {
      value: _vm.isModalOpen,
      callback: function ($$v) {
        _vm.isModalOpen = $$v;
      },
      expression: "isModalOpen"
    }
  }, [_c('div', {
    staticClass: "section-modal-content"
  }, [!_vm.currentSection ? _c('div', {
    staticClass: "text-center h4 my-3  pb-3"
  }, [_vm._v("\n          " + _vm._s(_vm.$t("Add")) + "\n        ")]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "closeIcon",
    on: {
      "click": function ($event) {
        _vm.isModalOpen = false;
      }
    }
  }, [_c('CloseIcon')], 1), _vm._v(" "), _vm.currentSection ? _c('div', {
    staticClass: "step-back",
    on: {
      "click": function ($event) {
        _vm.currentSection = null;
      }
    }
  }, [_c('BackIcon')], 1) : _vm._e(), _vm._v(" "), !_vm.currentSection ? _c('div', {
    staticClass: "m-1 p-1 type-items"
  }, _vm._l(_vm.types, function (type, index) {
    return _c('div', {
      key: type.name,
      staticClass: "section-item"
    }, [type.access === 'private' ? _c('div', {
      staticClass: "section-delete"
    }, [_c('div', {
      staticClass: "section-delete-icon",
      on: {
        "click": function ($event) {
          return _vm.openDeleteSectionTypeModal(type.name, index);
        }
      }
    }, [_c('TrashIcon', {
      staticClass: "trash-icon-style"
    })], 1)]) : _vm._e(), _vm._v(" "), _c('div', {
      staticClass: "section-item",
      on: {
        "click": function ($event) {
          _vm.currentSection = type;
        }
      }
    }, [type.name && !type.name.includes('local') ? _c('SectionItem', {
      staticClass: "bg-light-blue",
      attrs: {
        "title": _vm.formatName(type.name),
        "icon": type.name
      }
    }) : _vm._e()], 1)]);
  }), 0) : _c('div', {
    staticClass: "d-flex"
  }, [_c('div', {
    staticClass: "component-view"
  }, [_vm.currentSection.type === 'static' ? _c('Static', {
    attrs: {
      "props": _vm.currentSection,
      "savedView": _vm.savedView
    },
    on: {
      "addSectionType": _vm.addSectionType
    }
  }) : _vm._e(), _vm._v(" "), _vm.currentSection.type === 'dynamic' ? _c('Dynamic', {
    attrs: {
      "props": _vm.currentSection,
      "savedView": _vm.savedView,
      "headers": _vm.headers
    },
    on: {
      "addSectionType": _vm.addSectionType,
      "errorAddingSection": _vm.errorAddingSection
    }
  }) : _vm._e(), _vm._v(" "), _vm.currentSection.type === 'configurable' ? _c('Configurable', {
    attrs: {
      "props": _vm.currentSection,
      "variation": _vm.variation,
      "savedView": _vm.savedView,
      "headers": _vm.headers
    },
    on: {
      "addSectionType": _vm.addSectionType,
      "errorAddingSection": _vm.errorAddingSection,
      "loading": function ($event) {
        _vm.loading = !_vm.loading;
      }
    }
  }) : _vm._e(), _vm._v(" "), _vm.currentSection.type === 'local' ? _c('Local', {
    attrs: {
      "props": _vm.currentSection,
      "savedView": _vm.savedView
    },
    on: {
      "addSectionType": _vm.addSectionType
    }
  }) : _vm._e()], 1)])])]), _vm._v(" "), _c('b-modal', {
    ref: "modal",
    staticClass: "modal",
    attrs: {
      "centered": ""
    },
    model: {
      value: _vm.isDeleteModalOpen,
      callback: function ($$v) {
        _vm.isDeleteModalOpen = $$v;
      },
      expression: "isDeleteModalOpen"
    }
  }, [_c('div', {
    staticClass: "section-modal-content"
  }, [_c('div', {
    staticClass: "text-center h4 my-3  pb-3"
  }, [_vm._v("\n          " + _vm._s(_vm.$t("delete-section-type") + _vm.selectedSectionTypeName) + "\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "d-inline-flex"
  }, [_c('button', {
    staticClass: "hp-button",
    on: {
      "click": function ($event) {
        return _vm.deleteSectionType(_vm.selectedSectionTypeName, _vm.selectedSectionTypeIndex);
      }
    }
  }, [_c('div', {
    staticClass: "btn-text"
  }, [_vm._v("\n              " + _vm._s(_vm.$t("Confirm")) + "\n            ")])]), _vm._v(" "), _c('button', {
    staticClass: "hp-button",
    on: {
      "click": function ($event) {
        _vm.isDeleteModalOpen = false;
      }
    }
  }, [_c('div', {
    staticClass: "btn-text"
  }, [_vm._v("\n              " + _vm._s(_vm.$t("Cancel")) + "\n            ")])])])])]), _vm._v(" "), _c('div', {
    staticClass: "views"
  }, [_c('draggable', {
    attrs: {
      "group": "people",
      "handle": ".handle"
    },
    on: {
      "start": function ($event) {
        _vm.drag = true;
      },
      "end": function ($event) {
        _vm.drag = false;
      }
    },
    model: {
      value: _vm.currentViews,
      callback: function ($$v) {
        _vm.currentViews = $$v;
      },
      expression: "currentViews"
    }
  }, _vm._l(_vm.currentViews, function (view, index) {
    var _obj;

    return _c('section', {
      key: index,
      class: (_obj = {}, _obj[view.name] = true, _obj['view-in-edit-mode'] = _vm.editMode, _obj)
    }, [_c('div', {
      staticClass: "section-view"
    }, [_vm.admin && _vm.editMode ? _c('div', {
      staticClass: "controls d-flex justify-content-center hide-mobile"
    }, [view.linkedTo ? _c('LinkIcon') : _vm._e(), _vm._v(" "), _vm.editable(view.type) ? _c('div', {
      on: {
        "click": function ($event) {
          return _vm.edit(view);
        }
      }
    }, [_c('EditIcon', {
      staticClass: "edit-icon"
    })], 1) : _vm._e(), _vm._v(" "), _c('DragIcon', {
      staticClass: "drag-icon handle"
    }), _vm._v(" "), _c('div', {
      on: {
        "click": function ($event) {
          return _vm.deleteView(view.id);
        }
      }
    }, [_c('TrashIcon', {
      staticClass: "trash-icon"
    })], 1)], 1) : _vm._e(), _vm._v(" "), _c('div', {
      staticClass: "view-component",
      style: {
        background: _vm.viewsBgColor
      }
    }, [view.settings || view.type == 'local' ? _c(view.name, {
      tag: "component",
      attrs: {
        "section": view,
        "lang": _vm.lang
      }
    }) : _c('div', [_vm.admin ? _c('div', {
      staticClass: "error-section-loaded"
    }, [_vm._v("\n                  Some sections could not be loaded correctly, saving the page\n                  will delete these sections from your page, unless you are\n                  happy with the page you see now, do not save it\n                ")]) : _vm._e()])], 1)])]);
  }), 0)], 1), _vm._v(" "), _c('b-modal', {
    ref: "modal",
    staticClass: "modal",
    attrs: {
      "modal-class": 'section-modal-main-wrapper',
      "centered": ""
    },
    model: {
      value: _vm.staticModal,
      callback: function ($$v) {
        _vm.staticModal = $$v;
      },
      expression: "staticModal"
    }
  }, [_c('div', {
    staticClass: "section-modal-wrapper"
  }, [!_vm.currentSection ? _c('div', {
    staticClass: "text-center h4 header"
  }, [_c('div', {
    staticClass: "title"
  }, [_vm._v(_vm._s(_vm.$t("section-title")) + ":")]), _vm._v(" "), _c('div', {
    staticClass: "closeIcon",
    on: {
      "click": function ($event) {
        _vm.staticModal = false;
      }
    }
  }, [_c('CloseIcon')], 1)]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "body"
  }, [_c('div', {
    staticStyle: {
      "margin-bottom": "10px"
    }
  }, [_vm._v("\n            " + _vm._s(_vm.$t("section-input-title")) + "\n          ")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.sectionTypeName,
      expression: "sectionTypeName"
    }],
    staticClass: "section-input",
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": _vm.sectionTypeName
    },
    on: {
      "input": function ($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.sectionTypeName = $event.target.value;
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "footer"
  }, [_c('button', {
    staticClass: "hp-button",
    on: {
      "click": _vm.addNewStaticType
    }
  }, [_c('div', {
    staticClass: "btn-icon check-icon"
  }), _vm._v(" "), _c('div', {
    staticClass: "btn-text"
  }, [_vm._v("\n              " + _vm._s(_vm.$t("Continue")) + "\n            ")])])])])]), _vm._v(" "), _c('b-modal', {
    ref: "modal",
    staticClass: "modal",
    attrs: {
      "modal-class": 'section-modal-main-wrapper',
      "centered": ""
    },
    model: {
      value: _vm.staticSuccess,
      callback: function ($$v) {
        _vm.staticSuccess = $$v;
      },
      expression: "staticSuccess"
    }
  }, [_c('div', {
    staticClass: "section-modal-wrapper success-section-type"
  }, [_c('div', {
    staticClass: "text-center h4 header"
  }, [_c('div', {
    staticClass: "icon-head"
  }, [_c('CelebrateIcon')], 1), _vm._v(" "), _c('div', {
    staticClass: "title"
  }, [_vm._v("\n            " + _vm._s(_vm.$t("success-section-title")) + "\n          ")]), _vm._v(" "), _c('div', {
    staticClass: "closeIcon",
    on: {
      "click": function ($event) {
        _vm.staticSuccess = false;
      }
    }
  }, [_c('CloseIcon')], 1)]), _vm._v(" "), _c('div', {
    staticClass: "body"
  }, [_c('div', {
    staticClass: "subtitle"
  }, [_vm._v(_vm._s(_vm.$t("success-section-subtitle")) + ":")]), _vm._v(" "), _c('div', {
    staticClass: "section-list"
  }, [_c('div', {
    staticClass: "dot"
  }, [_c('DotIcon')], 1), _vm._v(" "), _c('div', [_vm._v("\n              " + _vm._s(_vm.$t("success-section-instruction-1")) + "\n            ")])]), _vm._v(" "), _c('div', {
    staticClass: "section-list"
  }, [_c('div', {
    staticClass: "dot"
  }, [_c('DotIcon')], 1), _vm._v(" "), _c('div', [_vm._v("\n              " + _vm._s(_vm.$t("success-section-instruction-2")) + "\n            ")])]), _vm._v(" "), _c('div', {
    staticClass: "section-list"
  }, [_c('div', {
    staticClass: "dot"
  }, [_c('DotIcon')], 1), _vm._v(" "), _c('div', [_vm._v("\n              " + _vm._s(_vm.$t("success-section-instruction-3")) + "\n            ")])])]), _vm._v(" "), _c('div', {
    staticClass: "footer"
  }, [_c('button', {
    staticClass: "hp-button",
    on: {
      "click": function ($event) {
        _vm.staticSuccess = false;
      }
    }
  }, [_c('div', {
    staticClass: "btn-icon check-icon"
  }), _vm._v(" "), _c('div', {
    staticClass: "btn-text"
  }, [_vm._v(_vm._s(_vm.$t("Done")))])])])])]), _vm._v(" "), _c('Loading', {
    attrs: {
      "loading": _vm.loading
    }
  })], 1) : _c('div', [_vm.admin ? _c('button', {
    staticClass: "hp-button",
    on: {
      "click": _vm.createNewPage
    }
  }, [_vm._v("\n      " + _vm._s(_vm.$t("Create New Page")) + "\n    ")]) : _vm._e()])]);
};

var __vue_staticRenderFns__$1 = [];
/* style */

const __vue_inject_styles__$1 = function (inject) {
  if (!inject) return;
  inject("data-v-0870134c_0", {
    source: ".section-modal-main-wrapper .modal-body{position:initial}",
    map: undefined,
    media: undefined
  }), inject("data-v-0870134c_1", {
    source: ".section-modal-wrapper[data-v-0870134c]{max-width:780px}.section-modal-wrapper.success-section-type .header[data-v-0870134c]{flex-direction:column;align-items:center}.section-modal-wrapper.success-section-type .header .icon-head[data-v-0870134c]{margin-bottom:10px}.section-modal-wrapper.success-section-type .body[data-v-0870134c]{width:60%;margin:20px auto}.section-modal-wrapper.success-section-type .body .subtitle[data-v-0870134c]{font-style:italic;text-align:center;width:75%;margin:0 auto 10px auto;color:#454545;font-weight:400}.section-modal-wrapper.success-section-type .body .section-list[data-v-0870134c]{color:#a7a7a7;display:flex;margin:5px 0}.section-modal-wrapper.success-section-type .body .section-list .dot[data-v-0870134c]{color:#31a9db;margin-right:10px}.section-modal-wrapper .header[data-v-0870134c]{margin:20px 0 40px 0;display:flex;justify-content:center}.section-modal-wrapper .header .title[data-v-0870134c]{width:75%}.section-modal-wrapper .header .closeIcon[data-v-0870134c]{position:absolute;top:10px;right:10px}.section-modal-wrapper .header .closeIcon svg[data-v-0870134c]{height:40px;width:40px}.section-modal-wrapper .body[data-v-0870134c]{margin:20px 0}.section-modal-wrapper .body .section-input[data-v-0870134c]{width:100%;height:50px}.section-modal-wrapper .footer[data-v-0870134c]{display:flex;justify-content:center}.section-modal-wrapper .footer .hp-button[data-v-0870134c]{width:200px}.section-wrapper[data-v-0870134c]{position:relative}.section-wrapper .create-static-section[data-v-0870134c]{border-color:#257596;color:#257596;background:#fff;position:absolute;top:50px;left:0;padding:0;display:flex;border-width:2px;border:2px solid #257596}.section-wrapper .create-static-section[data-v-0870134c]:hover{background:#257596;color:#fff}.section-wrapper .create-static-section:hover .btn-icon[data-v-0870134c]{background:#fff}.section-wrapper .create-static-section:hover .btn-icon svg[data-v-0870134c]{color:#257596}.section-wrapper .create-static-section .btn-icon[data-v-0870134c]{background:#257596;color:#fff;width:48px;height:36px;border-top-left-radius:14px;border-bottom-left-radius:14px}.section-wrapper .create-static-section .btn-text[data-v-0870134c]{padding-right:10px}span.handle[data-v-0870134c]{width:20px;height:20px;display:block;border:1px solid grey}.buttons-wrapper[data-v-0870134c]{max-width:800px;margin:0 auto}button[data-v-0870134c]{max-height:64px;width:auto;min-width:auto;border-radius:16px;height:auto;padding:6px 8px;min-height:auto;margin:10px}.view-component[data-v-0870134c]{position:relative;overflow-x:hidden;margin:0 auto}.view-component>div[data-v-0870134c]{margin:0 auto}.section-view[data-v-0870134c]{position:relative}.section-view .controls[data-v-0870134c]{background:#d3d3d3;padding:5px;border-radius:10px;top:3px;right:23px;position:absolute;z-index:9}.section-view .controls svg[data-v-0870134c]{cursor:pointer;width:40px;height:40px;color:#31a9db;margin:3px}.component-view[data-v-0870134c]{margin:0 auto}.views[data-v-0870134c]{margin:0 auto}.hp-button[data-v-0870134c]{outline:0;max-width:1000px;display:flex;background:#31a9db;border:none;color:#fff;align-items:center;justify-content:center}.hp-button[data-v-0870134c]:hover{background:#298cb6;transition:.1s}.hp-button div[data-v-0870134c]{display:flex;align-items:center;justify-content:center}.hp-button .btn-icon[data-v-0870134c]{margin-right:8px}.hp-button .btn-icon svg[data-v-0870134c]{color:#fff;width:24px;height:24px}.hp-button.danger[data-v-0870134c]{background:red}.hp-button.danger[data-v-0870134c]:hover{background:#d60101;transition:.1s}.hp-button.grey[data-v-0870134c]{background:#8b8b8b}.hp-button.grey[data-v-0870134c]:hover{background:#8f8e8e;transition:.1s}.part2[data-v-0870134c]{margin-top:3px;z-index:9;position:relative}.modal[data-v-0870134c]{padding:20px;position:relative}.modal .closeIcon[data-v-0870134c],.modal .step-back[data-v-0870134c]{cursor:pointer;position:absolute;top:10px}.modal .closeIcon svg[data-v-0870134c],.modal .step-back svg[data-v-0870134c]{width:3vw;height:3vw;transition:.2s}.modal .closeIcon svg[data-v-0870134c]:hover,.modal .step-back svg[data-v-0870134c]:hover{transition:.2s}.modal .step-back[data-v-0870134c]{left:10px}.modal .step-back svg[data-v-0870134c]{color:#8b8b8b}.modal .step-back svg[data-v-0870134c]:hover{color:#727272}.modal .closeIcon[data-v-0870134c]{right:10px}.modal .closeIcon svg[data-v-0870134c]{color:#31a9db}.modal .closeIcon svg[data-v-0870134c]:hover{color:#208cb9}.sync[data-v-0870134c]{color:red;cursor:pointer}.sync svg[data-v-0870134c]{width:20px;height:20px;color:red;margin-right:3px}.synched[data-v-0870134c]{display:flex;align-items:center}.synched svg[data-v-0870134c]{-webkit-animation:spin-data-v-0870134c 1.5s linear infinite;-moz-animation:spin-data-v-0870134c 1.5s linear infinite;animation:spin-data-v-0870134c 1.5s linear infinite}@-moz-keyframes spin-data-v-0870134c{100%{-moz-transform:rotate(360deg)}}@-webkit-keyframes spin-data-v-0870134c{100%{-webkit-transform:rotate(360deg)}}@keyframes spin-data-v-0870134c{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.modal[data-v-0870134c]{padding:20px}.modal .section-item[data-v-0870134c]{width:100%;height:130px}.modal .type-items[data-v-0870134c]{display:grid;grid-template-columns:repeat(4,130px);grid-gap:35px;justify-content:center}.sections-config[data-v-0870134c]{min-height:100vh}.sections-config .control-button[data-v-0870134c]{position:absolute;z-index:999;left:0;top:60px}",
    map: undefined,
    media: undefined
  }), inject("data-v-0870134c_2", {
    source: ".section-modal-content{padding-bottom:1rem}.modal-footer,.modal-header{display:none!important}.modal-content{padding:15px;border-radius:1.3rem;outline:0;width:auto;margin:0 auto;display:-webkit-box;display:flex;-webkit-box-align:center;align-items:center;min-width:65%}.modal{overflow:visible}.modal-dialog{width:100%!important;max-width:1200px;margin:0 auto}",
    map: undefined,
    media: undefined
  }), inject("data-v-0870134c_3", {
    source: "button{font-size:20px;outline:0}button svg{width:20px;height:20px}.bg-light-grey-hp{background:#f5f5f5}.bg-blue{background:#31a9db;color:#fff;border:none;outline:0!important;transition:.2s}.bg-blue:hover{background:#0881b3;transition:.2s}.danger{color:#fff}.error-section-loaded{text-align:center;color:#d82a2a;font-size:17px;width:50%;margin:0 auto;padding:15px;font-weight:500}.mainmsg{color:#686868}.section-delete{background:#31a9db;height:0;padding:0;text-align:-webkit-right}.section-delete-icon{cursor:pointer}.trash-icon-style{height:20px;width:20px;color:#fff}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__$1 = "data-v-0870134c";
/* module identifier */

const __vue_module_identifier__$1 = undefined;
/* functional template */

const __vue_is_functional_template__$1 = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, createInjector, undefined, undefined);

//
var script = {
  name: "Sections",
  props: {
    pageName: {
      type: String,
      default: ""
    },
    lang: {
      type: String,
      default: "en"
    },
    admin: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SectionsMain: __vue_component__$1
  },
  methods: {
    loaded(e) {
      this.$emit('finishLoad', e);
    }

  }
};

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('SectionsMain', {
    attrs: {
      "admin": _vm.admin,
      "pageName": _vm.pageName,
      "variations": _vm.variations,
      "lang": _vm.lang
    },
    on: {
      "load": _vm.loaded
    }
  });
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

async function globalFileUpload(file) {
  const token = window.$nuxt.$cookies.get("sections-auth-token");
  const data = new FormData();
  data.append('files[1][file]', file);
  data.append('type', "image");
  data.append('author', "Author");
  data.append('private_status', "public");
  data.append('files[1][platform_id]', '1');

  try {
    const config = {
      headers: sectionHeader({
        token
      })
    };
    const result = await axios.post(window.$nuxt.$sections.serverUrl + `/project/${window.$nuxt.$sections.projectId}/media`, data, config);
    return {
      data: result.data,
      success: true,
      error: ''
    };
  } catch (e) {
    return {
      data: '',
      success: false,
      error: e
    };
  }
}

async function addNewStaticType(sectionTypeName) {
  if (sectionTypeName !== "") {
    const token = window.$nuxt.$cookies.get("sections-auth-token");
    const config = {
      headers: sectionHeader({
        token
      })
    };
    const URL = window.$nuxt.$sections.serverUrl + `/project/${window.$nuxt.$sections.projectId}/section-types/${sectionTypeName}`;

    try {
      await axios.post(URL, {}, config);
      return {
        status: 'success'
      };
    } catch (error) {
      return {
        status: 'error',
        message: "Couldn't create the new section type: " + error.response.data.message
      };
    }
  }
}

/* eslint-disable import/prefer-default-export */

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Sections: __vue_component__,
  globalFileUpload: globalFileUpload,
  addNewStaticType: addNewStaticType
});

// Import vue components

const install = function installVueSections(Vue, options) {
  if (install.installed) return;
  install.installed = true;
  if (options == undefined) throw new Error("vue-sections: please define your options -> Vue.use(vueSections, {OPTIONS})");
  if (!options.hasOwnProperty('projectId')) throw new Error("vue-sections: You should define your projectId");
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
  });
  Vue.use(VueCookies);
  Vue.use(ToastPlugin);

  Vue.prototype.$formatText = (text, sep = " ") => {
    const result = text.replace(/([A-Z])/g, `${sep}$1`);
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };

  Vue.prototype.$sections = {
    projectId: options.projectId,
    projectUrl: options.projectUrl,
    serverUrl: options.environment === "testing" ? "https://sections-saas.k8s-dev.geeks.solutions/api/v1" : "https://sections.geeks.solutions/api/v1"
  };
};

const plugin = {
  install
}; // Auto-install when vue is found (eg. in browser via <script> tag)

let GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
} // Create module definition for Vue.use()

export default install;
export { __vue_component__ as Sections, addNewStaticType, globalFileUpload };
