<template>
  <div class="send-history">
    <!-- 搜索框 -->
    <div class="send-history-search">
      <el-input
        v-model="searchValue"
        :placeholder="t('过滤历史记录')"
        clearable
        size="small"
        @input="handleSearchInput"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #suffix>
          <el-icon class="clear-history-icon" :title="t('清空历史记录')" @click="handleClearHistory">
            <Delete />
          </el-icon>
        </template>
      </el-input>
      <el-button
        v-if="deletedHistoryCount > 0"
        size="small"
        type="default"
        class="clean-deleted-btn"
        @click="handleCleanDeletedHistory"
      >
        {{ t('清理已删除接口历史') }} ({{ deletedHistoryCount }})
      </el-button>
    </div>

    <!-- 历史列表 -->
    <div class="send-history-list" ref="listRef" @scroll="handleScroll">
      <div
        v-for="item in sendHistoryListWithStatus"
        :key="item._id"
        class="history-item"
        :class="{ 'deleted-item': item.isDeleted }"
        @click="handleClickItem(item)"
      >
        <!-- 方法/协议标签 -->
        <span
          class="method-tag"
          :class="getMethodClass(item)"
        >
          {{ getMethodLabel(item) }}
        </span>
        <!-- 名称和URL -->
        <div class="item-content">
          <div class="item-name" :title="item.nodeName">{{ item.nodeName }}</div>
          <div class="item-url" :title="item.url">{{ item.url }}</div>
        </div>
        <!-- 已删除标签 -->
        <span v-if="item.isDeleted" class="deleted-tag">{{ t('已删除') }}</span>
        <!-- 时间 -->
        <div class="item-time">{{ formatTime(item.timestamp) }}</div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-more">
        <el-icon class="is-loading"><Loading /></el-icon>
        {{ t('加载中') }}...
      </div>
      <div v-if="!hasMore && hasLoadedMore && sendHistoryListWithStatus.length > 0" class="no-more">
        {{ t('没有更多了') }}
      </div>
      <div v-if="!loading && sendHistoryListWithStatus.length === 0" class="empty">
        {{ t('暂无历史记录') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Loading, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useSendHistory } from './sendHistoryStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { router } from '@/router/index'
import { storeToRefs } from 'pinia'
import { sendHistoryCache } from '@/cache/sendHistory/sendHistoryCache'
import { appStateCache } from '@/cache/appState/appStateCache'
import type { SendHistoryItem, SendHistoryItemWithStatus } from '@src/types/history/sendHistory'
import type { ApidocBanner } from '@src/types'

const { t } = useI18n()
const sendHistoryStore = useSendHistory()
const projectNavStore = useProjectNav()
const bannerStore = useBanner()
const runtimeStore = useRuntime()

const { sendHistoryList, loading, hasMore, hasLoadedMore } = storeToRefs(sendHistoryStore)

const searchValue = ref(appStateCache.getHistoryFilterText())
const listRef = ref<HTMLElement | null>(null)
const searchTimer = ref<number | null>(null)
watch(searchValue, (newVal) => {
  appStateCache.setHistoryFilterText(newVal)
})

// 获取项目ID
const getProjectId = () => {
  return router.currentRoute.value.query.id as string
}
// 将banner树扁平化为nodeId Set，提高查询性能
const existingNodeIds = computed(() => {
  const nodeIds = new Set<string>()
  const traverse = (nodes: ApidocBanner[]) => {
    nodes.forEach(node => {
      nodeIds.add(node._id)
      if (node.children?.length) {
        traverse(node.children)
      }
    })
  }
  traverse(bannerStore.banner)
  return nodeIds
})
// 带删除状态的历史列表
const sendHistoryListWithStatus = computed<SendHistoryItemWithStatus[]>(() => {
  return sendHistoryList.value.map(item => ({
    ...item,
    isDeleted: !existingNodeIds.value.has(item.nodeId)
  }))
})
// 已删除的历史记录数量
const deletedHistoryCount = computed(() => {
  return sendHistoryListWithStatus.value.filter(item => item.isDeleted).length
})

// 获取方法标签显示
const getMethodLabel = (item: SendHistoryItem): string => {
  if (item.nodeType === 'http') {
    return item.method || 'GET'
  } else if (item.nodeType === 'websocket') {
    return item.protocol || 'WS'
  }
  return ''
}

// 获取方法样式类
const getMethodClass = (item: SendHistoryItem): string => {
  if (item.nodeType === 'http') {
    return `method-${(item.method || 'GET').toLowerCase()}`
  } else if (item.nodeType === 'websocket') {
    return 'method-ws'
  }
  return ''
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) {
    return t('刚刚')
  } else if (minutes < 60) {
    return `${minutes}${t('分钟前')}`
  } else if (hours < 24) {
    return `${hours}${t('小时前')}`
  } else {
    return `${days}${t('天前')}`
  }
}

// 搜索输入处理（防抖）
const handleSearchInput = () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  searchTimer.value = window.setTimeout(() => {
    sendHistoryStore.search(searchValue.value)
  }, 300)
}

// 清空历史记录
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      t('确定要清空所有历史记录吗？'),
      t('提示'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning'
      }
    )
    await sendHistoryCache.clearSendHistory()
    sendHistoryStore.clearSendHistoryList()
  } catch {
    // 用户取消
  }
}
// 清理已删除接口的历史记录
const handleCleanDeletedHistory = async () => {
  try {
    await ElMessageBox.confirm(
      t('确定要清理所有已删除接口的历史记录吗？'),
      t('提示'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning'
      }
    )
    const deletedIds = sendHistoryListWithStatus.value
      .filter(item => item.isDeleted)
      .map(item => item._id)
    const success = await sendHistoryStore.cleanDeletedHistory(deletedIds)
  } catch {
    // 用户取消
  }
}

// 滚动加载更多
const handleScroll = () => {
  if (!listRef.value || loading.value || !hasMore.value) {
    return
  }
  const { scrollTop, scrollHeight, clientHeight } = listRef.value
  if (scrollHeight - scrollTop - clientHeight < 100) {
    sendHistoryStore.loadMore()
  }
}

// 点击历史项
const handleClickItem = (item: SendHistoryItemWithStatus) => {
  if (item.isDeleted) {
    return
  }
  const projectId = getProjectId()

  if (item.nodeType === 'http') {
    projectNavStore.addNav({
      _id: item.nodeId,
      projectId,
      tabType: 'http',
      label: item.nodeName,
      saved: true,
      fixed: false,
      selected: true,
      head: {
        icon: item.method || 'GET',
        color: ''
      }
    })
  } else if (item.nodeType === 'websocket') {
    projectNavStore.addNav({
      _id: item.nodeId,
      projectId,
      tabType: 'websocket',
      label: item.nodeName,
      saved: true,
      fixed: false,
      selected: true,
      head: {
        icon: item.protocol || 'WS',
        color: ''
      }
    })
  }
}

// 监听 networkMode 变化，自动刷新历史列表
watch(() => runtimeStore.networkMode, () => {
  if (sendHistoryStore.sendHistoryList.length > 0 || !loading.value) {
    sendHistoryStore.loadSendHistory()
  }
})

onMounted(() => {
  if (searchValue.value) {
    sendHistoryStore.search(searchValue.value)
  } else {
    sendHistoryStore.loadSendHistory()
  }
})

onUnmounted(() => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.send-history {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--apiflow-banner-tool-height) - 63px);

  .send-history-search {
    padding: 8px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .clear-history-icon {
      cursor: pointer;
      color: var(--text-tertiary);
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-danger);
      }
    }

    .clean-deleted-btn {
      width: 100%;
    }
  }

  .send-history-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;

    .history-item {
      display: flex;
      align-items: flex-start;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 4px;

      &:hover {
        background-color: var(--bg-hover);
      }

      &.deleted-item {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          background-color: transparent;
        }
      }

      .method-tag {
        flex-shrink: 0;
        font-size: 12px;
        font-weight: 500;
        margin-right: 8px;
        min-width: 36px;
        text-align: center;

        &.method-get { color: var(--green); }
        &.method-post { color: var(--yellow); }
        &.method-put { color: var(--blue); }
        &.method-delete { color: var(--red); }
        &.method-patch { color: var(--purple); }
        &.method-ws { color: var(--red); }
      }

      .deleted-tag {
        flex-shrink: 0;
        font-size: 11px;
        color: var(--el-color-danger);
        background-color: var(--el-color-danger-light-9);
        padding: 2px 6px;
        border-radius: 3px;
        margin-left: 8px;
        margin-right: 4px;
      }

      .item-content {
        flex: 1;
        min-width: 0;

        .item-name {
          font-size: 13px;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-url {
          font-size: 11px;
          color: var(--text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: 2px;
        }
      }

      .item-time {
        flex-shrink: 0;
        font-size: 11px;
        color: var(--text-tertiary);
        margin-left: 8px;
      }
    }

    .loading-more,
    .no-more,
    .empty {
      text-align: center;
      padding: 16px;
      color: var(--text-tertiary);
      font-size: 12px;
    }

    .loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
  }
}
</style>
