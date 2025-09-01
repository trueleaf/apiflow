<template>
  <div class="websocket-response">
    <!-- 基本信息部分 -->
    <div class="websocket-base-info">
      <div class="text-bold">{{ t("基本信息") }}</div>
      <div class="px-4">
        <div class="base-info">
          <SLabelValue :label="`${t('连接地址')}：`" class="mt-2" one-line>
            <div class="text-ellipsis" :title="fullUrl">{{ fullUrl }}</div>
          </SLabelValue>
          <SLabelValue :label="`${t('维护人员：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ maintainer || t('未设置') }}</span>
          </SLabelValue>
          <SLabelValue :label="`${t('创建人员：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ creator || t('未设置') }}</span>
          </SLabelValue>
          <SLabelValue :label="`${t('更新日期：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(updatedAt) || t('未设置') }}</span>
          </SLabelValue>
          <SLabelValue :label="`${t('创建日期：')}`" 
            label-width="auto" class="w-50">
            <span class="text-ellipsis">{{ formatDate(createdAt) || t('未设置') }}</span>
          </SLabelValue>
        </div>
      </div>
    </div>
    
    <!-- WebSocket消息内容部分 -->
    <div class="websocket-content">
      <div v-if="!hasData" class="empty-content">
        <el-empty :description="t('WebSocket 响应信息展示区域')">
          <template #image>
            <div class="websocket-icon">
              <i class="iconfont iconwebsocket"></i>
            </div>
          </template>
        </el-empty>
      </div>
      
      <!-- 使用g-sse-view组件渲染WebSocket消息 -->
      <GSSEView 
        v-else
        :dataList="websocketMessages" 
        :isDataComplete="true"
        :virtual="websocketMessages.length > 100"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTranslation } from 'i18next-vue'
import { useRoute } from 'vue-router'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useWebSocket } from '@/store/websocket/websocket'
import { formatDate } from '@/helper'
import SLabelValue from '@/components/common/label-value/g-label-value.vue'
import GSSEView from '@/components/common/sse-view/g-sse-view.vue'
import type { ChunkWithTimestampe } from '@src/types/types'

const { t } = useTranslation()
const route = useRoute()
const apidocTabsStore = useApidocTas()
const websocketStore = useWebSocket()

// WebSocket消息数据
const websocketMessages = ref<ChunkWithTimestampe[]>([])

// 获取当前选中的tab
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string
  const tabs = apidocTabsStore.tabs[projectId]
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null
  return currentSelectTab
})

// 基本信息计算属性
const fullUrl = computed(() => {
  return websocketStore.websocketFullUrl
})

const maintainer = computed(() => websocketStore.websocket.info.maintainer || '')
const creator = computed(() => websocketStore.websocket.info.creator || '')
const updatedAt = computed(() => websocketStore.websocket.updatedAt)
const createdAt = computed(() => websocketStore.websocket.createdAt)

// 判断是否有数据
const hasData = computed(() => websocketMessages.value.length > 0)

// WebSocket消息监听器
let websocketMessageListener: ((data: any) => void) | null = null
let websocketClosedListener: ((data: any) => void) | null = null
let websocketErrorListener: ((data: any) => void) | null = null

// 缓存消息历史的key
const getCacheKey = (nodeId: string) => `websocket-info-messages-${nodeId}`

// 加载缓存的消息
const loadCachedMessages = () => {
  if (!currentSelectTab.value) return
  
  try {
    const cacheKey = getCacheKey(currentSelectTab.value._id)
    const cachedMessages = sessionStorage.getItem(cacheKey)
    if (cachedMessages) {
      const parsed = JSON.parse(cachedMessages)
      websocketMessages.value = parsed.map((msg: any) => ({
        chunk: new Uint8Array(msg.chunk),
        timestamp: msg.timestamp
      }))
    }
  } catch (error) {
    console.error('加载缓存消息失败:', error)
  }
}

// 缓存消息
const cacheMessages = () => {
  if (!currentSelectTab.value) return
  
  try {
    const cacheKey = getCacheKey(currentSelectTab.value._id)
    const messagesToCache = websocketMessages.value.map(msg => ({
      chunk: Array.from(msg.chunk),
      timestamp: msg.timestamp
    }))
    sessionStorage.setItem(cacheKey, JSON.stringify(messagesToCache))
  } catch (error) {
    console.error('缓存消息失败:', error)
  }
}

// 添加消息到列表
const addMessage = (message: string, type: 'send' | 'receive' | 'system' = 'receive', event = 'message') => {
  const messageWithMetadata = `event: ${event}\ndata: ${type === 'send' ? `[${t('发送')}] ` : type === 'system' ? `[${t('系统')}] ` : `[${t('接收')}] `}${message}\n\n`
  const textEncoder = new TextEncoder()
  const messageData = textEncoder.encode(messageWithMetadata)
  
  const chunk: ChunkWithTimestampe = {
    chunk: messageData,
    timestamp: Date.now()
  }
  
  websocketMessages.value.push(chunk)
  cacheMessages()
  
}

// 监听WebSocket消息
const setupWebSocketMessageListener = () => {
  if (!window.electronAPI) return
  
  websocketMessageListener = (data: { connectionId: string; nodeId: string; message: string; url: string }) => {
    // 只处理当前tab的消息
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      addMessage(data.message, 'receive')
    }
  }
  
  // 监听连接关闭事件
  websocketClosedListener = (data: { connectionId: string; nodeId: string; code: number; reason: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      addMessage(`${t('WebSocket连接已关闭')} (Code: ${data.code}, Reason: ${data.reason})`, 'system', 'close')
    }
  }
  
  // 监听连接错误事件
  websocketErrorListener = (data: { connectionId: string; nodeId: string; error: string; url: string }) => {
    if (currentSelectTab.value && data.nodeId === currentSelectTab.value._id) {
      addMessage(`${t('WebSocket连接错误')}: ${data.error}`, 'system', 'error')
    }
  }
  
  window.electronAPI.onMain('websocket-message', websocketMessageListener)
  window.electronAPI.onMain('websocket-closed', websocketClosedListener)
  window.electronAPI.onMain('websocket-error', websocketErrorListener)
}

// 监听WebSocket发送消息
const setupWebSocketSendListener = () => {
  // 暂时移除发送消息的自动监听
  // 发送消息将通过外部组件手动调用addMessage方法来添加
  console.log('WebSocket发送消息监听器已设置')
}

// 清理WebSocket消息监听器
const cleanupWebSocketMessageListener = () => {
  if (window.electronAPI) {
    if (websocketMessageListener) {
      window.electronAPI.removeListener('websocket-message', websocketMessageListener)
      websocketMessageListener = null
    }
    if (websocketClosedListener) {
      window.electronAPI.removeListener('websocket-closed', websocketClosedListener)
      websocketClosedListener = null
    }
    if (websocketErrorListener) {
      window.electronAPI.removeListener('websocket-error', websocketErrorListener)
      websocketErrorListener = null
    }
  }
}

// 清空消息数据
const clearMessages = () => {
  websocketMessages.value = []
  if (currentSelectTab.value) {
    const cacheKey = getCacheKey(currentSelectTab.value._id)
    sessionStorage.removeItem(cacheKey)
  }
}

// 监听tab变化，加载对应的缓存消息
watch(currentSelectTab, (newTab, oldTab) => {
  if (newTab?._id !== oldTab?._id) {
    websocketMessages.value = []
    if (newTab) {
      loadCachedMessages()
    }
  }
}, { immediate: true })

onMounted(() => {
  setupWebSocketMessageListener()
  setupWebSocketSendListener()
  loadCachedMessages()
})

onUnmounted(() => {
  cleanupWebSocketMessageListener()
  cacheMessages()
})

// 暴露清空方法和添加消息方法供外部调用
defineExpose({
  clearMessages,
  addMessage
})
</script>

<style lang="scss" scoped>
.websocket-response {
  height: 100%;
  display: flex;
  flex-direction: column;

  .websocket-base-info {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #fff;
    flex-shrink: 0;

    .text-bold {
      font-weight: 600;
      color: #303133;
    }

    .protocol-label {
      color: #67c23a;
      font-weight: 500;
    }

    .base-info {
      display: flex;
      flex-wrap: wrap;
      .w-50 {
        width: 50%;
      }
    }

    .text-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .websocket-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .empty-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fafafa;

      .websocket-icon {
        font-size: 64px;
        color: #d3d3d3;
        margin-bottom: 16px;
      }
    }
  }
}
</style>
