import Vue from 'vue'
import App from './App.vue'
import VueQuillEditor from 'vue-quill-editor'
import i18n from './i18n'
import { BootstrapVue } from 'bootstrap-vue'


// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(VueQuillEditor /* { default global options } */)

Vue.config.productionTip = false
require('dotenv').config()
new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
