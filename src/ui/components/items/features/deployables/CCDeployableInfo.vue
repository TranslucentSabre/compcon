<template>
  <component
    :is="hover ? 'deployableInfoHover' : panel ? 'deployableInfoPanel' : 'deployableInfoPopup'"
    :deployable="deployable"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import deployableInfoHover from './_deployableInfoHover.vue'
import deployableInfoPanel from './_deployableInfoPanel.vue'
import deployableInfoPopup from './_deployableInfoPopup.vue'

export default Vue.extend({
  name: 'cc-deployable-info',
  components: { deployableInfoHover, deployableInfoPanel, deployableInfoPopup },
  props: {
    deployable: {
      type: Object,
      required: true,
    },
    popup: {
      type: Boolean,
      default: true,
    },
    panel: {
      type: Boolean,
    },
    hover: {
      type: Boolean,
    },
  },
})
</script>
