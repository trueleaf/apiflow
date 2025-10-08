<template>
  <div class="response-content">
    <!-- 标题栏：响应配置 + 新增按钮 -->
    <div class="header-section">
      <div class="main-title">{{ t('响应配置') }}</div>
      <el-tooltip effect="light" :content="t('新增一个条件返回')" placement="top" :show-after="1000">
        <div class="add-response-btn">
          <el-icon @click="handleAddResponse">
            <Plus />
          </el-icon>
        </div>
      </el-tooltip>
    </div>

    <!-- 响应列表区域 -->
    <div class="response-list">
      <!-- 单个响应配置卡片 -->
      <div v-for="(response, index) in mockResponses" :key="index" class="response-card">
        <!-- 数据类型选择行 -->
        <div class="form-row">
          <!-- 返回数据结构 -->
          <div class="form-item flex-item">
            <label class="form-label">{{ t('返回数据结构') }}</label>
            <el-radio-group v-model="response.dataType" size="small">
              <el-radio-button label="json">JSON</el-radio-button>
              <el-radio-button label="text">Text</el-radio-button>
              <el-radio-button label="image">Image</el-radio-button>
              <el-radio-button label="file">File</el-radio-button>
              <el-radio-button label="binary">Binary</el-radio-button>
              <el-radio-button label="sse">SSE</el-radio-button>
            </el-radio-group>
          </div>
          
          <!-- 数据模式（仅 JSON 类型显示） -->
          <div v-if="response.dataType === 'json'" class="form-item flex-item">
            <label class="form-label">{{ t('数据模式') }}</label>
            <el-radio-group v-model="response.jsonConfig.mode">
              <el-radio label="fixed">{{ t('固定JSON返回') }}</el-radio>
              <el-radio label="randomAi">{{ t('AI生成') }}</el-radio>
              <el-radio label="random">{{ t('随机JSON返回') }}</el-radio>
            </el-radio-group>
          </div>

          <!-- 数据模式（仅 Text 类型显示） -->
          <div v-if="response.dataType === 'text'" class="form-item flex-item">
            <label class="form-label">{{ t('数据模式') }}</label>
            <el-radio-group v-model="response.textConfig.mode">
              <el-radio label="fixed">{{ t('固定Text返回') }}</el-radio>
              <el-radio label="randomAi">{{ t('AI生成') }}</el-radio>
              <el-radio label="random">{{ t('随机Text返回') }}</el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 随机JSON大小配置（仅随机模式显示） -->
        <div v-if="response.dataType === 'json' && response.jsonConfig.mode === 'random'" class="form-row">
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
              <span class="hint-dismiss" @click="handleDismissJsonHint">{{ t('不再提示') }}</span>
            </div>
          </div>
        </div>

        <!-- 随机Text大小配置（仅随机模式显示） -->
        <div v-if="response.dataType === 'text' && response.textConfig.mode === 'random'" class="form-row">
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
              <span class="hint-dismiss" @click="handleDismissTextHint">{{ t('不再提示') }}</span>
            </div>
          </div>
        </div>

        <!-- AI生成模式区域 -->
        <div 
          v-if="response.dataType === 'json' && response.jsonConfig.mode === 'randomAi'" 
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
                    'is-disabled': isSendDisabled(response)
                  }"
                  @click="!isSendDisabled(response) && handleGeneratePreview(response)">
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
          v-if="response.dataType === 'json' && response.jsonConfig.mode === 'fixed'" 
          class="json-editor-wrapper">
          <SJsonEditor 
            v-model="response.jsonConfig.fixedData"
            :config="{ fontSize: 13, language: 'json' }">
          </SJsonEditor>
        </div>

        <!-- Text AI生成模式区域 -->
        <div 
          v-if="response.dataType === 'text' && response.textConfig.mode === 'randomAi'" 
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
                    'is-disabled': isSendTextDisabled(response)
                  }"
                  @click="!isSendTextDisabled(response) && handleGenerateTextPreview(response)">
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
                <textarea
                  v-model="aiPreviewText"
                  class="text-preview-textarea"
                  readonly
                />
              </div>
              <div v-else class="empty-preview">
                <span class="empty-text">{{ t('请在左侧输入提示词并点击"生成预览"') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 固定Text编辑器区域 -->
        <div 
          v-if="response.dataType === 'text' && response.textConfig.mode === 'fixed'" 
          class="text-editor-wrapper">
          <textarea
            v-model="response.textConfig.fixedData"
            :placeholder="t('请输入固定返回的文本内容')"
            class="text-editor-textarea"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus, Loading, Top } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { 
  getMockJsonRandomSizeHintVisible, 
  setMockJsonRandomSizeHintVisible,
  getMockTextRandomSizeHintVisible,
  setMockTextRandomSizeHintVisible 
} from '@/cache/common/common'
import { MockHttpNode } from '@src/types'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)
const mockResponses = computed(() => httpMock.value.response)

// JSON 相关状态
const showRandomSizeHint = ref(true)
const aiGenerating = ref(false)
const aiPreviewJson = ref('')

// Text 相关状态
const showRandomTextSizeHint = ref(true)
const aiGeneratingText = ref(false)
const aiPreviewText = ref('')

// 计算 JSON 发送按钮是否禁用
const isSendDisabled = (response: MockHttpNode['response'][0]) => {
  const promptText = (response.jsonConfig.prompt || '').trim()
  return !promptText || aiGenerating.value
}

// 计算 Text 发送按钮是否禁用
const isSendTextDisabled = (response: MockHttpNode['response'][0]) => {
  const promptText = (response.textConfig.prompt || '').trim()
  return !promptText || aiGeneratingText.value
}

// 处理 JSON "不再提示"点击
const handleDismissJsonHint = () => {
  showRandomSizeHint.value = false
  setMockJsonRandomSizeHintVisible(false)
}

// 处理 Text "不再提示"点击
const handleDismissTextHint = () => {
  showRandomTextSizeHint.value = false
  setMockTextRandomSizeHintVisible(false)
}

// 处理 JSON AI生成预览
const handleGeneratePreview = async (response: MockHttpNode['response'][0]) => {
  const promptText = (response.jsonConfig.prompt || '').trim()
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

// 处理 Text AI生成预览
const handleGenerateTextPreview = async (response: MockHttpNode['response'][0]) => {
  const promptText = (response.textConfig.prompt || '').trim()
  if (!promptText) {
    ElMessage.warning(t('请先输入提示词'))
    return
  }

  aiGeneratingText.value = true
  aiPreviewText.value = ''
  try {
    const result = await window.electronAPI?.aiManager.generateText({
      prompt: promptText,
      maxLength: response.textConfig.randomSize || 100
    })

    if (result?.data) {
      aiPreviewText.value = result.data
    } else {
      aiPreviewText.value = ''
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
    aiGeneratingText.value = false
  }
}

// 新增返回值
const handleAddResponse = () => {
  httpMock.value.response.push({
    isDefault: false,
    conditions: {
      name: '',
      scriptCode: '',
    },
    statusCode: 200,
    headers: {},
    dataType: 'json',
    sseConfig: {
      event: {
        id: {
          enable: false,
          valueMode: 'increment',
        },
        event: {
          enable: false,
          value: '',
        },
        data: {
          mode: 'json',
          value: '',
        },
        retry: {
          enable: false,
          value: 3000,
        },
      },
      interval: 1000,
      maxNum: 10,
    },
    jsonConfig: {
      mode: 'fixed',
      fixedData: '',
      randomSize: 10,
      prompt: '',
    },
    textConfig: {
      mode: 'fixed',
      fixedData: '',
      randomSize: 100,
      prompt: '',
    },
    imageConfig: {
      mode: 'random',
      imageConfig: 'png',
      randomSize: 1,
      randomWidth: 800,
      randomHeight: 600,
      fixedFilePath: '',
    },
    fileConfig: {
      fileType: 'pdf',
    },
    binaryConfig: {
      filePath: '',
    },
  })
  ElMessage.success(t('添加成功'))
}

onMounted(() => {
  showRandomSizeHint.value = getMockJsonRandomSizeHintVisible()
  showRandomTextSizeHint.value = getMockTextRandomSizeHintVisible()
})
</script>

<style scoped>
.response-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.main-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
}

.add-response-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  cursor: pointer;

  .el-icon {
    width: 25px;
    height: 25px;
    transition: background 0.3s;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: var(--gray-200);
    }
  }
}

/* 响应列表 */
.response-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 响应卡片 */
.response-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: white;
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

/* JSON编辑器容器 */
.json-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  margin-top: 12px;
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
  margin-top: 12px;
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

/* Text 预览文本框 */
.text-preview-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.text-preview-textarea {
  width: 100%;
  height: 100%;
  padding: 12px;
  border: none;
  font-size: 14px;
  line-height: 1.5;
  color: var(--gray-800);
  background: transparent;
  outline: none;
  resize: none;
  font-family: inherit;
  
  &:focus {
    outline: none;
  }
}

/* Text 编辑器容器 */
.text-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  margin-top: 12px;
}

.text-editor-textarea {
  flex: 1;
  width: 100%;
  padding: 12px;
  border: none;
  font-size: 14px;
  line-height: 1.5;
  color: var(--gray-800);
  background: white;
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
</style>
