<template>
  <div class="formd">
    <div class="h8 mt-5">Content</div>
    <div class="slide-add-form">
      <div class="text-titles">
        <div class="english">
          <div>English</div>
          <input v-model="settings.content.en.title" placeholder="title" />
          <textarea
            v-model="settings.content.en.description"
            placeholder="description"
          />
        </div>
        <div class="french">
          <div>French</div>
          <input v-model="settings.content.fr.title" placeholder="title" />
          <textarea
            v-model="settings.content.fr.description"
            placeholder="description"
          />
        </div>
      </div>
    </div>
    <div class="border-position">
      <b-form-checkbox switch v-model="settings.bottomDirection" />
    </div>
    <div class="h8 mt-5">Images</div>
    <div class="mobile-images mt-4">
      <div class="img-input" v-for="(img, idx) in settings.images" :key="idx">
        <input type="file" accept="images/*" @change="e => upload(e, idx)" />
        <button class="addMore" type="button" @click="addImage">
          add +
        </button>
        <hr />
      </div>
    </div>
  </div>
</template>
<script>
import { base64Img } from "../../base/helpers";
export default {
  data() {
    return {
      settings: {
        bottomDirection: false,
        content: {
          en: {
            title: "",
            description: ""
          },
          fr: {
            title: "",
            description: ""
          }
        },
        images: [
          {
            file: "",
            filename: ""
          }
        ]
      }
    };
  },
  methods: {
    addImage() {
      this.settings.images.push({});
    },
    async upload(e, idx) {
      const newfile = await base64Img(e.target.files[0]);
      const image = {
        file: newfile.base64,
        filename: newfile.name
      };
      this.settings.images[idx] = image;
    }
  }
};
</script>

<style lang="less" scoped>
textarea,
input {
  font-size: 15px;
}
.text-titles {
  display: flex;
  justify-content: space-between;
}

.english,
.french {
  margin: 0 50px;
  display: block;
  input,textarea {
      width: 400px;
      margin: 10px;
      border-radius: 3px;
      padding: 7px;
      
  }
}

.video-upload,
.img-input {
  width: 70%;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  .addMore {
    font-size: 15px;
    background: lightblue;
    border: none;
    padding: 5px;
    width: 200px;
    margin: 0 20px;
  }
}

</style>
