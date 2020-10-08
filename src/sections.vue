<template>
  <div id="app">
      <SectionsMain admin :pageName="pageName" :variations="variations" :project_id="project_id" />
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import SectionsMain from './base'
export default {
  components:{
    SectionsMain
  },
  computed:{
    variations() {
      return []
    }
  },
  data(){
    return {
      project_id:"5f5ef6682a4e7d1a619112b7",
      pageName:'contact_us'
    }
  }
}
</script>
