<template>
  <div class="sections-config justify-content-center">
    <!-- page buttons part 1-->
    <button
      @click="openEditMode()"
      v-if="admin"
      class="bg-purple control-button"
    >
      {{ !editMode ? "Edit Page" : "View page" }}
    </button>
    <div
      class="bg-light-grey p-3 d-flex justify-content-center part1"
      v-if="admin && editMode"
    >
      <button
        class="hp-button"
        @click="(currentSection = null), (isModalOpen = true), (savedView = {})"
      >
        <div class="btn-icon"><PlusIcon /></div>
        <div class="btn-text">{{ $t("Add") }}</div>
      </button>
      <button class="hp-button" @click="saveVariation">
        <div class="btn-icon"><CheckIcon /></div>
        <div class="btn-text">{{ $t("Save") }}</div>
      </button>
      <button class="hp-button grey" @click="restoreVariations">
        <div class="btn-icon"><BackIcon /></div>
        <div class="btn-text">{{ $t("Restore") }}</div>
      </button>
    </div>
    <!-- page buttons part 2-->
    <div
      class="bg-light-grey p-3 d-flex justify-content-center part2"
      v-if="admin && editMode"
    >
      <b-alert
        :show="dismissCountDown"
        variant="warning"
        @dismissed="dismissCountDown = 0"
        @dismiss-count-down="
          countDownChanged => {
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
        <div class="btn-text">{{ pageName + " " + $t("Main") }}</div>
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
    <b-modal class="modal" v-model="isModalOpen" centered>
      <div class="section-modal-content">
        <div class="text-center h8 my-3  pb-3" v-if="!currentSection">
          {{ $t("Add") }}
        </div>
        <div class="closeIcon" @click="isModalOpen = false"><CloseIcon /></div>
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
              v-if="!type.name.includes('local')"
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
          <section v-for="(view, index) in currentViews" :key="index">
            <div class="section-view">
              <div
                class="controls d-flex justify-content-center"
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
              <div class="view-component">
                <component
                  :is="getSectionViewCompName(view.name)"
                  :section="view"
                />
              </div>
            </div>
          </section>
        </transition-group>
      </draggable>
    </div>
    <Loading :loading="loading" />
  </div>
</template>

<script>
// import sections types
import Static from "./types/Static";
import Dynamic from "./types/Dynamic";
import Configurable from "./types/Configurable";
import Local from "./types/Local";

// import other comps
import SectionItem from "./sectionItem";
import EditIcon from "./icons/edit";
import DragIcon from "./icons/drag";
import TrashIcon from "./icons/trash";
import BackIcon from "./icons/back";
import PlusIcon from "./icons/plus";
import CheckIcon from "./icons/save";
import CloseIcon from "./icons/close";
import draggable from "vuedraggable";
import SyncIcon from "./icons/sync";
import LinkIcon from "./icons/link";

// import local types
import localTypes from "../configs/localTypes";
import staticTypes from "../configs/staticTypes";


// import functions
import { formatName, getSectionViewCompName } from "./functions";
import loader from "../configs/loader";
import Vue from "vue";
import Loading from "./components/Loading";


import axios from 'axios'
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
    LinkIcon
  },
  mixins: [loader],
  props: {
    pageName: {
      type: String,
      default: ""
    },
    project_id:{
      type:String,
      default:''
    },
    admin: {
      type: Boolean,
      default: false
    },
    variations: {
      type: Array,
      default:()=> []
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
    }
  },

  data() {
    return {
      dismissCountDown: 0,
      editMode: false,
      selectedVariation: this.pageName,
      types: [
        ...localTypes,
        ...staticTypes
      ],
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
          altered: false
        }
      }
    };
  },
  computed: {
    activeVariation() {
      // If variation true return its page name
      const activeVar = this.variations.filter(variation => variation.active);
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
      }
    }
  },
  // apollo: {
  //   sectionTypes: {
  //     query: sectionTypes,
  //     result({ data, loading, networkStatus }) {
  //       if (!loading && data) {
  //         this.types = [...data.sectionTypes, ...localTypes]
  //       }
  //     }
  //   },
  //   getSections: {
  //     query: getSections,
  //     variables() {
  //       return {
  //         page: this.activeVariation.pageName,
  //         reactiveTrigger:this.reactiveTrigger
  //       }
  //     },
  //     context() {
  //       return {
  //         headers: this.headers
  //       }
  //     },
  //     result({ data, loading, networkStatus }) {
  //       if (!loading && data.getSections) {
  //         const views = {}
  //         data.getSections.sections.map(section => {
  //           if (section.id) {
  //             views[section.id] = section
  //           }
  //         })
  //         Vue.set(this.displayVariations, this.activeVariation.pageName, {
  //           name: this.activeVariation.pageName,
  //           views: { ...views }
  //         })
  //         this.selectedVariation = this.activeVariation.pageName
  //         this.loading = loading
  //       }
  //     }
  //   }
  // },
  created(){
axios.defaults.headers.put['sections-auth-token'] = this.$cookies.get("sections-auth-token") // for all requests

  },
  mounted(){
    // this.loading = true
    const URL = process.env.VUE_APP_SERVER_URL + `/api/v1/project/${this.project_id}/page/${this.pageName}`
    axios.post(URL).then(res=>{
      const sections = res.data.sections
        const views = {}
        if (sections) 
        console.log(sections)
         sections.map(section => {
            if (section.id) {
              views[section.id] = section
            }else {
              views['test'] = section
            }
          })
          Vue.set(this.displayVariations, this.activeVariation.pageName, {
            name: this.activeVariation.pageName,
            views: { ...views }
          })
          this.selectedVariation = this.activeVariation.pageName
          this.loading = false
        }
    )

  },
  methods: {
    openEditMode() {
      // CALL QUERIES and fill display variables
      // const allVars = this.variations.slice(0)
      // allVars.push({
      //   name: 'default',
      //   pageName: this.pageName
      // })
      // allVars.map(variation => {
      //   this.$apollo.queries.getSections.fetchMore({
      //     // New variables
      //     variables: {
      //       page: variation.pageName
      //     },
      //     // Transform the previous result with new data
      //     updateQuery: (previousResult, { fetchMoreResult }) => {
      //       const sections = fetchMoreResult.getSections.sections
      //       const views = {}
      //       sections.map(section => {
      //         if (section.id) {
      //           views[section.id] = section
      //         }
      //       })
      //       Vue.set(this.displayVariations, variation.pageName, {
      //         name: variation.name,
      //         views: { ...views }
      //       })
      //       Vue.set(this.originalVariations, variation.pageName, {
      //         name: variation.name,
      //         views: JSON.parse(JSON.stringify(views))
      //       })
      //     }
      //   })
      // })
      this.originalVariations = this.displayVariations
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
      ).filter(view => !view.linkedTo);
      // get default original values from the main
      let defaultVariationViews = Object.values(
        // we use an intermediary json object to deep clone the array
        JSON.parse(JSON.stringify(this.displayVariations[this.pageName].views))
      );
      // update the cloned list with a linkedTo id
      defaultVariationViews = defaultVariationViews.map(view => {
        view.linkedTo = view.id;
        view.id = "id-" + view.id;
        return view;
      });
      // get the new added sections to this variation
      const finalSections = [
        ...withoutLinkedToValueList,
        ...defaultVariationViews
      ];

      const finalViews = {};
      finalSections.map(section => {
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
            section.weight = Object.keys(
        this.displayVariations[this.selectedVariation].views
      ).length
      section.linkedTo = "";
      Vue.set(
        this.displayVariations[this.selectedVariation].views,
        section.id,
        section
      );

      if (this.selectedVariation === this.pageName) {
        // We check if there are variations that contains a section linked to the one we just edited
        // If there are, we edit them too so they stay in sync
        this.variations.map(variation => {
          const newViews = Object.values(
            this.displayVariations[variation.pageName].views
          ).map(sectionVariation => {
            if (sectionVariation.linkedTo === section.id)
              sectionVariation.settings = section.settings;
            return sectionVariation;
          });
          Vue.set(this.displayVariations[variation.pageName], "views", {
            ...newViews
          });
        });
      }

      this.currentViews = this.displayVariations[this.selectedVariation].views;
      this.displayVariations[this.selectedVariation].altered = true;
      this.isModalOpen = false;
      this.savedView = {};
      this.loading = false;
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
        sections.push({ ...refactorView });
      });
      
      const variables = {
        page: variationName,
        variations: [],
        sections
      }
      const URL = process.env.VUE_APP_SERVER_URL +`/api/v1/project/${this.project_id}/page/${variationName}`
      axios.put(URL,variables).then(()=>{
           this.displayVariations[variationName].altered = false
           this.loading = false
      }).catch((err)=>{
        console.log(err)
          this.loading = false
      })
    },
    saveVariation() {
      this.loading = true;
      // intialise the new views
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
      this.displayVariations = JSON.parse(
        JSON.stringify(this.originalVariations)
      );
    },
    deleteView(id) {
      if (this.selectedVariation === this.pageName) {
        // We check if there are variations that contains a section linked to the one we are about to delete
        // If there are, we unlink them
        this.variations.map(variation => {
          const newViews = Object.values(
            this.displayVariations[variation.pageName].views
          ).map(section => {
            if (section.linkedTo === id) section.linkedTo = "";
            return section;
          });
          Vue.set(this.displayVariations[variation.pageName], "views", {
            ...newViews
          });
        });
      }
      // Then we remove the variation we want to delete
      Vue.delete(this.displayVariations[this.selectedVariation].views, id);
    },
  }
};
</script>

<style lang="less" scoped>
.media-mobile(@rules) {
  @media only screen and (max-width: 1025px) {
    @rules();
  }
}
.media-wide(@rules) {
  @media only screen and (min-width: 1560px) {
    @rules();
  }
}
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
  border-radius: 20px;
  height: auto;
  padding: 10px 10px;
  min-height: auto;
  margin: 10px;
}

// modal styles
.view-component {
  // max-width: 1560px;
  margin: 0 auto;
  .media-mobile({width: 100%;});
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
    .media-mobile({top: -28px; right: 2px;});
    svg {
      cursor: pointer;
      width: 40px;
      height: 40px;
      color: #329ca8;
      margin: 3px;
      .media-mobile({width: 6vmin; height: 6vmin;});
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
  max-width: 1000px;
  display: flex;
  background: #329ca8;
  div {
    display: flex;
  }
  .btn-icon {
    margin-right: 8px;
    svg {
      color: white;
      width: 40px;
      height: 40px;
    }
  }
  &.danger {
    background: red;
  }
  &.grey {
    background: darkgray;
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
      .media-wide({width: 50px; height: 50px;});

      color: #9032a1;
    }
  }
  .step-back {
    left: 10px;
  }
  .closeIcon {
    right: 10px;
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
.media-mobile(
  {.part2,
  .part1 {display: block;} .type-items {grid-template-columns: repeat(2, 1fr) ;}}
) !important;

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

<style lang="less">
.media-mobile(@rules) {
  @media only screen and (max-width: 1025px) {
    @rules();
  }
}
.section-modal-content {
  padding: 1rem;
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
  .media-mobile({width: 95%; margin: 0 auto;});
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

<style lang="less">
  button {
    font-size: 20px;
    outline: none;
    svg {
      width: 20px;
      height: 20px;;
    }
  }
  .bg-light-grey {
    background: lightgrey;
  }
  .danger {
    color:white
  }
</style>