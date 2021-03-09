<template>
  <div>
    <h4>Adding section...</h4>
  </div>
</template>

<script>
import axios from "axios";
import { sectionHeader, serverUrl } from "../helpers";

export default {
  props: {
    props: {
      type: Object,
      default: {},
    },
    savedView: {
      type: Object,
      default: {},
    },
    headers: {
      type: Object,
      default: {},
    },
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
    },
  },
  mounted() {
    this.renderSection(this.props.name)
  },
  methods: {
    renderSection(name) {
      
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const variables = {
        section: {
              name,
              weight: 1
            }
      };
      const URL =
        serverUrl() +
        `/project/${this.$sections.projectId}/section/render`;
      axios
        .post(URL, variables, config)
        .then((res) => {
          if (res.data && res.data.error) {
            this.$emit('errorAddingSection', {
              closeModal: true,
              title: "Error adding "+ this.props.name,
              message: res.data.error
            })
            this.loading = false;
            return;
          }
          this.$emit('addSectionType', {
            name: this.props.name,
            type: 'dynamic',
            id: this.id,
            weight: this.weight,
            renderData: res.data.renderSection.renderData
          })
          this.loading = false;
        })
        .catch(() => {
          this.$emit('errorAddingSection', {
              closeModal: true,
              title: "Error adding "+ this.props.name,
              message: "We couldn't save your changes, try again later"
            })

          this.loading = false;
        });
    }
  },
};
</script>
