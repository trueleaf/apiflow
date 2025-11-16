<template>
  <div class="json-config">
    <!-- 数据模式选择 -->
    <div class="form-row">
      <div class="form-item flex-item">
        <label class="form-label">{{ t('数据模式') }}</label>
        <el-radio-group v-model="response.jsonConfig.mode">
          <el-radio label="fixed">{{ t('固定JSON返回') }}</el-radio>
          <el-radio label="randomAi">{{ t('AI生成') }}</el-radio>
          <el-radio label="random">{{ t('随机JSON返回') }}</el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- 随机JSON大小配置（仅随机模式显示） -->
    <div v-if="response.jsonConfig.mode === 'random'" class="form-row">
      <div class="form-item flex-item">
        <label class="form-label">{{ t('随机字段个数') }}</label>
        <el-input-number
          v-model="response.jsonConfig.randomSize"
          :min="1"
          :max="500"
          :step="1"
          size="small"
          controls-position="right"
        />
        <!-- 提示信息 -->
        <div v-if="showRandomSizeHint" class="hint-text">
          <span class="hint-message">{{ t('字段个数，最多500个字段') }}</span>
          <span class="hint-dismiss" @click="handleDismissHint">{{ t('不再提示') }}</span>
        </div>
      </div>
    </div>

    <!-- AI生成模式区域 -->
    <div v-if="response.jsonConfig.mode === 'randomAi'" class="ai-generate-wrapper">
      <!-- 左侧：提示词输入区 -->
      <div class="prompt-section">
        <div class="prompt-header">
          <label class="form-label">{{ t('提示词') }}</label>
        </div>
        <div class="prompt-content">
          <div class="textarea-wrapper">
            <textarea
              v-model="response.jsonConfig.prompt"
              :placeholder="t('请输入JSON数据生成提示词，例如：生成一个用户列表，包含姓名、年龄、邮箱等字段')"
              maxlength="2000"
              class="prompt-textarea"
            />
            <button
              class="send-btn"
              :class="{
                'is-loading': aiGenerating,
                'is-disabled': isSendDisabled
              }"
              type="button"
              @click="!isSendDisabled && handleGeneratePreview()">
              <Loader2 v-if="aiGenerating" class="icon-loading" />
              <Send v-else class="icon-send" />
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：JSON预览区 -->
      <div class="preview-section">
        <div class="preview-header">
          <label class="form-label">{{ t('预览结果') }}</label>
        </div>
        <div class="preview-content">
          <div v-if="aiGenerating" class="loading-wrapper">
            <Loader2 class="loading-spinner" />
            <span class="loading-text">{{ t('AI正在生成中，请稍候...') }}</span>
          </div>
          <div v-else-if="aiPreviewJson" class="json-preview-wrapper">
            <SJsonEditor
              v-model="aiPreviewJson"
              :config="{ fontSize: 13, language: 'json', readOnly: false }"
            >
            </SJsonEditor>
          </div>
          <div v-else class="empty-preview">
            <span class="empty-text">{{ t('请在左侧输入提示词并点击"生成预览"') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 固定JSON编辑器区域 -->
    <SJsonEditor
      v-if="response.jsonConfig.mode === 'fixed'"
      class="json-editor-wrapper"
      v-model="response.jsonConfig.fixedData"
      :config="{ fontSize: 13, language: 'json' }"
    >
    </SJsonEditor>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2, Send } from 'lucide-vue-next'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { userState } from '@/cache/userState/userStateCache'
import type { HttpMockNode } from '@src/types'
import { mainConfig } from '@src/config/mainConfig'
import type { DeepSeekRequestBody, DeepSeekResponse } from '@src/types/ai'
import { message } from '@/helper'

type ResponseItem = HttpMockNode['response'][0]

type Props = {
  response: ResponseItem
}

const props = defineProps<Props>()
const { t } = useI18n()

const showRandomSizeHint = ref(true)
const aiGenerating = ref(false)
const aiPreviewJson = ref('')

const getMessageContent = (response: DeepSeekResponse | null): string => {
  if (!response) {
    return ''
  }
  const content = response.choices?.[0]?.message?.content
  return content || ''
}

const isSendDisabled = computed(() => {
  const promptText = (props.response.jsonConfig.prompt || '').trim()
  return !promptText || aiGenerating.value
})

const handleDismissHint = () => {
  showRandomSizeHint.value = false
  userState.setMockJsonRandomSizeHintVisible(false)
}

const handleGeneratePreview = async () => {
  const promptText = (props.response.jsonConfig.prompt || '').trim()
  if (!promptText) {
    message.warning(t('请先输入提示词'))
    return
  }

  aiGenerating.value = true
  aiPreviewJson.value = ''
  try {
    const maxTokens = mainConfig.aiConfig.maxTokens ?? 2000
    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的数据生成助手。请根据用户的要求生成符合规范的JSON格式数据。你的回答必须是合法的JSON格式，不要包含任何解释性文字或markdown标记。'
        },
        {
          role: 'user',
          content: promptText
        }
      ],
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    }

    const result = await window.electronAPI?.aiManager.jsonChat(requestBody)

    if (result?.code === 0 && result.data) {
      const content = getMessageContent(result.data)
      if (content) {
        try {
          const parsed = JSON.parse(content)
          aiPreviewJson.value = JSON.stringify(parsed, null, 2)
        } catch {
          aiPreviewJson.value = content
        }
      } else {
        const errorMsg = t('AI生成失败，请稍后重试')
        message.error(errorMsg)
        aiPreviewJson.value = `// ${t('生成失败')}` + '\n' + `// ${errorMsg}`
      }
    } else {
      const errorMsg = result?.msg || t('AI生成失败，请稍后重试')
      message.error(errorMsg)
      aiPreviewJson.value = `// ${t('生成失败')}` + '\n' + `// ${errorMsg}`
    }
  } catch (error) {
    const errorMsg = (error as Error).message || t('AI生成失败，请稍后重试')
    message.error(errorMsg)
    aiPreviewJson.value = `// ${t('生成失败')}` + '\n' + `// ${errorMsg}`
  } finally {
    aiGenerating.value = false
  }
}

onMounted(() => {
  showRandomSizeHint.value = userState.getMockJsonRandomSizeHintVisible()
})
</script>

<style scoped>
.json-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-shrink: 0;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-item {
  flex: 0 0 auto;
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.form-label ~ * {
  margin-left: 12px;
}

.hint-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.hint-message {
  color: var(--text-tertiary);
  flex: 1;
}

.hint-dismiss {
  color: var(--primary-color);
  cursor: pointer;
  margin-left: 12px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.hint-dismiss:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.ai-generate-wrapper {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

.prompt-section {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.prompt-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: var(--bg-primary);
  min-height: 0;
}

.textarea-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.prompt-textarea {
  flex: 1;
  width: 100%;
  padding: 12px;
  padding-bottom: 48px;
  border: none;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  resize: none;
  font-family: inherit;
}

.prompt-textarea::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-color);
  color: var(--text-white);
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.send-btn:hover:not(.is-loading):not(.is-disabled) {
  background: color-mix(in srgb, var(--primary-color) 85%, white);
}

.send-btn.is-loading,
.send-btn.is-disabled {
  cursor: not-allowed;
}

.send-btn.is-disabled {
  background: color-mix(in srgb, var(--primary-color) 60%, white);
}

.icon-loading {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

.icon-send {
  width: 16px;
  height: 16px;
}

.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: var(--bg-primary);
  min-height: 0;
}

.json-preview-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.loading-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--primary-color);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 14px;
  color: var(--text-tertiary);
}

.json-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
