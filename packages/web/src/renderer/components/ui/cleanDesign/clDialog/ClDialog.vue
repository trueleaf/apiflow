<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :top="top"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    :before-close="handleBeforeClose"
    class="cl-dialog"
    @update:model-value="handleUpdateModelValue"
    @opened="handleOpened"
    @closed="handleClosed"
    @close="handleClose"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { ClDialogProps, ClDialogEmits } from '@src/types/components/components';

const props = withDefaults(defineProps<ClDialogProps>(), {
  title: '',
  width: '50%',
  top: '10vh',
  closeOnClickModal: true,
  destroyOnClose: false,
})
const emit = defineEmits<ClDialogEmits>()
const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
}
const handleBeforeClose = (done: () => void) => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else {
    done()
  }
}
const handleOpened = () => {
  emit('opened')
}
const handleClosed = () => {
  emit('closed')
}
const handleClose = () => {
  emit('close')
}
</script>
