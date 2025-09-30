<template>
  <div class="condition-content">
    <div class="config-title">{{ t('触发条件配置') }}</div>
    <div class="config-form">
      <div class="form-row">
        <div class="form-item flex-item">
          <label class="form-label">{{ t('端口') }} *</label>
          <el-input
            v-model.number="httpMock.requestCondition.port"
            type="number"
            :placeholder="t('端口')"
            :min="1"
            :max="65535"
            class="port-input"
          />
        </div>
        <div class="form-item flex-item">
          <label class="form-label">{{ t('HTTP方法') }}</label>
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
          <div class="used-port">
            <div v-if="filteredUsedPorts.length > 0" class="used-ports-tags">
              <div class="used-ports-label">{{ t('已占用端口') }}:</div>
              <div class="ports-tags-container">
                <div v-if="usedPortsLoading" class="ports-loading">
                  {{ t('加载中...') }}
                </div>
                <div v-else class="ports-tags">
                  <el-tooltip 
                    v-for="portInfo in filteredUsedPorts" 
                    :key="portInfo.nodeId"
                    :content="portInfo.nodeName"
                    placement="top"
                  >
                    <el-tag
                      closable
                      type="info"
                      size="small"
                      @close="handleClosePortTag(portInfo)"
                      class="port-tag"
                    >
                      {{ portInfo.port }}
                    </el-tag>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, onMounted, computed } from 'vue'
import { ElSwitch, ElInput, ElCheckboxGroup, ElCheckbox, ElMessageBox, ElTag, ElTooltip, ElIcon } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import { useApidocTas } from '@/store/apidoc/tabs.ts'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)
const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)

// 触发条件相关状态
const enabled = ref(false)
const enabledStatusLoading = ref(false)
const mockError = ref('')
const usedPorts = ref<{ port: number, projectId: string, nodeId: string, nodeName: string }[]>([])
const usedPortsLoading = ref(false)

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

// 过滤已占用端口，排除当前节点
const filteredUsedPorts = computed(() => {
  if (!enabled.value || !currentSelectTab.value?._id) {
    // 如果当前节点没有启动mock，显示所有已占用端口
    return usedPorts.value
  }
  
  // 如果当前节点启动了mock，过滤掉当前节点的端口
  const currentNodeId = currentSelectTab.value._id
  return usedPorts.value.filter(portInfo => portInfo.nodeId !== currentNodeId)
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
    getUsedPortsList()
    mockError.value = ''
  }
)

// 处理关闭端口标签
const handleClosePortTag = (portInfo: { port: number, projectId: string, nodeId: string, nodeName: string }) => {
  handleCloseMock(portInfo)
}

// 处理关闭Mock
const handleCloseMock = async (portInfo: { port: number, projectId: string, nodeId: string, nodeName: string }) => {
  try {
    await ElMessageBox.confirm(
      `${t('确定要关闭端口')} ${portInfo.port} ${t('上的Mock服务吗？')}`,
      t('确认关闭'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning',
      }
    )
    
    // 调用停止Mock服务
    const result = await httpMockStore.stopMockServer(portInfo.nodeId)
    if (result.success) {
      console.log(`端口 ${portInfo.port} 上的Mock服务已关闭`)
      // 刷新已使用端口列表
      await getUsedPortsList()
      // 如果关闭的是当前节点的服务，需要更新当前状态
      if (portInfo.nodeId === currentSelectTab.value?._id) {
        await checkEnabledStatus()
      }
    } else {
      console.error('关闭Mock服务失败:', result.error)
      mockError.value = `关闭端口 ${portInfo.port} 失败: ${result.error}`
    }
  } catch (error) {
    // 用户取消或其他错误
    if (error !== 'cancel' && error !== 'close') {
      console.error('关闭Mock服务失败:', error)
    }
  }
}

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
        // 启动Mock服务
        return httpMockStore.startMockServer(currentSelectTab.value._id)
          .then((result) => {
            if (result.success) {
              enabled.value = true
              console.log('Mock API已启用')
            } else {
              enabled.value = false
              mockError.value = result.error || '启动Mock服务失败'
            }
          })
      } else {
        // 停止Mock服务
        return httpMockStore.stopMockServer(currentSelectTab.value._id)
          .then(async (result: { success: boolean; error?: string }) => {
            if (result.success) {
              enabled.value = false
              console.log('Mock API已禁用')
              // 刷新已使用端口列表，确保UI状态同步
              await getUsedPortsList()
            } else {
              enabled.value = true
              mockError.value = result.error || '停止Mock服务失败'
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

// 获取已使用端口
const getUsedPortsList = async () => {
  usedPortsLoading.value = true
  try {
    const ports = await httpMockStore.getUsedPorts()
    usedPorts.value = ports
  } catch (error) {
    console.error('获取已使用端口失败:', error)
  } finally {
    usedPortsLoading.value = false
  }
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
  getUsedPortsList()
})
</script>

<style scoped>
.condition-content {
  margin-bottom: 12px;
}

.config-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 16px;
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

.used-ports-tags {
  display: flex;
}

.used-ports-label {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-right: 6px;
}

.ports-tags-container {
  min-height: 24px;
}

.ports-loading {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  padding: 4px 0;
}

.ports-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.port-tag {
  cursor: pointer;
}

.used-port {
  max-width: 300px;
}
</style>