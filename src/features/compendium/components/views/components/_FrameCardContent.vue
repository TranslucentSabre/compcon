<template>
  <c-card-base :item="item" :small="small" :hover="hover">
    <v-img
      v-if="item.DefaultImage"
      slot="top"
      :src="item.DefaultImage"
      :max-height="small ? '175px' : '225px'"
      contain
      class="py-2"
    />
    <span slot="overline">{{ item.MechTypeString }} Frame</span>
  </c-card-base>
</template>

<script lang="ts">
import Vue from 'vue'
import CCardBase from './_cCardBase.vue'

export default Vue.extend({
  name: 'frame-card-content',
  components: { CCardBase },
  props: {
    item: { type: Object, required: true },
    small: { type: Boolean },
    hover: { type: Boolean },
  },
})
</script>
