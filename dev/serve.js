import Vue from 'vue';
import Dev from './serve.vue';
// To register individual components where they are used (serve.vue) instead of using the
// library as a whole, comment/remove this import and it's corresponding "Vue.use" call
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import i18n from "../src/i18n"

import VueSections from '@/entry.esm';
Vue.use(VueSections);

// Vue.config.productionTip = false

const requireComponent = require.context(
  // The relative path of the components folder
  `${process.env.VUE_APP_RELATIVE_CONFIG_PATH}/views`,
  // Whether or not to look in subfolders
  false,
  // The regular expression used to match base component filenames
//   /Base[A-Z]\w+\.(vue|js)$/
)

Vue.config.productionTip = false;

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


new Vue({
  i18n,
  render: (h) => h(Dev),
}).$mount('#app');