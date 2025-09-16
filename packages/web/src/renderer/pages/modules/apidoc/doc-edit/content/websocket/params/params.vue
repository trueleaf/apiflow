<template>
  <div class="ws-params">
    <!-- 快捷操作区域 -->
    <div class="quick-actions">
      <div class="action-group">
        <div
          class="action-item"
          :class="{ disabled: !canUndo }"
          :title="t('撤销') + ' (Ctrl+Z)'"
          @click="handleUndo"
        >
          <el-icon size="16"><RefreshLeft /></el-icon>
          <span>{{ t('撤销') }}</span>
        </div>
        <div
          class="action-item"
          :class="{ disabled: !canRedo }"
          :title="t('重做') + ' (Ctrl+Y)'"
          @click="handleRedo"
        >
          <el-icon size="16"><RefreshRight /></el-icon>
          <span>{{ t('重做') }}</span>
        </div>
        <div
          class="action-item history-action"
          :title="t('历史记录')"
          @click="handleToggleHistory"
          ref="historyButtonRef"
        >
          <el-icon size="16"><Clock /></el-icon>
          <!-- <span>{{ t('历史记录') }}</span> -->
        </div>
        
      </div>
      <!-- 历史记录下拉列表 -->
      <div
        v-if="showHistoryDropdown"
        class="history-dropdown"
        ref="historyDropdownRef"
      >
        <div v-if="historyLoading" class="history-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>{{ t('加载中...') }}</span>
        </div>
        <div v-else-if="historyList.length === 0" class="history-empty">
          <span>{{ t('暂无历史记录') }}</span>
        </div>
        <div v-else class="history-list">
          <div
            v-for="history in historyList"
            :key="history._id"
            class="history-item"
            @click="handleSelectHistory(history)"
          >
            <div class="history-main">
              <div class="history-info">
                <span class="history-name">{{ history.node.info.name || t('未命名') }}</span>
                <span class="history-operator">{{ history.operatorName }}</span>
              </div>
              <div class="history-time">{{ formatRelativeTime(history.timestamp) }}</div>
            </div>
            <div class="history-actions">
              <el-icon
                class="delete-icon"
                @click.stop="handleDeleteHistory(history)"
                :title="t('删除')"
              >
                <Delete />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 连接配置选项卡 -->
    <el-tabs v-model="activeTab" class="params-tabs">
      <el-tab-pane name="messageContent">
        <template #label>
          <el-badge :is-dot="hasSendMessage">{{ t('消息内容') }}</el-badge>
        </template>
        <SMessageContent></SMessageContent>
      </el-tab-pane>
      <el-tab-pane name="params">
        <template #label>
          <el-badge :is-dot="hasParams">Params</el-badge>
        </template>
        <SQueryParams></SQueryParams>
      </el-tab-pane>
      <el-tab-pane name="headers">
        <template #label>
          <el-badge :is-dot="hasHeaders">{{ t("请求头") }}</el-badge>
        </template>
        <SHeaders></SHeaders>
      </el-tab-pane>
      <el-tab-pane name="preScript">
        <template #label>
          <el-badge :is-dot="hasPreScript">{{ t("前置脚本") }}</el-badge>
        </template>
        <SPreScript></SPreScript>
      </el-tab-pane>
      <el-tab-pane name="afterScript">
        <template #label>
          <el-badge :is-dot="hasAfterScript">{{ t("后置脚本") }}</el-badge>
        </template>
        <SAfterScript></SAfterScript>
      </el-tab-pane>
      <el-tab-pane name="config">
        <template #label>
          {{ t("连接配置") }}
        </template>
        <SConfig></SConfig>
      </el-tab-pane>
      <el-tab-pane :label="t('备注信息')" name="remarks">
        <SRemarks></SRemarks>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { RefreshLeft, RefreshRight, Clock, Delete, Loading } from '@element-plus/icons-vue'
import SHeaders from './headers/headers.vue'
import SQueryParams from './query-params/query-params.vue'
import SPreScript from './pre-script/pre-script.vue'
import SMessageContent from './message/message.vue'
import SAfterScript from './after-script/after-script.vue'
import SConfig from './config/config.vue'
import SRemarks from './remarks/remarks.vue'
import { useWebSocket } from '@/store/websocket/websocket'
import { useApidocTas } from '@/store/apidoc/tabs'
import { webSocketNodeCache } from '@/cache/websocket/websocketNodeCache'
import { useRedoUndo } from '@/store/redoUndo/redoUndo'
import { webSocketHistoryCache } from '@/cache/history'
import type { WebSocketHistory } from '@src/types/history'
import { ElMessageBox, ElMessage } from 'element-plus'

const { t } = useI18n()
const websocketStore = useWebSocket()
const apidocTabsStore = useApidocTas()
const redoUndoStore = useRedoUndo()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { websocket } = storeToRefs(websocketStore)
const activeTab = ref('')

// 历史记录相关
const showHistoryDropdown = ref(false)
const historyLoading = ref(false)
const historyList = ref<WebSocketHistory[]>([])
const historyButtonRef = ref<HTMLElement>()
const historyDropdownRef = ref<HTMLElement>()

const hasParams = computed(() => websocket.value.item.queryParams.some(param => param.key.trim() !== '' || param.value.trim() !== ''))

const hasHeaders = computed(() => websocket.value.item.headers.some(header => header.key.trim() !== '' || header.value.trim() !== ''))

const hasPreScript = computed(() => websocket.value.preRequest.raw.trim() !== '')

const hasAfterScript = computed(() => websocket.value.afterRequest.raw.trim() !== '')

const hasSendMessage = computed(() => websocket.value.item.sendMessage.trim() !== '')

// 撤销/重做相关计算属性
const canUndo = computed(() => {
  const nodeId = websocket.value._id;
  const undoList = redoUndoStore.wsUndoList[nodeId];
  return undoList && undoList.length > 0;
});

const canRedo = computed(() => {
  const nodeId = websocket.value._id;
  const redoList = redoUndoStore.wsRedoList[nodeId];
  return redoList && redoList.length > 0;
});

// 撤销/重做事件处理
const handleUndo = (): void => {
  const nodeId = websocket.value._id;
  redoUndoStore.wsUndo(nodeId);
};

const handleRedo = (): void => {
  const nodeId = websocket.value._id;
  redoUndoStore.wsRedo(nodeId);
};

/*
|--------------------------------------------------------------------------
| 历史记录相关方法
|--------------------------------------------------------------------------
*/
const handleToggleHistory = (): void => {
  if (showHistoryDropdown.value) {
    showHistoryDropdown.value = false;
    return;
  }
  showHistoryDropdown.value = true;
  // 非阻塞方式加载历史记录
  getHistoryList().catch(error => {
    console.error('加载历史记录失败:', error);
  });
};

const getHistoryList = (): Promise<void> => {
  if (!websocket.value._id) return Promise.resolve();
  
  historyLoading.value = true;
  return webSocketHistoryCache.getWsHistoryListByNodeId(websocket.value._id)
    .then((histories) => {
      historyList.value = histories;
    })
    .catch((error) => {
      console.error('加载历史记录失败:', error);
      ElMessage.error(t('加载历史记录失败'));
    })
    .finally(() => {
      historyLoading.value = false;
    });
};

const handleSelectHistory = (history: WebSocketHistory): void => {
  ElMessageBox.confirm(
    t('确定要使用此历史记录覆盖当前配置吗？当前未保存的修改将丢失。'),
    t('确认覆盖'),
    {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  ).then(() => {
    // 调用changeWebsocket重新赋值
    websocketStore.changeWebsocket(history.node);
    showHistoryDropdown.value = false;
    ElMessage.success(t('已恢复历史记录'));
  }).catch((error) => {
    // 用户取消操作
    if (error !== 'cancel' && error !== 'close') {
      console.error('恢复历史记录失败:', error);
      ElMessage.error(t('恢复历史记录失败'));
    }
  });
};

const handleDeleteHistory = (history: WebSocketHistory): void => {
  ElMessageBox.confirm(
    t('确定要删除这条历史记录吗？'),
    t('确认删除'),
    {
      confirmButtonText: t('删除'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  ).then(() => {
    // 删除操作也改为非阻塞
    webSocketHistoryCache.deleteWsHistoryByNode(websocket.value._id, [history._id])
      .then((success) => {
        if (success) {
          ElMessage.success(t('删除成功'));
          // 重新加载列表 - 非阻塞方式
          getHistoryList().catch(error => {
            console.error('重新加载历史记录失败:', error);
          });
        } else {
          ElMessage.error(t('删除失败'));
        }
      })
      .catch((error) => {
        console.error('删除历史记录失败:', error);
        ElMessage.error(t('删除失败'));
      });
  }).catch((error) => {
    // 用户取消操作
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除历史记录失败:', error);
      ElMessage.error(t('删除失败'));
    }
  });
};

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) {
    return t('刚刚');
  } else if (minutes < 60) {
    return t('{count}分钟前', { count: minutes });
  } else if (hours < 24) {
    return t('{count}小时前', { count: hours });
  } else {
    return t('{count}天前', { count: days });
  }
};

// 点击外部关闭下拉列表
const handleClickOutside = (event: MouseEvent): void => {
  if (
    showHistoryDropdown.value &&
    historyButtonRef.value &&
    historyDropdownRef.value &&
    !historyButtonRef.value.contains(event.target as Node) &&
    !historyDropdownRef.value.contains(event.target as Node)
  ) {
    showHistoryDropdown.value = false;
  }
};

const getInitialActiveTab = (): string => {
  if (currentSelectTab.value) {
    const cachedTab = webSocketNodeCache.getActiveTab(currentSelectTab.value._id)
    return cachedTab || 'messageContent'
  }
  return 'messageContent'
}

// 监听activeTab变化并保存到缓存
watch(activeTab, (newVal) => {
  if (currentSelectTab.value) {
    webSocketNodeCache.setActiveTab(currentSelectTab.value._id, newVal)
    // 设置当前激活的模块到websocket store
    websocketStore.setActiveModule(newVal)
  }
})

// 监听当前选中tab变化，重新加载activeTab
watch(currentSelectTab, (newTab) => {
  if (newTab) {
    activeTab.value = getInitialActiveTab()
  }
}, { immediate: true })

// 生命周期钩子
onMounted(() => {
  activeTab.value = getInitialActiveTab()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.ws-params {
  padding: 0 0 10px;
  position: relative;

  .quick-actions {
    height: 35px;
    display: flex;
    align-items: flex-end;
    padding: 0 20px;
    justify-content: flex-end;
    position: relative;
    
    .action-group {
      display: flex;
      .action-item {
        display: flex;
        align-items: center;
        padding: 4px 5px;
        font-size: 13px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
        
        &:hover:not(.disabled) {
          background-color: var(--gray-200);
        }
        
        &.disabled {
          opacity: 0.5;
          cursor: default;
        }
        
        &.history-action {
          position: relative;
        }
        
        span {
          user-select: none;
        }
      }
    }
    
    .history-dropdown {
      position: absolute;
      top: 100%;
      right: 20px;
      background: var(--white);
      border: 1px solid var(--gray-300);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: var(--z-index-dropdown);
      min-width: 280px;
      max-height: 350px;
      overflow-y: auto;
      margin-top: 5px;
      
      .history-loading,
      .history-empty {
        padding: 16px;
        text-align: center;
        color: var(--gray-500);
        font-size: 14px;
        
        .loading-icon {
          margin-right: 8px;
          animation: rotate 1s linear infinite;
        }
      }
      
      .history-list {
        padding: 8px 0;
      }
      
      .history-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid var(--gray-100);
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: var(--gray-50);
          
          .history-actions {
            opacity: 1;
          }
        }
        
        .history-main {
          flex: 1;
          min-width: 0;
          
          .history-info {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            
            .history-name {
              font-weight: 500;
              color: var(--color-text-primary);
              font-size: 14px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 140px;
            }
            
            .history-operator {
              font-size: 12px;
              color: var(--gray-500);
              background: var(--gray-100);
              padding: 2px 6px;
              border-radius: 4px;
              white-space: nowrap;
            }
          }
          
          .history-time {
            font-size: 12px;
            color: var(--gray-400);
          }
        }
        
        .history-actions {
          opacity: 0;
          transition: opacity 0.2s;
          
          .delete-icon {
            color: var(--gray-400);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
            
            &:hover {
              color: var(--color-danger);
              background-color: var(--danger-50);
            }
          }
        }
      }
    }
  }

  .params-tabs,
  .workbench {
    height: calc(100vh - var(--apiflow-apidoc-operation-height) - var(--apiflow-doc-nav-height) - 45px);
    overflow-y: auto;
    padding-right: 20px;
    padding-left: 20px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
