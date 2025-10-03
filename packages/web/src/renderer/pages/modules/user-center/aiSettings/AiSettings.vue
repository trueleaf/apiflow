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

          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存配置
              </el-button>
              <el-button @click="handleTest" :loading="testing" :disabled="!canTest">
                测试请求
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
        <div class="result-empty" v-else-if="!testing">
          <p>点击"测试请求"按钮查看大模型响应</p>
        </div>
        <div class="result-loading" v-else>
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>正在请求中...</p>
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
import type { Config } from '@src/types/common'
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
})
const saving = ref(false)
const testing = ref(false)
const testResult = ref<string>('')
const testError = ref<string>('')

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
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('配置保存失败')
  } finally {
    saving.value = false
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
    const result = await window.electronAPI?.aiManager.testChat({
      apiKey: formData.value.apiKey,
      apiUrl: formData.value.apiUrl,
    })

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
    flex: 0 0 500px;
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
