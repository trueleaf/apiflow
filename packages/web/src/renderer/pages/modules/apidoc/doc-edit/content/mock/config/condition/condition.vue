<template>
  <div class="condition-content">
    <div class="config-title">{{ t('触发条件配置') }}</div>
    <div class="config-form">
      <div class="form-row">
        <div class="form-item flex-item">
          <label class="form-label">{{ t('监听端口') }} *</label>
          <el-input-number
            v-model="httpMock.requestCondition.port"
            :placeholder="t('监听端口')"
            :min="1"
            :max="65535"
            :controls="false"
            class="port-input"
          />
        </div>
        <div class="form-item flex-item">
          <label class="form-label">{{ t('允许的HTTP方法') }}</label>
          <el-checkbox-group v-model="httpMock.requestCondition.method" class="methods-group">
            <el-checkbox label="ALL">ALL</el-checkbox>
            <el-checkbox label="GET">GET</el-checkbox>
            <el-checkbox label="POST">POST</el-checkbox>
            <el-checkbox label="PUT">PUT</el-checkbox>
            <el-checkbox label="PATCH">PATCH</el-checkbox>
            <el-checkbox label="DELETE">DELETE</el-checkbox>
            <el-checkbox label="OPTIONS">OPTIONS</el-checkbox>
            <el-checkbox label="HEAD">HEAD</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="form-row">
        <div class="form-item flex-item">
          <label class="form-label">{{ t('请求URL') }}</label>
          <el-input
            v-model="httpMock.requestCondition.url"
            :placeholder="t('请求URL')"
            class="url-input"
          />
          <div class="mock-url-container">
            <div class="mock-url-text">{{ mockUrl }}</div>
            <el-icon 
              v-copy="mockUrl"
              class="copy-icon"
            >
              <CopyDocument />
            </el-icon>
          </div>
        </div>
        <div class="form-item flex-item">
          <label class="form-label">{{ t('启用Mock API') }}</label>
          <div class="enabled-switch-wrapper">
            <el-switch 
              v-model="enabled" 
              @change="handleEnabledToggle"
              :loading="enabledStatusLoading"
            />
            <div v-if="mockError" class="mock-error">
              {{ mockError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, onMounted, computed } from 'vue'
import { ElSwitch, ElInputNumber, ElCheckboxGroup, ElCheckbox, ElIcon } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import { useApidocTas } from '@/store/apidoc/tabs.ts'
import { router } from '@/router/index.ts'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)
const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)

// 触发条件相关状态
const enabled = ref(false)
const enabledStatusLoading = ref(false)
const mockError = ref('')

// 获取本机IP地址，失败则使用默认值
const getLocalIp = () => {
  try {
    return window.electronAPI?.ip || '127.0.0.1'
  } catch (error) {
    console.warn('获取本机IP失败，使用默认值:', error)
    return '127.0.0.1'
  }
}

// 生成完整的Mock地址
const mockUrl = computed(() => {
  const ip = getLocalIp()
  const port = httpMock.value.requestCondition.port
  const url = httpMock.value.requestCondition.url
  return `http://${ip}:${port}${url}`
})

// 监听HTTP方法变更
watch(
  () => httpMock.value.requestCondition.method,
  (newMethods, oldMethods) => {
    if (!Array.isArray(newMethods) || !Array.isArray(oldMethods)) {
      return
    }

    if (newMethods.length === 0) {
      httpMockStore.changeHttpMockNodeMethod(['ALL'])
      return
    }

    const hasNewAll = newMethods.includes('ALL') && !oldMethods.includes('ALL')
    const hasNewOther = newMethods.some((method) => method !== 'ALL' && !oldMethods.includes(method))

    if (hasNewAll) {
      httpMockStore.changeHttpMockNodeMethod(['ALL'])
    } else if (hasNewOther && newMethods.includes('ALL')) {
      const methodsWithoutAll = newMethods.filter((method) => method !== 'ALL')
      httpMockStore.changeHttpMockNodeMethod(methodsWithoutAll)
    }
  }
)

// 监听 currentSelectTab 变化，重新加载状态
watch(
  () => currentSelectTab.value?._id,
  () => {
    checkEnabledStatus()
    mockError.value = ''
  }
)

// 处理enabled状态切换
const handleEnabledToggle = (val: string | number | boolean) => {
  const newEnabled = Boolean(val)
  const currentEnabled = enabled.value
  
  // 如果是关闭操作，先恢复switch状态，显示loading
  if (!newEnabled && currentEnabled) {
    enabled.value = true // 保持开启状态
  }
  
  enabledStatusLoading.value = true
  mockError.value = '' // 清除之前的错误
  
  return Promise.resolve()
    .then(() => {
      if (!currentSelectTab.value?._id) {
        throw new Error('Mock配置ID不存在')
      }

      if (newEnabled) {
        const projectId = router.currentRoute.value.query.id as string;
        const mockData = { ...httpMock.value, projectId };
        return window.electronAPI!.mock.startServer(JSON.parse(JSON.stringify(mockData)))
          .then((result) => {
            if (result.code === 0) {
              enabled.value = true
              console.log('Mock API已启用')
            } else {
              enabled.value = false
              mockError.value = result.msg || '启动Mock服务失败'
            }
          })
      } else {
        return window.electronAPI!.mock.stopServer(currentSelectTab.value._id)
          .then(async (result) => {
            if (result.code === 0) {
              // 验证服务器确实已关闭
              if (currentSelectTab.value?._id) {
                const checkResult = await httpMockStore.checkMockNodeEnabledStatus(currentSelectTab.value._id);
                if (checkResult) {
                  console.warn('服务器关闭验证失败，但主进程报告成功');
                  enabled.value = true
                  mockError.value = '服务器关闭验证失败'
                } else {
                  enabled.value = false
                  console.log('Mock API已禁用')
                }
              } else {
                enabled.value = false
                console.log('Mock API已禁用')
              }
            } else {
              enabled.value = true
              mockError.value = result.msg || '停止Mock服务失败'
            }
          })
      }
    })
    .catch((error) => {
      console.error('切换Mock状态失败:', error)
      mockError.value = `操作失败: ${error instanceof Error ? error.message : '未知错误'}`
      // 恢复到操作前的状态
      enabled.value = currentEnabled
    })
    .finally(() => {
      enabledStatusLoading.value = false
    })
}

// 检查Mock启用状态
const checkEnabledStatus = () => {
  if (currentSelectTab.value?._id) {
    enabledStatusLoading.value = true
    return httpMockStore.checkMockNodeEnabledStatus(currentSelectTab.value._id)
      .then((isEnabled) => {
        enabled.value = isEnabled
      })
      .catch((error) => {
        console.error('检查Mock状态失败:', error)
        mockError.value = '无法检查Mock服务状态'
      })
      .finally(() => {
        enabledStatusLoading.value = false
      })
  }
  return Promise.resolve()
}

// 组件挂载时初始化
onMounted(() => {
  checkEnabledStatus()
})
</script>

<style scoped>
.condition-content {
  margin-bottom: 12px;
}

.config-title {
  font-size: var(--font-size-base);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 10px;
}

.config-form {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-item {
  flex: 0 0 auto;
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

.port-input {
  max-width: 200px;
}

.url-input {
  width: 520px;
}

.methods-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 400px;
}

.methods-group :deep(.el-checkbox) {
  margin-right: 20px;
}

.mock-url-container {
  display: flex;
  align-items: center;
}

.mock-url-text {
  font-size: 12px;
  color: var(--gray-600);
  margin-right: 8px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  word-break: break-all;
  line-height: 1.4;
}

.copy-icon {
  flex-shrink: 0;
  cursor: pointer;
  color: var(--gray-500);
  transition: color 0.2s ease;
}

.copy-icon:hover {
  color: var(--primary-color);
}

.enabled-switch-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mock-error {
  font-size: var(--font-size-xs);
  color: #f56c6c;
  line-height: 1.4;
  background: #fef0f0;
  padding: 6px 8px;
  border-radius: var(--border-radius-sm);
  border-left: 3px solid #f56c6c;
}
</style>