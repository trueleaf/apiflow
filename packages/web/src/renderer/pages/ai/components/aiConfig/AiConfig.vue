<template>
  <div class="ai-config-view">
    <div class="ai-config-header">
      <button class="ai-back-btn" type="button" @click="emit('back')">
        <ArrowLeft :size="16" />
        <span>{{ t('返回') }}</span>
      </button>
    </div>
    <div class="ai-config-content">
      <div class="config-form">
        <div class="form-item">
          <div class="form-label">{{ t('API Provider') }}</div>
          <el-select v-model="providerType" class="form-input" @change="handleProviderChange">
            <el-option label="DeepSeek" value="DeepSeek" />
            <el-option label="OpenAI Compatible" value="OpenAICompatible" />
          </el-select>
        </div>

        <template v-if="providerType === 'DeepSeek'">
          <div class="form-item">
            <div class="form-label">{{ t('API Key') }}</div>
            <el-input
              v-model="localApiKey"
              :type="showApiKey ? 'text' : 'password'"
              :placeholder="t('请输入 DeepSeek API Key')"
              clearable
              class="form-input"
            >
              <template #suffix>
                <span class="password-toggle" @click="showApiKey = !showApiKey">
                  {{ showApiKey ? t('隐藏') : t('显示') }}
                </span>
              </template>
            </el-input>
          </div>
          <div class="form-item">
            <div class="form-label">{{ t('Model') }}</div>
            <el-select v-model="localModel" class="form-input">
              <el-option label="deepseek-chat" value="deepseek-chat" />
              <el-option label="deepseek-reasoner" value="deepseek-reasoner" />
            </el-select>
          </div>
        </template>

        <template v-else>
          <div class="form-item">
            <div class="form-label">{{ t('Base URL') }}</div>
            <el-input
              v-model="localBaseURL"
              :placeholder="t('请输入 API Base URL')"
              clearable
              class="form-input"
            />
          </div>
          <div class="form-item">
            <div class="form-label">{{ t('API Key') }}</div>
            <el-input
              v-model="localApiKey"
              :type="showApiKey ? 'text' : 'password'"
              :placeholder="t('请输入 API Key')"
              clearable
              class="form-input"
            >
              <template #suffix>
                <span class="password-toggle" @click="showApiKey = !showApiKey">
                  {{ showApiKey ? t('隐藏') : t('显示') }}
                </span>
              </template>
            </el-input>
          </div>
          <div class="form-item">
            <div class="form-label">{{ t('Model ID') }}</div>
            <el-input
              v-model="localModel"
              :placeholder="t('请输入模型 ID')"
              clearable
              class="form-input"
            />
          </div>
        </template>
      </div>
      <div class="config-footer">
        <button class="ai-config-btn" type="button" @click="emit('go-to-full-settings')">
          <span>{{ t('更多设置') }}</span>
          <ArrowRight :size="14" class="config-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import type { LLMProviderType } from '@src/types/ai/agent.type'

const { t } = useI18n()
const emit = defineEmits<{
  'back': []
  'go-to-full-settings': []
}>()

const llmClientStore = useLLMClientStore()

const providerType = ref<LLMProviderType>('DeepSeek')
const localApiKey = ref('')
const localBaseURL = ref('')
const localModel = ref('')
const showApiKey = ref(false)

let isSyncingFromStore = false
// 自动保存函数（防抖 300ms）
const autoSave = useDebounceFn(() => {
  if (isSyncingFromStore) return
  const hasApiKey = localApiKey.value.trim() !== ''
  if (!hasApiKey) return
  llmClientStore.updateConfig({
    provider: providerType.value,
    apiKey: localApiKey.value,
    baseURL: providerType.value === 'DeepSeek' ? 'https://api.deepseek.com/chat/completions' : localBaseURL.value,
    model: localModel.value,
    customHeaders: llmClientStore.activeProvider.customHeaders,
  })
}, 300)
// 从 store 同步数据到本地状态
const syncFromStore = () => {
  isSyncingFromStore = true
  const provider = llmClientStore.activeProvider
  providerType.value = provider.provider
  localApiKey.value = provider.apiKey
  localBaseURL.value = provider.baseURL
  localModel.value = provider.model
  nextTick(() => {
    isSyncingFromStore = false
  })
}
// 处理 Provider 类型变更
const handleProviderChange = (type: LLMProviderType) => {
  llmClientStore.changeProviderType(type)
  syncFromStore()
}
// 监听配置变化，自动保存
watch([providerType, localApiKey, localBaseURL, localModel], () => {
  autoSave()
})
// 监听 store 变化
watch(() => llmClientStore.activeProvider, () => {
  syncFromStore()
})

onMounted(() => {
  llmClientStore.initFromCache()
  syncFromStore()
})
</script>

<style scoped>
.ai-config-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ai-config-header {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--ai-header-border);
  flex-shrink: 0;
}
.ai-back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--ai-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.ai-back-btn:hover {
  background-color: var(--ai-action-hover-bg);
  color: var(--ai-text-primary);
}
.ai-config-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ai-text-primary);
}
.ai-config-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}
.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--ai-text-secondary);
}
.form-input {
  width: 100%;
}
.password-toggle {
  cursor: pointer;
  font-size: 12px;
  color: var(--ai-text-tertiary);
  transition: color 0.2s;
}
.password-toggle:hover {
  color: var(--ai-text-primary);
}
.config-footer {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  justify-content: center;
}
.ai-config-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  background: var(--ai-button-bg);
  border: 1px solid var(--ai-button-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: var(--ai-text-primary);
  white-space: nowrap;
}
.config-icon {
  margin-top: 4px;
}
.ai-config-btn:hover {
  background: var(--ai-button-hover-bg);
}
</style>
