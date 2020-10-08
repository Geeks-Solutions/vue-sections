import Vue from 'vue'
import sections from './sections'
import VueQuillEditor from 'vue-quill-editor'
import { BootstrapVue } from 'bootstrap-vue'
import VueCookies from 'vue-cookies'

// Install BootstrapVue
Vue.use(BootstrapVue)
Vue.use(VueCookies)
// Optionally install the BootstrapVue icon components plugin
Vue.use(VueQuillEditor /* { default global options } */)
Vue.config.productionTip = false
require('dotenv').config()


// initialize standard Vue app 
import i18n from './i18n'
new Vue({
  i18n,
  render: h => h(sections)
}).$mount('#app')


// compile to a web component
// import wrap from "@vue/web-component-wrapper";
// window.customElements.define("sections", wrap(Vue, sections));