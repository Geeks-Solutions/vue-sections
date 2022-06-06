<template>
  <div class="sections-config justify-content-center">
    <div v-if="!pageNotFound">
      <!-- page buttons part 1-->
      <button
        @click="openEditMode()"
        v-if="admin"
        class="bg-blue control-button hide-mobile"
      >
        {{ !editMode ? $t("Edit page") : $t("View page") }}
      </button>
      <div class="bg-light-grey-hp hide-mobile section-wrapper">
        <div v-if="admin && editMode" class="p3 text-center mainmsg pt-3">
          Your changes will be published when the page is saved.
        </div>

        <div
          class="pb-3 pt-1 d-flex justify-content-center part1 hide-mobile"
          v-if="admin && editMode"
        >
          <button
            class="hp-button create-static-section"
            @click="openStaticSection"
          >
            <div class="btn-icon check-icon"><CreateIcon /></div>
            <div class="btn-text">{{ $t("Create static section") }}</div>
          </button>
          <button
            class="hp-button"
            @click="
              (currentSection = null), (isModalOpen = true), (savedView = {})
            "
          >
            <div class="btn-icon plus-icon"><PlusIcon /></div>
            <div class="btn-text">{{ $t("Add") }}</div>
          </button>
          <button class="hp-button" @click="saveVariation">
            <div class="btn-icon check-icon"><CheckIcon /></div>
            <div class="btn-text">{{ $t("Save") }}</div>
          </button>
          <button class="hp-button grey" @click="restoreVariations">
            <div class="btn-icon back-icon"><BackIcon /></div>
            <div class="btn-text">{{ $t("Restore") }}</div>
          </button>
          <button
            @click="$cookies.remove('sections-auth-token'), (admin = false)"
            v-if="admin"
            class="bg-blue control-button"
            style="right: 0px;
                  left: auto;
                  background: black;
                  font-size: 13px;
                  border-radius: 5px;
                  padding: 3px 6px;"
          >
            {{ $t("Logout") }}
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
            <span>{{ $t("Synchronise") }}</span>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- page section types popup 'edit' -->
      <b-modal class="modal" v-model="isModalOpen" centered ref="modal">
        <div class="section-modal-content">
          <div class="text-center h4 my-3  pb-3" v-if="!currentSection">
            {{ $t("Add") }}
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
              v-for="(type, index) in types"
              :key="type.name"
            >
              <div v-if="type.access === 'private'" class="section-delete">
                <div class="section-delete-icon" @click="openDeleteSectionTypeModal(type.name, index)">
                  <TrashIcon class="trash-icon-style" />
                </div>
              </div>
              <div class="section-item" @click="currentSection = type">
                <SectionItem
                    v-if="type.name && !type.name.includes('local')"
                    class="bg-light-blue"
                    :title="formatName(type.name)"
                    :icon="type.name"
                />
              </div>
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
                @errorAddingSection="errorAddingSection"
                :savedView="savedView"
                :headers="headers"
              />
              <Configurable
                v-if="currentSection.type === 'configurable'"
                @addSectionType="addSectionType"
                @errorAddingSection="errorAddingSection"
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

      <!-- page section types popup 'delete' -->
      <b-modal class="modal" v-model="isDeleteModalOpen" centered ref="modal">
        <div class="section-modal-content">
          <div class="text-center h4 my-3  pb-3">
            {{ $t("delete-section-type") + selectedSectionTypeName}}
          </div>
          <div class="flex">
            <button
                class="hp-button"
                @click="deleteSectionType(selectedSectionTypeName, selectedSectionTypeIndex)"
            >
              <div class="btn-text">
                {{ $t("Confirm") }}
              </div>
            </button>
            <button
                class="hp-button"
                @click="isDeleteModalOpen = false"
            >
              <div class="btn-text">
                {{ $t("Cancel") }}
              </div>
            </button>
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
          <!-- <transition-group> -->
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
              <div class="view-component" :style="{ background: viewsBgColor }">
                <component
                  v-if="view.settings || view.type == 'local'"
                  :is="view.name"
                  :section="view"
                  :lang="lang"
                />
                <div v-else>
                  <div v-if="admin" class="error-section-loaded">
                    Some sections could not be loaded correctly, saving the page
                    will delete these sections from your page, unless you are
                    happy with the page you see now, do not save it
                  </div>
                </div>
              </div>
            </div>
          </section>
          <!-- </transition-group> -->
        </draggable>
      </div>
      <b-modal
        class="modal"
        :modal-class="'section-modal-main-wrapper'"
        v-model="staticModal"
        centered
        ref="modal"
      >
        <div class="section-modal-wrapper">
          <div class="text-center h4 header" v-if="!currentSection">
            <div class="title">{{ $t("section-title") }}:</div>
            <div class="closeIcon" @click="staticModal = false">
              <CloseIcon />
            </div>
          </div>
          <div class="body">
            <div style="margin-bottom: 10px;">
              {{ $t("section-input-title") }}
            </div>
            <input
              class="section-input"
              type="text"
              v-model="sectionTypeName"
            />
          </div>
          <div class="footer">
            <button class="hp-button" @click="addNewStaticType">
              <div class="btn-icon check-icon"></div>
              <div class="btn-text">
                {{ $t("Continue") }}
              </div>
            </button>
          </div>
        </div>
      </b-modal>
      <b-modal
        class="modal"
        :modal-class="'section-modal-main-wrapper'"
        v-model="staticSuccess"
        centered
        ref="modal"
      >
        <div class="section-modal-wrapper success-section-type">
          <div class="text-center h4 header">
            <div class="icon-head">
              <CelebrateIcon />
            </div>
            <div class="title">
              {{ $t("success-section-title") }}
            </div>
            <div class="closeIcon" @click="staticSuccess = false">
              <CloseIcon />
            </div>
          </div>
          <div class="body">
            <div class="subtitle">{{ $t("success-section-subtitle") }}:</div>
            <div class="section-list">
              <div class="dot"><DotIcon /></div>
              <div>
                {{ $t("success-section-instruction-1") }}
              </div>
            </div>
            <div class="section-list">
              <div class="dot"><DotIcon /></div>
              <div>
                {{ $t("success-section-instruction-2") }}
              </div>
            </div>
            <div class="section-list">
              <div class="dot"><DotIcon /></div>
              <div>
                {{ $t("success-section-instruction-3") }}
              </div>
            </div>
          </div>
          <div class="footer">
            <button class="hp-button" @click="staticSuccess = false">
              <div class="btn-icon check-icon"></div>
              <div class="btn-text">{{ $t("Done") }}</div>
            </button>
          </div>
        </div>
      </b-modal>
      <Loading :loading="loading" />
    </div>
    <div v-else>
      <button v-if="admin" class="hp-button" @click="createNewPage">
        {{ $t("Create New Page") }}
      </button>
    </div>
  </div>
</template>

<script>
import initI18n from "@/i18n";
// import sections types
import Static from "./types/Static.vue";
import Dynamic from "./types/Dynamic.vue";
import Configurable from "./types/Configurable.vue";
import Local from "./types/Local.vue";
import { BAlert, BModal } from "bootstrap-vue";

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
import CreateIcon from "./icons/create.vue";
import DotIcon from "./icons/dot.vue";
import CelebrateIcon from "./icons/celebrate.vue";

import camelCase from "lodash/camelCase";
import upperFirst from "lodash/upperFirst";

import Loading from "./components/Loading.vue";

import { formatName, sectionHeader, importComp } from "./helpers";
import axios from "axios";
export default {
  i18n: initI18n,
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
    CreateIcon,
    DotIcon,
    CelebrateIcon,
    "b-alert": BAlert,
    "b-modal": BModal,
  },
  props: {
    pageName: {
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
      default: "en",
    },
    viewsBgColor: {
      type: String,
      default: "transparent",
    },
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
          altered: false,
        },
      },
      selectedSectionTypeName: "",
      selectedSectionTypeIndex: ""
    };
  },
  // Server-side only
  // This will be called by the server renderer automatically
  serverPrefetch () {
        const config = {
      headers: sectionHeader({origin: this.$sections.projectUrl}),
    };
    const URL =
      this.$sections.serverUrl +
      `/project/${this.$sections.projectId}/page/${this.pageName}`;

    return axios
      .options(URL, config)
      .then((res) => {
        console.log(`Options API Call success`)

        return axios.post(URL, {}, config)
      })
      .then((res) => {
          const sections = res.data.sections;
          const views = {};
          sections.map((section) => {
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
            views: { ...views },
          });
          this.selectedVariation = this.activeVariation.pageName;
          this.loading = false;
        })
        .catch((error) => {
          this.showToast("Error", "danger", "Couldn't load the page in server prefetch: " + error.response.data.error);
          this.loading = false;
          this.pageNotFound = true;
        });
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
          this.$set(
            this.displayVariations[this.selectedVariation].views,
            newValue[index].id,
            replacement
          );
        }
      },
    },
  },
  mounted() {
    initI18n.locale = this.lang;
      this.loading = true;

      this.checkToken();
      // We check if this is running in the browser or not
      // because during SSR no cors preflight request is sent
      const inBrowser = typeof window !== 'undefined';
      const config = {
        headers: sectionHeader(((inBrowser) ? {} : {origin: this.$sections.projectUrl})),
      };
      const URL =
        this.$sections.serverUrl +
        `/project/${this.$sections.projectId}/page/${this.pageName}`;

      axios
      .post(URL, {}, config)
      .then((res) => {
        const sections = res.data.sections;
        const views = {};
        sections.map((section) => {
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
          views: { ...views },
        });
        this.selectedVariation = this.activeVariation.pageName;
        this.loading = false;
        this.$emit("load", true);
      })
      .catch((error) => {
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
          headers: sectionHeader({ token }),
        };
        const URL =
          this.$sections.serverUrl +
          `/project/${this.$sections.projectId}/section-types/${this.sectionTypeName}`;
        this.loading = true;
        axios.post(URL, {}, config).then(() => {
          this.types = [];
          this.getSectionTypes();
          this.staticSuccess = true;
          this.loading = false;
        })
        .catch((error) => {
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
        const name = upperFirst(
          camelCase(
            // Gets the file name regardless of folder depth
            sectionName
              .split("/")
              .pop()
              .replace(/\.\w+$/, "")
          )
        );
        const path = `/views/${sectionName}_${sectionType}`;
        this.$options.components[name] = importComp(path);
      }
    },
    createNewPage() {
      // pageName
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };
      const URL = this.$sections.serverUrl + `/project/${this.$sections.projectId}/page/${this.pageName}`;
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
          this.showToast(
            "Success",
            "success",
            "Congratulations on successfully creating a new page on sections. Start adding some content to it."
          );
        })
        .catch((err) => {
          this.showToast(
            "Error creating page",
            "danger",
            "We are unable to create a new sections page for " + this.pageName + "\n" + err.response.data.message
          );
        });
    },
    showToast(title, variant, message) {
      const inBrowser = typeof window !== 'undefined';
      if(inBrowser){
        this.$bvToast.toast(message, {
          title,
          variant,
          solid: true,
          toaster: "b-toaster-top-center",
        });
      } else {
        console.log(`## ${variant} ## ${title}: ${message}`)
      }
    },
    checkToken() {
      const auth_code = this.$route.query.auth_code;
      if (auth_code) {
        const config = {
          headers: sectionHeader({}),
        };
        const URL =
          this.$sections.serverUrl +
          `/project/${this.$sections.projectId}/token/${auth_code}`;
        axios
          .get(URL, config)
          .then((res) => {
            const token = res.data.token;
            this.$cookies.set("sections-auth-token", token, "7d");
            this.$router.push(this.$route.path)
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
      this.loading = true;
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader({
          token,
        }),
      };
      const url =
        this.$sections.serverUrl +
        `/project/${this.$sections.projectId}/section-types`;
      axios
        .get(url, config)
        .then((res) => {
          res.data.data.map((d) => {
            this.trackSectionComp(d.name, d.type);
            this.types.push({
              name: d.name,
              type: d.type,
              access: d.access,
              application: d.application,
              dynamic_options: d.dynamic_options,
              fields: d.fields,
              multiple: d.multiple,
            });
          });
          this.types = [...this.types, ...this.addSystemTypes()];
          this.loading = false;
        })
        .catch((error) => {
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
        throw new Error(
          "vue-sections: Your project contains no @/sections folder"
        );
      }
      staticTypes = this.build_comp(
        staticTypes,
        { ...external_types },
        "external",
        external_path
      );
      staticTypes = this.build_comp(
        staticTypes,
        internal_types,
        "internal",
        "internal:path"
      );
      return [...new Set(staticTypes)];
    },
    build_comp(staticTypes, types, compType, path) {
      let names = staticTypes.map((obj) => {
        return obj.name;
      });
      types.keys().forEach((fileName) => {
        const splitName = fileName.split("_");
        const type = splitName[1];
        const mainName = splitName[0];
        if (type) {
          if (type == "local") {
            const name = camelCase(
              // Gets the file name regardless of folder depth
              mainName
                .split("/")
                .pop()
                .replace(/\.\w+$/, "")
            );
            if (!names.includes(name)) {
              this.trackSectionComp(name, "local");
              staticTypes.push({
                name,
                type,
                compType,
              });
              names.push(name);
            }
          }
        } else {
          if (fileName.includes(".vue")) {
            console.error(
              `vue-sections: ${fileName} in ${path} can't be registered! You should follow the naming convention of any registered component '{Section Name}_{Section Type}.vue'`
            );
          }
        }
      });
      return staticTypes;
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
      this.$set(
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
        this.$set(
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
            this.$set(this.displayVariations[variation.pageName], "views", {
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
        this.showToast(
          "Success",
          "info",
          "This sections was successfully added to your page but is now only visible to you."
        );
      } catch (e) {
        this.showToast(
          "Error",
          "danger",
          "We are unable to preview your section, try again later"
        );
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

      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const variables = {
        page: variationName,
        variations: [],
        sections,
      };
      const URL =
        this.$sections.serverUrl +
        `/project/${this.$sections.projectId}/page/${variationName}`;
      axios
        .put(URL, variables, config)
        .then((res) => {
          if (res.data && res.data.error) {
            this.showToast("error", "danger", res.data.error);
            return;
          }
          this.displayVariations[variationName].altered = false;
          this.loading = false;
          this.showToast(
            "Success",
            "success",
            "You have successfully saved your changes and they are now visible to your visitors"
          );
        })
        .catch((error) => {
          this.showToast(
            "Error saving your changes",
            "danger",
              error.response.data.message
          );
          this.loading = false;
        });
    },
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
      this.showToast(
        "Revert Successful",
        "info",
        "You have successfully reverted your page to how it is currently showing to your visitors"
      );
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
          this.$set(this.displayVariations[variation.pageName], "views", {
            ...newViews,
          });
        });
      }
      // Then we remove the variation we want to delete
      this.$delete(this.displayVariations[this.selectedVariation].views, id);
      this.showToast(
        "Deletet",
        "info",
        "Your section has been removed, save your page to display this change to your visitors"
      );
    },
    errorAddingSection(error) {
      this.isModalOpen = !error.closeModal;
      this.showToast(error.title, "danger", error.message);
    },
    deleteSectionType(sectionTypeName, index) {
      this.isDeleteModalOpen = false
      this.loading = true
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader(({origin: this.$sections.projectUrl, token})),
      };
      const URL =
          this.$sections.serverUrl +
          `/project/${this.$sections.projectId}/section-types/${sectionTypeName}`;
      axios
          .delete(URL, config)
          .then((res) => {
            this.showToast(
                "Success",
                "info",
                res.data.message
            );
            this.types.splice(index, 1)
            this.loading = false
            this.$emit("load", false);
          })
          .catch((error) => {
            this.showToast("Error", "danger", "Couldn't delete section type: " + error);
            this.loading = false
            this.$emit("load", false);
          });
    },
    openDeleteSectionTypeModal(sectionTypeName, index) {
      this.selectedSectionTypeName = sectionTypeName
      this.selectedSectionTypeIndex = index
      this.isDeleteModalOpen = true
    }
  },
};
</script>

<style lang="scss">
.section-modal-main-wrapper {
  .modal-body {
    position: initial;
  }
}
</style>
<style lang="scss" scoped>
$sectionsBlue: #31a9db;
$sectionsDarkBlue: #257596;
$scetionGray: #454545;
$sectionLightGray: #a7a7a7;

.section-modal-wrapper {
  max-width: 780px;
  &.success-section-type {
    .header {
      flex-direction: column;
      align-items: center;
      .icon-head {
        margin-bottom: 10px;
      }
    }
    .body {
      width: 60%;
      margin: 20px auto;
      .subtitle {
        font-style: italic;
        text-align: center;
        width: 75%;
        margin: 0 auto 10px auto;
        color: $scetionGray;
        font-weight: 400;
      }
      .section-list {
        color: $sectionLightGray;
        display: flex;
        margin: 5px 0;
        .dot {
          color: $sectionsBlue;
          margin-right: 10px;
        }
      }
    }
  }
  .header {
    margin: 20px 0 40px 0;
    display: flex;
    justify-content: center;
    .title {
      width: 75%;
    }
    .closeIcon {
      position: absolute;
      top: 10px;
      right: 10px;
      svg {
        height: 40px;
        width: 40px;
      }
    }
  }
  .body {
    margin: 20px 0;
    .section-input {
      width: 100%;
      height: 50px;
    }
  }
  .footer {
    display: flex;
    justify-content: center;
    .hp-button {
      width: 200px;
    }
  }
}
.section-wrapper {
  position: relative;
  .create-static-section {
    border-color: $sectionsDarkBlue;
    color: $sectionsDarkBlue;
    background: white;
    position: absolute;
    top: 50px;
    left: 0;
    padding: 0;
    display: flex;
    border-width: 2px;
    border: 2px solid #257596;
    &:hover {
      background: $sectionsDarkBlue;
      color: white;
      .btn-icon {
        background: white;
        svg {
          color: $sectionsDarkBlue;
        }
      }
    }
    .btn-icon {
      background: $sectionsDarkBlue;
      color: white;
      width: 48px;
      height: 36px;
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
    }
    .btn-text {
      padding-right: 10px;
    }
  }
}
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
    top: 60px;
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

.section-delete {
  background: #31a9db;
  height: 25px;
  padding: 5px;
  text-align: -webkit-right;
}

.section-delete-icon {
  cursor: pointer;
}

.trash-icon-style {
  height: 20px;
  width: 20px;
  color: white;
}
</style>
