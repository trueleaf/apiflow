<template>
  <div class="ai-settings">
    <div class="page-title">
      <h2>AI 设置</h2>
      <p class="subtitle">自定义模型配置</p>
    </div>

    <div class="content-wrapper">
      <!-- 左侧配置区域 -->
      <div class="settings-form">
        <el-form :model="formData" label-width="100px" label-position="left">
          <el-form-item label="模型">
            <el-input v-model="formData.model" disabled placeholder="DeepSeek" />
          </el-form-item>

          <el-form-item label="API Key">
            <el-input 
              v-model="formData.apiKey" 
              type="password"
              show-password
              placeholder="请输入 DeepSeek API Key"
              clearable
            />
          </el-form-item>

          <el-form-item label="API 地址">
            <el-input
              v-model="formData.apiUrl"
              placeholder="请输入 API 地址"
              clearable
            />
          </el-form-item>

          <el-form-item label="超时时间(ms)">
            <el-input-number
              v-model="formData.timeout"
              :min="1000"
              :max="300000"
              :step="1000"
              placeholder="请输入超时时间"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存配置
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
              <el-button @click="handleTest" :loading="testing" :disabled="!canTest">
                文本测试
              </el-button>
              <el-button @click="handleJsonTest" :loading="jsonTesting" :disabled="!canTest">
                JSON测试
              </el-button>
              <el-button @click="handleStreamTest" :loading="streamTesting" :disabled="!canTest">
                流式测试
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧测试结果区域 -->
      <div class="test-result">
        <div class="result-header">
          <h3>测试结果</h3>
        </div>
        <div class="result-content" v-if="testResult">
          <VueMarkdownRender :source="testResult" />
        </div>
        <div class="result-empty" v-else-if="!testing && !jsonTesting && !streamTesting">
          <p>点击"文本测试"、"JSON测试"或"流式测试"按钮查看大模型响应</p>
        </div>
        <div class="result-loading" v-else>
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>正在请求中...</p>
          <el-button v-if="streamTesting" type="danger" size="small" @click="handleCancelStream">
            取消请求
          </el-button>
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
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { aiCache } from '@/cache/ai/aiCache'
import type { Config } from '@src/types/config'
import VueMarkdownRender from 'vue-markdown-render'

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

// 流式请求控制
let streamController: { cancel: () => Promise<void> } | null = null
let currentRequestId = ''

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
    ElMessage.warning('请输入 API Key')
    return
  }
  if (!formData.value.apiUrl.trim()) {
    ElMessage.warning('请输入 API 地址')
    return
  }

  saving.value = true
  try {
    aiCache.setAiConfig(formData.value)
    // 同步配置到主进程
    window.electronAPI?.ipcManager.sendToMain('apiflow-sync-ai-config', {
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('配置保存失败')
  } finally {
    saving.value = false
  }
}

// 重置配置
const handleReset = () => {
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
    window.electronAPI?.ipcManager.sendToMain('apiflow-sync-ai-config', {
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })
    ElMessage.success('配置已重置')
  } catch (error) {
    console.error('重置配置失败:', error)
    ElMessage.error('重置配置失败')
  }
}

// 测试请求
const handleTest = async () => {
  if (!canTest.value) {
    ElMessage.warning('请先配置 API Key 和 API 地址')
    return
  }

  testing.value = true
  testResult.value = ''
  testError.value = ''

  try {
    // 先保存配置，再测试
    aiCache.setAiConfig(formData.value)
    window.electronAPI?.ipcManager.sendToMain('apiflow-sync-ai-config', {
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })

    const result = await window.electronAPI?.aiManager.textChat()

    if (result?.code === 0 && result.data) {
      testResult.value = result.data
      ElMessage.success('测试请求成功')
    } else {
      testError.value = result?.msg || '测试请求失败'
      ElMessage.error(testError.value)
    }
  } catch (error) {
    console.error('测试请求失败:', error)
    testError.value = (error as Error).message
    ElMessage.error('测试请求失败')
  } finally {
    testing.value = false
  }
}

// JSON测试请求
const handleJsonTest = async () => {
  if (!canTest.value) {
    ElMessage.warning('请先配置 API Key 和 API 地址')
    return
  }

  jsonTesting.value = true
  testResult.value = ''
  testError.value = ''

  try {
    // 先保存配置，再测试
    aiCache.setAiConfig(formData.value)
    window.electronAPI?.ipcManager.sendToMain('apiflow-sync-ai-config', {
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })
    
    const result = await window.electronAPI?.aiManager.jsonChat()

    if (result?.code === 0 && result.data) {
      // 格式化 JSON 显示
      try {
        const jsonData = JSON.parse(result.data)
        testResult.value = '```json\n' + JSON.stringify(jsonData, null, 2) + '\n```'
      } catch {
        testResult.value = '```json\n' + result.data + '\n```'
      }
      ElMessage.success('JSON测试成功')
    } else {
      testError.value = result?.msg || 'JSON测试失败'
      ElMessage.error(testError.value)
    }
  } catch (error) {
    console.error('JSON测试失败:', error)
    testError.value = (error as Error).message
    ElMessage.error('JSON测试失败')
  } finally {
    jsonTesting.value = false
  }
}

// 流式测试请求
const handleStreamTest = async () => {
  if (!canTest.value) {
    ElMessage.warning('请先配置 API Key 和 API 地址')
    return
  }

  streamTesting.value = true
  testResult.value = ''
  testError.value = ''
  currentRequestId = `stream-${Date.now()}`

  try {
    // 先保存配置，再测试
    aiCache.setAiConfig(formData.value)
    window.electronAPI?.ipcManager.sendToMain('apiflow-sync-ai-config', {
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
      timeout: formData.value.timeout
    })

    const controller = window.electronAPI?.aiManager.textChatWithStream(
      {
        requestId: currentRequestId,
      },
      (chunk: string) => {
        // 接收数据块，逐步追加到结果中
        testResult.value += chunk
      },
      () => {
        // 流式请求完成
        streamTesting.value = false
        streamController = null
        ElMessage.success('流式请求完成')
      },
      (response) => {
        // 流式请求错误
        streamTesting.value = false
        streamController = null
        testError.value = response.msg
        ElMessage.error(response.msg)
      }
    )

    if (controller) {
      streamController = controller
      // 等待启动请求
      await controller.startPromise
    }
  } catch (error) {
    console.error('流式测试请求失败:', error)
    streamTesting.value = false
    streamController = null
    testError.value = (error as Error).message
    ElMessage.error('流式测试请求失败')
  }
}

// 取消流式请求
const handleCancelStream = async () => {
  if (streamController) {
    try {
      await streamController.cancel()
      streamTesting.value = false
      streamController = null
      ElMessage.info('已取消请求')
    } catch (error) {
      console.error('取消请求失败:', error)
      ElMessage.error('取消请求失败')
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
      color: #333;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .content-wrapper {
    display: flex;
    gap: 20px;
    flex: 1;
    overflow: hidden;
  }

  .settings-form {
    flex: 0 0 600px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #eaeaea;
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
    background: #fff;
    border-radius: 8px;
    border: 1px solid #eaeaea;
    padding: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .result-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #eaeaea;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .result-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f9fafb;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.8;
      color: #333;

      :deep(pre) {
        background: #282c34;
        color: #abb2bf;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
      }

      :deep(code) {
        background: #f0f0f0;
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
        border-left: 4px solid #409eff;
        background: #f0f7ff;
        color: #666;
      }
    }

    .result-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      font-size: 14px;
    }

    .result-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #409eff;
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
