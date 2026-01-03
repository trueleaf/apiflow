<template>
  <div class="condition-content">
    <div class="config-title">{{ t('触发条件配置') }}</div>
    <div class="config-form">
      <div class="form-row">
        <div class="form-item flex-item">
          <label class="form-label">{{ t('名称') }} *</label>
          <el-input
            v-model="websocketMock.info.name"
            :placeholder="t('请输入名称')"
            class="name-input"
            @input="(val: string) => websocketMockNodeStore.changeWebSocketMockName(val)"
          />
        </div>
        <div class="form-item flex-item">
          <label class="form-label">{{ t('监听端口') }} *</label>
          <el-input-number
            v-model="websocketMock.requestCondition.port"
            :placeholder="t('监听端口')"
            :min="1"
            :max="65535"
            :controls="false"
            class="port-input"
            @change="(val: number | null | undefined) => websocketMockNodeStore.changeWebSocketMockPort(val ?? 8080)"
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-item flex-item">
          <label class="form-label">
            {{ t('请求路径') }}
            <el-tooltip placement="top" :open-delay="500">
              <template #content>
                <div class="path-tooltip-content">
                  <div>{{ t('WebSocket连接路径') }}:</div>
                  <div class="path-example">{{ t('例如') }}: /ws, /socket, /chat</div>
                </div>
              </template>
              <CircleHelp class="help-icon" :size="14" />
            </el-tooltip>
          </label>
          <el-input
            v-model="websocketMock.requestCondition.path"
            :placeholder="t('例如: /ws')"
            class="path-input"
            @input="(val: string) => websocketMockNodeStore.changeWebSocketMockPath(val)"
          />
          <div class="mock-urls-wrapper">
            <div class="mock-url-item">
              <div class="mock-url-text">{{ localMockUrl }}</div>
              <el-icon 
                v-copy="localMockUrl"
                class="copy-icon"
              >
                <CopyDocument />
              </el-icon>
            </div>
            <div class="mock-url-item">
              <div class="mock-url-text">{{ networkMockUrl }}</div>
              <el-icon 
                v-copy="networkMockUrl"
                class="copy-icon"
              >
                <CopyDocument />
              </el-icon>
            </div>
          </div>
        </div>
        <div class="form-item flex-item">
          <label class="form-label">{{ t('启用Mock服务') }}</label>
          <div class="enabled-switch-wrapper">
            <el-switch 
              v-model="enabled" 
              :loading="enabledStatusLoading"
              :disabled="!isElectronEnv"
              @change="handleEnabledToggle"
            />
            <div v-if="!isElectronEnv" class="mock-warning">
              {{ t('浏览器环境不支持启用Mock服务') }}
            </div>
            <div v-else-if="mockError" class="mock-error">
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
import { CopyDocument } from '@element-plus/icons-vue'
import { CircleHelp } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { router } from '@/router/index'
import { isElectron } from '@/helper'

const { t } = useI18n()
const websocketMockNodeStore = useWebSocketMockNode()
const { websocketMock } = storeToRefs(websocketMockNodeStore)
const projectNavStore = useProjectNav()

// 平台环境检测
const isElectronEnv = isElectron()
const { currentSelectNav } = storeToRefs(projectNavStore)

const enabled = ref(false)
const enabledStatusLoading = ref(false)
const mockError = ref('')

// 获取本机IP地址，失败则使用默认值
const getLocalIp = () => {
  try {
    return window.electronAPI?.ip || '127.0.0.1'
  } catch {
    return '127.0.0.1'
  }
}
// 生成本地回环地址URL
const localMockUrl = computed(() => {
  const port = websocketMock.value.requestCondition.port
  const path = websocketMock.value.requestCondition.path
  return `ws://127.0.0.1:${port}${path}`
})
// 生成局域网地址URL
const networkMockUrl = computed(() => {
  const ip = getLocalIp()
  const port = websocketMock.value.requestCondition.port
  const path = websocketMock.value.requestCondition.path
  return `ws://${ip}:${port}${path}`
})
// 监听 currentSelectTab 变化，重新加载状态
watch(
  () => currentSelectNav.value?._id,
  () => {
    checkEnabledStatus()
    mockError.value = ''
  }
)
// 处理enabled状态切换
const handleEnabledToggle = (val: string | number | boolean) => {
  const newEnabled = Boolean(val)
  const currentEnabled = enabled.value
  
  if (!newEnabled && currentEnabled) {
    enabled.value = true
  }
  
  enabledStatusLoading.value = true
  mockError.value = ''
  
  return Promise.resolve()
    .then(() => {
      if (!currentSelectNav.value?._id) {
        throw new Error('Mock配置ID不存在')
      }

      if (newEnabled) {
        const projectId = router.currentRoute.value.query.id as string
        const mockData = { ...websocketMock.value, projectId }
        return window.electronAPI!.websocketMock.startServer(JSON.parse(JSON.stringify(mockData)))
          .then((result) => {
            if (result.code === 0) {
              enabled.value = true
            } else {
              enabled.value = false
              mockError.value = result.msg || '启动Mock服务失败'
            }
          })
      } else {
        return window.electronAPI!.websocketMock.stopServer(currentSelectNav.value._id)
          .then(async (result) => {
            if (result.code === 0) {
              if (currentSelectNav.value?._id) {
                const checkResult = await websocketMockNodeStore.checkMockNodeEnabledStatus(currentSelectNav.value._id)
                if (checkResult) {
                  enabled.value = true
                  mockError.value = '服务器关闭验证失败'
                } else {
                  enabled.value = false
                }
              } else {
                enabled.value = false
              }
            } else {
              enabled.value = true
              mockError.value = result.msg || '停止Mock服务失败'
            }
          })
      }
    })
    .catch((error) => {
      mockError.value = `操作失败: ${error instanceof Error ? error.message : '未知错误'}`
      enabled.value = currentEnabled
    })
    .finally(() => {
      enabledStatusLoading.value = false
    })
}
// 检查Mock启用状态
const checkEnabledStatus = () => {
  if (currentSelectNav.value?._id) {
    enabledStatusLoading.value = true
    return websocketMockNodeStore.checkMockNodeEnabledStatus(currentSelectNav.value._id)
      .then((isEnabled: boolean) => {
        enabled.value = isEnabled
      })
      .catch(() => {
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
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

.name-input {
  width: 200px;
}

.port-input {
  max-width: 200px;
}

.path-input {
  width: 520px;
}

.mock-urls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mock-url-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mock-url-text {
  font-size: 12px;
  color: var(--gray-600);
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
  color: var(--primary);
}

.enabled-switch-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mock-error {
  font-size: var(--font-size-xs);
  color: var(--el-color-danger);
  line-height: 1.4;
  background: var(--bg-danger-10);
  padding: 6px 8px;
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--el-color-danger);
}

.mock-warning {
  font-size: var(--font-size-xs);
  color: var(--el-color-warning);
  line-height: 1.4;
  background: var(--bg-warning-10);
  padding: 6px 8px;
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--el-color-warning);
}

.help-icon {
  margin-left: 4px;
  color: var(--gray-500);
  vertical-align: middle;
}
</style>

<style>
.path-tooltip-content {
  font-size: 12px;
  line-height: 1.6;
}

.path-tooltip-content .path-example {
  margin-left: 8px;
}
</style>
