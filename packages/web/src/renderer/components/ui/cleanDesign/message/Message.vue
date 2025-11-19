<template>
  <Teleport to="body">
    <Transition name="message-fade">
      <div v-if="visible" class="cl-message-wrapper" :style="{ zIndex }">
        <div class="cl-message-overlay" @click="handleOverlayClick"></div>
        <Transition name="message-scale">
          <div v-if="visible" class="cl-message-container">
            <div v-if="title" class="cl-message-header">
              <span class="cl-message-title">{{ title }}</span>
            </div>
            <div class="cl-message-body">
              <div class="cl-message-content" v-html="message"></div>
            </div>
            <div class="cl-message-footer">
              <div class="cl-message-footer-left">
                <el-checkbox v-if="showCheckbox" v-model="checked" :label="checkboxLabel" />
              </div>
              <div class="cl-message-footer-right">
                <el-button v-if="showCancel" @click="handleCancel">{{ cancelLabel }}</el-button>
                <el-button type="primary" @click="handleConfirm">{{ confirmLabel }}</el-button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MessageProps, MessageEmits } from '@src/types/components/components'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<MessageProps>(), {
  type: 'info',
  showCheckbox: false,
  showCancel: true,
  zIndex: 2000,
})
const emit = defineEmits<MessageEmits>()
const { t } = useI18n()
const checked = ref(false)
const checkboxLabel = computed(() => props.checkboxText || t('message.dontShowAgain'))
const confirmLabel = computed(() => props.confirmButtonText || t('message.confirm'))
const cancelLabel = computed(() => props.cancelButtonText || t('message.cancel'))
const handleConfirm = () => {
  emit('confirm', checked.value)
  emit('update:visible', false)
  emit('close')
  if (props.onConfirm) {
    props.onConfirm(checked.value)
  }
  if (props.onClose) {
    props.onClose()
  }
}
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
  emit('close')
  if (props.onCancel) {
    props.onCancel()
  }
  if (props.onClose) {
    props.onClose()
  }
}
const handleOverlayClick = () => {
  handleCancel()
}
</script>

<style scoped>
@import './style/message.css';
</style>
