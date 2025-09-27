<template>
  <div class="response-content">
    <div class="config-title">{{ t('响应配置') }}</div>
    
    <!-- 响应配置表单 -->
    <div v-if="currentResponse" class="config-form">
      <!-- 基础配置 -->
      <div class="form-row">
        <div class="form-item flex-item">
          <label class="form-label">{{ t('HTTP状态码') }} *</label>
          <el-input
            v-model.number="currentResponse.statusCode"
            type="number"
            :min="100"
            :max="599"
            class="status-code-input"
            placeholder="200"
          />
        </div>
        <div class="form-item flex-item">
          <label class="form-label">{{ t('延迟时间 (ms)') }}</label>
          <el-input-number
            v-model="httpMock.config.delay"
            :min="0"
            :max="60000"
            :step="100"
            class="delay-input"
            :controls="false"
            placeholder="0"
          />
        </div>
      </div>
      
      <!-- 响应头配置 -->
      <div class="form-row">
        <div class="form-item full-width">
          <div class="headers-section">
            <div class="headers-header">
              <label class="form-label">{{ t('响应头') }}</label>
              <el-button type="text" size="small" @click="addHeader">
                <el-icon><Plus /></el-icon>
                {{ t('添加') }}
              </el-button>
            </div>
            <div class="headers-list">
              <div 
                v-for="key in Object.keys(currentResponse.headers)" 
                :key="key" 
                class="header-item"
              >
                <el-input 
                  :model-value="key" 
                  @input="updateHeaderKey($event, key)"
                  placeholder="Header名称" 
                  class="header-key"
                />
                <el-input 
                  v-model="currentResponse.headers[key]" 
                  placeholder="Header值" 
                  class="header-value"
                />
                <el-button 
                  type="text" 
                  size="small" 
                  @click="removeHeader(key)"
                  class="header-remove"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <div v-if="Object.keys(currentResponse.headers).length === 0" class="no-headers">
                {{ t('暂无响应头，点击添加按钮创建') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 数据类型选择 -->
      <div class="form-row">
        <div class="form-item full-width">
          <label class="form-label">{{ t('响应数据类型') }}</label>
          <div class="data-type-options">
            <div 
              v-for="type in dataTypeOptions" 
              :key="type.value"
              :class="['data-type-option', { 'active': currentResponse.dataType === type.value }]"
              @click="changeDataType(type.value)"
            >
              <span class="type-icon">{{ type.icon }}</span>
              <span class="type-name">{{ type.label }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 数据内容配置 -->
      <div class="form-row">
        <div class="form-item full-width">
          <label class="form-label">{{ t('数据内容配置') }}</label>
        
        <!-- JSON配置 -->
        <div v-if="currentResponse.dataType === 'json'" class="json-config">
          <div class="mode-selector">
            <el-radio-group v-model="currentResponse.jsonConfig.mode" class="mode-radio-group">
              <el-radio-button label="fixed">{{ t('固定数据') }}</el-radio-button>
              <el-radio-button label="random">{{ t('随机生成') }}</el-radio-button>
            </el-radio-group>
          </div>
          
          <div v-if="currentResponse.jsonConfig.mode === 'fixed'" class="fixed-data-config">
            <el-input
              v-model="currentResponse.jsonConfig.fixedData"
              type="textarea"
              :rows="6"
              placeholder='{"message": "Hello World"}'
              class="json-textarea"
              @blur="validateJsonData"
            />
            <div v-if="jsonValidationError" class="validation-error">
              {{ jsonValidationError }}
            </div>
          </div>
          
          <div v-else class="random-data-config">
            <div class="random-item">
              <label class="config-label">{{ t('数据量大小') }}</label>
              <el-input-number
                v-model="currentResponse.jsonConfig.randomSize"
                :min="1"
                :max="1000"
                class="size-input"
              />
              <span class="unit">{{ t('条记录') }}</span>
            </div>
          </div>
        </div>
        
        <!-- 文本配置 -->
        <div v-else-if="currentResponse.dataType === 'text'" class="text-config">
          <div class="mode-selector">
            <el-radio-group v-model="currentResponse.textConfig.mode" class="mode-radio-group">
              <el-radio-button label="fixed">{{ t('固定数据') }}</el-radio-button>
              <el-radio-button label="random">{{ t('随机生成') }}</el-radio-button>
            </el-radio-group>
          </div>
          
          <div v-if="currentResponse.textConfig.mode === 'fixed'" class="fixed-data-config">
            <el-input
              v-model="currentResponse.textConfig.fixedData"
              type="textarea"
              :rows="6"
              placeholder="请输入文本内容..."
              class="text-textarea"
            />
          </div>
          
          <div v-else class="random-data-config">
            <div class="random-item">
              <label class="config-label">{{ t('文本长度') }}</label>
              <el-input-number
                v-model="currentResponse.textConfig.randomSize"
                :min="10"
                :max="10000"
                class="size-input"
              />
              <span class="unit">{{ t('字符') }}</span>
            </div>
          </div>
        </div>

        <!-- 图片配置 -->
        <div v-else-if="currentResponse.dataType === 'image'" class="image-config">
          <div class="mode-selector">
            <el-radio-group v-model="currentResponse.imageConfig.mode" class="mode-radio-group">
              <el-radio-button label="fixed">{{ t('固定图片') }}</el-radio-button>
              <el-radio-button label="random">{{ t('随机生成') }}</el-radio-button>
            </el-radio-group>
          </div>
          
          <div v-if="currentResponse.imageConfig.mode === 'fixed'" class="fixed-data-config">
            <div class="file-selector">
              <label class="config-label">{{ t('图片文件路径') }}</label>
              <el-input
                v-model="currentResponse.imageConfig.fixedFilePath"
                placeholder="/path/to/image.jpg"
                class="file-path-input"
              >
                <template #append>
                  <el-button @click="selectImageFile">{{ t('选择文件') }}</el-button>
                </template>
              </el-input>
            </div>
          </div>
          
          <div v-else class="random-data-config">
            <div class="random-grid">
              <div class="random-item">
                <label class="config-label">{{ t('图片数量') }}</label>
                <el-input-number
                  v-model="currentResponse.imageConfig.randomSize"
                  :min="1"
                  :max="100"
                  class="size-input"
                />
                <span class="unit">{{ t('张') }}</span>
              </div>
              <div class="random-item">
                <label class="config-label">{{ t('宽度范围') }}</label>
                <el-input-number
                  v-model="currentResponse.imageConfig.randomWidth"
                  :min="100"
                  :max="4000"
                  class="size-input"
                />
                <span class="unit">px</span>
              </div>
              <div class="random-item">
                <label class="config-label">{{ t('高度范围') }}</label>
                <el-input-number
                  v-model="currentResponse.imageConfig.randomHeight"
                  :min="100"
                  :max="4000"
                  class="size-input"
                />
                <span class="unit">px</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件配置 -->
        <div v-else-if="currentResponse.dataType === 'file'" class="file-config">
          <div class="file-type-selector">
            <label class="config-label">{{ t('文件类型') }}</label>
            <el-select v-model="currentResponse.fileConfig.fileType" placeholder="选择文件类型">
              <el-option label="Word文档 (.doc)" value="doc" />
              <el-option label="Word文档 (.docx)" value="docx" />
              <el-option label="Excel表格 (.xls)" value="xls" />
              <el-option label="Excel表格 (.xlsx)" value="xlsx" />
              <el-option label="PDF文档 (.pdf)" value="pdf" />
              <el-option label="PowerPoint (.ppt)" value="ppt" />
              <el-option label="PowerPoint (.pptx)" value="pptx" />
              <el-option label="ZIP压缩包 (.zip)" value="zip" />
              <el-option label="7z压缩包 (.7z)" value="7z" />
            </el-select>
          </div>
        </div>

        <!-- 二进制配置 -->
        <div v-else-if="currentResponse.dataType === 'binary'" class="binary-config">
          <div class="file-selector">
            <label class="config-label">{{ t('二进制文件路径') }}</label>
            <el-input
              v-model="currentResponse.binaryConfig.filePath"
              placeholder="/path/to/binary/file"
              class="file-path-input"
            >
              <template #append>
                <el-button @click="selectBinaryFile">{{ t('选择文件') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- SSE配置 -->
        <div v-else-if="currentResponse.dataType === 'sse'" class="sse-config">
          <div class="sse-note">
            <div class="note-icon">📡</div>
            <div class="note-content">
              <div class="note-title">{{ t('服务器推送事件 (SSE)') }}</div>
              <div class="note-desc">{{ t('SSE配置功能正在开发中，敬请期待...') }}</div>
            </div>
          </div>
        </div>

          <!-- 其他数据类型的占位符 -->
          <div v-else class="other-config-placeholder">
            <div class="placeholder-text">
              {{ t('未知数据类型配置') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-response">
      <div class="empty-text">{{ t('未配置响应条件') }}</div>
      <div class="empty-hint">{{ t('点击"添加条件"创建你的第一个响应') }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElButton, ElIcon, ElInput, ElRadioGroup, ElRadioButton, ElInputNumber, ElSelect, ElOption } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)

// 响应配置相关状态
const jsonValidationError = ref('')

// 当前响应配置（第一个响应）
const currentResponse = computed(() => {
  return httpMock.value?.response?.[0] || null
})

// 数据类型选项
const dataTypeOptions = computed(() => [
  {
    value: 'json',
    label: t('JSON数据'),
    description: t('返回JSON格式数据'),
    icon: '📄'
  },
  {
    value: 'text',
    label: t('文本数据'),
    description: t('返回纯文本数据'),
    icon: '📝'
  },
  {
    value: 'image',
    label: t('图片文件'),
    description: t('返回图片文件'),
    icon: '🖼️'
  },
  {
    value: 'file',
    label: t('文档文件'),
    description: t('返回文档文件'),
    icon: '📁'
  },
  {
    value: 'binary',
    label: t('二进制文件'),
    description: t('返回二进制数据'),
    icon: '⚙️'
  },
  {
    value: 'sse',
    label: t('SSE流'),
    description: t('服务器推送事件'),
    icon: '📡'
  }
])



// 响应配置相关方法
const addHeader = () => {
  if (currentResponse.value) {
    const newKey = `Header-${Date.now()}`
    currentResponse.value.headers[newKey] = ''
  }
}

const removeHeader = (key: string) => {
  if (currentResponse.value && currentResponse.value.headers[key] !== undefined) {
    delete currentResponse.value.headers[key]
  }
}

const updateHeaderKey = (newKey: string, oldKey: string) => {
  if (currentResponse.value && newKey !== oldKey) {
    const value = currentResponse.value.headers[oldKey]
    delete currentResponse.value.headers[oldKey]
    currentResponse.value.headers[newKey] = value
  }
}

const changeDataType = (dataType: string) => {
  if (currentResponse.value) {
    currentResponse.value.dataType = dataType as any
  }
}

// 文件选择方法
const selectImageFile = () => {
  // TODO: 实现图片文件选择逻辑
  console.log('选择图片文件')
}

const selectBinaryFile = () => {
  // TODO: 实现二进制文件选择逻辑
  console.log('选择二进制文件')
}

// 数据验证方法
const validateJsonData = () => {
  if (!currentResponse.value?.jsonConfig.fixedData) {
    jsonValidationError.value = ''
    return
  }
  
  try {
    JSON.parse(currentResponse.value.jsonConfig.fixedData)
    jsonValidationError.value = ''
  } catch (error) {
    jsonValidationError.value = t('JSON格式不正确，请检查语法')
  }
}
</script>

<style scoped>
.response-content {
  margin-bottom: 12px;
}

.config-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 16px;
}

.config-form {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-item {
  flex: 0 0 auto;
}

.full-width {
  flex: 1;
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

.status-code-input {
  max-width: 200px;
}

.delay-input {
  max-width: 200px;
}

.empty-response {
  text-align: center;
  padding: 40px 20px;
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
  border: 1px dashed var(--gray-300);
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--gray-600);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

/* 响应头配置 */
.headers-section {
  width: 100%;
}

.headers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-key {
  flex: 1;
  min-width: 0;
}

.header-value {
  flex: 2;
  min-width: 0;
}

.header-remove {
  flex-shrink: 0;
  color: #dc2626;
}

.no-headers {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  background: var(--gray-100);
  border: 1px dashed var(--gray-300);
  border-radius: var(--border-radius-base);
}

.data-type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.data-type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--white);
}

.data-type-option:hover {
  border-color: var(--primary-color);
  background: var(--primary-color-light);
}

.data-type-option.active {
  border-color: var(--primary-color);
  background: var(--primary-color-light);
  color: var(--primary-color);
}

.type-icon {
  font-size: 16px;
  line-height: 1;
}

.type-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.3;
}

/* 数据内容配置 */
.mode-selector {
  margin: 12px 0;
}

.mode-radio-group :deep(.el-radio-button) {
  --el-radio-button-checked-bg-color: var(--primary-color);
  --el-radio-button-checked-border-color: var(--primary-color);
}

.fixed-data-config {
  margin-top: 12px;
}

.json-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.random-data-config {
  margin-top: 12px;
}

.random-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-input {
  width: 120px;
}

.unit {
  font-size: 14px;
  color: var(--gray-600);
}

/* 各类型配置通用样式 */
.text-config,
.image-config, 
.file-config,
.binary-config {
  margin-top: 12px;
}

.text-textarea :deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

.file-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-path-input {
  width: 100%;
}

.random-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.file-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-type-selector :deep(.el-select) {
  width: 300px;
}

/* SSE配置样式 */
.sse-config {
  margin-top: 12px;
}

.sse-note {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--primary-color-light);
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius-base);
}

.note-icon {
  font-size: 20px;
  line-height: 1;
}

.note-content {
  flex: 1;
}

.note-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.note-desc {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  line-height: 1.4;
}

.other-config-placeholder {
  padding: 32px 20px;
  text-align: center;
  background: var(--gray-100);
  border: 1px dashed var(--gray-300);
  border-radius: var(--border-radius-base);
}

.placeholder-text {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}

/* 验证错误样式 */
.validation-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--border-radius-base);
  color: #dc2626;
  font-size: var(--font-size-xs);
  line-height: 1.4;
}

@media (max-width: 960px) {
  .config-form {
    gap: 14px;
  }

  .form-row {
    flex-direction: column;
    gap: 14px;
  }

  .status-code-input,
  .delay-input {
    max-width: 100%;
  }

  .data-type-options {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-item {
    flex-direction: column;
    gap: 8px;
  }

  .header-key,
  .header-value {
    width: 100%;
  }

  .random-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .random-grid {
    grid-template-columns: 1fr;
  }

  .file-type-selector :deep(.el-select) {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .config-title {
    font-size: var(--font-size-base);
    margin-bottom: 12px;
  }

  .empty-response {
    padding: 30px 16px;
  }

  .config-form {
    margin-left: 12px;
  }
}
</style>