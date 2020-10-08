<template>
  <div>
    <h4>Adding section...</h4>
  </div>
</template>

<script>
// import { renderSection } from '../graphql'
export default {
  props: {
    props: {
      type: Object,
      default: {}
    },
    savedView: {
      type: Object,
      default: {}
    },
    headers: {
      type: Object,
      default: {}
    }
  },
  computed: {
    id() {
      if (this.savedView.id) {
        return this.savedView.id;
      }
      return "id-" + Date.now();
    },
    weight() {
      if (this.savedView.weight) {
        return this.savedView.weight;
      }
      return null;
    }
  },
  mounted() {
    // this.renderSection(this.props.name)
  },
  methods: {
    // renderSection(name) {
    //   this.$apollo
    //     .mutate({
    //       mutation: renderSection,
    //       variables: {
    //         settings: {
    //           name,
    //           weight: 1
    //         }
    //       },
    //       context: {
    //         headers: this.headers
    //       }
    //     })
    //     .then(res => {
    //       this.$emit('addSectionType', {
    //         name: this.props.name,
    //         type: 'dynamic',
    //         id: this.id,
    //         weight: this.weight,
    //         renderData: res.data.renderSection.renderData
    //       })
    //     })
    //     .catch(err => {
    //       console.log(err)
    //     })
    // }
  }
};
</script>
