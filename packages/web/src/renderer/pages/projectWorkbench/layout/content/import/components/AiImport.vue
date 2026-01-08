<template>
  <div class="ai-import">
    <!-- AI 不可用提示 -->
    <div v-if="!isAiAvailable" class="ai-unavailable">
      <AlertCircle :size="20" class="warning-icon" />
      <span>{{ t('AI 功能不可用，请先配置 API Key') }}</span>
      <el-button type="primary" link @click="handleGoSettings">{{ t('前往配置') }}</el-button>
    </div>
    <!-- 输入区域 -->
    <div v-else class="ai-input-area">
      <el-input
        v-model="content"
        type="textarea"
        :placeholder="t('请粘贴任意格式的 API 文档数据，AI 将自动识别并提取接口信息')"
        :rows="10"
        resize="none"
        :disabled="loading"
      />
      <div class="ai-actions">
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!content.trim()"
          @click="handleAnalyze"
        >
          <Sparkles v-if="!loading" :size="16" class="mr-1" />
          {{ loading ? t('识别中...') : t('开始识别') }}
        </el-button>
        <el-button :disabled="loading" @click="handleClear">{{ t('清空') }}</el-button>
      </div>
      <!-- 进度提示 -->
      <div v-if="loading" class="ai-progress">
        <el-progress :percentage="50" :indeterminate="true" :show-text="false" />
        <span class="progress-text">{{ t('AI 正在分析数据，请稍候...') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles, AlertCircle } from 'lucide-vue-next'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { AiImportTranslator } from '../aiImport'
import { router } from '@/router/index'
import { ElMessage } from 'element-plus'

import type { HttpNode, FolderNode } from '@src/types'

const emit = defineEmits<{
  (e: 'success', data: { docs: (HttpNode | FolderNode)[]; type: 'ai' }): void
  (e: 'error', message: string): void
}>()
const props = defineProps<{
  projectId: string
}>()
const { t } = useI18n()
const llmStore = useLLMClientStore()
const content = ref('')
const loading = ref(false)
// 检查 AI 是否可用
const isAiAvailable = computed(() => llmStore.isAvailable())
// 跳转设置页
const handleGoSettings = () => {
  router.push({ name: 'Settings', query: { action: 'ai-settings' } })
}
// 开始 AI 分析
const handleAnalyze = async () => {
  if (!content.value.trim()) {
    ElMessage.warning(t('请输入内容'))
    return
  }
  loading.value = true
  try {
    const translator = new AiImportTranslator(props.projectId)
    const docs = await translator.analyze(content.value)
    emit('success', { docs, type: 'ai' })
    ElMessage.success(t('识别成功'))
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : t('AI 识别失败')
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  } finally {
    loading.value = false
  }
}
// 清空内容
const handleClear = () => {
  content.value = ''
}
</script>

<style lang="scss" scoped>
.ai-import {
  .ai-unavailable {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: var(--el-color-warning-light-9);
    border-radius: var(--border-radius);
    color: var(--el-color-warning);

    .warning-icon {
      flex-shrink: 0;
    }
  }

  .ai-input-area {
    :deep(.el-textarea__inner) {
      font-family: var(--font-family-code);
      font-size: 13px;
    }

    .ai-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }

    .ai-progress {
      margin-top: 12px;

      .progress-text {
        display: block;
        margin-top: 8px;
        font-size: 13px;
        color: var(--gray-500);
      }
    }
  }
}
</style>
