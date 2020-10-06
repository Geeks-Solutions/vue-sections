<template>
<div class="input">
    <quill-editor class="wyzywig" v-model="settings" />  
  </div>
</template>
<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
export default {
    data(){
        return {
            settings:""
        }
    }
}
</script>