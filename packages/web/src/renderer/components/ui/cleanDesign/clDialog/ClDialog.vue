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
  --cl-dialog-bg: #ffffff;
  --cl-dialog-header-bg: #f9f9f9;
  --cl-dialog-border: #e5e5e5;
  --cl-dialog-title-color: #333333;
  --cl-dialog-close-color: #909399;
  --cl-dialog-close-hover-color: #606266;
  --cl-dialog-close-hover-bg: rgba(0, 0, 0, 0.1);
  --cl-dialog-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  --cl-dialog-overlay-bg: rgba(0, 0, 0, 0.5);
  background: var(--cl-dialog-bg);
  border: 1px solid var(--cl-dialog-border);
  box-shadow: var(--cl-dialog-shadow);
  transition: background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease;
  .el-dialog__header {
    background: var(--cl-dialog-header-bg);
    border-bottom: 1px solid var(--cl-dialog-border);
    padding: 16px 20px;
    margin: 0;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  .el-dialog__title {
    color: var(--cl-dialog-title-color);
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
      color: var(--cl-dialog-close-color);
      font-size: 16px;
      transition: all 0.2s ease;
      &:hover {
        color: var(--cl-dialog-close-hover-color);
        background: var(--cl-dialog-close-hover-bg);
        border-radius: 50%;
      }
    }
  }
  .el-dialog__body {
    padding: 20px;
    color: var(--cl-dialog-title-color);
  }
  .el-dialog__footer {
    padding: 12px 20px;
    border-top: 1px solid var(--cl-dialog-border);
    transition: border-color 0.2s ease;
  }
}
:global([data-theme="dark"]) :deep(.cl-dialog) {
  --cl-dialog-bg: #2a2a2a;
  --cl-dialog-header-bg: #1e1e1e;
  --cl-dialog-border: #404040;
  --cl-dialog-title-color: #e0e0e0;
  --cl-dialog-close-color: #b0b0b0;
  --cl-dialog-close-hover-color: #e0e0e0;
  --cl-dialog-close-hover-bg: rgba(255, 255, 255, 0.1);
  --cl-dialog-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  --cl-dialog-overlay-bg: rgba(0, 0, 0, 0.7);
}
</style>
