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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2';
import { message } from '@/helper'
import { updateAxiosBaseURL } from '@/api/api'

const { t } = useI18n()
const appSettingsStore = useAppSettings()
const localServerUrl = ref(appSettingsStore.serverUrl)

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
</style>
