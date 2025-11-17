<template>
  <div class="ai-settings">
    <div class="page-title">
      <h2>{{ $t('AI 设置') }}</h2>
      <p class="subtitle">{{ $t('自定义模型配置') }}</p>
    </div>

    <div class="content-wrapper">
      <!-- 左侧配置区域 -->
      <div class="settings-form">
        <el-form :model="formData" label-width="100px" label-position="left">
          <el-form-item :label="$t('模型')">
            <el-input v-model="formData.model" disabled placeholder="DeepSeek" />
          </el-form-item>

          <el-form-item label="API Key">
            <el-input
              v-model="formData.apiKey"
              type="password"
              show-password
              :placeholder="$t('请输入 DeepSeek API Key')"
              clearable
            />
          </el-form-item>

          <el-form-item :label="$t('API 地址')">
            <el-input
              v-model="formData.apiUrl"
              :placeholder="$t('请输入 API 地址')"
              clearable
            />
          </el-form-item>

          <el-form-item :label="$t('超时时间(ms)')">
            <el-input-number
              v-model="formData.timeout"
              :min="1000"
              :max="300000"
              :step="1000"
              :controls="false"
              :placeholder="$t('请输入超时时间')"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="handleSave" :loading="saving">
                {{ $t('保存配置') }}
              </el-button>
              <el-button @click="handleReset">
                {{ $t('重置') }}
              </el-button>
              <el-button @click="handleTest" :loading="testing" :disabled="!canTest">
                {{ $t('文本测试') }}
              </el-button>
              <el-button @click="handleJsonTest" :loading="jsonTesting" :disabled="!canTest">
                {{ $t('JSON测试') }}
              </el-button>
              <el-button @click="handleStreamTest" :loading="streamTesting" :disabled="!canTest">
                {{ $t('流式测试') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧测试结果区域 -->
      <div class="test-result">
        <div class="result-header">
          <h3>{{ $t('测试结果') }}</h3>
          <el-button
            v-if="streamTesting"
            type="danger"
            size="small"
            @click="handleCancelStream"
          >
            {{ $t('取消请求') }}
          </el-button>
        </div>
        <div class="result-content" v-if="testResult || jsonTestData">
          <SJsonEditor
            v-if="currentTestType === 'json' && jsonTestData"
            v-model="jsonTestData"
            :read-only="true"
            :auto-height="true"
            :max-height="600"
          />
          <VueMarkdownRender
            v-else-if="testResult"
            :source="testResult"
          />
        </div>
        <div class="result-empty" v-else-if="!testing && !jsonTesting && !streamTesting">
          <p>{{ $t('点击"文本测试"、"JSON测试"或"流式测试"按钮查看大模型响应') }}</p>
        </div>
        <div class="result-loading" v-else>
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>{{ $t('正在请求中...') }}</p>
        </div>
        <div class="result-error" v-if="testError">
          <el-alert type="error" :title="testError" :closable="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading } from '@element-plus/icons-vue'
import { aiCache } from '@/cache/ai/aiCache'
import type { Config } from '@src/types/config'
import { mainConfig } from '@src/config/mainConfig'
import type { DeepSeekRequestBody, DeepSeekResponse } from '@src/types/ai'
import VueMarkdownRender from 'vue-markdown-render'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { message, parseAiStream } from '@/helper'

const { t } = useI18n()

type AiConfig = Config['mainConfig']['aiConfig']

/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
const formData = ref<AiConfig>({
  model: 'DeepSeek',
  apiKey: '',
  apiUrl: '',
  timeout: 60000,
})
const saving = ref(false)
const testing = ref(false)
const jsonTesting = ref(false)
const streamTesting = ref(false)
const testResult = ref<string>('')
const testError = ref<string>('')
const currentTestType = ref<'text' | 'json' | 'stream' | null>(null)
const jsonTestData = ref<string>('')

// 流式请求控制
let streamController: { cancel: () => Promise<void> } | null = null
let currentRequestId = ''
let streamBuffer = ''

const getMessageContent = (response: DeepSeekResponse | null): string => {
  if (!response) {
    return ''
  }
  const content = response.choices?.[0]?.message?.content
  return content || ''
}

// 是否可以测试
const canTest = computed(() => {
  return formData.value.apiKey.trim() !== '' && formData.value.apiUrl.trim() !== ''
})

/*
|--------------------------------------------------------------------------
| 初始化相关
|--------------------------------------------------------------------------
*/
// 加载配置
const loadConfig = () => {
  const config = aiCache.getAiConfig()
  formData.value = { ...config }
}

/*
|--------------------------------------------------------------------------
| 事件处理
|--------------------------------------------------------------------------
*/
// 保存配置
const handleSave = async () => {
  if (!formData.value.apiKey.trim()) {
    message.warning(t('请输入 API Key'))
    return
  }
  if (!formData.value.apiUrl.trim()) {
    message.warning(t('请输入 API 地址'))
    return
  }

  saving.value = true
  try {
    aiCache.setAiConfig(formData.value)
    // 同步配置到主进程
    await window.electronAPI?.aiManager.updateConfig({
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })
    message.success(t('配置保存成功'))
  } catch (error) {
    message.error(t('配置保存失败'))
  } finally {
    saving.value = false
  }
}

// 重置配置
const handleReset = async () => {
  formData.value = {
    model: 'DeepSeek',
    apiKey: '',
    apiUrl: '',
    timeout: 60000,
  }
  testResult.value = ''
  testError.value = ''
  try {
    aiCache.setAiConfig(formData.value)
    // 同步配置到主进程
    await window.electronAPI?.aiManager.updateConfig({
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })
  } catch (error) {
    console.error(t('log.重置配置失败'), error)
    message.error(t('log.重置配置失败'))
  }
}

// 测试请求
const handleTest = async () => {
  if (!canTest.value) {
    message.warning(t('请先配置 API Key 和 API 地址'))
    return
  }

  testing.value = true
  testResult.value = ''
  testError.value = ''
  currentTestType.value = 'text'
  jsonTestData.value = ''

  try {
    // 先保存配置，再测试
    aiCache.setAiConfig(formData.value)
    await window.electronAPI?.aiManager.updateConfig({
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })

    const maxTokens = mainConfig.aiConfig.maxTokens ?? 2000
    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的文案助手。请严格遵循用户指令生成内容，务必保证返回的文案条数不超过${maxTokens}条，必须控制整体字数不超过${maxTokens}个字符。`
        },
        {
          role: 'user',
          content: '你是什么模型'
        }
      ],
      max_tokens: maxTokens
    }

    const result = await window.electronAPI?.aiManager.textChat(requestBody)

    if (result?.code === 0 && result.data) {
      const content = getMessageContent(result.data)
      if (content) {
        testResult.value = content
      } else {
        testError.value = t('AI 返回内容为空')
        message.error(testError.value)
      }
    } else {
      testError.value = result?.msg || t('测试请求失败')
      message.error(testError.value)
    }
  } catch (error) {
    testError.value = (error as Error).message
    message.error(t('测试请求失败'))
  } finally {
    testing.value = false
  }
}

// JSON测试请求
const handleJsonTest = async () => {
  if (!canTest.value) {
    message.warning(t('请先配置 API Key 和 API 地址'))
    return
  }

  jsonTesting.value = true
  testResult.value = ''
  testError.value = ''
  currentTestType.value = 'json'
  jsonTestData.value = ''

  try {
    // 先保存配置，再测试
    aiCache.setAiConfig(formData.value)
    await window.electronAPI?.aiManager.updateConfig({
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })

    const maxTokens = mainConfig.aiConfig.maxTokens ?? 2000
    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的数据生成助手。请根据用户的要求生成符合规范的JSON格式数据。你的回答必须是合法的JSON格式，不要包含任何解释性文字或markdown标记。'
        },
        {
          role: 'user',
          content: '生成一个简单的测试JSON对象，包含name和age字段'
        }
      ],
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    }

    const result = await window.electronAPI?.aiManager.jsonChat(requestBody)

    if (result?.code === 0 && result.data) {
      const content = getMessageContent(result.data)
      if (content) {
        try {
          const jsonData = JSON.parse(content)
          jsonTestData.value = JSON.stringify(jsonData, null, 2)
        } catch {
          jsonTestData.value = content
        }
      } else {
        testError.value = t('AI 返回内容为空')
        message.error(testError.value)
      }
    } else {
      testError.value = result?.msg || t('JSON测试失败')
      message.error(testError.value)
    }
  } catch (error) {
    testError.value = (error as Error).message
    message.error(t('JSON测试失败'))
  } finally {
    jsonTesting.value = false
  }
}

// 流式测试请求
const handleStreamTest = async () => {
  if (!canTest.value) {
    message.warning(t('请先配置 API Key 和 API 地址'))
    return
  }

  streamTesting.value = true
  testResult.value = ''
  testError.value = ''
  currentTestType.value = 'stream'
  jsonTestData.value = ''
  currentRequestId = `stream-${Date.now()}`
  streamBuffer = ''

  try {
    // 先保存配置，再测试
    aiCache.setAiConfig(formData.value)
    await window.electronAPI?.aiManager.updateConfig({
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })

    const maxTokens = mainConfig.aiConfig.maxTokens ?? 2000
    const requestBody: DeepSeekRequestBody & { stream: true } = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的文案助手。请严格遵循用户指令生成内容，务必保证返回的文案条数不超过${maxTokens}条，必须控制整体字数不超过${maxTokens}个字符。`
        },
        {
          role: 'user',
          content: '你是什么模型'
        }
      ],
      max_tokens: maxTokens,
      stream: true
    }

    const controller = window.electronAPI?.aiManager.textChatWithStream(
      {
        requestId: currentRequestId,
        requestBody
      },
      (rawChunk: string) => {
        // 使用纯函数解析原始数据块
        streamBuffer = parseAiStream(streamBuffer, rawChunk, (content: string) => {
          // 接收解析后的内容，逐步追加到结果中
          testResult.value += content
        })
      },
      () => {
        // 流式请求完成
        streamBuffer = ''
        streamTesting.value = false
        streamController = null
      },
      (response) => {
        // 流式请求错误
        streamBuffer = ''
        streamTesting.value = false
        streamController = null
        testError.value = response.msg
        message.error(response.msg)
      }
    )

    if (controller) {
      streamController = controller
      // 等待启动请求
      await controller.startPromise
    }
  } catch (error) {
    streamBuffer = ''
    streamTesting.value = false
    streamController = null
    testError.value = (error as Error).message
    message.error('流式测试请求失败')
  }
}

// 取消流式请求
const handleCancelStream = async () => {
  if (streamController) {
    try {
      await streamController.cancel()
      streamTesting.value = false
      streamController = null
    } catch (error) {
      console.error(t('log.取消请求失败'), error)
      message.error(t('log.取消请求失败'))
    }
  }
}

/*
|--------------------------------------------------------------------------
| 组件生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.ai-settings {
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-title {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .content-wrapper {
    display: flex;
    gap: 20px;
    flex: 1;
    overflow: hidden;
  }

  .settings-form {
    flex: 0 0 700px;
    background: var(--el-bg-color);
    border-radius: 8px;
    border: 1px solid var(--border-lighter);
    padding: 24px;
    overflow-y: auto;

    .el-form {
      max-width: 100%;
    }

    .button-group {
      display: flex;
      gap: 12px;
    }
  }

  .test-result {
    flex: 1;
    background: var(--el-bg-color);
    border-radius: 8px;
    border: 1px solid var(--border-lighter);
    padding: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-lighter);

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .result-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: var(--bg-gray-50);
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.8;
      color: var(--el-text-color-primary);

      :deep(pre) {
        background: var(--code-bg-dark);
        color: var(--code-text-dark);
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
      }

      :deep(code) {
        background: var(--bg-gray-200);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }

      :deep(p) {
        margin: 8px 0;
      }

      :deep(ul), :deep(ol) {
        margin: 8px 0;
        padding-left: 24px;
      }

      :deep(blockquote) {
        margin: 8px 0;
        padding: 8px 16px;
        border-left: 4px solid var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        color: var(--text-gray-600);
      }
    }

    .result-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }

    .result-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--el-color-primary);
      font-size: 14px;

      .el-icon {
        font-size: 32px;
      }
    }

    .result-error {
      margin-top: 16px;
    }
  }
}
</style>
