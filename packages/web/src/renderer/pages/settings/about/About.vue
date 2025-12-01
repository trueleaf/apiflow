<template>
  <div class="about-container">
    <div class="page-header">
      <h2>{{ $t('关于') }}</h2>
    </div>

    <div class="about-content">
      <div class="app-info-section panel">
        <div class="app-logo">
          <img :src="logoImg" alt="Apiflow Logo" class="logo-image" />
        </div>
        <div class="app-details">
          <h1 class="app-name">Apiflow</h1>
          <div class="info-item">
            <span class="info-label">{{ $t('版本') }}:</span>
            <span class="info-value">v{{ appVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('构建时间') }}:</span>
            <span class="info-value">{{ buildTime }}</span>
          </div>
        </div>
      </div>

      <div class="update-section panel">
        <div class="section-header">
          <RefreshCw :size="20" class="section-icon" />
          <h3>{{ $t('软件更新') }}</h3>
        </div>
        <div class="section-content">
          <p class="section-description">{{ $t('检查是否有可用的更新版本') }}</p>
          <div class="update-actions">
            <el-button v-if="updateState === 'idle'" @click="handleCheckUpdate">
              <template #icon><RefreshCw :size="14" /></template>
              {{ $t('检查更新') }}
            </el-button>
            <el-button v-else-if="updateState === 'checking'" loading>
              {{ $t('检查更新中') }}
            </el-button>
            <el-badge v-else-if="updateState === 'available'" :is-dot="hasUpdate" type="danger">
              <el-button type="primary" @click="handleDownloadUpdate">
                <template #icon><Download :size="14" /></template>
                {{ $t('下载更新') }}
              </el-button>
            </el-badge>
            <div v-else-if="updateState === 'downloading'" class="progress-container">
              <el-progress :percentage="downloadProgress" :stroke-width="8" style="width: 200px" />
              <span class="progress-text">{{ downloadProgress }}%</span>
              <el-button size="small" @click="handleCancelDownload">
                {{ $t('取消下载') }}
              </el-button>
            </div>
            <el-button v-else-if="updateState === 'downloaded'" type="primary" @click="handleInstallUpdate">
              <template #icon><PackageCheck :size="14" /></template>
              {{ $t('安装更新') }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="links-section panel">
        <div class="section-header">
          <ExternalLink :size="20" class="section-icon" />
          <h3>{{ $t('相关链接') }}</h3>
        </div>
        <div class="section-content">
          <div class="link-item">
            <span class="link-label">{{ $t('开源协议') }}:</span>
            <span class="link-value">MIT License</span>
          </div>
          <div class="link-item">
            <span class="link-label">{{ $t('官方网站') }}:</span>
            <a href="https://github.com/trueleaf/apiflow" target="_blank" class="link-value external">
              https://github.com/trueleaf/apiflow
            </a>
          </div>
          <div class="link-item">
            <span class="link-label">{{ $t('版权信息') }}:</span>
            <span class="link-value">Copyright © 2025 TrueLeaf Team</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RefreshCw, Download, PackageCheck, ExternalLink } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { message } from '@/helper'
import logoImg from '@/assets/imgs/logo.png'

const { t } = useI18n()

const emit = defineEmits<{
  'update-badge': [show: boolean]
}>()

type UpdateButtonState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
const updateState = ref<UpdateButtonState>('idle')
const downloadProgress = ref(0)
const hasUpdate = ref(false)

const appVersion = '0.9.0'
const buildTime = computed(() => {
  try {
    if (typeof __APP_BUILD_TIME__ !== 'undefined' && __APP_BUILD_TIME__) {
      const date = new Date(__APP_BUILD_TIME__)
      return date.toLocaleString()
    }
  } catch {
    // ignore
  }
  return '-'
})
const notifyBadgeChange = () => {
  const shouldShow = hasUpdate.value && (updateState.value === 'available' || updateState.value === 'downloaded')
  emit('update-badge', shouldShow)
}
const initUpdateState = async () => {
  try {
    const status = await window.electronAPI?.updater.getUpdateStatus()
    if (!status) return
    if (status.downloaded) {
      updateState.value = 'downloaded'
      hasUpdate.value = true
    } else if (status.downloading) {
      updateState.value = 'downloading'
      downloadProgress.value = status.downloadProgress
      hasUpdate.value = true
    }
    notifyBadgeChange()
  } catch (error) {
    // 静默失败
  }
}
const bindUpdateEvents = () => {
  window.electronAPI?.updater.onUpdateChecking(() => {
    updateState.value = 'checking'
    notifyBadgeChange()
  })
  window.electronAPI?.updater.onUpdateAvailable(() => {
    updateState.value = 'available'
    hasUpdate.value = true
    notifyBadgeChange()
  })
  window.electronAPI?.updater.onUpdateNotAvailable(() => {
    updateState.value = 'idle'
    hasUpdate.value = false
    message.success(t('已是最新版本'))
    notifyBadgeChange()
  })
  window.electronAPI?.updater.onDownloadProgress((progress: { percent: number }) => {
    updateState.value = 'downloading'
    downloadProgress.value = Math.floor(progress.percent)
    notifyBadgeChange()
  })
  window.electronAPI?.updater.onDownloadCompleted(() => {
    updateState.value = 'downloaded'
    downloadProgress.value = 100
    hasUpdate.value = true
    message.success(t('下载完成可以安装更新'))
    notifyBadgeChange()
  })
  window.electronAPI?.updater.onUpdateError((error: { message: string }) => {
    updateState.value = 'error'
    message.error(error.message || t('更新失败'))
    setTimeout(() => {
      updateState.value = 'idle'
      hasUpdate.value = false
      notifyBadgeChange()
    }, 3000)
  })
}
const handleCheckUpdate = async () => {
  if (updateState.value === 'available') {
    handleDownloadUpdate()
    return
  }
  updateState.value = 'checking'
  notifyBadgeChange()
  try {
    const result = await window.electronAPI?.updater.checkForUpdates()
    if (!result?.success && result?.error) {
      message.error(result.error)
      updateState.value = 'idle'
      notifyBadgeChange()
    }
  } catch (error) {
    message.error(t('检查更新失败'))
    updateState.value = 'idle'
    notifyBadgeChange()
  }
}
const handleDownloadUpdate = async () => {
  updateState.value = 'downloading'
  downloadProgress.value = 0
  notifyBadgeChange()
  try {
    const result = await window.electronAPI?.updater.downloadUpdate()
    if (!result?.success && result?.error) {
      message.error(result.error)
      updateState.value = 'available'
      notifyBadgeChange()
    }
  } catch (error) {
    message.error(t('更新失败'))
    updateState.value = 'available'
    notifyBadgeChange()
  }
}
const handleCancelDownload = async () => {
  try {
    await window.electronAPI?.updater.cancelDownload()
    updateState.value = 'available'
    downloadProgress.value = 0
    notifyBadgeChange()
  } catch (error) {
    // 静默失败
  }
}
const handleInstallUpdate = () => {
  try {
    window.electronAPI?.updater.quitAndInstall()
  } catch (error) {
    message.error(t('安装更新失败'))
  }
}
onMounted(() => {
  initUpdateState()
  bindUpdateEvents()
})
</script>

<style lang="scss" scoped>
.about-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  box-sizing: border-box;
  overflow-y: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .about-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .panel {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    box-shadow: 0 10px 30px var(--shadow-light);
    padding: 32px;
  }

  .app-info-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    .app-logo {
      .logo-image {
        width: 120px;
        height: 120px;
        border-radius: 24px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
    }

    .app-details {
      text-align: center;

      .app-name {
        font-size: 32px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 16px 0;
      }

      .info-item {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;

        .info-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .info-value {
          color: var(--text-primary);
        }
      }
    }
  }

  .update-section,
  .links-section {
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;

      .section-icon {
        color: var(--el-color-primary);
      }

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .section-content {
      .section-description {
        color: var(--text-secondary);
        margin: 0 0 16px 0;
        font-size: 14px;
      }

      .update-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .progress-container {
          display: flex;
          align-items: center;
          gap: 12px;

          .progress-text {
            font-size: 14px;
            color: var(--text-primary);
            min-width: 40px;
            font-weight: 500;
          }
        }
      }
    }
  }

  .links-section {
    .section-content {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .link-item {
        display: flex;
        gap: 8px;
        font-size: 14px;

        .link-label {
          color: var(--text-secondary);
          font-weight: 500;
          min-width: 80px;
        }

        .link-value {
          color: var(--text-primary);

          &.external {
            color: var(--el-color-primary);
            text-decoration: none;
            transition: opacity 0.2s;

            &:hover {
              opacity: 0.8;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}
</style>
