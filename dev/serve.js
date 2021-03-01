import Vue from 'vue';
import Dev from './serve.vue';
import i18n from "../src/i18n"

import Sections from '@/entry.esm';

Vue.use(Sections, {projectId: '60352afc1a9d7f0006327a38'});
Vue.config.productionTip = false;

new Vue({
  i18n,
  render: (h) => h(Dev),
}).$mount('#app');