<template>
  <div class="binary-config-wrapper">
    <div class="form-row">
      <div class="form-item flex-item">
        <label class="form-label">{{ t('二进制文件') }}</label>
        <div class="binary-file-selector">
          <el-button size="small" @click="handleSelectBinaryFile">
            {{ t('选择文件') }}
          </el-button>
          <div v-if="response.binaryConfig.filePath" class="file-path-display">
            {{ response.binaryConfig.filePath }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { HttpMockNode } from '@src/types'


import { message } from '@/helper'
type ResponseItem = HttpMockNode['response'][0]

type Props = {
  response: ResponseItem
}

const props = defineProps<Props>()
const { t } = useI18n()

// Binary 文件选择
const handleSelectBinaryFile = () => {
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
      message.error(t('文件大小不能超过 100MB'))
      document.body.removeChild(input)
      return
    }

    // 使用 Electron API 获取文件路径
    if (window.electronAPI?.fileManager?.getFilePath) {
      try {
        const filePath = window.electronAPI.fileManager.getFilePath(file)
        if (filePath) {
          props.response.binaryConfig.filePath = filePath
        } else {
          message.error(t('文件路径获取失败，请重试'))
        }
      } catch (error) {
        message.error(t('文件路径获取失败，请重试'))
      }
    } else {
      message.error(t('文件选择功能不可用'))
    }
    
    document.body.removeChild(input)
  }
  
  document.body.appendChild(input)
  input.click()
}
</script>

<style scoped>
.binary-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
