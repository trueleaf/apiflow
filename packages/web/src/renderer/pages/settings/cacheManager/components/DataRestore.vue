<template>
  <div class="data-restore">
    <div class="header">
      <h3 class="title">{{ t('数据导入') }}</h3>
      <p class="desc">{{ t('从备份文件中恢复数据，支持导入离线版本或在线版本导出的数据') }}</p>
    </div>
    <div class="panel">
      <div class="section">
        <div class="section-title">{{ t('选择备份文件') }}</div>
        <el-upload class="upload" drag :auto-upload="false" :show-file-list="false" accept=".zip" :disabled="importing" :on-change="handleFileChange">
          <div class="upload-inner">
            <FileArchive :size="22" class="upload-icon" />
            <div class="upload-main">
              <div class="upload-name">
                {{ selectedFile ? selectedFile.name : t('请选择导入文件') }}
              </div>
              <div class="upload-sub">
                {{ analyzing ? t('正在分析文件...') : selectedFile ? `${t('预计导入数据量：')} ${estimatedCount} ${t('项')}` : '' }}
              </div>
            </div>
          </div>
        </el-upload>
        <div v-if="selectedFile" class="file-actions">
          <el-button link type="primary" :disabled="importing" @click="handleResetFile">
            <template #icon><RotateCcw :size="14" /></template>
            {{ t('重新选择') }}
          </el-button>
        </div>
      </div>
      <div class="section">
        <div class="section-title">{{ t('导入选项') }}</div>
        <el-radio-group v-model="importMode" :disabled="importing">
          <el-radio value="merge">{{ t('合并模式') }}</el-radio>
          <el-radio value="override">{{ t('覆盖模式') }}</el-radio>
        </el-radio-group>
        <div class="mode-desc">
          {{ importMode === 'merge' ? t('合并模式：新数据将与现有数据合并，相同key的数据将被覆盖') : t('覆盖模式：清空现有数据后导入新数据') }}
        </div>
      </div>
      <div class="actions">
        <el-button type="primary" :loading="importing" :disabled="!canImport" @click="handleImport">
          <template #icon><Upload :size="14" /></template>
          {{ importState === 'success' ? t('再次导入') : t('开始导入') }}
        </el-button>
      </div>
      <div v-if="importing || importState !== 'idle'" class="progress">
        <el-progress :percentage="progressPercent" :stroke-width="8" />
        <div class="progress-text">
          <span>{{ t('已处理：') }} {{ progressCurrent }} / {{ progressTotal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { Upload, FileArchive, RotateCcw } from 'lucide-vue-next'
import { message, reloadApp } from '@/helper'
import type { BackupManifestV1 } from '../utils/localDataBackup'
import { parseBackupManifest, importLocalDataFromZip } from '../utils/localDataBackup'

const { t } = useI18n()
const selectedFile = ref<File | null>(null)
const analyzing = ref(false)
const manifest = ref<BackupManifestV1 | null>(null)
const zipRef = ref<Awaited<ReturnType<typeof parseBackupManifest>>['zip'] | null>(null)
const estimatedCount = ref(0)
const importMode = ref<'merge' | 'override'>('merge')
const importing = ref(false)
const importState = ref<'idle' | 'success' | 'error'>('idle')
const progressCurrent = ref(0)
const progressTotal = ref(0)
const progressPercent = computed(() => {
  if (progressTotal.value <= 0) {
    return 0
  }
  const percent = Math.floor((progressCurrent.value / progressTotal.value) * 100)
  return Math.min(100, Math.max(0, percent))
})
const canImport = computed(() => {
  return Boolean(selectedFile.value && zipRef.value && manifest.value && !analyzing.value && estimatedCount.value > 0)
})
// 重置已选择文件
const handleResetFile = (): void => {
  selectedFile.value = null
  zipRef.value = null
  manifest.value = null
  estimatedCount.value = 0
  importState.value = 'idle'
  progressCurrent.value = 0
  progressTotal.value = 0
}
// 处理文件选择
const handleFileChange = async (uploadFile: UploadFile): Promise<void> => {
  if (!uploadFile.raw) {
    message.warning(t('请选择导入文件'))
    return
  }
  handleResetFile()
  selectedFile.value = uploadFile.raw
  analyzing.value = true
  try {
    const parsed = await parseBackupManifest(uploadFile.raw)
    zipRef.value = parsed.zip
    manifest.value = parsed.manifest
    estimatedCount.value = parsed.estimatedCount
    if (estimatedCount.value <= 0) {
      message.warning(t('文件中没有可导入的数据'))
    }
  } catch {
    handleResetFile()
    message.error(t('导入失败'))
  } finally {
    analyzing.value = false
  }
}
// 处理导入操作
const handleImport = async (): Promise<void> => {
  if (!zipRef.value || !manifest.value) {
    message.warning(t('请选择导入文件'))
    return
  }
  if (importing.value) {
    return
  }
  if (importMode.value === 'override') {
    try {
      await ElMessageBox.confirm(
        t('覆盖模式将清空所有现有数据，此操作不可恢复！是否继续？'),
        t('导入选项'),
        { confirmButtonText: t('确定/DataRestoreOverwrite'), cancelButtonText: t('取消'), type: 'warning' }
      )
    } catch {
      return
    }
  }
  importing.value = true
  importState.value = 'idle'
  progressCurrent.value = 0
  progressTotal.value = estimatedCount.value
  try {
    const result = await importLocalDataFromZip(zipRef.value, manifest.value, importMode.value, (p) => {
      progressCurrent.value = p.current
      progressTotal.value = p.total
    })
    importState.value = 'success'
    reloadApp()
  } catch {
    importState.value = 'error'
    message.error(t('导入失败'))
  } finally {
    importing.value = false
  }
}
</script>
<style lang="scss" scoped>
.data-restore {
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
  .section {
    & + .section {
      margin-top: 16px;
    }
  }
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }
  .upload {
    width: 100%;
  }
  .upload-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }
  .upload-icon {
    color: var(--el-color-primary);
  }
  .upload-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }
  .upload-name {
    font-size: 13px;
    color: var(--el-text-color-primary);
  }
  .upload-sub {
    font-size: 12px;
    color: var(--el-text-color-regular);
    min-height: 16px;
  }
  .file-actions {
    margin-top: 8px;
  }
  .mode-desc {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    line-height: 1.4;
  }
  .actions {
    margin-top: 16px;
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
