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
    <div 
      v-if="response.jsonConfig.mode === 'randomAi'" 
      class="ai-generate-wrapper">
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
            <div 
              class="send-btn"
              :class="{ 
                'is-loading': aiGenerating,
                'is-disabled': isSendDisabled
              }"
              @click="!isSendDisabled && handleGeneratePreview()">
              <el-icon v-if="aiGenerating" class="is-loading">
                <Loading />
              </el-icon>
              <el-icon v-else>
                <Top />
              </el-icon>
            </div>
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
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span class="loading-text">{{ t('AI正在生成中，请稍候...') }}</span>
          </div>
          <div v-else-if="aiPreviewJson" class="json-preview-wrapper">
            <SJsonEditor 
              v-model="aiPreviewJson"
              :config="{ fontSize: 13, language: 'json', readOnly: false }">
            </SJsonEditor>
          </div>
          <div v-else class="empty-preview">
            <span class="empty-text">{{ t('请在左侧输入提示词并点击"生成预览"') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 固定JSON编辑器区域 -->
    <div 
      v-if="response.jsonConfig.mode === 'fixed'" 
      class="json-editor-wrapper">
      <SJsonEditor 
        v-model="response.jsonConfig.fixedData"
        :config="{ fontSize: 13, language: 'json' }">
      </SJsonEditor>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Loading, Top } from '@element-plus/icons-vue'
import SJsonEditor from '@/components/common/jsonEditor/GJsonEditor.vue'
import { 
  getMockJsonRandomSizeHintVisible, 
  setMockJsonRandomSizeHintVisible
} from '@/cache/common/commonCache'
import type { MockHttpNode } from '@src/types'

type ResponseItem = MockHttpNode['response'][0]

type Props = {
  response: ResponseItem
}

const props = defineProps<Props>()
const { t } = useI18n()

// JSON 相关状态
const showRandomSizeHint = ref(true)
const aiGenerating = ref(false)
const aiPreviewJson = ref('')

// 计算发送按钮是否禁用
const isSendDisabled = computed(() => {
  const promptText = (props.response.jsonConfig.prompt || '').trim()
  return !promptText || aiGenerating.value
})

// 处理"不再提示"点击
const handleDismissHint = () => {
  showRandomSizeHint.value = false
  setMockJsonRandomSizeHintVisible(false)
}

// 处理 AI生成预览
const handleGeneratePreview = async () => {
  const promptText = (props.response.jsonConfig.prompt || '').trim()
  if (!promptText) {
    ElMessage.warning(t('请先输入提示词'))
    return
  }

  aiGenerating.value = true
  aiPreviewJson.value = ''
  try {
    const result = await window.electronAPI?.aiManager.generateJson({
      prompt: promptText
    })

    if (result?.data) {
      aiPreviewJson.value = typeof result.data === 'string'
        ? result.data
        : JSON.stringify(result.data)
    } else {
      aiPreviewJson.value = ''
    }

    if (result && result.code === 0 && result.data) {
      return
    }

    if (result?.msg) {
      ElMessage.error(result.msg)
    } else {
      ElMessage.error(t('AI生成失败，请稍后重试'))
    }
  } catch (error) {
    ElMessage.error(t('AI生成失败，请稍后重试'))
  } finally {
    aiGenerating.value = false
  }
}

onMounted(() => {
  showRandomSizeHint.value = getMockJsonRandomSizeHintVisible()
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
  color: var(--gray-700);
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
  color: var(--gray-500);
  flex: 1;
}

.hint-dismiss {
  color: var(--primary);
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
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: white;
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
  color: var(--gray-800);
  background: transparent;
  outline: none;
  resize: none;
  font-family: inherit;
  
  &::placeholder {
    color: var(--gray-400);
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
  background: var(--primary);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1;
  
  &:hover:not(.is-loading):not(.is-disabled) {
    background: var(--el-color-primary-light-3);
  }
  
  &.is-loading {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &.is-disabled {
    background: var(--el-color-primary-light-5);
    cursor: not-allowed;
  }
  
  .el-icon {
    font-size: 16px;
  }
}

/* 右侧JSON预览区 */
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
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: white;
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
  color: var(--primary);

  .el-icon {
    font-size: 32px;
  }

  .loading-text {
    font-size: 14px;
    color: var(--gray-600);
  }
}

.empty-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .empty-text {
    font-size: 14px;
    color: var(--gray-400);
  }
}

/* JSON编辑器容器 */
.json-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}
</style>
