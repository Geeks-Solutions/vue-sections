import VueI18n from "vue-i18n";

function loadLocaleMessages() {

  const en = require("../src/lang/en.json");
  const fr = require("../src/lang/fr.json");

  return {
    "en": en,
    "fr": fr
  };
}

export default new VueI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: loadLocaleMessages(),
});
