<template>
  <div class="sections-config justify-content-center" v-if="showSections">
    <div v-if="!pageNotFound">
      <!-- page buttons part 1-->
      <button
        @click="openEditMode()"
        v-if="admin"
        class="bg-blue control-button hide-mobile"
      >
        {{ !editMode ? "Edit page" : "View page" }}
      </button>
      <div class="bg-light-grey-hp hide-mobile">
        <div v-if="admin && editMode" class="p3 text-center mainmsg pt-3">
          MESSAGE?
        </div>

        <div
          class=" pb-3 pt-1 d-flex justify-content-center part1 hide-mobile"
          v-if="admin && editMode"
        >
          <button
            class="hp-button"
            @click="
              (currentSection = null), (isModalOpen = true), (savedView = {})
            "
          >
            <div class="btn-icon plus-icon"><PlusIcon /></div>
            <div class="btn-text">Add</div>
          </button>
          <button class="hp-button" @click="saveVariation">
            <div class="btn-icon check-icon"><CheckIcon /></div>
            <div class="btn-text">Save</div>
          </button>
          <button class="hp-button grey" @click="restoreVariations">
            <div class="btn-icon back-icon"><BackIcon /></div>
            <div class="btn-text">Restore</div>
          </button>
          <button
            @click="$cookies.remove('sections-auth-token'), (admin = false)"
            v-if="admin"
            class="bg-blue control-button"
            style="    right: 0px;
    left: auto;
    background: black;
    font-size: 13px;
    border-radius: 5px;
    padding: 3px 6px;"
          >
            Logout
          </button>
        </div>
      </div>
      <!-- page buttons part 2-->
      <div
        class="bg-light-grey-hp p-3 d-flex justify-content-center part2 hide-mobile"
        v-if="admin && editMode"
      >
        <b-alert
          :show="dismissCountDown"
          variant="warning"
          @dismissed="dismissCountDown = 0"
          @dismiss-count-down="
            (countDownChanged) => {
              dismissCountDown = countDownChanged;
            }
          "
        >
          <p>Save the main section before editing a variation</p>
          <b-progress
            variant="warning"
            max="4"
            :value="dismissCountDown"
            height="4px"
          ></b-progress>
        </b-alert>
        <button
          class="hp-button "
          :class="selectedVariation === pageName ? 'danger' : 'grey'"
          @click="selectedVariation = pageName"
        >
          <div class="btn-text">{{ pageName + " " + "Main" }}</div>
        </button>
        <div v-for="(v, idx) in variations" :key="idx">
          <button
            class="hp-button"
            :class="selectedVariation === v.pageName ? 'danger' : 'grey'"
            @click="
              if (displayVariations[pageName].altered) dismissCountDown = 4;
              else selectedVariation = v.pageName;
            "
          >
            <div class="btn-text">{{ v.name }}</div>
          </button>
          <div
            class="sync d-flex p4  justify-content-center"
            v-if="selectedVariation === v.pageName"
            @click="synch()"
          >
            <div class="icon" :class="{ synched }"><SyncIcon /></div>
            <span>Synchronise</span>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- page section types popup 'edit' -->
      <b-modal class="modal" v-model="isModalOpen" centered ref="modal">
        <div class="section-modal-content">
          <div class="text-center h4 my-3  pb-3" v-if="!currentSection">
            Add
          </div>
          <div class="closeIcon" @click="isModalOpen = false">
            <CloseIcon />
          </div>
          <div
            class="step-back"
            v-if="currentSection"
            @click="currentSection = null"
          >
            <BackIcon />
          </div>

          <div v-if="!currentSection" class="m-1 p-1 type-items">
            <div
              class="section-item"
              v-for="type in types"
              :key="type.name"
              @click="currentSection = type"
            >
              <SectionItem
                v-if="type.name && !type.name.includes('local')"
                class="bg-light-blue "
                :title="formatName(type.name)"
                :icon="type.name"
              />
            </div>
          </div>
          <div v-else class="d-flex">
            <div class="component-view">
              <!-- we can use this short hand too -->
              <!-- <component :is="currentSection.type" :props="currentSection"  /> -->
              <Static
                v-if="currentSection.type === 'static'"
                :props="currentSection"
                @addSectionType="addSectionType"
                :savedView="savedView"
              />
              <Dynamic
                v-if="currentSection.type === 'dynamic'"
                :props="currentSection"
                @addSectionType="addSectionType"
                :savedView="savedView"
                :headers="headers"
              />
              <Configurable
                v-if="currentSection.type === 'configurable'"
                @addSectionType="addSectionType"
                :props="currentSection"
                :variation="variation"
                :savedView="savedView"
                :headers="headers"
                @loading="loading = !loading"
              />
              <Local
                v-if="currentSection.type === 'local'"
                :props="currentSection"
                @addSectionType="addSectionType"
                :savedView="savedView"
              />
            </div>
          </div>
        </div>
      </b-modal>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- views rendered in homepage -->
      <div class="views">
        <draggable
          v-model="currentViews"
          group="people"
          @start="drag = true"
          @end="drag = false"
          handle=".handle"
        >
          <transition-group>
            <section
              v-for="(view, index) in currentViews"
              :key="index"
              :class="{ [view.name]: true, 'view-in-edit-mode': editMode }"
            >
              <div class="section-view">
                <div
                  class="controls d-flex justify-content-center hide-mobile"
                  v-if="admin && editMode"
                >
                  <LinkIcon v-if="view.linkedTo" />
                  <div @click="edit(view)" v-if="editable(view.type)">
                    <EditIcon class="edit-icon" />
                  </div>
                  <DragIcon class="drag-icon handle" />
                  <div @click="deleteView(view.id)">
                    <TrashIcon class="trash-icon" />
                  </div>
                </div>
                <div
                  class="view-component"
                  :style="{ background: viewsBgColor }"
                >
                  <component
                    v-if="view.settings"
                    :is="getSectionViewCompName(view.name)"
                    :section="view"
                    :lang="lang"
                  />
                  <div v-else>
                    <div v-if="admin" class="error-section-loaded">
                      Some sections could not be loaded correctly, saving the
                      page will delete these sections from your page, unless you
                      are happy with the page you see now, do not save it
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </transition-group>
        </draggable>
      </div>
      <Loading :loading="loading" />
    </div>
    <div v-else>
      <button class="hp-button" @click="createNewPage">
        Create New Page
      </button>
      <b-toast title="" solid variant="success" :visible="successCreatePage">
        Congratulations on successfully creating a new page on sections. Start
        adding some content to it.
      </b-toast>
      <b-modal
        class="modal"
        header-bg-variant="danger"
        header-text-variant="light"
        title="Unable to Create New Page for Sections"
        :visible="errorCreatePage"
        ok-title="Try Again"
        centered
      >
        We are unable to create a new page for sections for {{ pageName }}
      </b-modal>
    </div>
  </div>
</template>

<script>
// import sections types
import Static from "./types/Static.vue";
import Dynamic from "./types/Dynamic.vue";
import Configurable from "./types/Configurable.vue";
import Local from "./types/Local.vue";
import { BAlert, BModal, VBModal, BToast } from "bootstrap-vue";

// import other comps
import SectionItem from "./sectionItem.vue";
import EditIcon from "./icons/edit.vue";
import DragIcon from "./icons/drag.vue";
import TrashIcon from "./icons/trash.vue";
import BackIcon from "./icons/back.vue";
import PlusIcon from "./icons/plus.vue";
import CheckIcon from "./icons/save.vue";
import CloseIcon from "./icons/close.vue";
import draggable from "vuedraggable";
import SyncIcon from "./icons/sync.vue";
import LinkIcon from "./icons/link.vue";

// import camelCase from "lodash/camelCase";
// import functions
import { formatName, getSectionViewCompName } from "./functions";
import Vue from "vue";
import Loading from "./components/Loading.vue";

import { sectionHeader } from "./helpers";

import axios from "axios";
export default {
  layout: "dashboard",
  components: {
    Loading,
    SyncIcon,
    Static,
    Dynamic,
    Local,
    Configurable,
    SectionItem,
    EditIcon,
    DragIcon,
    TrashIcon,
    BackIcon,
    PlusIcon,
    CheckIcon,
    CloseIcon,
    draggable,
    LinkIcon,
    "b-alert": BAlert,
    "b-modal": BModal,
    "b-toast": BToast,
  },
  props: {
    pageName: {
      type: String,
      default: "",
    },
    projectId: {
      type: String,
      default: "",
    },
    admin: {
      type: Boolean,
      default: false,
    },
    variations: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Object,
      default() {
        return {};
      },
    },
    reactiveTrigger: {
      type: String,
      default: "",
    },
    lang: {
      type: String,
      default: "",
    },
    viewsBgColor: {
      type: String,
      default: "transparent",
    },
  },

  data() {
    return {
      showSections: false,
      pageNotFound: false,
      successCreatePage: false,
      errorCreatePage: false,
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
      synched: false,
      savedView: {},
      // all saved variations
      displayVariations: {
        [this.pageName]: {
          name: this.pageName,
          views: {},
          altered: false,
        },
      },
    };
  },
  computed: {
    activeVariation() {
      // If variation true return its page name
      const activeVar = this.variations.filter((variation) => variation.active);
      if (activeVar.length === 1) return activeVar[0];
      else if (activeVar.length > 1) {
        return activeVar[0];
      }
      // otherwise return the default pageName prop
      else return { name: "default", pageName: this.pageName };
    },
    currentViews: {
      get() {
        let views = [];
        views = Object.values(
          this.displayVariations[this.selectedVariation].views
        );
        views = views.sort(function(a, b) {
          return a.weight - b.weight;
        });

        return views;
      },
      set(newValue) {
        for (let index = 0; index < newValue.length; index++) {
          const replacement = newValue[index];
          replacement.weight = index;
          Vue.set(
            this.displayVariations[this.selectedVariation].views,
            newValue[index].id,
            replacement
          );
        }
      },
    },
  },
  created() {
    axios.defaults.headers.common["token"] = this.$cookies.get(
      "sections-auth-token"
    ); // for all requests
    // axios.defaults.headers.common["origin"] = "http://localhost:3330"; // for all requests
    // axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*"; // for all requests
  },
  mounted() {
    this.$root.$on("toast", ({ type, message }) => {
      this.toast(type, type, message);
    });
    this.loading = true;
    this.checkToken();
    const config = {
      headers: sectionHeader({}),
    };
    const URL =
      process.env.VUE_APP_SERVER_URL +
      `/api/v1/project/${this.$sections.projectId}/page/${this.pageName}`;
    axios
      .post(URL, {}, config)
      .then((res) => {
        const sections = res.data.sections;
        const views = {};
        sections.map((section) => {
          section.settings = JSON.parse(section.settings);
          if (section.id) {
            views[section.id] = section;
          } else {
            views["test"] = section;
          }
        });
        Vue.set(this.displayVariations, this.activeVariation.pageName, {
          name: this.activeVariation.pageName,
          views: { ...views },
        });
        this.selectedVariation = this.activeVariation.pageName;
        this.$store.commit("setFetched");
        this.loading = false;
        this.showSections = true;
      })
      .catch(() => {
        // this.toast(
        //   "Error",
        //   "Error",
        //   "Couldn't load the page.Check logs for more info please"
        // );
        this.loading = false;
        this.showSections = true;
        this.pageNotFound = true;
        this.$store.commit("setFetched");
      });
  },
  methods: {
    createNewPage() {
      // pageName
      const token = Vue.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };
      const URL = `${this.server_url}/api/v1/project/${this.$sections.projectId}/page/${this.pageName}`;
      axios
        .put(
          URL,
          {
            variations: [],
            sections: [],
          },
          config
        )
        .then((res) => {
          this.successCreatePage = true;
          setTimeout(() => {
            this.successCreatePage = false;
          }, 1000);
        })
        .catch((err) => {
          this.errorCreatePage = true;
        });
    },
    checkToken() {
      const root_path = window.location.href.split("?")[0];
      const auth_code = window.location.href.split("auth_code=")[1];
      if (auth_code) {
        const config = {
          headers: sectionHeader({}),
        };
        const URL =
          process.env.VUE_APP_SERVER_URL +
          `/api/v1/project/${this.$sections.projectId}/token/${auth_code}`;
        axios
          .get(URL, config)
          .then((res) => {
            const token = res.data.token;
            this.$cookies.set("sections-auth-token", token);
            window.location.replace(root_path);
            this.loading = false;
          })
          .catch((err) => {
            this.loading = false;
          });
      }
    },
    getSectionTypes() {
      if (this.types && this.types.length) {
        return;
      }
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader({
          token,
        }),
      };
      const url =
        process.env.VUE_APP_SERVER_URL +
        `/api/v1/project/${this.$sections.projectId}/section-types`;
      axios
        .get(url, config)
        .then((res) => {
          res.data.data.map((d) => {
            this.types.push({
              name: d.name,
              type: d.type,
            });
          });
        })
        .catch(() => {});
    },
    openEditMode() {
      this.getSectionTypes();
      if (!this.originalVariations[this.selectedVariation]) {
        this.originalVariations = JSON.parse(
          JSON.stringify(this.displayVariations)
        );
      }

      this.editMode = !this.editMode;
    },
    formatName,
    getSectionViewCompName,
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
      this.synched = true;
      // get all existing linked to
      const currentVariationView = this.displayVariations[
        this.selectedVariation
      ].views;

      // remove all existing linked to
      const withoutLinkedToValueList = Object.values(
        currentVariationView
      ).filter((view) => !view.linkedTo);
      // get default original values from the main
      let defaultVariationViews = Object.values(
        // we use an intermediary json object to deep clone the array
        JSON.parse(JSON.stringify(this.displayVariations[this.pageName].views))
      );
      // update the cloned list with a linkedTo id
      defaultVariationViews = defaultVariationViews.map((view) => {
        view.linkedTo = view.id;
        view.id = "id-" + view.id;
        return view;
      });
      // get the new added sections to this variation
      const finalSections = [
        ...withoutLinkedToValueList,
        ...defaultVariationViews,
      ];

      const finalViews = {};
      finalSections.map((section) => {
        finalViews[section.id] = section;
      });
      Vue.set(
        this.displayVariations[this.selectedVariation],
        "views",
        finalViews
      );

      setTimeout(() => {
        this.synched = false;
      }, 1000);
    },
    addSectionType(section) {
      try {
        if (this.savedView.linkedTo) {
          const confirmed = window.confirm(
            "This section is linked to a main section, editing it will break the link, are you sure you want to proceed ?"
          );
          if (!confirmed) {
            return;
          }
        }
        if (section.weight === "null") {
          section.weight = Object.keys(
            this.displayVariations[this.selectedVariation].views
          ).length;
        }

        section.linkedTo = "";
        Vue.set(
          this.displayVariations[this.selectedVariation].views,
          section.id,
          section
        );

        if (this.selectedVariation === this.pageName) {
          // We check if there are variations that contains a section linked to the one we just edited
          // If there are, we edit them too so they stay in sync
          this.variations.map((variation) => {
            const newViews = Object.values(
              this.displayVariations[variation.pageName].views
            ).map((sectionVariation) => {
              if (sectionVariation.linkedTo === section.id)
                sectionVariation.settings = section.settings;
              return sectionVariation;
            });
            Vue.set(this.displayVariations[variation.pageName], "views", {
              ...newViews,
            });
          });
        }

        this.currentViews = this.displayVariations[
          this.selectedVariation
        ].views;
        this.displayVariations[this.selectedVariation].altered = true;
        this.isModalOpen = false;
        this.savedView = {};
        this.loading = false;
      } catch (e) {
        // this.toast(
        //   "error",
        //   "Error",
        //   "We are unable to preview your section, try again later or contact your support"
        // );
      }
    },
    mutateVariation(variationName) {
      const sections = [];
      let views = this.displayVariations[variationName].views;
      views = Object.values(views);
      views.map((view) => {
        const refactorView = {
          id: view.id,
          weight: view.weight,
          name: view.name,
          type: view.type,
          linkedTo: view.linkedTo,
        };
        if (view.settings) {
          refactorView.options = JSON.stringify(view.settings);
        }
        if (!view.settings && view.type === "configurable") {
          const options = [];
          view.renderData.map((rData) => {
            options.push(rData.settings);
          });
          refactorView.options = JSON.stringify(options);
        }
        if (refactorView.id.startsWith("id-")) {
          delete refactorView.id;
        }
        sections.push({ ...refactorView });
      });

      const variables = {
        page: variationName,
        variations: [],
        sections,
      };
      const URL =
        process.env.VUE_APP_SERVER_URL +
        `/api/v1/project/${this.$sections.projectId}/page/${variationName}`;
      axios
        .put(URL, variables)
        .then((res) => {
          if (res.data && res.data.error) {
            this.toast("error", "Error", res.data.error);
            return;
          }
          this.displayVariations[variationName].altered = false;
          this.loading = false;
          // this.toast(
          //   "Success",
          //   "Success",
          //   "You have successfully saved your changes and they are now visible to your visitors"
          // );
        })
        .catch(() => {
          // this.toast(
          //   "error",
          //   "Error",
          //   "We couldn't save your changes, try again later or contact your support"
          // );

          this.loading = false;
        });
    },
    // toast(title, type, message) {
    //   this.$bvToast.toast(message, {
    //     title,
    //     variant: type === "Error" ? "danger" : "success",
    //     solid: true,
    //     toaster: "b-toaster-top-center",
    //   });
    // },
    saveVariation() {
      this.loading = true;
      // intialise the new views
      this.mutateVariation(this.pageName);
      this.variations.map((variation) => {
        this.mutateVariation(variation.pageName);
      });
    },
    edit(view) {
      this.types.map((type) => {
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
      this.displayVariations = JSON.parse(
        JSON.stringify(this.originalVariations)
      );
      // this.toast(
      //   "info",
      //   "info",
      //   "You have successfully reverted your page to how it is currently showing to your visitors"
      // );
    },
    deleteView(id) {
      if (this.selectedVariation === this.pageName) {
        // We check if there are variations that contains a section linked to the one we are about to delete
        // If there are, we unlink them
        this.variations.map((variation) => {
          const newViews = Object.values(
            this.displayVariations[variation.pageName].views
          ).map((section) => {
            if (section.linkedTo === id) section.linkedTo = "";
            return section;
          });
          Vue.set(this.displayVariations[variation.pageName], "views", {
            ...newViews,
          });
        });
      }
      // Then we remove the variation we want to delete
      Vue.delete(this.displayVariations[this.selectedVariation].views, id);
      this.toast(
        "deleted",
        "success",
        "Your section has been removed, save your page to display this change to your visitors"
      );
    },
  },
};
</script>

<style lang="scss" scoped>
$sectionsBlue: #31a9db;
// .media-mobile(@rules) {
//   @media only screen and (max-width: 1025px) {
//     @rules();
//   }
// }
// .media-wide(@rules) {
//   @media only screen and (min-width: 1560px) {
//     @rules();
//   }
// }
span.handle {
  width: 20px;
  height: 20px;
  display: block;
  border: 1px solid grey;
}

.buttons-wrapper {
  max-width: 800px;
  margin: 0 auto;
}
button {
  max-height: 64px;
  width: auto;
  min-width: auto;
  border-radius: 16px;
  height: auto;
  padding: 6px 8px;
  min-height: auto;
  margin: 10px;
}

// modal styles
.view-component {
  position: relative;
  // max-width: 1560px;
  overflow-x: hidden;
  margin: 0 auto;
  // .media-mobile({width: 100%;});
}
.view-component > div {
  margin: 0 auto;
}
.section-view {
  position: relative;
  .controls {
    background: lightgray;
    padding: 5px;
    border-radius: 10px;
    top: 3px;
    right: 23px;
    position: absolute;
    z-index: 9;
    // .media-mobile({top: -28px; right: 2px;});
    svg {
      cursor: pointer;
      width: 40px;
      height: 40px;
      color: $sectionsBlue;
      margin: 3px;
      // .media-mobile({width: 6vmin; height: 6vmin;});
    }
  }
}
.component-view {
  margin: 0 auto;
}
.views {
  margin: 0 auto;
}

.hp-button {
  outline: none;
  max-width: 1000px;
  display: flex;
  background: #31a9db;
  border: none;
  color: white;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #298cb6;
    transition: 0.1s;
  }
  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-icon {
    margin-right: 8px;
    svg {
      color: white;
      width: 24px;
      height: 24px;
    }
  }
  &.danger {
    background: red;
    &:hover {
      background: rgb(214, 1, 1);
      transition: 0.1s;
    }
  }
  &.grey {
    background: #8b8b8b;
    &:hover {
      background: rgb(143, 142, 142);
      transition: 0.1s;
    }
  }
}
.part2 {
  margin-top: 3px;
  z-index: 9;
  position: relative;
}

.modal {
  padding: 20px;
  position: relative;
  .closeIcon,
  .step-back {
    cursor: pointer;
    position: absolute;
    top: 10px;
    svg {
      width: 3vw;
      height: 3vw;
      // .media-wide({width: 50px; height: 50px;});

      transition: 0.2s;
      &:hover {
        transition: 0.2s;
      }
    }
  }
  .step-back {
    left: 10px;
    svg {
      color: #8b8b8b;
      &:hover {
        color: darken(#8b8b8b, 10%);
      }
    }
  }
  .closeIcon {
    right: 10px;
    svg {
      color: $sectionsBlue;
      &:hover {
        color: darken($sectionsBlue, 10%);
      }
    }
  }
}

.sync {
  color: red;
  cursor: pointer;
  svg {
    width: 20px;
    height: 20px;
    color: red;
    margin-right: 3px;
  }
}
.synched {
  display: flex;
  align-items: center;
  svg {
    -webkit-animation: spin 1.5s linear infinite;
    -moz-animation: spin 1.5s linear infinite;
    animation: spin 1.5s linear infinite;
  }
  @-moz-keyframes spin {
    100% {
      -moz-transform: rotate(360deg);
    }
  }
  @-webkit-keyframes spin {
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
}

.modal {
  .section-item {
    width: 100%;
    height: 130px;
  }
  padding: 20px;
  .type-items {
    display: grid;
    grid-template-columns: repeat(4, 130px);
    grid-gap: 35px;
    justify-content: center;
  }
}
// .media-mobile(
//   {.part2,
//   .part1 {display: block;} .type-items {grid-template-columns: repeat(2, 1fr) ;}}
// ) !important;

.sections-config {
  min-height: 100vh;
  // position:relative;
  .control-button {
    position: absolute;
    z-index: 999;
    left: 0;
    top: 100px;
  }
}
</style>

<style lang="scss">
// .media-mobile(@rules) {
//   @media only screen and (max-width: 1025px) {
//     @rules();
//   }
// }
.section-modal-content {
  padding-bottom: 1rem;
}

.modal-header,
.modal-footer {
  display: none !important;
}
.modal-content {
  padding: 15px;
  border-radius: 1.3rem;
  outline: none;
  width: auto;
  margin: 0 auto;
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  min-width: 65%;
  // .media-mobile({width: 95%; margin: 0 auto;});
}
.modal {
  overflow: visible;
}
.modal-dialog {
  width: 100% !important;
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<style lang="scss">
button {
  font-size: 20px;
  outline: none;
  svg {
    width: 20px;
    height: 20px;
  }
}
.bg-light-grey-hp {
  background: #f5f5f5;
}
.bg-blue {
  background: #31a9db;
  color: white;
  border: none;
  outline: none !important;
  transition: 0.2s;

  &:hover {
    background: #0881b3;
    transition: 0.2s;
  }
}
.danger {
  color: white;
}

.error-section-loaded {
  text-align: center;
  color: rgb(216, 42, 42);
  font-size: 17px;
  width: 50%;
  margin: 0 auto;
  padding: 15px;
  font-weight: 500;
}

// .hide-mobile {
//   .media-mobile({display: none;}) !important;
// }
.mainmsg {
  color: #686868;
}
</style>
