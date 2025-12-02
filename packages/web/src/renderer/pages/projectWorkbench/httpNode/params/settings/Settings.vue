<template>
  <div class="request-settings">
    <div class="config-list">
      <div class="config-item">
        <div class="config-meta">
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
              class="reset-btn"
              @click="handleReset('maxTextBodySize')"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
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
              class="reset-btn"
              @click="handleReset('maxRawBodySize')"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
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
              class="reset-btn"
              @click="handleReset('userAgent')"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
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
              class="reset-btn"
              @click="handleReset('maxHeaderValueDisplayLength')"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
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
              class="reset-btn"
              @click="handleReset('followRedirect')"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
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
              class="reset-btn"
              @click="handleReset('maxRedirects')"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <div class="meta-text">
            <div class="meta-title">{{ t('Body参数显示顺序') }}</div>
            <div class="meta-hint">{{ t('拖拽调整Body类型的显示顺序') }}</div>
          </div>
        </div>
        <div class="config-control vertical">
          <draggable
            v-model="bodyModeOrder"
            class="mode-order-list"
            item-key="mode"
            :animation="200"
            ghost-class="ghost"
            @end="handleDragEnd"
          >
            <template #item="{ element: mode, index }">
              <div class="mode-order-item">
                <GripVertical :size="16" class="drag-handle" />
                <span class="mode-label">{{ getModeLabel(mode) }}</span>
                <span class="mode-order">{{ index + 1 }}</span>
              </div>
            </template>
          </draggable>
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              class="reset-btn"
              @click="handleResetBodyModeOrder"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <div class="meta-text">
            <div class="meta-title">{{ t('标签页显示顺序') }}</div>
            <div class="meta-hint">{{ t('拖拽调整标签页的显示顺序') }}</div>
          </div>
        </div>
        <div class="config-control vertical">
          <draggable
            v-model="tabOrder"
            class="tab-order-list"
            item-key="tabName"
            :animation="200"
            ghost-class="ghost"
            @end="handleTabOrderDragEnd"
          >
            <template #item="{ element: tabName, index }">
              <div class="tab-order-item">
                <GripVertical :size="16" class="drag-handle" />
                <span class="tab-label">{{ getTabLabel(tabName) }}</span>
                <span class="tab-order">{{ index + 1 }}</span>
              </div>
            </template>
          </draggable>
          <el-tooltip :content="t('恢复默认')" placement="top">
            <el-button
              link
              size="small"
              class="reset-btn"
              @click="handleResetTabOrder"
            >
              {{ t('恢复') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, watch, onMounted, onUnmounted, toRaw, ref } from 'vue'
import { debounce } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { router } from '@/router'
import { useHttpNodeConfig } from '@/store/apidoc/httpNodeConfigStore'
import { generateDefaultHttpNodeConfig } from '@/helper'
import { GripVertical } from 'lucide-vue-next'
import type { HttpNodeBodyMode, HttpNodeTabName } from '@src/types'
import { bodyModeOrderCache } from '@/cache/httpNode/bodyModeOrderCache'
import { tabOrderCache } from '@/cache/httpNode/tabOrderCache'
import draggable from 'vuedraggable'
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
  window.addEventListener('storage', handleStorageChange)
})
// Body Mode 顺序配置
const bodyModeOrder = ref<HttpNodeBodyMode[]>(bodyModeOrderCache.getBodyModeOrder())
// 获取 Mode 显示标签
const getModeLabel = (mode: HttpNodeBodyMode): string => {
  const labels: Record<HttpNodeBodyMode, string> = {
    json: 'JSON',
    formdata: 'Form-Data',
    urlencoded: 'URL-Encoded',
    raw: 'Raw',
    binary: 'Binary',
    none: 'None',
  }
  return labels[mode]
}
// 拖拽结束，保存新顺序
const handleDragEnd = () => {
  bodyModeOrderCache.setBodyModeOrder(bodyModeOrder.value)
}
// 重置为默认顺序
const handleResetBodyModeOrder = () => {
  bodyModeOrderCache.resetBodyModeOrder()
  bodyModeOrder.value = bodyModeOrderCache.getBodyModeOrder()
}
// Tab Order 标签页顺序配置
const tabOrder = ref<HttpNodeTabName[]>(tabOrderCache.getTabOrder())
// 获取标签页显示标签
const getTabLabel = (tabName: HttpNodeTabName): string => {
  const labels: Record<HttpNodeTabName, string> = {
    SParams: 'Params',
    SRequestBody: 'Body',
    SRequestHeaders: t('请求头'),
    SResponseParams: t('返回参数'),
    SPreRequest: t('前置脚本'),
    SAfterRequest: t('后置脚本'),
    SRemarks: t('备注'),
    SSettings: t('设置'),
  }
  return labels[tabName]
}
// 拖拽结束,保存新顺序
const handleTabOrderDragEnd = () => {
  tabOrderCache.setTabOrder(tabOrder.value)
}
// 重置为默认顺序
const handleResetTabOrder = () => {
  tabOrderCache.resetTabOrder()
  tabOrder.value = tabOrderCache.getTabOrder()
}
// 监听storage变化,同步来自Params的顺序更改
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'settings/httpNode/tabOrder') {
    tabOrder.value = tabOrderCache.getTabOrder()
  }
}
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
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
  &.vertical {
    flex-direction: column;
    align-items: flex-start;
  }
}
.control-number {
  width: 240px;
}
.control-text {
  width: 240px;
}
.control-unit {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}
.reset-btn {
  padding: 4px 8px;
  color: var(--gray-500);
  transition: color 0.2s;
}
.reset-btn:hover {
  color: var(--primary-color);
}
.mode-order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 300px;
  margin-bottom: 12px;
}
.mode-order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: var(--gray-100);
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: move;
  transition: all 0.2s;
  user-select: none;
  &:hover {
    background-color: var(--gray-200);
    .drag-handle {
      opacity: 1;
      color: var(--theme-color);
    }
  }
  .drag-handle {
    opacity: 0.3;
    color: var(--gray-500);
    cursor: grab;
    transition: all 0.2s;
    flex-shrink: 0;
    &:active {
      cursor: grabbing;
    }
  }
  .mode-label {
    flex: 1;
    font-size: var(--font-size-sm);
    color: var(--gray-800);
    font-weight: 500;
  }
  .mode-order {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: var(--theme-color);
    color: var(--white);
    border-radius: 50%;
    font-size: var(--font-size-xs);
    font-weight: 600;
  }
}
.ghost {
  opacity: 0.5;
  background-color: var(--theme-color-light);
  border-color: var(--theme-color);
}
.tab-order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 300px;
  margin-bottom: 12px;
}
.tab-order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: var(--gray-100);
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: move;
  transition: all 0.2s;
  user-select: none;
  &:hover {
    background-color: var(--gray-200);
    .drag-handle {
      opacity: 1;
      color: var(--theme-color);
    }
  }
  .drag-handle {
    opacity: 0.3;
    color: var(--gray-500);
    cursor: grab;
    transition: all 0.2s;
    flex-shrink: 0;
    &:active {
      cursor: grabbing;
    }
  }
  .tab-label {
    flex: 1;
    font-size: var(--font-size-sm);
    color: var(--gray-800);
    font-weight: 500;
  }
  .tab-order {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: var(--theme-color);
    color: var(--white);
    border-radius: 50%;
    font-size: var(--font-size-xs);
    font-weight: 600;
  }
}
@media (max-width: 1360px) {
  .config-item {
    grid-template-columns: 360px 1fr;
  }
}
</style>
