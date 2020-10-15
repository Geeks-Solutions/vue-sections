import Vue from 'vue'
import sections from './sections'
import VueQuillEditor from 'vue-quill-editor'
import { BootstrapVue } from 'bootstrap-vue'
import VueCookies from 'vue-cookies'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import i18n from './i18n'
// // Install BootstrapVue
Vue.use(BootstrapVue)
Vue.use(VueCookies)
// // Optionally install the BootstrapVue icon components plugin
Vue.use(VueQuillEditor /* { default global options } */)
// Vue.config.productionTip = false
// require('dotenv').config()



const requireComponent = require.context(
  // The relative path of the components folder
  `${process.env.VUE_APP_RELATIVE_CONFIG_PATH}/views`,
  // Whether or not to look in subfolders
  false,
  // The regular expression used to match base component filenames
//   /Base[A-Z]\w+\.(vue|js)$/
)

requireComponent.keys().forEach(fileName => {
  // Get component config
  const componentConfig = requireComponent(fileName)

  // Get PascalCase name of component
  const componentName = upperFirst(
    camelCase(
      // Gets the file name regardless of folder depth
      fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')
    )
  )
  // Register component globally
  Vue.component(
    componentName,
    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    componentConfig.default || componentConfig
  )
})
// initialize standard Vue app 
new Vue({
  i18n,
  render: h => h(sections)
}).$mount('#app')


// compile to a web component
// import wrap from "@vue/web-component-wrapper";
// window.customElements.define("sections-bo", wrap(Vue, sections));

