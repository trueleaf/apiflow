<template>
  <div class="ws-params">
    <!-- 快捷操作区域 -->
    <div class="quick-actions" :class="{ vertical: layout === 'vertical' }">
      <!-- 左侧操作组 -->
      <div class="action-group action-group-left">
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
        </div>
      </div>
      <!-- 分隔符 -->
      <div class="action-divider"></div>
      <!-- 右侧操作组 -->
      <div class="action-group action-group-right">
        <el-dropdown trigger="click">
          <div class="action-item">
            <LayoutGrid :size="16" />
            <span>{{ t("布局") }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleChangeLayout('horizontal')">
                <span :class="{ 'theme-color': layout === 'horizontal' }">{{ t("左右布局") }}</span>
              </el-dropdown-item>
              <el-dropdown-item @click="handleChangeLayout('vertical')">
                <span :class="{ 'theme-color': layout === 'vertical' }">{{ t("上下布局") }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div class="action-item" @click="handleOpenVariable">
          <Variable :size="16" />
          <span>{{ t("变量") }}</span>
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
            v-for="(history, index) in historyList"
            :key="history._id"
            class="history-item"
            @click="handleSelectHistory(history)"
          >
            <div class="history-main">
              <div class="history-info">
                <span class="history-name">{{ t('历史记录') }}{{ index + 1 }}</span>
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
    <el-tabs v-model="currentActiveTab" class="params-tabs">
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
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { RefreshLeft, RefreshRight, Clock, Delete, Loading } from '@element-plus/icons-vue'
import { LayoutGrid, Variable } from 'lucide-vue-next'
import SHeaders from './headers/Headers.vue'
import SQueryParams from './queryParams/QueryParams.vue'
import SPreScript from './preScript/PreScript.vue'
import SMessageContent from './message/Message.vue'
import SAfterScript from './afterScript/AfterScript.vue'
import { useWebSocket } from '@/store/websocket/websocketStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { appState } from '@/cache/appState/appStateCache.ts'
import { useWsRedoUndo } from '@/store/redoUndo/wsRedoUndoStore'
import { webSocketHistoryCache } from '@/cache/websocketNode/websocketHistoryCache'
import type { WebSocketHistory } from '@src/types/history/wsHistory'
import { ElMessageBox } from 'element-plus'
import { WebsocketActiveTabType } from '@src/types/websocketNode'
import { useRoute } from 'vue-router'


import { message } from '@/helper'
const { t } = useI18n()
const websocketStore = useWebSocket()
const projectNavStore = useProjectNav()
const projectWorkbenchStore = useProjectWorkbench()
const redoUndoStore = useWsRedoUndo()
const route = useRoute()
const { currentSelectNav } = storeToRefs(projectNavStore)
const { websocket } = storeToRefs(websocketStore)
const { layout } = storeToRefs(projectWorkbenchStore)
const currentActiveTab = computed({
  get: () => websocketStore.currentActiveTab,
  set: (val: WebsocketActiveTabType) => {
    websocketStore.setActiveTab(val)
    if (currentSelectNav.value) {
      appState.setWsNodeActiveParamsTab(currentSelectNav.value._id, val)
    }
  }
})

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

const hasSendMessage = computed(() => websocket.value.item.messageBlocks.length > 0 && websocket.value.item.messageBlocks.some(block => block.content.trim() !== ''))

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

//撤销/重做事件处理
const handleUndo = (): void => {
  const nodeId = websocket.value._id;
  redoUndoStore.wsUndo(nodeId);
};
const handleRedo = (): void => {
  const nodeId = websocket.value._id;
  redoUndoStore.wsRedo(nodeId);
};
//切换布局
const handleChangeLayout = (layoutOption: 'vertical' | 'horizontal') => {
  projectWorkbenchStore.changeLayout(layoutOption)
}
//打开变量维护页面
const handleOpenVariable = () => {
  projectNavStore.addNav({
    _id: 'variable',
    projectId: route.query.id as string,
    tabType: 'variable',
    label: t('变量维护'),
    head: {
      icon: '',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  })
}

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
      message.error(t('加载历史记录失败'));
    })
    .finally(() => {
      historyLoading.value = false;
    });
};

const handleSelectHistory = (history: WebSocketHistory): void => {
  ElMessageBox.confirm(
    t('当前操作将覆盖原有数据，是否继续？'),
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
  }).catch((error) => {
    // 用户取消操作
    if (error !== 'cancel' && error !== 'close') {
      console.error('恢复历史记录失败:', error);
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
          message.success(t('删除成功'));
          // 重新加载列表 - 非阻塞方式
          getHistoryList().catch(error => {
            console.error('重新加载历史记录失败:', error);
          });
        } else {
          message.error(t('删除失败'));
        }
      })
      .catch((error) => {
        console.error('删除历史记录失败:', error);
        message.error(t('删除失败'));
      });
  }).catch((error) => {
    // 用户取消操作
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除历史记录失败:', error);
      message.error(t('删除失败'));
    }
  });
};

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (seconds < 60) {
    return t('刚刚');
  } else if (minutes < 60) {
    return t('{count}分钟前', { count: minutes });
  } else if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return t('{hours}小时{minutes}分钟前', { 
      hours, 
      minutes: remainingMinutes
    });
  } else {
    // 超过一天时，显示具体的日期时间格式
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
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

const initActiveTab = (): void => {
  const cachedTab = appState.getWsNodeActiveParamsTab(currentSelectNav.value!._id) || 'messageContent';
  websocketStore.setActiveTab(cachedTab)
}
  
// 监听当前选中tab变化，重新加载activeTab
watch(currentSelectNav, (newTab) => {
  if (newTab) {
    initActiveTab()
  }
}, { immediate: true })

// 生命周期钩子
onMounted(() => {
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
    height: var(--apiflow-quick-actions-height);
    display: flex;
    align-items: flex-end;
    padding: 0 20px;
    justify-content: flex-end;
    position: relative;
    background: var(--white);

    &.vertical {
      z-index: 1;
    }
    
    .action-group {
      display: flex;
      align-items: center;
      
      .action-item {
        display: flex;
        align-items: center;
        padding: 4px 5px;
        font-size: 13px;
        cursor: pointer;
        border-radius: 4px;
        gap: 4px;
        
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

    .action-divider {
      width: 1px;
      height: 20px;
      background-color: var(--gray-300);
      margin: 0 10px;
    }
    
    .history-dropdown {
      position: absolute;
      top: 100%;
      right: 20px;
      background: var(--white);
      border: 1px solid var(--gray-300);
      border-radius: 6px;
      box-shadow: 0 4px 12px var(--bg-black-15);
      z-index: var(--zIndex-history-dropdown);
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
        border-bottom: 1px solid var(--gray-100);
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: var(--gray-200);
          
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
              color: var(--gray-800);
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
            color: var(--gray-500);
          }
        }
        
        .history-actions {
          opacity: 0;
          
          .delete-icon {
            cursor: pointer;
            border-radius: 4px;
            &:hover {
              color: var(--red);
            }
          }
        }
      }
    }
  }

  .el-dropdown {
    line-height: initial;
  }

  .params-tabs {
    height: calc(100vh - var(--apiflow-apidoc-operation-height) - var(--apiflow-doc-nav-height) - var(--apiflow-quick-actions-height));
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
