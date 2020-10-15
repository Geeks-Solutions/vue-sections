<template>
  <div
    class="text-images-wrapper"
    v-if="section.settings"
    :class="{ oneImage: section.settings.images.length === 1 }"
  >
    <div class="content">
      <div class="typography">
        <div class="title-underlined h3">
          {{ section.settings.content.en.title }}
        </div>
        <div class="description p2">
          {{ section.settings.content.en.description }}
        </div>
      </div>
      <div
        class="images-layout"
        :class="{ 'bot-direction': section.settings.bottomDirection }"
      >
        <div
          class="img"
          :class="`img-${i}`"
          v-for="(img, i) in section.settings.images"
          :key="i"
        >
          <img
            :src="'data:image/png;base64, ' + img.file"
            :class="{
              'bot-direction': section.settings.bottomDirection
            }"
          />
        </div>
        <div
          class="grey-square"
          :class="{ 'bot-direction': section.settings.bottomDirection }"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    section: {
      type: Object,
      default: {}
    }
  }
};
</script>

<style lang="less" scoped>
.media-mobile(@rules) {
  @media only screen and (max-width: 1025px) {
    @rules();
  }
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 50px;
  max-width: 1560px;
  margin: 0 auto;
  .media-mobile({display: block;padding: 4vmin});
  .typography {
    width: 35%;
    .media-mobile({width: 100%;});
  }
}

.images-layout {
  position: relative;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, 240px);
  grid-template-rows: repeat(2, 171px);
  .media-mobile(
    {grid-template-columns: repeat(2, 1fr) ; grid-template-rows: repeat(
        2,
        120px
      ) ;margin: 3vmin 0;}
  );
  &.bot-direction {
    .media-mobile({display: block;width: 100%;});
  }
  .grey-square {
    width: 200px;
    height: 200px;
    background: lightgrey;
    position: absolute;
    top: -25px;
    left: -25px;
    z-index: -1;
    border-top-left-radius: 20px;

    &.bot-direction {
      border-top-left-radius: 0;
      border-bottom-left-radius: 20px;
      top: auto;
      bottom: -25px;
    }
  }
}
.img.img-0 {
  img {
    &.bot-direction {
      .media-mobile({border-top-left-radius: 40px;});
    }
  }
}
.img-1 {
  grid-row: 1 / span 2;
  grid-column: 1 / span 2;
  img {
    border-bottom-left-radius: 40px;
    .media-mobile({border-bottom-left-radius: 0;});
    &.bot-direction {
      border-bottom-left-radius: 0;
      border-top-left-radius: 40px;
    }
  }
}
.img-2 {
  img {
    .media-mobile({border-bottom-right-radius: 20px;});
  }
}
.img {
  img {
    width: 100%;
    height: 100%;
    &.bot-direction {
      .media-mobile({border-radius: 0;height: 250px;margin: 2px 0});
    }
  }
}

.description {
  margin-top: 20px;
}

.oneImage {
  .content {
    padding: 30px 0;
    flex-direction: row-reverse;
    justify-content: space-between;
    max-width: 88%;
  }
  .grey-square {
    height: 100%;
    left: -80px;
    width: 50px;
    top: 0;
    border-radius: 0;
    .media-mobile({height: 100%; left: -5vmin; width: 20px;});
    &::before {
      content: "";
      background: lightgrey;
      width: 100px;
      height: 41px;
      top: -26px;
      left: 0;
      z-index: 0;
      position: absolute;
      .media-mobile({height: 20px;top: -19px});
    }
    &::after {
      content: "";
      background: lightgrey;
      width: 100px;
      height: 41px;
      top: auto;
      bottom: -20px;
      left: 0;
      z-index: 0;
      position: absolute;
      .media-mobile({height: 20px;});
    }
  }
  .images-layout {
    display: block;
    img {
      max-height: 350px;
      .media-mobile(
        {width: 89%; height: 100%; margin: 10vmin auto; display: flex;}
      );
    }
  }
}
</style>
