<template>
  <div class="input">
    <quill-editor ref="myQuillEditor" class="wyzywig" v-model="settings" />
  </div>
</template>
<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";
import axios from "axios";

export default {
  components: {
    quillEditor,
  },
  data() {
    return {
      settings: ""
    };
  },
  mounted() {
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('image', () => {
      this.uploadFunction();
    });
  },
  methods: {
    validate() {
      return true;
    },
    uploadFunction() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.click();

      let imageURL = ''

      // Listen upload local image and save to server
      input.onchange = async () => {
        const file = input.files[0];
        const data = new FormData()
        data.append('files[1][file]', file)
        data.append('type', "image")
        data.append('author', "Author")
        data.append('private_status', "public")
        data.append('files[1][platform_id]', '1')
        const token = this.$cookies.get("sections-auth-token")
          const config = {
            headers: this.sectionHeader({token}),
          };
          await axios.post(
              this.$sections.serverUrl +
              `/project/${this.$sections.projectId}/media`,
              // Uncomment the below line to overpass CORS
              '/media/',
              data,
              config
          ).then((result) => {
            imageURL = result.data.files[0].url
            const range = this.$refs.myQuillEditor.quill.getSelection();
            this.$refs.myQuillEditor.quill.insertEmbed(range.index, 'image', imageURL);
          })
      };
    },
    sectionHeader(header) {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000000 + 1);
      const header_key = `project-id-${timestamp}-${random}`;
      header[header_key] = "a3b2cd1";
      if(header.origin){
        header['access-control-request-headers'] = header_key;
      }
      return header
    }
  }
};
</script>
