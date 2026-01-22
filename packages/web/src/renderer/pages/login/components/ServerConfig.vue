<template>
  <div class="server-config-container">
    <div class="form-item">
      <div class="form-label">
        {{ t('接口调用地址') }}
      </div>
      <el-input
        v-model="localServerUrl"
        :placeholder="t('请输入接口调用地址')"
        clearable
        class="form-input"
      />
    </div>
    <div class="form-actions">
      <el-form-item class="mb-1">
        <el-button type="primary" @click="handleSave" :disabled="!hasChanges" class="w-100">{{ t('保存') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleReset" class="w-100">{{ t('重置') }}</el-button>
      </el-form-item>
    </div>
    <!-- 在线URL配置（仅Electron环境显示） -->
    <template v-if="isElectronEnv">
      <el-divider />
      <div class="form-item">
        <div class="form-label">
          {{ t('在线页面地址') }}
          <span class="form-label-tip">{{ t('配置后将加载远程页面') }}</span>
        </div>
        <el-input
          v-model="localOnlineUrl"
          :placeholder="t('请输入在线页面地址')"
          clearable
          class="form-input"
          :disabled="isCheckingUrl"
        />
        <div v-if="currentOnlineUrl" class="current-online-url">
          {{ t('当前配置') }}: {{ currentOnlineUrl }}
        </div>
      </div>
      <div class="form-actions">
        <el-form-item class="mb-1">
          <el-button
            type="primary"
            @click="handleSaveOnlineUrl"
            :disabled="!localOnlineUrl.trim() || isCheckingUrl"
            :loading="isCheckingUrl"
            class="w-100"
          >
            {{ isCheckingUrl ? t('正在检测') : t('保存并刷新') }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="handleResetOnlineUrl"
            :disabled="!currentOnlineUrl || isCheckingUrl"
            class="w-100"
          >
            {{ t('恢复默认') }}
          </el-button>
        </el-form-item>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2';
import { message } from '@/helper'
import { updateAxiosBaseURL } from '@/api/api'
import { isElectron } from '@/helper'
import { IPC_EVENTS } from '@src/types/ipc'

const { t } = useI18n()
const appSettingsStore = useAppSettings()
const localServerUrl = ref(appSettingsStore.serverUrl)
const isElectronEnv = isElectron()
const localOnlineUrl = ref('')
const currentOnlineUrl = ref('')
const isCheckingUrl = ref(false)

watch(() => appSettingsStore.serverUrl, (newVal) => {
  localServerUrl.value = newVal
})

const hasChanges = computed(() => localServerUrl.value.trim() !== appSettingsStore.serverUrl)

const validateUrl = (url: string): boolean => {
  if (!url.trim()) {
    return false
  }
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}
// 检测URL是否可访问
const checkUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response.type === 'opaque' || response.ok
  } catch {
    return false
  }
}
// 获取当前在线URL配置
const fetchCurrentOnlineUrl = async () => {
  if (!isElectronEnv) return
  try {
    const result = await window.electronAPI?.ipcManager.invoke<unknown, string>(IPC_EVENTS.apiflow.rendererToMain.getOnlineUrl)
    currentOnlineUrl.value = result || ''
  } catch {
    currentOnlineUrl.value = ''
  }
}

const handleSave = () => {
  const trimmedUrl = localServerUrl.value.trim()
  if (!validateUrl(trimmedUrl)) {
    message.warning(t('请输入有效的接口调用地址'))
    return
  }
  appSettingsStore.setServerUrl(trimmedUrl)
  updateAxiosBaseURL(trimmedUrl)
  message.success(t('保存成功'))
}

const handleReset = async () => {
  try {
    await ClConfirm({
      content: t('确认将所有配置恢复为默认值吗？'),
      type: 'warning',
      confirmButtonText: t('确定/ServerConfigReset'),
      cancelButtonText: t('取消'),
    })
  } catch {
    return
  }
  appSettingsStore.resetServerUrl()
  updateAxiosBaseURL(appSettingsStore.serverUrl)
  localServerUrl.value = appSettingsStore.serverUrl
  message.success(t('重置成功'))
}
// 保存在线URL
const handleSaveOnlineUrl = async () => {
  const trimmedUrl = localOnlineUrl.value.trim()
  if (!validateUrl(trimmedUrl)) {
    message.warning(t('请输入有效的在线页面地址'))
    return
  }
  isCheckingUrl.value = true
  try {
    const isAccessible = await checkUrlAccessible(trimmedUrl)
    if (!isAccessible) {
      message.warning(t('无法访问该地址，请检查URL是否正确'))
      return
    }
    await window.electronAPI?.ipcManager.invoke(IPC_EVENTS.apiflow.rendererToMain.setOnlineUrl, trimmedUrl)
    message.success(t('配置已保存，即将刷新应用'))
  } catch {
    message.error(t('保存失败'))
  } finally {
    isCheckingUrl.value = false
  }
}
// 恢复默认（清除在线URL配置）
const handleResetOnlineUrl = async () => {
  try {
    await ClConfirm({
      content: t('确认恢复为默认本地页面吗？'),
      type: 'warning',
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
    })
  } catch {
    return
  }
  try {
    await window.electronAPI?.ipcManager.invoke(IPC_EVENTS.apiflow.rendererToMain.setOnlineUrl, '')
    message.success(t('配置已重置，即将刷新应用'))
  } catch {
    message.error(t('重置失败'))
  }
}

onMounted(() => {
  fetchCurrentOnlineUrl()
})
</script>

<style lang="scss" scoped>
.form-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.form-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-label-tip {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 400;
}
.label-icon {
  color: var(--text-primary);
  flex-shrink: 0;
}
.form-input {
  width: 100%;
}
.form-actions {
  display: block;
}
.current-online-url {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
  word-break: break-all;
}
</style>
