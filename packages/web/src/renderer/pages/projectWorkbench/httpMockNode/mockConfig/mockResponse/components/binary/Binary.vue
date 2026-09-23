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
const handleSelectBinaryFile = async () => {
  try {
    const file = await window.desktopAPI?.fileManager.selectFile();
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      message.error(t('文件大小不能超过 100MB'));
      return;
    }
    props.response.binaryConfig.filePath = file.path;
  } catch {
    message.error(t('文件路径获取失败，请重试'));
  }
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
