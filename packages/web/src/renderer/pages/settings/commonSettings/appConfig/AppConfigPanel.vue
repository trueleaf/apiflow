<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ t('应用配置') }}</h3>
        <p>{{ t('自定义应用品牌与主题') }}</p>
      </div>
    </div>
    <div class="panel-body">
      <div class="media-block">
        <div
          class="image-container logo-container"
          :class="{ 'is-hover': isLogoHover }"
          @mouseenter="isLogoHover = true"
          @mouseleave="isLogoHover = false"
          @click="triggerLogoUpload"
        >
          <img 
            :src="appSettingsStore.appLogo" 
            :alt="t('应用Logo')" 
            class="image-preview"
          >
          <div class="image-overlay" v-if="isLogoHover || isLogoUploading">
            <div v-if="isLogoUploading" class="loading-indicator">
              <span class="loading-spinner"></span>
            </div>
            <div v-else class="overlay-text">
              {{ t('点击更换') }}
            </div>
          </div>
        </div>
        <el-upload
          class="upload-proxy"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleLogoChange"
          accept="image/jpeg,image/jpg,image/png,image/gif"
        >
          <template #trigger>
            <button ref="logoTrigger"></button>
          </template>
        </el-upload>
      </div>

      <div class="form-block">
        <div class="form-grid">
          <div class="form-item">
            <div class="form-label">
              <AppWindow :size="18" class="label-icon" />
              {{ t('应用名称') }}
            </div>
            <el-input
              v-model="localAppTitle"
              :placeholder="t('请输入应用名称')"
              clearable
              class="form-input"
            />
          </div>

          <div class="form-item">
            <div class="form-label">
              <Palette :size="18" class="label-icon" />
              {{ t('应用主题') }}
            </div>
            <div class="theme-placeholder" aria-disabled="true">
              <el-radio-group v-model="localAppTheme" class="theme-radio-group" :disabled="true">
                <el-radio value="light" class="theme-radio" :disabled="true">{{ t('浅色') }}</el-radio>
                <el-radio value="dark" class="theme-radio" :disabled="true">{{ t('深色') }}</el-radio>
                <el-radio value="auto" class="theme-radio" :disabled="true">{{ t('跟随系统') }}</el-radio>
              </el-radio-group>
              <div class="coming-soon">{{ t('敬请期待') }}</div>
            </div>
          </div>

          <div class="form-item form-item-full">
            <div class="form-label">
              <Globe :size="18" class="label-icon" />
              {{ t('接口调用地址') }}
            </div>
            <el-input
              v-model="localServerUrl"
              :placeholder="t('请输入接口调用地址')"
              clearable
              class="form-input"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="panel-actions">
      <el-button @click="handleReset">
        {{ t('重置') }}
      </el-button>
      <el-button type="primary" @click="handleSave" :disabled="!hasChanges">
        {{ t('保存') }}
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import { processImageUpload } from '@/utils/imageHelper'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { AppWindow, Palette, Globe } from 'lucide-vue-next'
import type { UploadFile } from 'element-plus'
import type { AppTheme } from '@src/types'
import { message } from '@/helper'
import { updateAxiosBaseURL } from '@/api/api'

const { t } = useI18n()
const appSettingsStore = useAppSettings()
const isLogoHover = ref(false)
const isLogoUploading = ref(false)
const logoTrigger = ref()
const localAppTitle = ref(appSettingsStore.appTitle)
const localAppTheme = ref<AppTheme>(appSettingsStore.appTheme)
const localServerUrl = ref(appSettingsStore.serverUrl)
const hasChanges = computed(() => {
  return localAppTitle.value.trim() !== appSettingsStore.appTitle ||
    localAppTheme.value !== appSettingsStore.appTheme ||
    localServerUrl.value.trim() !== appSettingsStore.serverUrl
})
watch(() => appSettingsStore.appTitle, (newVal) => {
  localAppTitle.value = newVal
})
watch(() => appSettingsStore.appTheme, (newVal) => {
  localAppTheme.value = newVal
})
watch(() => appSettingsStore.serverUrl, (newVal) => {
  localServerUrl.value = newVal
})
const triggerLogoUpload = () => {
  logoTrigger.value?.click()
}
const handleLogoChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    message.warning(t('请选择图片文件'))
    return
  }
  isLogoUploading.value = true
  const result = await processImageUpload(uploadFile.raw, 'logo')
  isLogoUploading.value = false
  if (result.success && result.data) {
    appSettingsStore.setAppLogo(result.data)
  } else {
    message.error(result.message || t('图片上传失败'))
  }
}
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
const handleSave = () => {
  const trimmedTitle = localAppTitle.value.trim()
  const trimmedUrl = localServerUrl.value.trim()
  if (!trimmedTitle) {
    message.warning(t('应用名称不能为空'))
    return
  }
  if (!validateUrl(trimmedUrl)) {
    message.warning(t('请输入有效的接口调用地址'))
    return
  }
  appSettingsStore.setAppTitle(trimmedTitle)
  appSettingsStore.setAppTheme(localAppTheme.value)
  appSettingsStore.setServerUrl(trimmedUrl)
  updateAxiosBaseURL(trimmedUrl)
  message.success(t('保存成功'))
}
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      t('确认将所有配置恢复为默认值吗？'),
      {
        type: 'warning',
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
      }
    )
  } catch {
    return
  }
  appSettingsStore.resetAllSettings()
  updateAxiosBaseURL(appSettingsStore.serverUrl)
  message.success(t('重置成功'))
}
</script>

<style lang="scss" scoped>
.panel {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--shadow-light);
  padding: 32px;
  margin-bottom: 32px;
}

.panel-header {
  margin-bottom: 24px;

  h3 {
    margin: 0 0 6px;
    font-size: 20px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.panel-body {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.media-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.form-block {
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.form-item-full {
    grid-column: 1 / -1;
  }
}

.form-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  .label-icon {
    color: var(--text-primary);
    flex-shrink: 0;
  }
}

.form-input {
  width: 100%;
}

.theme-radio-group {
  display: flex;
  gap: 16px;
}
.theme-placeholder {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.coming-soon {
  color: var(--text-secondary);
  font-size: 12px;
  margin-left: 4px;
}

.image-container {
  width: 150px;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  position: relative;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: var(--border-dark);
  }

  .image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: var(--bg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;

    .overlay-text {
      color: var(--text-inverse);
      font-size: 14px;
      font-weight: 500;
    }

    .loading-indicator {
      .loading-spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 3px solid var(--el-overlay-color-lighter);
        border-top-color: var(--text-inverse);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }
  }
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.upload-proxy {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
