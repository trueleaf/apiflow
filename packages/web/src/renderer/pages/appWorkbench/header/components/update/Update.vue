<template>
  <button
    v-if="showUpdateButton"
    class="update-trigger-btn"
    :title="updateButtonTitle"
    :disabled="updateState === 'checking'"
    @click="handleUpdateClick"
  >
    <span class="update-icon-wrapper">
      <Download v-if="updateState === 'available' || updateState === 'checking'" :size="16" />
      <DownloadCloud v-if="updateState === 'downloading'" :size="16" />
      <PackageCheck v-if="updateState === 'downloaded'" :size="16" />
      <span v-if="updateState === 'available' || updateState === 'downloaded'" class="update-badge"></span>
    </span>
    <span v-if="updateState === 'downloading'" class="progress-text">{{ downloadProgress }}%</span>
    <span v-if="updateState === 'downloaded'" class="install-text">{{ t('安装') }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, DownloadCloud, PackageCheck } from 'lucide-vue-next'
import { IPC_EVENTS } from '@src/types/ipc'

const { t } = useI18n()
const updateState = ref<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'>('idle')
const downloadProgress = ref(0)
const updateInfo = ref<{ version: string; releaseNotes: string } | null>(null)
const updateError = ref('')
const showUpdateButton = computed(() => updateState.value !== 'idle')
const updateButtonTitle = computed(() => {
  const titleMap = {
    'idle': '',
    'checking': t('检查更新中...'),
    'available': t('发现新版本,点击下载'),
    'downloading': `${t('下载中...')} ${downloadProgress.value}%`,
    'downloaded': t('点击安装更新'),
    'error': updateError.value
  }
  return titleMap[updateState.value]
})
// 初始化更新状态
const initUpdateState = async () => {
  try {
    const status = await window.electronAPI?.updater.getUpdateStatus()
    if (!status) return
    if (status.downloaded) {
      updateState.value = 'downloaded'
      updateInfo.value = { version: status.newVersion || '', releaseNotes: '' }
      setTimeout(() => {
        if (updateState.value === 'downloaded') {
          handleInstallUpdate()
        }
      }, 5000)
    } else if (status.downloading) {
      updateState.value = 'downloading'
      downloadProgress.value = status.downloadProgress
    } else if (status.newVersion && status.newVersion !== status.currentVersion) {
      updateState.value = 'available'
      updateInfo.value = { version: status.newVersion, releaseNotes: '' }
    }
  } catch {
    // 静默失败
  }
}
// 绑定更新事件监听
const bindUpdateEvents = () => {
  window.electronAPI?.updater.onUpdateChecking(() => {
    updateState.value = 'checking'
  })
  window.electronAPI?.updater.onUpdateAvailable((info: { version: string; releaseDate: string; releaseNotes: string }) => {
    updateState.value = 'available'
    updateInfo.value = { version: info.version, releaseNotes: info.releaseNotes }
  })
  window.electronAPI?.updater.onUpdateNotAvailable(() => {
    updateState.value = 'idle'
  })
  window.electronAPI?.updater.onDownloadProgress((progress: { percent: number }) => {
    updateState.value = 'downloading'
    downloadProgress.value = Math.floor(progress.percent)
  })
  window.electronAPI?.updater.onDownloadCompleted(() => {
    updateState.value = 'downloaded'
    downloadProgress.value = 100
  })
  window.electronAPI?.updater.onUpdateError((error: { message: string }) => {
    showError(error.message || '更新过程中发生错误')
  })
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.confirmDownloadUpdate, () => {
    handleStartDownload()
  })
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.cancelDownloadUpdate, () => {
    updateState.value = 'available'
  })
}
// 按钮点击处理
const handleUpdateClick = async () => {
  if (updateState.value === 'checking') return
  if (updateState.value === 'available') {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.showUpdateConfirm, {
      version: updateInfo.value?.version,
      releaseNotes: updateInfo.value?.releaseNotes
    })
    return
  }
  if (updateState.value === 'downloading') {
    await handleCancelDownload()
    return
  }
  if (updateState.value === 'downloaded') {
    await handleInstallUpdate()
    return
  }
  await handleCheckUpdate()
}
// 检查更新
const handleCheckUpdate = async () => {
  updateState.value = 'checking'
  try {
    const result = await window.electronAPI?.updater.checkForUpdates()
    if (!result?.success) {
      showError(result?.error || '检查更新失败')
      return
    }
    if (!result.hasUpdate) {
      window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.showNoUpdateMessage)
      updateState.value = 'idle'
    }
  } catch {
    showError('检查更新时发生错误')
  }
}
// 开始下载
const handleStartDownload = async () => {
  updateState.value = 'downloading'
  downloadProgress.value = 0
  try {
    const result = await window.electronAPI?.updater.downloadUpdate()
    if (!result?.success) {
      showError(result?.error || '下载失败')
    }
  } catch {
    showError('下载更新时发生错误')
  }
}
// 取消下载
const handleCancelDownload = async () => {
  try {
    await window.electronAPI?.updater.cancelDownload()
    updateState.value = 'available'
    downloadProgress.value = 0
  } catch {
    // 静默失败
  }
}
// 安装更新
const handleInstallUpdate = () => {
  try {
    window.electronAPI?.updater.quitAndInstall()
  } catch {
    showError('安装更新失败')
  }
}
// 显示错误
const showError = (message: string) => {
  updateError.value = message
  updateState.value = 'error'
  setTimeout(() => {
    updateState.value = 'idle'
    updateError.value = ''
  }, 3000)
}

onMounted(async () => {
  await initUpdateState()
  bindUpdateEvents()
})
</script>

<style lang="scss" scoped>
.update-trigger-btn {
  padding: 0 8px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  transition: all 0.2s;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
  border-radius: 3px;
  margin-right: 8px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:hover:not(:disabled) {
    background: var(--bg-white-15);
  }

  .update-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .update-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 6px;
    height: 6px;
    background-color: var(--el-color-danger);
    border-radius: 50%;
  }

  .progress-text {
    font-size: 10px;
    font-weight: 500;
    min-width: 30px;
    text-align: center;
  }

  .install-text {
    font-size: 12px;
  }
}
</style>
