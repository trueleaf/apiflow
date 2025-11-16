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
interface ClDialogProps {
  modelValue: boolean
  title?: string
  width?: string | number
  top?: string
  closeOnClickModal?: boolean
  destroyOnClose?: boolean
  beforeClose?: (done: () => void) => void
}
const props = withDefaults(defineProps<ClDialogProps>(), {
  title: '',
  width: '50%',
  top: '10vh',
  closeOnClickModal: true,
  destroyOnClose: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  opened: []
  closed: []
  close: []
}>()
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

<style lang="scss" scoped>
:deep(.cl-dialog) {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  box-shadow: 0 2px 12px var(--shadow-color);
  transition: background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease;
  .el-dialog__header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);
    padding: 16px 20px;
    margin: 0;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  .el-dialog__title {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  .el-dialog__headerbtn {
    top: 16px;
    right: 20px;
    width: 24px;
    height: 24px;
    .el-dialog__close {
      color: var(--text-secondary);
      font-size: 16px;
      transition: all 0.2s ease;
      &:hover {
        color: var(--text-primary);
        background: var(--bg-hover);
        border-radius: 50%;
      }
    }
  }
  .el-dialog__body {
    padding: 20px;
    color: var(--text-primary);
  }
  .el-dialog__footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-light);
    transition: border-color 0.2s ease;
  }
}
</style>
