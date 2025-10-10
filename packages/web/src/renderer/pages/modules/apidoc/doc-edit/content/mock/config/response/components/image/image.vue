<template>
  <div class="image-config-wrapper">
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
              :on-change="handleImageChange"
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
                  :src="previewSrc || response.imageConfig.fixedFilePath" 
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
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import mime from 'mime'
import type { MockHttpNode } from '@src/types'
import type { UploadFile } from 'element-plus'

type ResponseItem = MockHttpNode['response'][0]

type Props = {
  response: ResponseItem
}

const props = defineProps<Props>()
const { t } = useI18n()

// 图片预览状态
const previewSrc = ref('')

// 图片文件变更处理
const handleImageChange = (file: UploadFile) => {
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

  props.response.imageConfig.fixedFilePath = filePath
  loadPreviewFromFile(file.raw)
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

// 从文件加载预览
const loadPreviewFromFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    const result = event.target?.result
    if (typeof result === 'string') {
      previewSrc.value = result
    }
  }
  reader.readAsDataURL(file)
}

// 从文件路径加载预览
const loadPreviewFromPath = async (filePath: string): Promise<void> => {
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
        previewSrc.value = result
      }
    }
    reader.readAsDataURL(blob)
  } catch {
    // 忽略错误，使用文件路径作为 src
  }
}

// 监听文件路径变化，加载预览
watch(
  () => props.response.imageConfig.fixedFilePath,
  (filePath) => {
    if (!filePath) {
      previewSrc.value = ''
      return
    }
    
    // 如果是 data: 或 blob: 或 http(s): 协议，直接使用
    if (filePath.startsWith('data:') || filePath.startsWith('blob:') || /^https?:\/\//i.test(filePath)) {
      previewSrc.value = filePath
      return
    }
    
    // 对于本地文件路径，加载预览
    void loadPreviewFromPath(filePath)
  },
  { immediate: true }
)

// 监听模式变化，清空预览
watch(
  () => props.response.imageConfig.mode,
  (mode) => {
    if (mode !== 'fixed') {
      previewSrc.value = ''
    }
  }
)
</script>

<style scoped>
.image-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.random-image-config,
.fixed-image-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.w-120px {
  width: 120px;
}

.full-width {
  width: 100%;
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
