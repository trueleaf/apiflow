<template>
  <div class="data-backup">
    <div class="header">
      <h3 class="title">{{ t('数据导出') }}</h3>
      <p class="desc">{{ t('导出数据可用于备份，也可以导入到在线版本或离线版本中') }}</p>
    </div>
    <div class="panel">
      <div class="options">
        <div class="option-row">
          <div class="option-label">{{ t('高级选项') }}</div>
          <div class="option-control">
            <el-switch v-model="includeResponseCache" :disabled="exporting" @change="handleOptionChange" />
            <div class="option-text">
              <div class="option-title">{{ t('导出返回值缓存') }}</div>
              <div class="option-sub">{{ t('导出返回值缓存会花费更长时间，') }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">{{ t('预计数据量：') }}</span>
          <span class="stat-value">{{ estimatedCount }}</span>
          <span class="stat-suffix">{{ t('项') }}</span>
        </div>
      </div>
      <div class="actions">
        <el-button type="primary" :loading="exporting" :disabled="estimatedCount === 0" @click="handleExport">
          <template #icon><Download :size="14" /></template>
          {{ exportState === 'success' ? t('再次导出') : t('开始导出') }}
        </el-button>
      </div>
      <div v-if="exporting || exportState !== 'idle'" class="progress">
        <el-progress :percentage="progressPercent" :stroke-width="8" />
        <div class="progress-text">
          <span>{{ t('已处理：') }} {{ progressCurrent }} / {{ progressTotal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { message } from '@/helper'
import { estimateLocalDataCount, exportLocalDataToZip, downloadBlob } from '../utils/localDataBackup'

const { t } = useI18n()
const includeResponseCache = ref(false)
const exporting = ref(false)
const exportState = ref<'idle' | 'success' | 'error'>('idle')
const estimatedCount = ref(0)
const progressCurrent = ref(0)
const progressTotal = ref(0)
const progressPercent = computed(() => {
  if (progressTotal.value <= 0) {
    return 0
  }
  const percent = Math.floor((progressCurrent.value / progressTotal.value) * 100)
  return Math.min(100, Math.max(0, percent))
})
// 初始化预计数据量
const initEstimate = async (): Promise<void> => {
  try {
    estimatedCount.value = await estimateLocalDataCount(includeResponseCache.value)
  } catch {
    estimatedCount.value = 0
  }
}
// 处理导出操作
const handleExport = async (): Promise<void> => {
  if (exporting.value) {
    return
  }
  if (estimatedCount.value <= 0) {
    message.warning(t('没有可导出的数据'))
    return
  }
  exporting.value = true
  exportState.value = 'idle'
  progressCurrent.value = 0
  try {
    const result = await exportLocalDataToZip(includeResponseCache.value, (p) => {
      progressCurrent.value = p.current
      progressTotal.value = p.total
    })
    downloadBlob(result.blob, result.fileName)
    exportState.value = 'success'
    await initEstimate()
  } catch {
    exportState.value = 'error'
    message.error(t('导出失败'))
  } finally {
    exporting.value = false
  }
}
// 切换高级选项后重新估算
const handleOptionChange = async (): Promise<void> => {
  await initEstimate()
}
onMounted(async () => {
  await initEstimate()
})
</script>
<style lang="scss" scoped>
.data-backup {
  width: 100%;
  .header {
    margin-bottom: 16px;
    .title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    .desc {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: var(--el-text-color-regular);
      line-height: 1.4;
    }
  }
  .panel {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 16px;
  }
  .options {
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 12px;
    margin-bottom: 12px;
    .option-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .option-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      padding-top: 6px;
      white-space: nowrap;
    }
    .option-control {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .option-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .option-title {
      font-size: 13px;
      color: var(--el-text-color-primary);
    }
    .option-sub {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
  .stats {
    margin-bottom: 12px;
    .stat-item {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
    .stat-label {
      margin-right: 4px;
    }
    .stat-value {
      font-weight: 600;
      color: var(--el-color-primary);
      margin-right: 4px;
    }
  }
  .actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .progress {
    margin-top: 16px;
  }
  .progress-text {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}
</style>
