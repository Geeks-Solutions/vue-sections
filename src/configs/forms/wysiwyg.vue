<template>
  <div class="input">
    <quill-editor class="wyzywig" v-model="settings" />
  </div>
</template>
<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";

export default {
  components: {
    quillEditor,
  },
  data() {
    return {
      settings: "",
    };
  },
};
</script>
