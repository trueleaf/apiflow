<template>
  <div class="file-import">
    <el-upload
      class="upload-area"
      drag
      action=""
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      accept=".json,.yaml,.yml"
    >
      <div class="upload-content">
        <Upload :size="40" :stroke-width="1.5" class="upload-icon" />
        <div class="upload-text">
          {{ t('将文件拖到此处，或') }}<em>{{ t('点击上传') }}</em>
        </div>
        <div class="upload-hint">{{ t('支持 .json / .yaml 格式') }}</div>
      </div>
    </el-upload>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { Upload } from 'lucide-vue-next'
import { validateFile, parseFileContent } from '@/composables/useImport'

const emit = defineEmits<{
  (e: 'success', data: unknown): void
  (e: 'error', message: string): void
}>()
const { t } = useI18n()
// 文件上传前验证
const handleBeforeUpload = (file: File) => {
  const validation = validateFile(file, t)
  if (!validation.valid) {
    ElMessage.error(validation.error || '')
    emit('error', validation.error || '')
    return false
  }
  return true
}
// 处理文件上传
const handleUpload = async (options: { file: File }) => {
  const file = options.file
  const validation = validateFile(file, t)
  try {
    const content = await file.text()
    const data = parseFileContent(content, validation.fileType)
    emit('success', data)
    return content
  } catch (err) {
    const errorMsg = t('文件解析失败')
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
    throw err
  }
}
</script>

<style lang="scss" scoped>
.file-import {
  .upload-area {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--gray-300);
      border-radius: var(--border-radius);
      transition: all 0.2s;

      &:hover {
        border-color: var(--theme-color);
      }
    }
  }

  .upload-content {
    text-align: center;

    .upload-icon {
      color: var(--gray-400);
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
      color: var(--gray-600);

      em {
        color: var(--theme-color);
        font-style: normal;
        cursor: pointer;
      }
    }

    .upload-hint {
      font-size: 12px;
      color: var(--gray-400);
      margin-top: 4px;
    }
  }
}
</style>
