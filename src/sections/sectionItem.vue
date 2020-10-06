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
      default: ""
    }
  },
  computed: {
    getIcon() {
      return () =>
        import(
          `../configs/type-icons/${this.title.replace(/ /g, "_")}`
        );
    }
  }
};
</script>

<style lang="less" scoped>
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
