<template>
  <div>
    <skill-block :pilot="pilot" />
    <dt-resources-block :pilot="pilot" />
    <pilot-loadout-block :pilot="pilot" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import SkillBlock from './components/SkillBlock.vue'
import DtResourcesBlock from './components/DtResourcesBlock.vue'
import PilotLoadoutBlock from './components/PilotLoadoutBlock.vue'

export default Vue.extend({
  name: 'narrative-view',
  components: { SkillBlock, DtResourcesBlock, PilotLoadoutBlock },
  props: {
    pilot: {
      type: Object,
      required: true,
    },
  },
})
</script>
