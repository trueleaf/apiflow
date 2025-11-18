<template>
  <div class="request-settings">
    <div class="config-list">
      {{ formData }}
      <div class="config-item">
        <div class="config-meta">
          <Layers class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">{{ t('文本Body最大大小') }} (bytes)</div>
            <div class="meta-hint">{{ t('超过此大小的文本响应将被截断') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-input-number
            v-model="formData.maxTextBodySize"
            :min="1024"
            :max="100000000"
            :controls="false"
            class="control-number"
          />
        </div>
      </div>
      <div class="config-item">
        <div class="config-meta">
          <Layers class="config-icon" />
          <div class="meta-text">
            <div class="meta-title">{{ t('原始Body最大大小') }} (bytes)</div>
            <div class="meta-hint">{{ t('超过此大小的原始响应将被截断') }}</div>
          </div>
        </div>
        <div class="config-control">
          <el-input-number
            v-model="formData.maxRawBodySize"
            :min="1024"
            :max="100000000"
            :controls="false"
            class="control-number"
          />
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
            class="control-text"
          />
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
            class="control-number"
          />
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
          <el-switch v-model="formData.followRedirect" />
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
            class="control-number"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { AlignLeft, Layers, RefreshCw, Repeat, User } from 'lucide-vue-next'
import { router } from '@/router'
import { useHttpNodeConfig } from '@/store/apidoc/httpNodeConfigStore'
const { t } = useI18n()
const httpNodeConfigStore = useHttpNodeConfig()
const projectId = computed(() => router.currentRoute.value.query.id as string)
const formData = computed(() => httpNodeConfigStore.currentConfig)
const saveConfig = debounce(() => {
  if (projectId.value) {
    httpNodeConfigStore.setHttpNodeConfig(projectId.value, formData.value)
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
.request-settings {
}
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
  padding: 16px 0;
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
}
.control-number {
  width: 240px;
}
.control-text {
  width: 320px;
}
@media (max-width: 1360px) {
  .config-item {
    grid-template-columns: 360px 1fr;
  }
}
</style>
