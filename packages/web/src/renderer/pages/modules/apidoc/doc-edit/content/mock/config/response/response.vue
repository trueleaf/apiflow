<template>
  <div class="response-content">
    <div class="response-header">
      <div class="config-title">{{ t('响应配置') }}</div>
      <el-button type="primary" @click="handleAddCondition">
        {{ t('添加条件') }}
      </el-button>
    </div>
    
    <!-- 响应配置卡片 -->
    <div v-if="currentResponse" class="response-card">
      <!-- 条件头部 -->
      <div class="response-card-header">
        <div class="condition-info">
          <div class="condition-tag-wrapper">
            <span class="default-tag">{{ t('默认响应') }}</span>
            <span v-if="currentResponse.conditions.name" class="condition-name">
              {{ currentResponse.conditions.name }}
            </span>
          </div>
        </div>
        <div class="condition-actions">
          <el-button type="text" size="small">{{ t('编辑') }}</el-button>
          <el-button type="text" size="small">{{ t('复制') }}</el-button>
          <el-button type="text" size="small" class="danger-text">{{ t('删除') }}</el-button>
        </div>
      </div>
      
      <!-- 基础配置区域 -->
      <div class="response-basic-config">
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">{{ t('HTTP状态码') }}</label>
            <el-input
              v-model.number="currentResponse.statusCode"
              type="number"
              :min="100"
              :max="599"
              class="status-code-input"
              placeholder="200"
            />
          </div>
          <div class="config-item">
            <label class="config-label">{{ t('延迟时间') }}</label>
            <div class="delay-display">
              <span class="delay-value">{{ httpMock.config.delay }}ms</span>
              <span class="delay-note">{{ t('（从全局配置继承）') }}</span>
            </div>
          </div>
        </div>
        
        <!-- 响应头配置 -->
        <div class="headers-config">
          <div class="headers-title">
            <span>{{ t('响应头') }}</span>
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
      
      <!-- 数据类型选择区域 -->
      <div class="data-type-section">
        <div class="section-title">{{ t('响应数据类型') }}</div>
        <div class="data-type-options">
          <div 
            v-for="type in dataTypeOptions" 
            :key="type.value"
            :class="['data-type-option', { 'active': currentResponse.dataType === type.value }]"
            @click="changeDataType(type.value)"
          >
            <div class="type-icon">
              <span class="icon-text">{{ type.icon }}</span>
            </div>
            <div class="type-info">
              <div class="type-name">{{ type.label }}</div>
              <div class="type-desc">{{ type.description }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 数据内容配置区域 -->
      <div class="data-content-section">
        <div class="section-title">{{ t('数据内容配置') }}</div>
        
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

// 添加条件按钮处理（由父组件处理跨组件操作）
const handleAddCondition = () => {
  console.log('添加条件按钮被点击')
}

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

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

/* 响应配置卡片样式 - 现代化极简风格 */
.response-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

.response-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 卡片头部 */
.response-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.condition-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.condition-tag-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.default-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.condition-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.condition-actions {
  display: flex;
  gap: 8px;
}

.danger-text {
  color: #dc2626 !important;
}

/* 基础配置区域 */
.response-basic-config {
  padding: 20px;
  background: #ffffff;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.status-code-input {
  max-width: 120px;
}

.delay-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delay-value {
  font-weight: 600;
  color: #059669;
  font-size: 14px;
}

.delay-note {
  font-size: 12px;
  color: #6b7280;
}

/* 响应头配置 */
.headers-config {
  border-top: 1px solid #f3f4f6;
  padding-top: 20px;
}

.headers-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

/* 数据类型选择区域 */
.data-type-section {
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #f3f4f6;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.data-type-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.data-type-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: #ffffff;
}

.data-type-option:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.data-type-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.type-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
}

.icon-text {
  font-size: 16px;
  line-height: 1;
}

.data-type-option.active .type-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.type-info {
  flex: 1;
  min-width: 0;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  line-height: 1.3;
}

.type-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
  margin-top: 2px;
}

/* 数据内容配置区域 */
.data-content-section {
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #f3f4f6;
}

.mode-selector {
  margin-bottom: 16px;
}

.mode-radio-group :deep(.el-radio-button) {
  --el-radio-button-checked-bg-color: #3b82f6;
  --el-radio-button-checked-border-color: #3b82f6;
}

.fixed-data-config {
  margin-top: 16px;
}

.json-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.random-data-config {
  margin-top: 16px;
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
  color: #6b7280;
}

/* 文本配置样式 */
.text-config {
  margin-top: 16px;
}

.text-textarea :deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

/* 图片配置样式 */
.image-config {
  margin-top: 16px;
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
  margin-top: 16px;
}

/* 文件配置样式 */
.file-config {
  margin-top: 16px;
}

.file-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-type-selector :deep(.el-select) {
  width: 300px;
}

/* 二进制配置样式 */
.binary-config {
  margin-top: 16px;
}

/* SSE配置样式 */
.sse-config {
  margin-top: 16px;
}

.sse-note {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
}

.note-icon {
  font-size: 24px;
  line-height: 1;
}

.note-content {
  flex: 1;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 4px;
}

.note-desc {
  font-size: 14px;
  color: #075985;
  line-height: 1.4;
}

.other-config-placeholder {
  padding: 40px 20px;
  text-align: center;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

.placeholder-text {
  font-size: 14px;
  color: #6b7280;
}

/* 验证错误样式 */
.validation-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  line-height: 1.4;
}

@media (max-width: 960px) {
  .response-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  /* 响应式布局调整 */
  .config-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .data-type-options {
    grid-template-columns: 1fr;
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
  .empty-response {
    padding: 30px 16px;
  }

  /* 移动端优化 */
  .response-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .condition-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .response-basic-config,
  .data-type-section,
  .data-content-section {
    padding: 16px;
  }

  .type-icon {
    width: 28px;
    height: 28px;
  }

  .section-title {
    font-size: 14px;
  }
}
</style>