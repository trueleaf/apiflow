<template>
  <div class="request-settings">
    <div class="config-list">
      <div class="config-item">
        <div class="config-meta">
          <Layers class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">{{ t('文本Body最大大小') }} (MB)</div>
            <div class="meta-hint">{{ t('超过此大小的文本响应将被截断') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-input-number
            v-model="maxTextBodySizeMB"
            :min="minBodySizeMB"
            :max="maxBodySizeMB"
            :precision="2"
            :controls="false"
            size="small"
            class="control-number"
          />
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              :disabled="isTextBodySizeDefault"
              :class="['reset-btn', { 'is-disabled': isTextBodySizeDefault }]"
              @click="handleReset('maxTextBodySize')"
            >
              <RotateCcw :size="16" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <Layers class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">{{ t('原始Body最大大小') }} (MB)</div>
            <div class="meta-hint">{{ t('超过此大小的原始响应将被截断') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-input-number
            v-model="maxRawBodySizeMB"
            :min="minBodySizeMB"
            :max="maxBodySizeMB"
            :precision="2"
            :controls="false"
            size="small"
            class="control-number"
          />
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              :disabled="isRawBodySizeDefault"
              :class="['reset-btn', { 'is-disabled': isRawBodySizeDefault }]"
              @click="handleReset('maxRawBodySize')"
            >
              <RotateCcw :size="16" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <User class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">User-Agent</div>
            <div class="meta-hint">{{ t('自定义请求的User-Agent标识') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-input
            v-model="formData.userAgent"
            size="small"
            class="control-text"
          />
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              :disabled="isUserAgentDefault"
              :class="['reset-btn', { 'is-disabled': isUserAgentDefault }]"
              @click="handleReset('userAgent')"
            >
              <RotateCcw :size="16" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <AlignLeft class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">{{ t('请求头值最大展示长度') }}</div>
            <div class="meta-hint">{{ t('超过此长度的请求头值将折叠显示') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-input-number
            v-model="formData.maxHeaderValueDisplayLength"
            :min="50"
            :max="10000"
            :controls="false"
            size="small"
            class="control-number"
          />
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              :disabled="isMaxHeaderValueDisplayLengthDefault"
              :class="['reset-btn', { 'is-disabled': isMaxHeaderValueDisplayLengthDefault }]"
              @click="handleReset('maxHeaderValueDisplayLength')"
            >
              <RotateCcw :size="16" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <RefreshCw class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">{{ t('自动跟随重定向') }}</div>
            <div class="meta-hint">{{ t('启用后将自动跟随3xx重定向响应') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-switch v-model="formData.followRedirect" size="small" />
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              :disabled="isFollowRedirectDefault"
              :class="['reset-btn', { 'is-disabled': isFollowRedirectDefault }]"
              @click="handleReset('followRedirect')"
            >
              <RotateCcw :size="16" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <Repeat class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">{{ t('最大重定向次数') }}</div>
            <div class="meta-hint">{{ t('防止无限重定向循环') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-input-number
            v-model="formData.maxRedirects"
            :min="0"
            :max="20"
            :controls="false"
            size="small"
            class="control-number"
          />
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              :disabled="isMaxRedirectsDefault"
              :class="['reset-btn', { 'is-disabled': isMaxRedirectsDefault }]"
              @click="handleReset('maxRedirects')"
            >
              <RotateCcw :size="16" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, watch, onMounted, toRaw } from 'vue'
import { debounce } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { AlignLeft, Layers, RefreshCw, Repeat, RotateCcw, User } from 'lucide-vue-next'
import { router } from '@/router'
import { useHttpNodeConfig } from '@/store/apidoc/httpNodeConfigStore'
import { generateDefaultHttpNodeConfig } from '@/helper'
const { t } = useI18n()
const httpNodeConfigStore = useHttpNodeConfig()
const { currentConfig: formData } = storeToRefs(httpNodeConfigStore)
const projectId = computed(() => router.currentRoute.value.query.id as string)
const defaultConfig = generateDefaultHttpNodeConfig()
const BYTES_IN_MEGABYTE = 1024 * 1024
const MIN_BODY_BYTES = 1024
const MAX_BODY_BYTES = 100000000
const minBodySizeMB = MIN_BODY_BYTES / BYTES_IN_MEGABYTE
const maxBodySizeMB = MAX_BODY_BYTES / BYTES_IN_MEGABYTE
type BodySizeKey = 'maxTextBodySize' | 'maxRawBodySize'
const formatBytesToMB = (bytes: number | undefined) => {
  if (!bytes || Number.isNaN(bytes)) {
    return Math.round(minBodySizeMB * 100) / 100
  }
  return Math.round((bytes / BYTES_IN_MEGABYTE) * 100) / 100
}
const updateBodySize = (key: BodySizeKey, value: number) => {
  if (Number.isNaN(value)) {
    return
  }
  const clamped = Math.min(Math.max(value, minBodySizeMB), maxBodySizeMB)
  httpNodeConfigStore.updateCurrentConfig(key, Math.round(clamped * BYTES_IN_MEGABYTE))
}
const maxTextBodySizeMB = computed({
  get: () => formatBytesToMB(formData.value.maxTextBodySize),
  set: (value: number) => {
    updateBodySize('maxTextBodySize', value)
  }
})
const maxRawBodySizeMB = computed({
  get: () => formatBytesToMB(formData.value.maxRawBodySize),
  set: (value: number) => {
    updateBodySize('maxRawBodySize', value)
  }
})
const isTextBodySizeDefault = computed(() => {
  return formData.value.maxTextBodySize === defaultConfig.maxTextBodySize
})
const isRawBodySizeDefault = computed(() => {
  return formData.value.maxRawBodySize === defaultConfig.maxRawBodySize
})
const isUserAgentDefault = computed(() => {
  return formData.value.userAgent === defaultConfig.userAgent
})
const isMaxHeaderValueDisplayLengthDefault = computed(() => {
  return formData.value.maxHeaderValueDisplayLength === defaultConfig.maxHeaderValueDisplayLength
})
const isFollowRedirectDefault = computed(() => {
  return formData.value.followRedirect === defaultConfig.followRedirect
})
const isMaxRedirectsDefault = computed(() => {
  return formData.value.maxRedirects === defaultConfig.maxRedirects
})
const handleReset = (key: keyof typeof defaultConfig) => {
  const defaultValue = defaultConfig[key]
  if (formData.value[key] === defaultValue) {
    return
  }
  httpNodeConfigStore.updateCurrentConfig(key, defaultValue)
}
const saveConfig = debounce(() => {
  if (projectId.value) {
    httpNodeConfigStore.setHttpNodeConfig(projectId.value, toRaw(formData.value))
  }
}, 500)
watch(formData, () => {
  saveConfig()
}, { deep: true })
onMounted(() => {
  if (projectId.value) {
    httpNodeConfigStore.initHttpNodeConfig(projectId.value)
  }
})
</script>
<style lang="scss" scoped>
.config-title {
  font-size: var(--font-size-base);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 16px;
}
.config-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.config-item {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  padding: 5px 0;
  border-bottom: 1px solid var(--gray-200);
}
.config-item:last-child {
  border-bottom: none;
}
.config-meta {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.config-icon {
  width: 20px;
  height: 20px;
  color: var(--gray-600);
  flex-shrink: 0;
}
.meta-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-title {
  font-size: var(--font-size-sm);
  color: var(--gray-800);
  font-weight: 500;
}
.meta-hint {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  line-height: 1.4;
}
.config-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control-number {
  width: 240px;
}
.control-text {
  width: 320px;
}
.control-unit {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}
.reset-btn {
  padding: 4px;
  color: var(--gray-500);
  transition: color 0.2s;
}
.reset-btn:hover:not(.is-disabled) {
  color: var(--primary-color);
}
.reset-btn.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (max-width: 1360px) {
  .config-item {
    grid-template-columns: 360px 1fr;
  }
}
</style>
