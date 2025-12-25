<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ t('API Provider 配置') }}</h3>
        <p>{{ t('配置大语言模型服务提供商') }}</p>
      </div>
    </div>
    <div class="panel-body">
      <div class="form-block">
        <div class="form-grid">
          <div class="form-item full-row">
            <div class="form-label">
              {{ t('API Provider') }}
            </div>
            <el-select v-model="providerType" class="form-input" @change="handleProviderChange">
              <el-option label="DeepSeek" value="DeepSeek" />
              <el-option label="OpenAI Compatible" value="OpenAICompatible" />
            </el-select>
          </div>

          <template v-if="providerType === 'DeepSeek'">
            <div class="form-item">
              <div class="form-label">
                {{ t('API Key') }}
              </div>
              <el-input v-model="localApiKey" :type="showApiKey ? 'text' : 'password'"
                :placeholder="t('请输入 DeepSeek API Key')" clearable class="form-input">
                <template #suffix>
                  <span class="password-toggle" @click="showApiKey = !showApiKey">
                    {{ showApiKey ? t('隐藏') : t('显示') }}
                  </span>
                </template>
              </el-input>
            </div>
            <div class="form-item">
              <div class="form-label">
                {{ t('Model') }}
              </div>
              <el-select v-model="localModel" class="form-input">
                <el-option label="deepseek-chat" value="deepseek-chat" />
                <el-option label="deepseek-reasoner" value="deepseek-reasoner" />
              </el-select>
            </div>
          </template>

          <template v-else>
            <div class="form-item full-row">
              <div class="form-label">
                {{ t('Base URL') }}
              </div>
              <el-input v-model="localBaseURL" :placeholder="t('请输入 API Base URL')" clearable class="form-input" />
            </div>
            <div class="form-item">
              <div class="form-label">
                {{ t('API Key') }}
              </div>
              <el-input v-model="localApiKey" :type="showApiKey ? 'text' : 'password'" :placeholder="t('请输入 API Key')"
                clearable class="form-input">
                <template #suffix>
                  <span class="password-toggle" @click="showApiKey = !showApiKey">
                    {{ showApiKey ? t('隐藏') : t('显示') }}
                  </span>
                </template>
              </el-input>
            </div>
            <div class="form-item">
              <div class="form-label">
                {{ t('Model ID') }}
              </div>
              <el-input v-model="localModel" :placeholder="t('请输入模型 ID')" clearable class="form-input" />
            </div>

            <div class="form-item full-row">
              <div class="form-label">
                {{ t('Custom Headers') }}
                <span class="label-hint">{{ t('(可选)') }}</span>
              </div>
              <div class="custom-headers">
                <div v-for="(header, index) in localCustomHeaders" :key="index" class="header-row">
                  <el-input v-model="header.key" :placeholder="t('Header Key')" class="header-key" />
                  <el-input v-model="header.value" :placeholder="t('Header Value')" class="header-value" />
                  <el-button type="danger" text class="header-remove" @click="removeHeader(index)">
                    {{ t('删除') }}
                  </el-button>
                </div>
                <el-button type="primary" text class="add-header-btn" @click="addHeader">
                  {{ t('添加请求头') }}
                </el-button>
              </div>
            </div>
          </template>
          <div class="form-item full-row">
            <div class="form-label">
              {{ t('额外请求体') }}
              <span class="label-hint">{{ t('(可选)') }}</span>
            </div>
            <div class="extra-body-editor">
              <SJsonEditor
                v-model="localExtraBody"
                :auto-height="true"
                :max-height="260"
                :min-height="140"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-actions">
      <el-button type="primary" :loading="isLoading && !isStreaming" :disabled="!isConfigValid" @click="$emit('send')">
        {{ isLoading && !isStreaming ? t('发送中...') : t('发送') }}
      </el-button>
      <el-button type="primary" :loading="isStreaming" :disabled="!isConfigValid" @click="$emit('streamSend')">
        {{ isStreaming ? t('接收中...') : t('流式发送') }}
      </el-button>
      <el-button v-if="isLoading" type="danger" @click="$emit('cancel')">
            {{ t('取消') }}
          </el-button>
      <el-button @click="handleReset">
        {{ t('重置') }}
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import type { LLMProviderType, CustomHeader } from '@src/types/ai/agent.type'
import { message } from '@/helper'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'

defineProps<{
  isLoading: boolean
  isStreaming: boolean
}>()

defineEmits<{
  send: []
  streamSend: []
  cancel: []
}>()

const { t } = useI18n()
const llmClientStore = useLLMClientStore()

const providerType = ref<LLMProviderType>('DeepSeek')
const localApiKey = ref('')
const localBaseURL = ref('')
const localModel = ref('')
const localCustomHeaders = ref<CustomHeader[]>([])
const localExtraBody = ref('')
const showApiKey = ref(false)
// 判断配置是否有效
const isConfigValid = computed(() => {
  const hasApiKey = localApiKey.value.trim() !== ''
  if (providerType.value === 'OpenAICompatible') {
    return hasApiKey && localBaseURL.value.trim() !== '' && localModel.value.trim() !== ''
  }
  return hasApiKey && localModel.value.trim() !== ''
})
// 标记是否正在从 store 同步数据
let isSyncingFromStore = false
// 自动保存函数（防抖 300ms）
const autoSave = useDebounceFn(() => {
  if (isSyncingFromStore) return
  if (!isConfigValid.value) return
  const validHeaders = localCustomHeaders.value.filter(h => h.key.trim() !== '')
  llmClientStore.updateLLMConfig({
    provider: providerType.value,
    apiKey: localApiKey.value,
    baseURL: providerType.value === 'DeepSeek' ? 'https://api.deepseek.com/chat/completions' : localBaseURL.value,
    model: localModel.value,
    customHeaders: validHeaders,
    extraBody: localExtraBody.value,
  })
}, 300)
// 从 store 同步数据到本地状态
const syncFromStore = () => {
  isSyncingFromStore = true
  const provider = llmClientStore.LLMConfig
  providerType.value = provider.provider
  localApiKey.value = provider.apiKey
  localBaseURL.value = provider.baseURL
  localModel.value = provider.model
  localCustomHeaders.value = [...provider.customHeaders.map(h => ({ ...h }))]
  localExtraBody.value = provider.extraBody
  nextTick(() => {
    isSyncingFromStore = false
  })
}
// 处理 Provider 类型变更
const handleProviderChange = (type: LLMProviderType) => {
  if (type === 'DeepSeek') {
    llmClientStore.updateLLMConfig({
      provider: type,
      baseURL: 'https://api.deepseek.com/chat/completions',
      model: 'deepseek-chat',
      customHeaders: []
    })
  } else {
    llmClientStore.updateLLMConfig({
      provider: type,
      baseURL: '',
      model: ''
    })
  }
  syncFromStore()
}
// 添加自定义请求头
const addHeader = () => {
  localCustomHeaders.value.push({ key: '', value: '' })
}
// 删除自定义请求头
const removeHeader = (index: number) => {
  localCustomHeaders.value.splice(index, 1)
}
// 重置配置
const handleReset = () => {
  llmClientStore.resetLLMConfig()
  syncFromStore()
  message.success(t('配置已重置'))
}
// 监听配置变化，自动保存
watch([providerType, localApiKey, localBaseURL, localModel, localCustomHeaders, localExtraBody], () => {
  autoSave()
}, { deep: true })
// 监听 store 变化（禁用深度监听，避免循环触发）
watch(() => llmClientStore.LLMConfig, () => {
  syncFromStore()
})

onMounted(() => {
  syncFromStore()
})
</script>

<style lang="scss" scoped>
.panel {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--shadow-light);
  padding: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
  flex: 1;
  overflow-y: auto;
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

  &.full-row {
    grid-column: span 2;
  }
}

.form-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  .label-hint {
    color: var(--text-tertiary);
    font-weight: 400;
    font-size: 12px;
  }
}

.form-input {
  width: 100%;
}

.password-toggle {
  cursor: pointer;
  color: var(--text-tertiary);
  transition: color 0.2s;

  &:hover {
    color: var(--text-primary);
  }
}

.custom-headers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-key {
  flex: 1;
}

.header-value {
  flex: 2;
}

.header-remove {
  flex-shrink: 0;
  padding: 8px;
}

.add-header-btn {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 4px;
}
.extra-body-editor {
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}
</style>
