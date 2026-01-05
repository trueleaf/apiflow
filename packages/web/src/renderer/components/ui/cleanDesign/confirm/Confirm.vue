<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="visible" class="cl-confirm-wrapper" :style="{ zIndex }">
        <div class="cl-confirm-overlay" @click="handleCancel"></div>
        <Transition name="confirm-scale">
          <div v-if="visible" class="cl-confirm-container">
            <div class="cl-confirm-header">
              <div v-if="type" :class="['cl-confirm-icon', type]">
                <component :is="typeIcon" :size="20" />
              </div>
              <span v-if="title" class="cl-confirm-title">{{ title }}</span>
              <button class="cl-confirm-close" @click="handleCancel">
                <X :size="16" />
              </button>
            </div>
            <div class="cl-confirm-body">
              <div class="cl-confirm-content" v-html="content"></div>
            </div>
            <div class="cl-confirm-footer">
              <div class="cl-confirm-footer-left">
                <el-checkbox v-if="showCheckbox" v-model="checked" :label="checkboxLabel" />
              </div>
              <div class="cl-confirm-footer-right">
                <el-button @click="handleCancel">{{ cancelLabel }}</el-button>
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
import type { ConfirmProps, ConfirmEmits } from '@src/types/components/components'
import { i18n } from '@/i18n'
import { Info, AlertTriangle, XCircle, CheckCircle, X } from 'lucide-vue-next'
import './style/confirm.css'

const props = withDefaults(defineProps<ConfirmProps>(), {
  type: 'info',
  showCheckbox: false,
  zIndex: 2000,
})
const emit = defineEmits<ConfirmEmits>()
const t = i18n.global.t
const checked = ref(false)
const typeIcon = computed(() => {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
  }
  return icons[props.type || 'info']
})
const checkboxLabel = computed(() => props.checkboxText || t('confirmDontShowAgain'))
const confirmLabel = computed(() => props.confirmButtonText || t('confirmConfirm'))
const cancelLabel = computed(() => props.cancelButtonText || t('confirmCancel'))
const handleConfirm = () => {
  emit('confirm', checked.value)
  emit('update:visible', false)
  emit('close')
  if (props.onConfirm) {
    props.onConfirm(checked.value)
  }
}
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
  emit('close')
  if (props.onCancel) {
    props.onCancel()
  }
}
</script>
