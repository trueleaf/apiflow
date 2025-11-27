<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ $t('API Provider 配置') }}</h3>
        <p>{{ $t('配置大语言模型服务提供商') }}</p>
      </div>
    </div>
    <div class="panel-body">
      <div class="form-block">
        <div class="form-grid">
          <div class="form-item full-row">
            <div class="form-label">
              <Cloud :size="18" class="label-icon" />
              {{ $t('API Provider') }}
            </div>
            <el-select
              v-model="providerType"
              class="form-input"
              @change="handleProviderChange"
            >
              <el-option label="DeepSeek" value="DeepSeek" />
              <el-option label="OpenAI Compatible" value="OpenAICompatible" />
            </el-select>
          </div>

          <template v-if="providerType === 'DeepSeek'">
            <div class="form-item">
              <div class="form-label">
                <Key :size="18" class="label-icon" />
                {{ $t('API Key') }}
              </div>
              <el-input
                v-model="localApiKey"
                :type="showApiKey ? 'text' : 'password'"
                :placeholder="$t('请输入 DeepSeek API Key')"
                clearable
                class="form-input"
              >
                <template #suffix>
                  <component
                    :is="showApiKey ? EyeOff : Eye"
                    :size="16"
                    class="password-toggle"
                    @click="showApiKey = !showApiKey"
                  />
                </template>
              </el-input>
            </div>
            <div class="form-item">
              <div class="form-label">
                <Bot :size="18" class="label-icon" />
                {{ $t('Model') }}
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
                <Link :size="18" class="label-icon" />
                {{ $t('Base URL') }}
              </div>
              <el-input
                v-model="localBaseURL"
                :placeholder="$t('请输入 API Base URL')"
                clearable
                class="form-input"
              />
            </div>
            <div class="form-item">
              <div class="form-label">
                <Key :size="18" class="label-icon" />
                {{ $t('API Key') }}
              </div>
              <el-input
                v-model="localApiKey"
                :type="showApiKey ? 'text' : 'password'"
                :placeholder="$t('请输入 API Key')"
                clearable
                class="form-input"
              >
                <template #suffix>
                  <component
                    :is="showApiKey ? EyeOff : Eye"
                    :size="16"
                    class="password-toggle"
                    @click="showApiKey = !showApiKey"
                  />
                </template>
              </el-input>
            </div>
            <div class="form-item">
              <div class="form-label">
                <Bot :size="18" class="label-icon" />
                {{ $t('Model ID') }}
              </div>
              <el-input
                v-model="localModel"
                :placeholder="$t('请输入模型 ID')"
                clearable
                class="form-input"
              />
            </div>

            <div class="form-item full-row">
              <div class="form-label">
                <FileCode :size="18" class="label-icon" />
                {{ $t('Custom Headers') }}
                <span class="label-hint">{{ $t('(可选)') }}</span>
              </div>
              <div class="custom-headers">
                <div
                  v-for="(header, index) in localCustomHeaders"
                  :key="index"
                  class="header-row"
                >
                  <el-input
                    v-model="header.key"
                    :placeholder="$t('Header Key')"
                    class="header-key"
                  />
                  <el-input
                    v-model="header.value"
                    :placeholder="$t('Header Value')"
                    class="header-value"
                  />
                  <el-button
                    type="danger"
                    text
                    class="header-remove"
                    @click="removeHeader(index)"
                  >
                    <Trash2 :size="16" />
                  </el-button>
                </div>
                <el-button type="primary" text class="add-header-btn" @click="addHeader">
                  <Plus :size="16" />
                  {{ $t('添加请求头') }}
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="panel-actions">
      <el-button @click="handleReset">
        {{ $t('重置') }}
      </el-button>
      <el-button type="primary" @click="handleSave">
        {{ $t('保存配置') }}
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Cloud, Key, Bot, Link, FileCode, Eye, EyeOff, Trash2, Plus } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useLLMProvider } from '@/store/ai/llmProviderStore'
import type { LLMProviderType, CustomHeader } from '@src/types/ai/agent.type'
import { message } from '@/helper'

const { t } = useI18n()
const llmProviderStore = useLLMProvider()

const providerType = ref<LLMProviderType>('DeepSeek')
const localApiKey = ref('')
const localBaseURL = ref('')
const localModel = ref('')
const localCustomHeaders = ref<CustomHeader[]>([])
const showApiKey = ref(false)
// 从 store 同步数据到本地状态
const syncFromStore = () => {
  const provider = llmProviderStore.activeProvider
  providerType.value = provider.provider
  localApiKey.value = provider.apiKey
  localBaseURL.value = provider.baseURL
  localModel.value = provider.model
  localCustomHeaders.value = [...provider.customHeaders.map(h => ({ ...h }))]
}
// 处理 Provider 类型变更
const handleProviderChange = (type: LLMProviderType) => {
  llmProviderStore.changeProviderType(type)
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
// 保存配置
const handleSave = () => {
  if (!localApiKey.value.trim()) {
    message.warning(t('请输入 API Key'))
    return
  }
  if (providerType.value === 'OpenAICompatible') {
    if (!localBaseURL.value.trim()) {
      message.warning(t('请输入 Base URL'))
      return
    }
    if (!localModel.value.trim()) {
      message.warning(t('请输入 Model ID'))
      return
    }
  }
  const validHeaders = localCustomHeaders.value.filter(h => h.key.trim() !== '')
  llmProviderStore.updateConfig({
    provider: providerType.value,
    apiKey: localApiKey.value,
    baseURL: providerType.value === 'DeepSeek' ? 'https://api.deepseek.com' : localBaseURL.value,
    model: localModel.value,
    customHeaders: validHeaders,
  })
  message.success(t('配置保存成功'))
}
// 重置配置
const handleReset = () => {
  llmProviderStore.resetConfig()
  syncFromStore()
  message.success(t('配置已重置'))
}
// 监听 store 变化
watch(() => llmProviderStore.activeProvider, () => {
  syncFromStore()
}, { deep: true })

onMounted(() => {
  llmProviderStore.initFromCache()
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

  .label-icon {
    color: var(--text-primary);
    flex-shrink: 0;
  }

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

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}
</style>
