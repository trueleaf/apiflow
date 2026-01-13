<template>
  <div class="update-card">
    <div class="card-header">
      <h3>{{ t('软件更新') }}</h3>
    </div>

    <div class="card-body">
      <!-- 状态显示区域 -->
      <div class="status-section">
        <!-- 空闲状态 -->
        <div v-if="status === 'idle'" class="status-idle">
          <el-button type="primary" @click="handleCheckUpdate" :loading="false">
            <RefreshCw :size="16" />
            {{ t('检查更新') }}
          </el-button>
        </div>

        <!-- 检查更新中 -->
        <div v-else-if="status === 'checking'" class="status-checking">
          <el-progress :percentage="100" :indeterminate="true" />
          <p class="status-text">{{ t('正在检查更新') }}</p>
        </div>

        <!-- 发现新版本 -->
        <div v-else-if="status === 'available'" class="status-available">
          <div class="update-info">
            <div class="info-title">
              <Sparkles :size="20" class="icon-sparkles" />
              <span>{{ t('发现新版本') }} v{{ updateInfo?.version }}</span>
            </div>
            <div class="info-detail" v-if="updateInfo">
              <div class="info-row" v-if="updateInfo.releaseDate">
                <span class="info-label">{{ t('发布日期') }}：</span>
                <span>{{ formatDate(updateInfo.releaseDate, 'YYYY-MM-DD') }}</span>
              </div>
              <div class="info-row" v-if="updateInfo.releaseNotes">
                <span class="info-label">{{ t('更新内容') }}：</span>
                <div class="release-notes" v-html="updateInfo.releaseNotes"></div>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="handleDownloadUpdate">
              {{ t('立即下载') }}
            </el-button>
            <el-button @click="status = 'idle'">
              {{ t('暂不更新') }}
            </el-button>
          </div>
        </div>

        <!-- 下载中 -->
        <div v-else-if="status === 'downloading'" class="status-downloading">
          <el-progress :percentage="downloadProgress.percent" />
          <div class="download-info">
            <p>{{ t('正在下载更新') }}</p>
            <div class="download-details">
              <span>{{ t('已下载') }}：{{ formatUnit(downloadProgress.transferred, 'bytes') }} / {{ formatUnit(downloadProgress.total, 'bytes') }}</span>
              <span>{{ t('下载速度') }}：{{ formatUnit(downloadProgress.bytesPerSecond, 'bytes') }}/s</span>
            </div>
          </div>
          <div class="action-buttons">
            <el-button size="small" @click="handlePauseDownload">
              {{ t('暂停') }}
            </el-button>
            <el-button size="small" @click="handleCancelDownload">
              {{ t('取消下载') }}
            </el-button>
          </div>
        </div>

        <!-- 下载已暂停 -->
        <div v-else-if="status === 'paused'" class="status-paused">
          <el-progress :percentage="downloadProgress.percent" />
          <div class="download-info">
            <p>{{ t('下载已暂停') }}</p>
            <div class="download-details">
              <span>{{ t('已下载') }}：{{ formatUnit(downloadProgress.transferred, 'bytes') }} / {{ formatUnit(downloadProgress.total, 'bytes') }}</span>
              <span>{{ t('完成度') }}：{{ downloadProgress.percent }}%</span>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleResumeDownload">
              {{ t('继续下载') }}
            </el-button>
            <el-button size="small" @click="handleCancelDownload">
              {{ t('取消下载') }}
            </el-button>
          </div>
        </div>

        <!-- 下载完成 -->
        <div v-else-if="status === 'downloaded'" class="status-downloaded">
          <div class="success-info">
            <CheckCircle :size="24" class="icon-success" />
            <p>{{ t('下载完成') }}</p>
            <p class="tip">{{ t('准备安装') }} v{{ updateInfo?.version }}</p>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="handleInstallUpdate">
              {{ t('立即安装') }}
            </el-button>
            <el-button @click="status = 'idle'">
              {{ t('稍后提醒') }}
            </el-button>
          </div>
          <p class="install-tip">{{ t('应用将在安装后自动重启') }}</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="status === 'error'" class="status-error">
          <div class="error-info">
            <XCircle :size="24" class="icon-error" />
            <p class="error-title">{{ t('检查更新失败') }}</p>
            <div class="error-detail" v-if="errorInfo">
              <p><span class="error-label">{{ t('错误原因') }}：</span>{{ errorInfo.message }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="handleCheckUpdate">
              {{ t('重新检查') }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 更新源配置 -->
      <div class="update-source-config">
        <h4 class="section-title">{{ t('更新源配置') }}</h4>
        
        <el-radio-group v-model="settings.source" @change="handleSourceChange" class="source-radio-group">
          <el-radio value="github">{{ t('GitHub源') }}</el-radio>
          <el-radio value="custom">{{ t('自定义源') }}</el-radio>
        </el-radio-group>

        <div class="source-inputs">
          <div v-if="settings.source === 'github'" class="input-group">
            <label class="input-label">{{ t('GitHub源') }}:</label>
            <el-input
              :model-value="'https://github.com/trueleaf/apiflow'"
              disabled
              class="source-input"
            />
          </div>

          <div v-if="settings.source === 'custom'" class="input-group">
            <label class="input-label">{{ t('自定义源') }}:</label>
            <el-input
              v-model="settings.customUrl"
              :placeholder="t('请输入更新源URL')"
              @blur="handleCustomUrlChange"
              class="source-input"
            >
              <template #append>
                <el-button 
                  @click="handleTestConnection" 
                  :loading="testConnectionLoadinng"
                >
                  {{ t('测试连接') }}
                </el-button>
              </template>
            </el-input>
            <p class="input-tip">{{ t('例如') }}：https://example.com/updates</p>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 启动时自动检查更新 -->
      <div class="auto-check-section">
        <el-checkbox v-model="settings.autoCheck" @change="handleAutoCheckChange">
          {{ t('启动时自动检查更新') }}
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { RefreshCw, Sparkles, CheckCircle, XCircle } from 'lucide-vue-next'
import { appStateCache } from '@/cache/appState/appStateCache'
import { formatUnit, formatDate } from '@/helper'
import { UPDATE_IPC_EVENTS } from '@src/types/ipc/update'
import type { UpdateInfo, UpdateProgress, UpdateError, UpdateSettings, UpdateStatus, DownloadTask } from '@src/types/update'

const { t } = useI18n()
const status = ref<UpdateStatus>('idle')
const updateInfo = ref<UpdateInfo | null>(null)
const downloadProgress = reactive<UpdateProgress>({
  percent: 0,
  bytesPerSecond: 0,
  transferred: 0,
  total: 0,
})
const errorInfo = ref<UpdateError | null>(null)
const settings = reactive<UpdateSettings>({
  autoCheck: false,
  source: 'github',
  customUrl: '',
})
const testConnectionLoadinng = ref(false)
/*
|--------------------------------------------------------------------------
| 更新相关方法
|--------------------------------------------------------------------------
*/
// 检查更新
const handleCheckUpdate = async () => {
  status.value = 'checking'
  errorInfo.value = null
  
  try {
    const result = await window.electronAPI?.updateManager.checkForUpdates();
    if (result?.code !== 0) {
      status.value = 'error'
      errorInfo.value = {
        message: result?.msg || t('检查更新失败'),
      }
    }
    // 状态会通过IPC事件更新
  } catch (error) {
    status.value = 'error'
    errorInfo.value = {
      message: error instanceof Error ? error.message : t('检查更新失败'),
    }
  }
}
// 下载更新
const handleDownloadUpdate = async () => {
  status.value = 'downloading'
  
  try {
    const result = await window.electronAPI?.updateManager.downloadUpdate()
    if (result?.code !== 0) {
      ElMessage.error(result?.msg || t('下载失败'))
      status.value = 'available'
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('下载失败'))
    status.value = 'available'
  }
}
// 取消下载
const handleCancelDownload = async () => {
  await window.electronAPI?.updateManager.cancelDownload()
  status.value = 'idle'
}
// 暂停下载
const handlePauseDownload = async () => {
  try {
    const result = await window.electronAPI?.updateManager.pauseDownload()
    if (result?.code === 0) {
      status.value = 'paused'
    } else {
      ElMessage.error(result?.msg || t('暂停失败'))
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('暂停失败'))
  }
}
// 恢复下载
const handleResumeDownload = async () => {
  try {
    const result = await window.electronAPI?.updateManager.resumeDownload()
    if (result?.code === 0) {
      status.value = 'downloading'
    } else {
      ElMessage.error(result?.msg || t('恢复失败'))
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('恢复失败'))
  }
}
// 安装更新
const handleInstallUpdate = async () => {
  await window.electronAPI?.updateManager.quitAndInstall()
}
// 自动检查更新开关变化
const handleAutoCheckChange = (value: boolean | string | number) => {
  const boolValue = Boolean(value)
  appStateCache.setAutoCheckUpdate(boolValue)
  window.electronAPI?.updateManager.setAutoCheck(boolValue)
}
// 更新源变化
const handleSourceChange = (value: string | number | boolean | undefined) => {
  const sourceValue = value as 'github' | 'custom'
  appStateCache.setUpdateSource(sourceValue)
  window.electronAPI?.updateManager.setUpdateSource(
    sourceValue,
    sourceValue === 'custom' ? settings.customUrl : undefined
  )
}
// 自定义URL变化
const handleCustomUrlChange = () => {
  if (settings.source === 'custom') {
    appStateCache.setCustomUpdateUrl(settings.customUrl)
    window.electronAPI?.updateManager.setUpdateSource(
      'custom',
      settings.customUrl
    )
  }
}
// 测试连接
const handleTestConnection = async () => {
  if (!settings.customUrl) {
    ElMessage.warning(t('请输入更新源URL'))
    return
  }

  testConnectionLoadinng.value = true
  try {
    const result = await window.electronAPI?.updateManager.testConnection(
      settings.customUrl
    )
    if (result?.code === 0) {
      ElMessage.success(t('连接成功'))
    } else {
      ElMessage.error(`${t('连接失败')}: ${result?.msg}`)
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('连接失败'))
  } finally {
    testConnectionLoadinng.value = false
  }
}
// 监听IPC事件
const initIPCListeners = () => {
  // 正在检查更新
  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.checkingForUpdate, () => {
    status.value = 'checking'
  })

  // 发现新版本
  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.updateAvailable, (data: UpdateInfo) => {
    status.value = 'available';
    updateInfo.value = data
  })

  // 已是最新版本
  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.updateNotAvailable, () => {
    status.value = 'idle'
    ElMessage.success(t('已是最新版本'))
  })

  // 下载进度
  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.downloadProgress, (data: UpdateProgress) => {
    Object.assign(downloadProgress, data)
  })

  // 下载完成
  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.updateDownloaded, () => {
    status.value = 'downloaded'
  })

  // 下载状态变化
  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.downloadStateChanged, (data: { state: string; error?: string }) => {
    if (data.state === 'downloading') {
      status.value = 'downloading'
    } else if (data.state === 'paused') {
      status.value = 'paused'
    } else if (data.state === 'cancelled') {
      status.value = 'idle'
    } else if (data.state === 'completed') {
      status.value = 'downloaded'
    } else if (data.state === 'error') {
      status.value = 'error'
      errorInfo.value = {
        message: data.error || t('下载失败'),
      }
    }
  })

  // 错误
  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.error, (data: UpdateError) => {
    status.value = 'error'
    errorInfo.value = data
  })
}

// 组件挂载
onMounted(async () => {
  const cachedSettings = appStateCache.getUpdateSettings()
  Object.assign(settings, cachedSettings);
  // 同步配置到主进程，需要转换为普通对象
  window.electronAPI?.updateManager.syncSettings({
    autoCheck: settings.autoCheck,
    source: settings.source,
    customUrl: settings.customUrl,
  })
  initIPCListeners()
  await restoreDownloadState()
})

// 恢复下载状态
const restoreDownloadState = async () => {
  try {
    const result = await window.electronAPI?.updateManager.getDownloadState()
    if (result?.code === 0 && result.data) {
      const taskState = result.data as DownloadTask
      if (taskState.state === 'downloading') {
        status.value = 'downloading'
        Object.assign(downloadProgress, taskState.progress)
      } else if (taskState.state === 'paused') {
        status.value = 'paused'
        Object.assign(downloadProgress, taskState.progress)
      } else if (taskState.state === 'completed') {
        status.value = 'downloaded'
        Object.assign(downloadProgress, { ...taskState.progress, percent: 100 })
      }
      console.log('[UpdateCard] 恢复下载状态:', taskState.state)
    }
  } catch (error) {
    console.warn('[UpdateCard] 恢复下载状态失败:', error)
  }
}

// 组件卸载
onUnmounted(() => {
  window.electronAPI?.ipcManager.removeListener(UPDATE_IPC_EVENTS.checkingForUpdate)
  window.electronAPI?.ipcManager.removeListener(UPDATE_IPC_EVENTS.updateAvailable)
  window.electronAPI?.ipcManager.removeListener(UPDATE_IPC_EVENTS.updateNotAvailable)
  window.electronAPI?.ipcManager.removeListener(UPDATE_IPC_EVENTS.downloadProgress)
  window.electronAPI?.ipcManager.removeListener(UPDATE_IPC_EVENTS.updateDownloaded)
  window.electronAPI?.ipcManager.removeListener(UPDATE_IPC_EVENTS.downloadStateChanged)
  window.electronAPI?.ipcManager.removeListener(UPDATE_IPC_EVENTS.error)
})
</script>

<style lang="scss" scoped>
.update-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  overflow: hidden;

  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light);
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .card-body {
    padding: 20px;
  }

  .status-section {
    .status-idle {
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }

    .status-checking {
      text-align: center;
      padding: 20px 0;
      
      .status-text {
        margin-top: 12px;
        color: var(--text-secondary);
        font-size: 14px;
      }
    }

    .status-available {
      .update-info {
        background: var(--el-fill-color-light);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        
        .info-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-color-primary);
          margin-bottom: 12px;
          
          .icon-sparkles {
            color: var(--el-color-warning);
          }
        }
        
        .info-detail {
          .info-row {
            margin-bottom: 8px;
            font-size: 13px;
            color: var(--text-secondary);
            
            .info-label {
              font-weight: 500;
              color: var(--text-primary);
            }
            
            .release-notes {
              margin-top: 4px;
              padding: 8px;
              background: var(--bg-primary);
              border-radius: 4px;
              line-height: 1.6;
              max-height: 300px;
              overflow-y: auto;
              :deep(p) {
                margin: 0 0 8px 0;
                &:last-child {
                  margin-bottom: 0;
                }
              }
              :deep(ul), :deep(ol) {
                margin: 8px 0;
                padding-left: 20px;
              }
              :deep(li) {
                margin-bottom: 4px;
              }
              :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
                margin: 12px 0 8px 0;
                font-weight: 600;
                &:first-child {
                  margin-top: 0;
                }
              }
              :deep(code) {
                padding: 2px 4px;
                background: var(--el-fill-color-darker);
                border-radius: 3px;
                font-size: 0.9em;
              }
              :deep(pre) {
                padding: 8px;
                background: var(--el-fill-color-darker);
                border-radius: 4px;
                overflow-x: auto;
                code {
                  padding: 0;
                  background: transparent;
                }
              }
              :deep(a) {
                color: var(--el-color-primary);
                text-decoration: none;
                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }

    .status-downloading {
      text-align: center;
      
      .download-info {
        margin: 16px 0;
        
        p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--text-primary);
        }
        
        .download-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: 12px;
      }
    }

    .status-paused {
      text-align: center;
      
      .download-info {
        margin: 16px 0;
        
        p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--el-color-warning);
          font-weight: 500;
        }
        
        .download-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: 12px;
      }
    }

    .status-downloaded {
      text-align: center;
      
      .success-info {
        margin-bottom: 16px;
        
        .icon-success {
          color: var(--el-color-success);
          margin-bottom: 8px;
        }
        
        p {
          margin: 4px 0;
          font-size: 14px;
          color: var(--text-primary);
        }
        
        .tip {
          color: var(--text-secondary);
          font-size: 13px;
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-bottom: 12px;
      }
      
      .install-tip {
        font-size: 12px;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .status-error {
      .error-info {
        background: var(--el-color-error-light-9);
        border: 1px solid var(--el-color-error-light-7);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        text-align: center;
        
        .icon-error {
          color: var(--el-color-error);
          margin-bottom: 8px;
        }
        
        .error-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 8px 0;
        }
        
        .error-detail {
          text-align: left;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 12px;
          
          p {
            margin: 4px 0;
          }
          
          .error-label {
            font-weight: 500;
            color: var(--text-primary);
          }
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
  }

  .divider {
    height: 1px;
    background: var(--border-light);
    margin: 20px 0;
  }

  .update-source-config {
    .section-title {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .source-radio-group {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;

      :deep(.el-radio) {
        margin-right: 0;
      }
    }

    .source-inputs {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .input-label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .source-input {
          width: 100%;
        }

        .input-tip {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }
      }
    }
  }

  .auto-check-section {
    padding: 4px 0;
  }
}
</style>
