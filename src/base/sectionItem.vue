<template>
  <div class="item text-center">
    <div class="card-content">
      <div class="icon">
        <component :is="getIcon" />
      </div>
      <div class="p3 text-capitalize px-3">
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  computed: {
    getIcon() {
      // This is not working
      const path = "/type-icons/" + this.title.replace(/ /g, "_") + ".vue";
      if (this.type == "internal") {
        return () => import(`../src/configs${path}`);
      } else {
        if (process.env.VUE_APP_SECTIONS_CONF) {
          return () => import(`${process.env.VUE_APP_SECTIONS_CONF}${path}`);
        } else {
          return () => import(`@/sections_config${path}`);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.item {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgb(8, 172, 236);
  cursor: pointer;
}
.icon {
  svg {
    color: white;
    fill: white;
    min-width: 60px;
    height: 60px;
  }
}
.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  line-height: 1.3;
}
</style>
