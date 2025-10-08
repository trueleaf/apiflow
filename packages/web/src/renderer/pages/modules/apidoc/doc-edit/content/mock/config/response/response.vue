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
            <label class="form-label mb-1">{{ t('返回数据结构') }}</label>
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

          <!-- 文本类型（仅 Text 类型显示） -->
          <div v-if="response.dataType === 'text'" class="form-item flex-item">
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
          v-if="response.dataType === 'text' && response.textConfig.mode === 'fixed'" 
          class="text-editor-wrapper">
          <SJsonEditor 
            v-model="response.textConfig.fixedData"
            :config="{ fontSize: 13, language: getEditorLanguage(response.textConfig.textType) }">
          </SJsonEditor>
        </div>

        <!-- Image 配置区域 -->
        <div v-if="response.dataType === 'image'" class="image-config-wrapper">
          <!-- 模式选择 -->
          <div class="form-row">
            <div class="form-item flex-item">
              <label class="form-label">{{ t('图片模式') }}</label>
              <el-radio-group v-model="response.imageConfig.mode">
                <el-radio label="random">{{ t('随机图片') }}</el-radio>
                <el-radio label="fixed">{{ t('固定图片') }}</el-radio>
              </el-radio-group>
            </div>
          </div>

          <!-- 随机模式配置 -->
          <div v-if="response.imageConfig.mode === 'random'" class="random-image-config">
            <!-- 图片格式 -->
            <div class="form-row">
              <div class="form-item flex-item">
                <label class="form-label mb-1">{{ t('图片格式') }}</label>
                <el-radio-group v-model="response.imageConfig.imageConfig" size="small">
                  <el-radio-button label="png">PNG</el-radio-button>
                  <el-radio-button label="jpg">JPG</el-radio-button>
                  <el-radio-button label="webp">WEBP</el-radio-button>
                  <el-radio-button label="svg">SVG</el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <!-- 图片尺寸和大小 -->
            <div class="form-row">
              <div class="form-item flex-item">
                <label class="form-label">{{ t('图片宽度(px)') }}</label>
                <el-input-number 
                  v-model="response.imageConfig.randomWidth" 
                  :min="100" 
                  :max="4096" 
                  size="small"
                  controls-position="right"
                  class="w-120px"
                />
              </div>
              
              <div class="form-item flex-item">
                <label class="form-label">{{ t('图片高度(px)') }}</label>
                <el-input-number 
                  v-model="response.imageConfig.randomHeight" 
                  :min="100" 
                  :max="4096" 
                  size="small"
                  controls-position="right"
                  class="w-120px"
                />
              </div>

              <div class="form-item flex-item">
                <label class="form-label">{{ t('图片大小(kb)') }}</label>
                <el-input-number 
                  v-model="response.imageConfig.randomSize" 
                  :min="1" 
                  :max="10240" 
                  size="small"
                  controls-position="right"
                  class="w-120px"
                />
              </div>
            </div>
          </div>

          <!-- 固定模式配置 -->
          <div v-if="response.imageConfig.mode === 'fixed'" class="fixed-image-config">
            <!-- 文件选择 -->
            <div class="form-row">
              <div class="form-item full-width">
                <label class="form-label">{{ t('图片文件') }}</label>
                <div class="file-upload-wrapper">
                  <el-upload
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/*"
                    :on-change="(file: any) => handleImageChange(file, response)"
                    drag
                  >
                    <div v-if="!response.imageConfig.fixedFilePath" class="upload-trigger">
                      <el-icon class="upload-icon">
                        <Upload />
                      </el-icon>
                      <div class="upload-text">
                        {{ t('点击或拖拽图片到此处') }}
                      </div>
                      <div class="upload-hint">
                        {{ t('支持 PNG、JPG、GIF、WEBP、SVG 等格式，最大 10MB') }}
                      </div>
                    </div>
                    <div v-else class="upload-trigger has-image">
                      <img 
                        :src="response.imageConfig.fixedFilePath" 
                        :alt="getImageFileName(response.imageConfig.fixedFilePath)"
                        class="image-thumbnail"
                      />
                      <div class="image-overlay">
                        <el-icon class="overlay-icon">
                          <Upload />
                        </el-icon>
                        <div class="overlay-text">
                          {{ t('点击或拖拽更换图片') }}
                        </div>
                      </div>
                    </div>
                  </el-upload>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus, Loading, Top, Upload } from '@element-plus/icons-vue'
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
import { uuid, generateEmptyHttpMockNode } from '@/helper'

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
      prompt: promptText
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
  const mockNodeTemplate = generateEmptyHttpMockNode(uuid())
  const newResponse = mockNodeTemplate.response[0]
  newResponse.isDefault = false
  newResponse.jsonConfig.randomSize = 10
  newResponse.textConfig.randomSize = 100
  newResponse.imageConfig.mode = 'random'
  newResponse.imageConfig.randomWidth = 800
  newResponse.imageConfig.randomHeight = 600
  newResponse.imageConfig.randomSize = 10
  newResponse.fileConfig.fileType = 'pdf'
  httpMock.value.response.push(newResponse)
  ElMessage.success(t('添加成功'))
}

// 图片文件变更处理
type ImageFileInfo = {
  size?: number
}
const imageFilesInfo = ref<Map<number, ImageFileInfo>>(new Map())

const handleImageChange = (file: { raw: File }, response: MockHttpNode['response'][0]) => {
  if (!file.raw) {
    return
  }

  const maxSize = 10 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error(t('图片大小不能超过 10MB'))
    return
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
  if (!validTypes.includes(file.raw.type)) {
    ElMessage.error(t('不支持的图片格式，请选择 PNG、JPG、GIF、WEBP、SVG 或 BMP 格式'))
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      response.imageConfig.fixedFilePath = e.target.result as string
      
      const responseIndex = mockResponses.value.indexOf(response)
      if (responseIndex !== -1) {
        imageFilesInfo.value.set(responseIndex, {
          size: file.raw.size
        })
      }
      
      ElMessage.success(t('图片上传成功'))
    }
  }
  reader.onerror = () => {
    ElMessage.error(t('图片读取失败，请重试'))
  }
  reader.readAsDataURL(file.raw)
}

// 获取图片文件名
const getImageFileName = (filePath: string): string => {
  if (!filePath) return ''
  
  if (filePath.startsWith('data:')) {
    return t('已上传的图片')
  }
  
  const parts = filePath.split('/')
  return parts[parts.length - 1] || t('未知文件')
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

/* ========== Image 配置样式 ========== */
.image-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.random-image-config,
.fixed-image-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.unit-text {
  margin-left: 8px;
  font-size: 14px;
  color: var(--gray-600);
}

.w-120px {
  width: 120px;
}

.full-width {
  width: 100%;
}

/* 文件上传区域 */
.file-upload-wrapper {
  margin-top: 8px;
  width: 200px;
  height: 200px;
}

.file-upload-wrapper :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.file-upload-wrapper :deep(.el-upload-dragger) {
  width: 200px;
  height: 200px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;

  &.has-image {
    position: relative;
    padding: 0;
    overflow: hidden;
  }
}

.upload-icon {
  font-size: 32px;
  color: var(--gray-400);
  margin-bottom: 8px;
  transition: color 0.3s;
}

.upload-text {
  font-size: 13px;
  color: var(--gray-700);
  margin-bottom: 6px;
  font-weight: 500;
  text-align: center;
  padding: 0 12px;
}

.upload-hint {
  font-size: 11px;
  color: var(--gray-500);
  text-align: center;
  padding: 0 12px;
  line-height: 1.4;
}

.upload-trigger:hover {
  .upload-icon {
    color: var(--primary);
  }
}

/* 图片缩略图样式 */
.image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 图片覆盖层（hover 时显示） */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.upload-trigger.has-image:hover .image-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.overlay-text {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  padding: 0 12px;
}
</style>
