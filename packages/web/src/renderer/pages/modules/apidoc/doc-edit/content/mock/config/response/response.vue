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

        <!-- ========== SSE 配置区域 ========== -->
        <div v-if="response.dataType === 'sse'" class="sse-config-wrapper">
          
          <!-- 发送节奏配置 -->
          <div class="form-row mb-3 mt-3">
            <div class="form-item flex-item">
              <label class="form-label">{{ t('发送间隔') }}({{ t('单位：毫秒') }})</label>
              <el-input-number
                v-model="response.sseConfig.interval"
                :min="100"
                :step="100"
                size="small"
                controls-position="right"
              />
            </div>
            <div class="form-item flex-item">
              <label class="form-label">{{ t('最大事件数量') }}({{ t('达到数量后结束推送') }})</label>
              <el-input-number
                v-model="response.sseConfig.maxNum"
                :min="1"
                :step="1"
                size="small"
                controls-position="right"
              />
            </div>
          </div>
          <!-- 事件数据、事件ID、事件名称、重试间隔 -->
          <div class="form-row mb-3">
            <!-- 事件数据 -->
            <div class="form-item flex-item">
              <label class="form-label">{{ t('事件数据') }}</label>
              <el-radio-group v-model="response.sseConfig.event.data.mode" size="small">
                <el-radio-button label="json">JSON</el-radio-button>
                <el-radio-button label="string">Text</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 事件ID -->
            <div class="form-item flex-item">
              <label class="form-label">{{ t('事件ID') }}</label>
              <el-switch v-model="response.sseConfig.event.id.enable" size="small" />
              <div v-if="response.sseConfig.event.id.enable" style="margin-top: 6px;">
                <el-radio-group v-model="response.sseConfig.event.id.valueMode" size="small">
                  <el-radio-button label="increment">{{ t('自增') }}</el-radio-button>
                  <el-radio-button label="timestamp">{{ t('时间戳') }}</el-radio-button>
                  <el-radio-button label="random">{{ t('随机') }}</el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <!-- 事件名称 -->
            <div class="form-item flex-item">
              <label class="form-label">{{ t('事件名称') }}</label>
              <el-switch v-model="response.sseConfig.event.event.enable" size="small" />
              <div v-if="response.sseConfig.event.event.enable" style="margin-top: 6px;">
                <el-input
                  v-model="response.sseConfig.event.event.value"
                  size="small"
                  :placeholder="t('例如：message')"
                  style="width: 220px;"
                />
              </div>
            </div>

            <!-- 重试间隔（retry） -->
            <div class="form-item flex-item">
              <label class="form-label">{{ t('重试间隔') }}({{ t('单位：毫秒') }})</label>
              <el-switch v-model="response.sseConfig.event.retry.enable" size="small" />
              <div v-if="response.sseConfig.event.retry.enable" style="margin-top: 6px;">
                <el-input-number
                  v-model="response.sseConfig.event.retry.value"
                  :min="0"
                  :step="100"
                  size="small"
                  controls-position="right"
                />
              </div>
            </div>
          </div>


          <!-- 事件数据编辑器 -->
          <div class="sse-editor-wrapper">
            <SJsonEditor
              v-model="response.sseConfig.event.data.value"
              :config="{ fontSize: 13, language: response.sseConfig.event.data.mode === 'json' ? 'json' : 'plaintext' }"
            />
          </div>
        </div>

        <!-- 随机Text大小配置（仅随机模式显示） -->
        <div v-if="response.dataType === 'text' && response.textConfig.mode === 'random'" class="form-row mt-2">
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
                        :src="getImagePreviewSrc(response, index)" 
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

        <!-- File 配置区域 -->
        <div v-if="response.dataType === 'file'" class="file-config-wrapper">
          <div class="form-row">
            <div class="form-item full-width">
              <label class="form-label">{{ t('文件类型') }}</label>
              <div class="file-type-grid">
                <!-- PDF -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'pdf' }"
                  @click="response.fileConfig.fileType = 'pdf'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconpdfwenjian"></use>
                  </svg>
                  <div class="file-type-label">PDF</div>
                </div>

                <!-- DOC -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'doc' }"
                  @click="response.fileConfig.fileType = 'doc'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconWORD"></use>
                  </svg>
                  <div class="file-type-label">DOC</div>
                </div>

                <!-- DOCX -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'docx' }"
                  @click="response.fileConfig.fileType = 'docx'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconWORD"></use>
                  </svg>
                  <div class="file-type-label">DOCX</div>
                </div>

                <!-- XLS -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'xls' }"
                  @click="response.fileConfig.fileType = 'xls'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconexcel"></use>
                  </svg>
                  <div class="file-type-label">XLS</div>
                </div>

                <!-- XLSX -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'xlsx' }"
                  @click="response.fileConfig.fileType = 'xlsx'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconexcel"></use>
                  </svg>
                  <div class="file-type-label">XLSX</div>
                </div>

                <!-- PPT -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'ppt' }"
                  @click="response.fileConfig.fileType = 'ppt'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconppt"></use>
                  </svg>
                  <div class="file-type-label">PPT</div>
                </div>

                <!-- PPTX -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'pptx' }"
                  @click="response.fileConfig.fileType = 'pptx'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconppt"></use>
                  </svg>
                  <div class="file-type-label">PPTX</div>
                </div>

                <!-- ZIP -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === 'zip' }"
                  @click="response.fileConfig.fileType = 'zip'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconyasuobao"></use>
                  </svg>
                  <div class="file-type-label">ZIP</div>
                </div>

                <!-- 7Z -->
                <div 
                  class="file-type-item"
                  :class="{ 'is-selected': response.fileConfig.fileType === '7z' }"
                  @click="response.fileConfig.fileType = '7z'">
                  <svg class="icon file-type-icon" aria-hidden="true">
                    <use xlink:href="#iconyasuobao"></use>
                  </svg>
                  <div class="file-type-label">7Z</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Binary 配置区域 -->
        <div v-if="response.dataType === 'binary'" class="binary-config-wrapper">
          <div class="form-row">
            <div class="form-item flex-item">
              <label class="form-label">{{ t('二进制文件') }}</label>
              <div class="binary-file-selector">
                <el-button size="small" @click="handleSelectBinaryFile(response)">
                  {{ t('选择文件') }}
                </el-button>
                <div v-if="response.binaryConfig.filePath" class="file-path-display">
                  {{ response.binaryConfig.filePath }}
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
import { computed, ref, onMounted, watch } from 'vue'
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
import mime from 'mime'

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
  previewSrc?: string
  path?: string
}
const imageFilesInfo = ref<Map<number, ImageFileInfo>>(new Map())

// Binary 文件选择
const handleSelectBinaryFile = (response: MockHttpNode['response'][0]) => {
  // 创建一个临时的 input 元素
  const input = document.createElement('input')
  input.type = 'file'
  input.style.display = 'none'
  
  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (!file) {
      return
    }

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      ElMessage.error(t('文件大小不能超过 100MB'))
      document.body.removeChild(input)
      return
    }

    // 使用 Electron API 获取文件路径
    if (window.electronAPI?.fileManager?.getFilePath) {
      try {
        const filePath = window.electronAPI.fileManager.getFilePath(file)
        if (filePath) {
          response.binaryConfig.filePath = filePath
        } else {
          ElMessage.error(t('文件路径获取失败，请重试'))
        }
      } catch (error) {
        ElMessage.error(t('文件路径获取失败，请重试'))
      }
    } else {
      ElMessage.error(t('文件选择功能不可用'))
    }
    
    document.body.removeChild(input)
  }
  
  document.body.appendChild(input)
  input.click()
}

const handleImageChange = (file: { raw: File }, response: MockHttpNode['response'][0]) => {
  if (!file.raw) {
    return
  }

  const maxSize = 1024 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error(t('图片大小不能超过 1GB'))
    return
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
  if (!validTypes.includes(file.raw.type)) {
    ElMessage.error(t('不支持的图片格式，请选择 PNG、JPG、GIF、WEBP、SVG 或 BMP 格式'))
    return
  }

  const filePath = window.electronAPI?.fileManager.getFilePath(file.raw)
  if (!filePath) {
    ElMessage.error(t('图片路径获取失败，请重试'))
    return
  }

  response.imageConfig.fixedFilePath = filePath
  const responseIndex = mockResponses.value.indexOf(response)
  if (responseIndex !== -1) {
    imageFilesInfo.value.set(responseIndex, {
      size: file.raw.size,
      path: filePath
    })
    loadPreviewFromFile(file.raw, responseIndex)
  }
}

// 获取图片文件名
const getImageFileName = (filePath: string): string => {
  if (!filePath) return ''
  
  if (filePath.startsWith('data:')) {
    return t('已上传的图片')
  }
  
  let normalizedPath = filePath
  if (normalizedPath.startsWith('file://')) {
    normalizedPath = normalizedPath.replace(/^file:\/\//, '')
  }
  const parts = normalizedPath.split(/[/\\]/)
  return parts[parts.length - 1] || t('未知文件')
}



const getImagePreviewSrc = (response: MockHttpNode['response'][0], index: number): string => {
  const previewInfo = imageFilesInfo.value.get(index)
  if (previewInfo?.previewSrc) {
    return previewInfo.previewSrc
  }
  const filePath = response.imageConfig.fixedFilePath
  if (!filePath) {
    return ''
  }
  // 只返回 data: 或 blob: 或 http(s): 协议的 URL
  if (filePath.startsWith('data:') || filePath.startsWith('blob:') || /^https?:\/\//i.test(filePath)) {
    return filePath
  }
  // 对于本地文件路径,触发加载后返回空字符串,等待 watch 加载完成
  void loadPreviewFromPath(filePath, index)
  return ''
}

// 从文件加载预览
const loadPreviewFromFile = (file: File, index: number) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    const result = event.target?.result
    if (typeof result === 'string') {
      const info = imageFilesInfo.value.get(index)
      imageFilesInfo.value.set(index, {
        size: info?.size,
        path: info?.path,
        previewSrc: result
      })
    }
  }
  reader.readAsDataURL(file)
}

// 从文件路径加载预览
const loadPreviewFromPath = async (filePath: string, index: number): Promise<void> => {
  if (!window.electronAPI?.fileManager.readFileAsUint8Array) {
    return
  }
  try {
    const readResult = await window.electronAPI.fileManager.readFileAsUint8Array(filePath)
    if (!readResult || typeof readResult === 'string') {
      return
    }
    let uint8Data: Uint8Array
    if (readResult instanceof Uint8Array) {
      uint8Data = readResult
    } else if (Array.isArray(readResult)) {
      uint8Data = Uint8Array.from(readResult as number[])
    } else {
      return
    }
    const mimeType = mime.getType(filePath) || 'application/octet-stream'
    const blob = new Blob([uint8Data.buffer] as BlobPart[], { type: mimeType })
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        const existing = imageFilesInfo.value.get(index)
        imageFilesInfo.value.set(index, {
          size: existing?.size,
          path: filePath,
          previewSrc: result
        })
      }
    }
    reader.readAsDataURL(blob)
  } catch {
    // 忽略错误，使用文件路径作为 src
  }
}

onMounted(() => {
  showRandomSizeHint.value = getMockJsonRandomSizeHintVisible()
  showRandomTextSizeHint.value = getMockTextRandomSizeHintVisible()
})

watch(mockResponses, (responses) => {
  const activeIndexes = new Set<number>()
  responses.forEach((response, index) => {
    activeIndexes.add(index)
    
    // 处理图片文件信息
    if (response.imageConfig.mode !== 'fixed') {
      imageFilesInfo.value.delete(index)
    } else {
      const filePath = response.imageConfig.fixedFilePath
      if (!filePath) {
        imageFilesInfo.value.delete(index)
      } else {
        const cached = imageFilesInfo.value.get(index)
        if (cached?.path === filePath && cached.previewSrc) {
          return
        }
        imageFilesInfo.value.set(index, {
          size: cached?.size,
          path: filePath,
          previewSrc: cached?.previewSrc
        })
        void loadPreviewFromPath(filePath, index)
      }
    }
  })
  
  imageFilesInfo.value.forEach((_value, key) => {
    if (!activeIndexes.has(key)) {
      imageFilesInfo.value.delete(key)
    }
  })
}, { deep: true, immediate: true })
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

/* ========== File 配置样式 ========== */
.file-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

/* 文件类型网格布局 */
.file-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 80px);
  gap: 12px;
  margin-top: 8px;
}

/* 单个文件类型卡片 */
.file-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  padding: 12px;
  border: 1px solid var(--gray-300);
  background: white;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    border-color: var(--primary);
    background: var(--el-color-primary-light-9);
  }
  
  &.is-selected {
    border-color: var(--primary);
    background: var(--el-color-primary-light-9);
    
    .file-type-label {
      color: var(--primary);
      font-weight: 600;
    }
  }
}

/* 文件类型图标 */
.file-type-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}

/* 文件类型标签 */
.file-type-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  text-align: center;
}

/* ========== SSE 配置样式 ========== */
.sse-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  flex: 1;
  min-height: 0;
}

.sse-editor-wrapper {
  flex: 1;
  min-height: 300px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

/* ========== Binary 配置样式 ========== */
.binary-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.binary-file-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.file-path-display {
  font-size: 12px;
  color: var(--gray-600);
  word-break: break-all;
  padding: 8px 12px;
  background: var(--gray-100);
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
}
</style>
