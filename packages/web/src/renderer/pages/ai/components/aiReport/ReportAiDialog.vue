<template>
  <el-dialog
    v-model="visible"
    :title="t('举报 AI 内容')"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="report-dialog-content">
      <p class="report-description">
        {{ t('如果您发现 AI 生成的内容不恰当或令人不适，请通过以下方式向我们举报：') }}
      </p>
      <div class="report-email-section">
        <div class="report-email-label">{{ t('联系邮箱') }}:</div>
        <div class="report-email-wrapper">
          <span class="report-email">2581105856@qq.com</span>
          <button
            class="report-copy-btn"
            type="button"
            @click="handleCopyEmail"
            :title="t('复制邮箱')"
          >
            <Copy :size="16" />
          </button>
        </div>
      </div>
      <div class="report-tips">
        <p class="report-tip-item">
          <CheckCircle2 :size="14" />
          <span>{{ t('请在邮件中描述具体的不当内容') }}</span>
        </p>
        <p class="report-tip-item">
          <CheckCircle2 :size="14" />
          <span>{{ t('我们会认真审核每一条举报') }}</span>
        </p>
        <p class="report-tip-item">
          <CheckCircle2 :size="14" />
          <span>{{ t('您的反馈将帮助我们改进AI服务') }}</span>
        </p>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">{{ t('关闭') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Copy, CheckCircle2 } from 'lucide-vue-next'
import { message } from '@/helper'

const { t } = useI18n()
const props = defineProps<{
  modelValue: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
const visible = ref(props.modelValue)
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})
const handleClose = () => {
  visible.value = false
}
const handleCopyEmail = async () => {
  try {
    await navigator.clipboard.writeText('2581105856@qq.com')
    message.success(t('已复制到剪贴板'))
  } catch (error) {
    message.error(t('复制失败，请手动复制'))
  }
}
</script>

<style lang="scss" scoped>
.report-dialog-content {
  padding: 4px 0;
}
.report-description {
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}
.report-email-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
.report-email-label {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
.report-email-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.report-email {
  flex: 1;
  font-size: 15px;
  color: var(--primary);
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
.report-copy-btn {
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.report-copy-btn:hover {
  background: var(--bg-hover);
  color: var(--primary);
  border-color: var(--primary);
}
.report-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.report-tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}
.report-tip-item svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--success);
}
</style>
