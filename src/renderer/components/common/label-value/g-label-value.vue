<template>
  <div class="label-value" :style="{ width: realWidth }">
    <span class="label" :style="{ width: labelWidth }">
      <span>{{ label }}</span>
    </span>
    <span v-if="!slots.default" :title="value" class="value">{{ value }}</span>
    <slot v-else class="value" />
  </div>
</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue';


const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  labelWidth: {
    type: String,
    default: '80px',
  },
  value: {
    type: String,
    default: '',
  },
  halfLine: {
    type: Boolean,
    default: false,
  },
  oneLine: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '',
  },
})
const realWidth = computed(() => {
  if (props.halfLine) {
    return '50%';
  }
  if (props.oneLine) {
    return '100%';
  }
  if (props.width) {
    return props.width
  }
  return '';
})
const slots = useSlots()

</script>

<style  scoped>
.label-value {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  max-width: 100%;
  margin-bottom: size(10);

  .label {
    color: $gray-800;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .value {
    color: $gray-600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
}
</style>
