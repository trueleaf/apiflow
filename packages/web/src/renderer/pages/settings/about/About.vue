<template>
  <div class="about-container">
    <div class="page-header">
      <h2>{{ $t('关于') }}</h2>
    </div>

    <div class="about-grid">
      <!-- Left Column: App Identity -->
      <div class="app-identity-card">
        <div class="logo-wrapper">
          <img :src="logoImg" alt="Apiflow" class="app-logo" />
        </div>
        <div class="app-info">
          <h1 class="app-name">Apiflow</h1>
          <div class="version-info">
            <span class="version-tag">v{{ appVersion }}</span>
            <span class="build-time" v-if="buildTime">{{ buildTime }}</span>
          </div>
        </div>
        
        <div class="links-list">
          <a href="https://github.com/trueleaf/apiflow" target="_blank" class="link-item">
            <Github :size="16" />
            <span>GitHub</span>
            <span v-if="starCount" class="star-count">
              <Star :size="12" />
              {{ starCount }}
            </span>
          </a>
          <div class="link-item">
            <FileText :size="16" />
            <span>MIT License</span>
          </div>
          <div class="copyright">
            Copyright © 2025 TrueLeaf Team
          </div>
        </div>
      </div>

      <!-- Right Column: Settings & Updates -->
      <div class="settings-column">
        <!-- Update Card -->
        <div class="setting-card">
          <div class="card-header">
            <div class="header-title">
              <RefreshCw :size="18" class="header-icon" />
              <h3>{{ $t('软件更新') }}</h3>
            </div>
            <el-tag v-if="hasUpdate" type="danger" size="small" effect="dark">New</el-tag>
          </div>
          
          <div class="card-content">
            <div class="update-status-row">
              <div class="status-text">
                <p class="main-text">
                  {{ updateState === 'idle' ? $t('当前已是最新版本') : 
                     updateState === 'checking' ? $t('正在检查更新...') :
                     updateState === 'available' ? $t('发现新版本') :
                     updateState === 'downloading' ? $t('正在下载更新...') :
                     updateState === 'downloaded' ? $t('更新已就绪') : '' }}
                </p>
                <p class="sub-text" v-if="updateState === 'idle'">{{ $t('检查是否有可用的更新版本') }}</p>
              </div>

              <div class="action-area">
                <el-button v-if="updateState === 'idle'" @click="handleCheckUpdate">
                  {{ $t('检查更新') }}
                </el-button>
                
                <el-button v-else-if="updateState === 'checking'" loading disabled>
                  {{ $t('检查中') }}
                </el-button>
                
                <el-button v-else-if="updateState === 'available'" type="primary" @click="handleDownloadUpdate">
                  <template #icon><Download :size="14" /></template>
                  {{ $t('下载更新') }}
                </el-button>
                
                <div v-else-if="updateState === 'downloading'" class="download-progress">
                  <el-progress :percentage="downloadProgress" :stroke-width="6" :width="120" />
                  <el-button link type="info" size="small" @click="handleCancelDownload">
                    {{ $t('取消') }}
                  </el-button>
                </div>
                
                <el-button v-else-if="updateState === 'downloaded'" type="success" @click="handleInstallUpdate">
                  <template #icon><PackageCheck :size="14" /></template>
                  {{ $t('立即重启') }}
                </el-button>
              </div>
            </div>

            <div class="divider"></div>

            <div class="update-source-config">
              <span class="config-label">{{ $t('更新源') }}</span>
              <div class="config-control">
                <el-radio-group v-model="updateSourceType" @change="handleUpdateSourceChange" size="small">
                  <el-radio value="github" label="github">GitHub</el-radio>
                  <el-radio value="custom" label="custom">{{ $t('自定义') }}</el-radio>
                </el-radio-group>
                
                <div v-if="updateSourceType === 'custom'" class="custom-url-input">
                  <el-input
                    v-model="customUpdateUrl"
                    :placeholder="$t('请输入自定义更新服务器地址')"
                    size="small"
                    @blur="handleSaveUpdateSource"
                  >
                    <template #prefix>https://</template>
                  </el-input>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Github, FileText, RefreshCw, Download, PackageCheck, Star } from 'lucide-vue-next'
import { message } from '@/helper'
import logoImg from '@/assets/imgs/logo.png'
import { appSettingsCache } from '@/cache/settings/appSettingsCache'

const { t } = useI18n()

const emit = defineEmits<{
  'update-badge': [show: boolean]
}>()

const starCount = ref('')

const fetchStarCount = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/trueleaf/apiflow')
    if (response.ok) {
      const data = await response.json()
      const count = data.stargazers_count
      if (count >= 1000) {
        starCount.value = (count / 1000).toFixed(1) + 'k'
      } else {
        starCount.value = String(count)
      }
    }
  } catch {
    // 静默失败
  }
}

type UpdateButtonState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
const updateState = ref<UpdateButtonState>('idle')
const downloadProgress = ref(0)
const hasUpdate = ref(false)

const appVersion = '0.9.0'
const buildTime = computed(() => {
  try {
    if (typeof __APP_BUILD_TIME__ !== 'undefined' && __APP_BUILD_TIME__) {
      const date = new Date(__APP_BUILD_TIME__)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
  } catch {
    // ignore
  }
  return ''
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
    } else if (status.newVersion && status.newVersion !== status.currentVersion) {
      updateState.value = 'available'
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
    console.log(result)
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

const updateSourceType = ref<'github' | 'custom'>('github')
const customUpdateUrl = ref('')

const initUpdateSource = async () => {
  const cachedSource = appSettingsCache.getUpdateSource()
  updateSourceType.value = cachedSource.sourceType
  customUpdateUrl.value = cachedSource.customUrl
  try {
    const source = await window.electronAPI?.updater.getUpdateSource()
    if (source) {
      updateSourceType.value = source.sourceType
      customUpdateUrl.value = source.customUrl
    }
  } catch {
    // 静默失败
  }
}

const handleUpdateSourceChange = () => {
  if (updateSourceType.value === 'github') {
    handleSaveUpdateSource()
  }
}

const handleSaveUpdateSource = async () => {
  if (updateSourceType.value === 'custom' && !customUpdateUrl.value.trim()) {
    return
  }
  try {
    const result = await window.electronAPI?.updater.setUpdateSource({
      sourceType: updateSourceType.value,
      customUrl: updateSourceType.value === 'custom' ? customUpdateUrl.value.trim() : undefined,
    })
    if (result?.success) {
      appSettingsCache.setUpdateSource({
        sourceType: updateSourceType.value,
        customUrl: customUpdateUrl.value,
      })
      if (updateSourceType.value === 'custom') {
        message.success(t('更新源配置已保存'))
      }
    }
  } catch {
    message.error(t('保存失败'))
  }
}

onMounted(() => {
  initUpdateState()
  bindUpdateEvents()
  initUpdateSource()
  fetchStarCount()
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
    margin-bottom: 24px;
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .about-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
    align-items: start;
  }

  .app-identity-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .logo-wrapper {
      margin-bottom: 20px;
      .app-logo {
        width: 100px;
        height: 100px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }

    .app-info {
      margin-bottom: 32px;
      .app-name {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px 0;
      }
      
      .version-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .version-tag {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .build-time {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }

    .links-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid var(--border-light);
      padding-top: 24px;

      .link-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 14px;
        transition: color 0.2s;
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
        }

        .star-count {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          padding: 1px 6px;
          background: var(--el-fill-color-light);
          border-radius: 10px;
        }
      }

      .copyright {
        margin-top: 12px;
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }

  .settings-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    overflow: hidden;

    .card-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-secondary);

      .header-title {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .header-icon {
          color: var(--text-secondary);
        }

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    .card-content {
      padding: 24px;
    }
  }

  .update-status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .status-text {
      .main-text {
        font-size: 16px;
        font-weight: 500;
        color: var(--text-primary);
        margin: 0 0 4px 0;
      }
      .sub-text {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .action-area {
      .download-progress {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }

  .divider {
    height: 1px;
    background: var(--border-light);
    margin: 0 -24px 24px;
  }

  .update-source-config {
    display: flex;
    align-items: center;
    gap: 24px;

    .config-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      min-width: 60px;
    }

    .config-control {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .custom-url-input {
        max-width: 360px;
      }
    }
  }
}

@media (max-width: 900px) {
  .about-container {
    .about-grid {
      grid-template-columns: 1fr;
    }
    
    .app-identity-card {
      flex-direction: row;
      text-align: left;
      padding: 24px;
      
      .logo-wrapper {
        margin: 0 24px 0 0;
        .app-logo {
          width: 80px;
          height: 80px;
        }
      }
      
      .app-info {
        margin: 0;
        flex: 1;
      }
      
      .links-list {
        width: auto;
        border-top: none;
        padding-top: 0;
        border-left: 1px solid var(--border-light);
        padding-left: 24px;
        align-items: flex-start;
      }
    }
  }
}
</style>
