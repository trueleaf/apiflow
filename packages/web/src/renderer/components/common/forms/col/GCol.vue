
<template>
  <el-col :xs="24" :sm="24" :md="md" :lg="lg" :xl="xl">
    <slot />
  </el-col>
</template>

<script lang="ts" setup>
import { computed } from 'vue';


const props = defineProps({
  oneLine: {
    type: Boolean,
    default: false,
  },
  halfLine: {
    type: Boolean,
    default: false,
  },
})
const md = computed(() => {
  if (props.oneLine) {
    return 24;
  }
  if (props.halfLine) {
    return 12;
  }
  return 12;
})
const lg = computed(() => {
  if (props.oneLine) {
    return 24;
  }
})
const xl = computed(() => {
  if (props.oneLine) {
    return 24;
  }
})
</script>
