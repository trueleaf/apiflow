
<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    v-bind="$attrs"
    :before-close="closeModel"
    :close-on-press-escape="easyClose"
    :close-on-click-modal="easyClose"
  >
    <slot />
    <template #footer>
      <span>
        <slot name="footer" />
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  easyClose: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue', 'close']);
const closeModel = () => {
  emits('update:modelValue', false);
  emits('close', false);
}
</script>
