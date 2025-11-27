<template>
  <div class="text-config">
    <!-- 数据模式和文本类型选择 -->
    <div class="form-row">
      <div class="form-item flex-item">
        <label class="form-label">{{ t('数据模式') }}</label>
        <el-radio-group v-model="response.textConfig.mode">
          <el-radio label="fixed">{{ t('固定Text返回') }}</el-radio>
          <el-radio label="randomAi">{{ t('AI生成') }}</el-radio>
          <el-radio label="random">{{ t('随机Text返回') }}</el-radio>
        </el-radio-group>
      </div>

      <div class="form-item flex-item">
        <label class="form-label mb-1">{{ t('文本类型') }}</label>
        <el-select v-model="response.textConfig.textType" size="small" class="w-100px">
          <el-option label="Text/Plain" value="text/plain" />
          <el-option label="HTML" value="html" />
          <el-option label="XML" value="xml" />
          <el-option label="YAML" value="yaml" />
          <el-option label="CSV" value="csv" />
          <el-option label="Any" value="any" />
        </el-select>
      </div>
    </div>

    <!-- 随机Text大小配置（仅随机模式显示） -->
    <div v-if="response.textConfig.mode === 'random'" class="form-row mt-2">
      <div class="form-item flex-item">
        <label class="form-label">{{ t('随机字符个数') }}</label>
        <el-input-number 
          v-model="response.textConfig.randomSize" 
          :min="1" 
          :max="10000" 
          :step="1"
          size="small"
          controls-position="right"
        />
        <!-- 提示信息 -->
        <div v-if="showRandomTextSizeHint" class="hint-text">
          <span class="hint-message">{{ t('字符个数，最多10000个字符') }}</span>
          <span class="hint-dismiss" @click="handleDismissHint">{{ t('不再提示') }}</span>
        </div>
      </div>
    </div>

    <!-- Text AI生成模式区域 -->
    <div 
      v-if="response.textConfig.mode === 'randomAi'" 
      class="ai-generate-wrapper">
      <!-- 左侧：提示词输入区 -->
      <div class="prompt-section">
        <div class="prompt-header">
          <label class="form-label">{{ t('提示词') }}</label>
        </div>
        <div class="prompt-content">
          <div class="textarea-wrapper">
            <textarea
              v-model="response.textConfig.prompt"
              :placeholder="t('请输入文本生成提示词，例如：生成一篇关于人工智能的简短介绍')"
              maxlength="2000"
              class="prompt-textarea"
            />
            <div 
              class="send-btn"
              :class="{ 
                'is-loading': aiGeneratingText,
                'is-disabled': isSendDisabled
              }"
              @click="!isSendDisabled && handleGenerateTextPreview()">
              <el-icon v-if="aiGeneratingText" class="is-loading">
                <Loading />
              </el-icon>
              <el-icon v-else>
                <Top />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：文本预览区 -->
      <div class="preview-section">
        <div class="preview-header">
          <label class="form-label">{{ t('预览结果') }}</label>
        </div>
        <div class="preview-content">
          <div v-if="aiGeneratingText" class="loading-wrapper">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span class="loading-text">{{ t('AI正在生成中，请稍候...') }}</span>
          </div>
          <div v-else-if="aiPreviewText" class="text-preview-wrapper">
            <SJsonEditor 
              v-model="aiPreviewText"
              :config="{ fontSize: 13, language: getEditorLanguage(response.textConfig.textType), readOnly: true }">
            </SJsonEditor>
          </div>
          <div v-else class="empty-preview">
            <span class="empty-text">{{ t('请在左侧输入提示词并点击"生成预览"') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 固定Text编辑器区域 -->
    <div 
      v-if="response.textConfig.mode === 'fixed'" 
      class="text-editor-wrapper">
      <SJsonEditor 
        v-model="response.textConfig.fixedData"
        :config="{ fontSize: 13, language: getEditorLanguage(response.textConfig.textType) }">
      </SJsonEditor>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading, Top } from '@element-plus/icons-vue'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { appState } from '@/cache/appState/appStateCache'
import type { HttpMockNode } from '@src/types'
import type { OpenAiRequestBody, OpenAiResponseBody } from '@src/types/ai/agent.type'
import { message } from '@/helper'
type ResponseItem = HttpMockNode['response'][0]

type Props = {
  response: ResponseItem
}

const props = defineProps<Props>()
const { t } = useI18n()

// Text 相关状态
const showRandomTextSizeHint = ref(true)
const aiGeneratingText = ref(false)
const aiPreviewText = ref('')

const getMessageContent = (response: OpenAiResponseBody | null): string => {
  if (!response) {
    return ''
  }
  const content = response.choices?.[0]?.message?.content
  return content || ''
}

// 将textType映射为编辑器支持的语言类型
const getEditorLanguage = (textType: string): string => {
  const languageMap: Record<string, string> = {
    'text/plain': 'plaintext',
    'html': 'html',
    'xml': 'xml',
    'yaml': 'yaml',
    'csv': 'plaintext',
    'any': 'plaintext'
  }
  return languageMap[textType] || 'plaintext'
}

// 计算发送按钮是否禁用
const isSendDisabled = computed(() => {
  const promptText = (props.response.textConfig.prompt || '').trim()
  return !promptText || aiGeneratingText.value
})

// 处理"不再提示"点击
const handleDismissHint = () => {
  showRandomTextSizeHint.value = false
  appState.setMockTextRandomSizeHintVisible(false)
}

// 处理 Text AI生成预览
const handleGenerateTextPreview = async () => {
  const promptText = (props.response.textConfig.prompt || '').trim()
  if (!promptText) {
    message.warning(t('请先输入提示词'))
    return
  }

  aiGeneratingText.value = true
  aiPreviewText.value = ''
  try {
    const requestBody: OpenAiRequestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的文案助手。请根据用户指令输出文本内容。'
        },
        {
          role: 'user',
          content: promptText
        }
      ],
      max_tokens: 300
    }

    const result = await window.electronAPI?.aiManager.textChat(requestBody)
    const content = getMessageContent(result || null)
    if (content) {
      aiPreviewText.value = content
    } else {
      const errorMsg = t('AI生成失败，请稍后重试')
      message.error(errorMsg)
      aiPreviewText.value = `[${t('生成失败')}] ${errorMsg}`
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    message.error(errorMsg)
    aiPreviewText.value = `[${t('生成失败')}] ${errorMsg}`
  } finally {
    aiGeneratingText.value = false
  }
}

onMounted(() => {
  showRandomTextSizeHint.value = appState.getMockTextRandomSizeHintVisible()
})
</script>

<style scoped>
.text-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.w-100px {
  width: 100px;
}

.mt-2 {
  margin-top: 8px;
}

/* 表单行 */
.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-shrink: 0;
}

/* 表单项 */
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

/* 提示信息样式 */
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
  transition: all 0.2s;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}

/* AI生成模式布局 */
.ai-generate-wrapper {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

/* 左侧提示词输入区 */
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

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus {
    outline: none;
  }
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
  transition: all 0.3s;
  z-index: 1;

  &:hover:not(.is-loading):not(.is-disabled) {
    background: color-mix(in srgb, var(--primary-color) 85%, white);
  }

  &.is-loading {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.is-disabled {
    background: color-mix(in srgb, var(--primary-color) 60%, white);
    cursor: not-allowed;
  }

  .el-icon {
    font-size: 16px;
  }
}

/* 右侧预览区 */
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

.text-preview-wrapper {
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

  .el-icon {
    font-size: 32px;
  }

  .loading-text {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.empty-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .empty-text {
    font-size: 14px;
    color: var(--text-tertiary);
  }
}

/* Text 编辑器容器 */
.text-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}
</style>
