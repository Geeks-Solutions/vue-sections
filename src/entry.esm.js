
// Import vue components
import * as components from '@/lib-components/index';
import VueCookies from "vue-cookies";
// This is the way to have the toaster
import { ToastPlugin } from 'bootstrap-vue';

// install function executed by Vue.use()
const install = function installVueSections(Vue,options) {
  if (install.installed) return;
	install.installed = true;

  if(options == undefined)
    throw new Error("vue-sections: please define your options -> Vue.use(vueSections, {OPTIONS})")
    
  if(!options.hasOwnProperty('projectId'))
    throw new Error("vue-sections: You should define your projectId")

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
  
  Vue.prototype.$sections =  {
    projectId: options.projectId,
    projectUrl: options.projectUrl,
    serverUrl: (options.environment === "testing" ? "https://api.sections-saas.k8s-dev.geeks.solutions/api/v1" : "https://sections.geeks.solutions/api/v1")
  }
};

const plugin = {
	install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
let GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}

// Create module definition for Vue.use()
export default install;

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from '@/lib-components/index';
