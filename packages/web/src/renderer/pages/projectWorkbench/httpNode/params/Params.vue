<template>
  <div class="api-params" :class="{ vertical: layout === 'vertical' }">
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
        <template v-else>
          <div class="history-list">
            <div
              v-for="(history, index) in historyList"
              :key="history._id"
              class="history-item"
              @click="handleSelectHistory(history)"
              @mouseenter="handleHistoryItemMouseEnter(history)"
              @mouseleave="handleHistoryItemMouseLeave"
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
          <!-- 底部清除全部按钮 -->
          <div class="history-footer">
            <button class="clear-all-btn" @click="handleClearAllHistory">
              <el-icon><Delete /></el-icon>
              <span>{{ t('清除全部历史记录') }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane name="SParams">
        <template #label>
          <el-badge :is-dot="hasQueryOrPathsParams">Params</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SRequestBody">
        <template #label>
          <el-badge :is-dot="hasBodyParams">Body</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SRequestHeaders">
        <template #label>
          <el-badge :is-dot="hasHeaders">{{ t("请求头") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SResponseParams">
        <template #label>
          <el-badge :is-dot="!!responseNum">{{ t("返回参数") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SPreRequest">
        <template #label>
          <el-badge :is-dot="hasPreRequest">{{ t("前置脚本") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane name="SAfterRequest">
        <template #label>
          <el-badge :is-dot="hasAfterRequest">{{ t("后置脚本") }}</el-badge>
        </template>
      </el-tab-pane>
      <el-tab-pane :label="t('备注')" name="SRemarks"></el-tab-pane>
    </el-tabs>
    <keep-alive>
      <component :is="getComponent()" class="workbench" @changeCommonHeaderSendStatus="freshHasHeaders"></component>
    </keep-alive>

    <!-- 历史记录详情框 -->
    <Teleport to="body">
      <div
        v-if="showHistoryDetail && detailHistory"
        class="history-detail-panel"
        ref="historyDetailRef"
        @mouseenter="handleDetailMouseEnter"
        @mouseleave="handleDetailMouseLeave"
      >
        <div class="detail-header">
          <span class="detail-title">{{ t('历史记录详情') }}</span>
          <el-icon class="close-icon" @click="handleCloseDetail"><Close /></el-icon>
        </div>

        <div class="detail-content">
          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-title">{{ t('基本信息') }}</div>
            <div class="section-content">
              <div class="info-row">
                <span class="info-label">{{ t('请求方法') }}:</span>
                <span class="info-value method-tag" :class="detailHistory.node.item.method.toLowerCase()">
                  {{ detailHistory.node.item.method }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('请求路径') }}:</span>
                <span class="info-value url-text">{{ detailHistory.node.item.url.prefix }}{{ detailHistory.node.item.url.path }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('操作者') }}:</span>
                <span class="info-value">{{ detailHistory.operatorName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ t('记录时间') }}:</span>
                <span class="info-value">{{ new Date(detailHistory.timestamp).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- 请求信息 -->
          <div class="detail-section">
            <div class="section-title">{{ t('请求信息') }}</div>
            <div class="section-content">
              <!-- Headers -->
              <div v-if="detailHistory.node.item.headers.filter(h => h.key).length > 0" class="info-group">
                <div class="group-title">Headers ({{ detailHistory.node.item.headers.filter(h => h.key).length }})</div>
                <div class="param-list">
                  <div v-for="header in detailHistory.node.item.headers.filter(h => h.key)" :key="header._id" class="param-item">
                    <span class="param-key">{{ header.key }}:</span>
                    <span class="param-value">{{ header.value }}</span>
                  </div>
                </div>
              </div>

              <!-- Query Parameters -->
              <div v-if="detailHistory.node.item.queryParams.filter(q => q.key).length > 0" class="info-group">
                <div class="group-title">Query Parameters ({{ detailHistory.node.item.queryParams.filter(q => q.key).length }})</div>
                <div class="param-list">
                  <div v-for="param in detailHistory.node.item.queryParams.filter(q => q.key)" :key="param._id" class="param-item">
                    <span class="param-key">{{ param.key }}:</span>
                    <span class="param-value">{{ param.value }}</span>
                  </div>
                </div>
              </div>

              <!-- Path Parameters -->
              <div v-if="detailHistory.node.item.paths.filter(p => p.key).length > 0" class="info-group">
                <div class="group-title">Path Parameters ({{ detailHistory.node.item.paths.filter(p => p.key).length }})</div>
                <div class="param-list">
                  <div v-for="param in detailHistory.node.item.paths.filter(p => p.key)" :key="param._id" class="param-item">
                    <span class="param-key">{{ param.key }}:</span>
                    <span class="param-value">{{ param.value }}</span>
                  </div>
                </div>
              </div>

              <!-- Request Body -->
              <div v-if="detailHistory.node.item.requestBody.mode !== 'none'" class="info-group">
                <div class="group-title">Body ({{ detailHistory.node.item.requestBody.mode }})</div>
                <div class="body-content">
                  <!-- JSON Body -->
                  <pre v-if="detailHistory.node.item.requestBody.mode === 'json'" class="json-code">{{ detailHistory.node.item.requestBody.rawJson || '{}' }}</pre>

                  <!-- FormData Body -->
                  <div v-else-if="detailHistory.node.item.requestBody.mode === 'formdata'" class="param-list">
                    <div v-for="param in detailHistory.node.item.requestBody.formdata.filter(f => f.key)" :key="param._id" class="param-item">
                      <span class="param-key">{{ param.key }}:</span>
                      <span class="param-value">{{ param.value }}</span>
                    </div>
                  </div>

                  <!-- URL-encoded Body -->
                  <div v-else-if="detailHistory.node.item.requestBody.mode === 'urlencoded'" class="param-list">
                    <div v-for="param in detailHistory.node.item.requestBody.urlencoded.filter(u => u.key)" :key="param._id" class="param-item">
                      <span class="param-key">{{ param.key }}:</span>
                      <span class="param-value">{{ param.value }}</span>
                    </div>
                  </div>

                  <!-- Raw Body -->
                  <pre v-else-if="detailHistory.node.item.requestBody.mode === 'raw'" class="raw-code">{{ detailHistory.node.item.requestBody.raw.data }}</pre>

                  <!-- Binary Body -->
                  <div v-else-if="detailHistory.node.item.requestBody.mode === 'binary'" class="binary-info">
                    {{ t('二进制文件') }}: {{ detailHistory.node.item.requestBody.binary.binaryValue.path || detailHistory.node.item.requestBody.binary.varValue }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 返回参数 -->
          <div v-if="detailHistory.node.item.responseParams.length > 0" class="detail-section">
            <div class="section-title">{{ t('返回参数') }}</div>
            <div class="section-content">
              <div v-for="response in detailHistory.node.item.responseParams" :key="response._id" class="info-group">
                <div class="group-title">
                  {{ response.statusCode }} - {{ response.title }}
                </div>
                <div class="body-content">
                  <pre v-if="response.value.strJson" class="json-code">{{ response.value.strJson }}</pre>
                  <pre v-else-if="response.value.text" class="raw-code">{{ response.value.text }}</pre>
                  <div v-else class="empty-response">{{ t('无返回内容') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script lang="ts" setup>
import type { DebouncedFunc } from 'lodash-es'
import type { HttpNode, ApidocProperty } from '@src/types'
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache.ts'
import { userState } from '@/cache/userState/userStateCache.ts'
import { webSocketNodeCache } from '@/cache/websocketNode/websocketNodeCache.ts'
import { checkPropertyIsEqual } from '@/helper'
import { debounce } from "lodash-es"
import { useI18n } from 'vue-i18n'
import { RefreshLeft, RefreshRight, Clock, Delete, Loading, Close } from '@element-plus/icons-vue'
import { LayoutGrid, Variable } from 'lucide-vue-next'
import SParams from './params/Params.vue';
import SRequestBody from './body/Body.vue';
import SRequestHeaders from './headers/Headers.vue';
import SResponseParams from './responseConfig/ResponseConfig.vue';
import SPreRequestParams from './preRequest/PreRequest.vue';
import SAfterRequestParams from './afterRequest/AfterRequest.vue';
import SRemark from './remarks/Remarks.vue';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useApidocBaseInfo } from '@/store/share/baseInfoStore'
import { useApidoc } from '@/store/share/apidocStore'
import { useRoute } from 'vue-router'
import { useApidocTas } from '@/store/share/tabsStore'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { ElMessageBox } from 'element-plus'
import { httpNodeHistoryCache } from '@/cache/httpNode/httpNodeHistoryCache'
import { message } from '@/helper'
import type { HttpHistory } from '@src/types/history/httpHistory'
type ActiceName = 'SParams' | 'SRequestBody' | 'SResponseParams' | 'SRequestHeaders' | 'SRemarks' | 'SPreRequest' | 'SAfterRequest'
const apidocBaseInfoStore = useApidocBaseInfo()
const apidocStore = useApidoc()
const apidocTabsStore = useApidocTas()
const httpRedoUndoStore = useHttpRedoUndo()
const activeName = ref<ActiceName>('SParams');
const { t } = useI18n()
import { router } from '@/router'
const debounceFn = ref(null as (null | DebouncedFunc<(apidoc: HttpNode) => void>))
const route = useRoute()
const projectId = router.currentRoute.value.query.id as string;
// 历史记录相关
const showHistoryDropdown = ref(false)
const historyLoading = ref(false)
const historyList = ref<HttpHistory[]>([])
const historyButtonRef = ref<HTMLElement>()
const historyDropdownRef = ref<HTMLElement>()
// 历史记录详情相关
const showHistoryDetail = ref(false)
const detailHistory = ref<HttpHistory | null>(null)
const hoverTimer = ref<number | null>(null)
const hideTimer = ref<number | null>(null)
const historyDetailRef = ref<HTMLElement>()
// const mode = computed(() => apidocBaseInfoStore.mode)
const hasQueryOrPathsParams = computed(() => {
  const { queryParams, paths } = apidocStore.apidoc.item;
  const hasQueryParams = queryParams.filter(p => p.select).some((data) => data.key);
  const hasPathsParams = paths.some((data) => data.key);
  return hasQueryParams || hasPathsParams;
})
const hasBodyParams = computed(() => {
  const { contentType } = apidocStore.apidoc.item;
  const isBinary = apidocStore.apidoc.item.requestBody.mode === 'binary';
  if (isBinary) {
    return true
  }
  return !!contentType;
})
const hasPreRequest = computed(() => {
  const preRequest = apidocStore.apidoc.preRequest?.raw;
  return !!preRequest;
})
const hasAfterRequest = computed(() => {
  const afterRequest = apidocStore.apidoc.afterRequest?.raw;
  return !!afterRequest;
})
const responseNum = computed(() => {
  const resParams = apidocStore.apidoc.item.responseParams;
  let resNum = 0;
  resParams.forEach(response => {
    const resValue = response.value;
    const { dataType } = resValue;
    if (dataType === 'application/json') {
      if (resValue.strJson.length > 0) {
        resNum += 1;
      }
    } else if (dataType === 'text/javascript' || dataType === 'text/plain' || dataType === 'text/html' || dataType === 'application/xml') {
      if (resValue.text.length > 0) {
        resNum += 1;
      }
    } else {
      console.warn(`${t('未实现的返回类型')}${dataType}`);
    }
  });
  return resNum;
})
const currentSelectTab = computed(() => {
  const projectId = route.query.id as string;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  return currentSelectTab;
})
const hasHeaders = ref(false);
const freshHasHeaders = () => {
  const { headers } = apidocStore.apidoc.item;
  const commonHeaders = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab.value?._id || "");
  const cpCommonHeaders = JSON.parse(JSON.stringify(commonHeaders)) as (typeof commonHeaders);
  cpCommonHeaders.forEach(header => {
    const ignoreHeaderIds = webSocketNodeCache.getWsIgnoredCommonHeaderByTabId(projectId, currentSelectTab.value?._id ?? "");
    const isSelect = ignoreHeaderIds?.find(headerId => headerId === header._id) ? false : true;
    header.select = isSelect;
  })
  const allHeaders = headers.concat(cpCommonHeaders.map(v => ({ ...v })) as ApidocProperty<'string'>[]);
  const hasHeader = allHeaders.filter(header => header.select).some((data) => data.key);
  // console.log('fresh', hasHeader, allHeaders, )
  hasHeaders.value = hasHeader;
}
watchEffect(freshHasHeaders, {
});
const layout = computed(() => apidocBaseInfoStore.layout)
const apidoc = computed(() => apidocStore.apidoc)
// 撤销/重做相关计算属性
const canUndo = computed(() => {
  if (!currentSelectTab.value) return false;
  const undoList = httpRedoUndoStore.httpUndoList[currentSelectTab.value._id];
  return undoList && undoList.length > 0;
});
const canRedo = computed(() => {
  if (!currentSelectTab.value) return false;
  const redoList = httpRedoUndoStore.httpRedoList[currentSelectTab.value._id];
  return redoList && redoList.length > 0;
});
/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
const getComponent = () => {
  if (activeName.value === 'SParams') {
    return SParams;
  } else if (activeName.value === 'SAfterRequest') {
    return SAfterRequestParams;
  } else if (activeName.value === 'SPreRequest') {
    return SPreRequestParams
  } else if (activeName.value === 'SRemarks') {
    return SRemark
  } else if (activeName.value === 'SRequestBody') {
    return SRequestBody
  } else if (activeName.value === 'SRequestHeaders') {
    return SRequestHeaders
  } else if (activeName.value === 'SResponseParams') {
    return SResponseParams
  }
}
//初始化tab缓存
const initTabCache = () => {
  if (currentSelectTab) {
    const cachedTab = userState.getHttpNodeActiveParamsTab(currentSelectTab.value?._id || "");
    const allowedTabs: ActiceName[] = [
      'SParams',
      'SRequestBody',
      'SResponseParams',
      'SRequestHeaders',
      'SRemarks',
      'SPreRequest',
      'SAfterRequest'
    ];
    if (cachedTab && allowedTabs.includes(cachedTab as ActiceName)) {
      activeName.value = cachedTab as ActiceName;
    } else {
      activeName.value = 'SParams';
    }
  }
}
//切换布局
const handleChangeLayout = (layout: 'vertical' | 'horizontal') => {
  apidocBaseInfoStore.changeLayout(layout);
}
// 撤销/重做事件处理
const handleUndo = (): void => {
  if (!currentSelectTab.value) return;
  if (!canUndo.value) {
    return; // 按钮已禁用时不显示提示
  }
  const result = httpRedoUndoStore.httpUndo(currentSelectTab.value._id);
  if (result.code !== 0) {
    message.error(result.msg);
  }
  // 成功时不显示提示，避免干扰用户操作
};
const handleRedo = (): void => {
  if (!currentSelectTab.value) return;
  if (!canRedo.value) {
    return; // 按钮已禁用时不显示提示
  }
  const result = httpRedoUndoStore.httpRedo(currentSelectTab.value._id);
  if (result.code !== 0) {
    message.error(result.msg);
  }
  // 成功时不显示提示，避免干扰用户操作
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
  if (!currentSelectTab.value) return Promise.resolve();

  historyLoading.value = true;
  return httpNodeHistoryCache.getHttpHistoryListByNodeId(currentSelectTab.value._id)
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

const handleSelectHistory = (history: HttpHistory): void => {
  ElMessageBox.confirm(
    t('当前操作将覆盖原有数据,是否继续?'),
    t('确认覆盖'),
    {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  ).then(() => {
    // 调用changeApidoc重新赋值
    apidocStore.changeApidoc(history.node);
    showHistoryDropdown.value = false;
  }).catch((error) => {
    // 用户取消操作
    if (error !== 'cancel' && error !== 'close') {
      console.error('恢复历史记录失败:', error);
    }
  });
};

const handleDeleteHistory = (history: HttpHistory): void => {
  ElMessageBox.confirm(
    t('确定要删除这条历史记录吗?'),
    t('确认删除'),
    {
      confirmButtonText: t('删除'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  ).then(() => {
    if (!currentSelectTab.value) return;
    httpNodeHistoryCache.deleteHttpHistoryByNode(currentSelectTab.value._id, [history._id])
      .then((success) => {
        if (success) {
          // 从列表中移除已删除的记录
          historyList.value = historyList.value.filter(h => h._id !== history._id);
          message.success(t('删除成功'));
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
    }
  });
};

const handleClearAllHistory = (): void => {
  ElMessageBox.confirm(
    t('确定要清除所有历史记录吗？此操作不可恢复。'),
    t('确认清除'),
    {
      confirmButtonText: t('确定清除'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  ).then(() => {
    if (!currentSelectTab.value) return;
    // 获取所有历史记录的ID
    const allHistoryIds = historyList.value.map(h => h._id);
    httpNodeHistoryCache.deleteHttpHistoryByNode(currentSelectTab.value._id, allHistoryIds)
      .then((success) => {
        if (success) {
          // 清空列表
          historyList.value = [];
          message.success(t('清除成功'));
          // 关闭历史记录弹窗
          showHistoryDropdown.value = false;
        } else {
          message.error(t('清除失败'));
        }
      })
      .catch((error) => {
        console.error('清除历史记录失败:', error);
        message.error(t('清除失败'));
      });
  }).catch((error) => {
    // 用户取消操作
    if (error !== 'cancel' && error !== 'close') {
      console.error('清除历史记录失败:', error);
    }
  });
};

// 历史记录项鼠标进入
const handleHistoryItemMouseEnter = (history: HttpHistory): void => {
  // 清除隐藏计时器
  if (hideTimer.value !== null) {
    clearTimeout(hideTimer.value);
    hideTimer.value = null;
  }

  // 如果已经在显示同一个详情，不需要重新计时
  if (showHistoryDetail.value && detailHistory.value?._id === history._id) {
    return;
  }

  // 开始新的悬停计时
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
  }

  hoverTimer.value = window.setTimeout(() => {
    detailHistory.value = history;
    showHistoryDetail.value = true;
    hoverTimer.value = null;
  }, 1000); // 1秒后显示
};

// 历史记录项鼠标离开
const handleHistoryItemMouseLeave = (): void => {
  // 清除悬停计时器
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }

  // 延迟隐藏，给时间移到详情框
  hideTimer.value = window.setTimeout(() => {
    showHistoryDetail.value = false;
    detailHistory.value = null;
    hideTimer.value = null;
  }, 300);
};

// 详情框鼠标进入
const handleDetailMouseEnter = (): void => {
  // 取消隐藏计时
  if (hideTimer.value !== null) {
    clearTimeout(hideTimer.value);
    hideTimer.value = null;
  }
};

// 详情框鼠标离开
const handleDetailMouseLeave = (): void => {
  // 延迟隐藏
  hideTimer.value = window.setTimeout(() => {
    showHistoryDetail.value = false;
    detailHistory.value = null;
    hideTimer.value = null;
  }, 300);
};

// 关闭详情框
const handleCloseDetail = (): void => {
  showHistoryDetail.value = false;
  detailHistory.value = null;
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }
  if (hideTimer.value !== null) {
    clearTimeout(hideTimer.value);
    hideTimer.value = null;
  }
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
//=========================================================================//
//检查请求方法是否发生改变
const checkMethodIsEqual = (apidoc: HttpNode, originApidoc: HttpNode) => {
  return apidoc.item.method.toLowerCase() === originApidoc.item.method.toLowerCase();
}
//检查preRequest是否发送改变
const checkPreRequest = (apidoc: HttpNode, originApidoc: HttpNode) => {
  return apidoc.preRequest.raw === originApidoc.preRequest.raw;
}
//检查请求url是否发生改变
const checkUrlIsEqual = (apidoc: HttpNode, originApidoc: HttpNode) => {
  const apidocPath = apidoc.item.url.path;
  const originPath = originApidoc.item.url.path;
  return apidocPath === originPath;
}
//判断apidoc是否发生改变
const checkApidocIsEqual = (apidoc: HttpNode, originApidoc: HttpNode) => {
  const cpApidoc: HttpNode = JSON.parse(JSON.stringify(apidoc));
  const cpOriginApidoc: HttpNode = JSON.parse(JSON.stringify(originApidoc));
  const preRequestIsEqual = checkPreRequest(cpApidoc, cpOriginApidoc);
  const methodIsEqual = checkMethodIsEqual(cpApidoc, cpOriginApidoc);
  const urlIsEqual = checkUrlIsEqual(cpApidoc, cpOriginApidoc);
  const headerIsEqual = checkPropertyIsEqual(cpApidoc.item.headers, cpOriginApidoc.item.headers);
  const pathsIsEqual = checkPropertyIsEqual(cpApidoc.item.paths, cpOriginApidoc.item.paths);
  const queryParamsIsEqual = checkPropertyIsEqual(cpApidoc.item.queryParams, cpOriginApidoc.item.queryParams);
  const descriptionIsEqual = cpApidoc.info.description === cpOriginApidoc.info.description;
  //=====================================Request====================================//
  if (!methodIsEqual || !urlIsEqual || !headerIsEqual || !pathsIsEqual || !queryParamsIsEqual || !preRequestIsEqual || !descriptionIsEqual) {
    return false;
  }
  if (cpApidoc.item.requestBody.mode !== cpOriginApidoc.item.requestBody.mode) { //body模式不同
    return false;
  }
  if (cpApidoc.item.requestBody.mode === 'json') {
    const jsonBodyIsEqual = cpApidoc.item.requestBody.rawJson === cpOriginApidoc.item.requestBody.rawJson
    if (!jsonBodyIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'formdata') {
    const formDataIsEqual = checkPropertyIsEqual(cpApidoc.item.requestBody.formdata, cpOriginApidoc.item.requestBody.formdata);
    if (!formDataIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'urlencoded') {
    const urlencodedIsEqual = checkPropertyIsEqual(cpApidoc.item.requestBody.urlencoded, cpOriginApidoc.item.requestBody.urlencoded);
    if (!urlencodedIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'raw') {
    const rawDataIsEqual = cpApidoc.item.requestBody.raw.data === cpOriginApidoc.item.requestBody.raw.data
    const rawTypeIsEqual = cpApidoc.item.requestBody.raw.dataType === cpOriginApidoc.item.requestBody.raw.dataType
    if (!rawTypeIsEqual) {
      return false;
    }
    if (!rawDataIsEqual) {
      return false;
    }
  } else if (cpApidoc.item.requestBody.mode === 'binary') {
    const binaryDataIsEqual = cpApidoc.item.requestBody.binary.mode === cpOriginApidoc.item.requestBody.binary.mode
    const binaryPathIsEqual = cpApidoc.item.requestBody.binary.binaryValue.path === cpOriginApidoc.item.requestBody.binary.binaryValue.path;
    const binaryVarIsEqual = cpApidoc.item.requestBody.binary.varValue === cpOriginApidoc.item.requestBody.binary.varValue;
    if (!binaryDataIsEqual) {
      return false;
    }
    if (!binaryPathIsEqual) {
      return false;
    }
    if (!binaryVarIsEqual) {
      return false;
    }
  }
  //=====================================Response====================================//
  if (cpApidoc.item.responseParams.length !== cpOriginApidoc.item.responseParams.length) { //返回参数长度不相等
    return false;
  }
  for (let i = 0; i < cpApidoc.item.responseParams.length; i += 1) {
    const item = cpApidoc.item.responseParams[i];
    const originItem = cpOriginApidoc.item.responseParams[i];
    if (item.value.strJson !== originItem.value.strJson) {
      return false;
    }
    if (item.statusCode !== originItem.statusCode) { //状态码不相同
      return false;
    }
    if (item.title !== originItem.title) { //描述不相同
      return false;
    }
    if (item.value.dataType !== originItem.value.dataType) { //数据类型不相同
      return false;
    }
    if (item.value.file.url !== originItem.value.file.url || item.value.file.raw !== originItem.value.file.raw) { //文件类型url不相同
      return false;
    }
    if (item.value.text !== originItem.value.text) { //文件类型url不相同
      return false;
    }
  }
  return true;
}
//=========================================================================//
// //切换工作模式
// const toggleMode = (mode: 'edit' | 'view') => {
//   apidocBaseInfoStore.changeMode(mode);
// }
//打开变量维护页面
const handleOpenVariable = () => {
  apidocTabsStore.addTab({
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
//打开联想参数
// const handleOpenMindParams = () => {
//   apidocTabsStore.addTab({
//     _id: 'mindParams',
//     projectId: route.query.id as string,
//     tabType: 'mindParams',
//     label: t('联想参数'),
//     head: {
//       icon: 'iconmindParams',
//       color: ''
//     },
//     saved: true,
//     fixed: true,
//     selected: true,
//   })
// }
/*
|--------------------------------------------------------------------------
| 监听定义
|--------------------------------------------------------------------------
*/
watch(() => activeName.value, (val: string) => {
  if (currentSelectTab.value) {
    userState.setHttpNodeActiveParamsTab(currentSelectTab.value._id, val);
  }
})
watch(() => currentSelectTab.value, () => {
  initTabCache();
})
watch(() => apidoc.value, (apidoc: HttpNode) => {
  if (debounceFn) {
    debounceFn.value?.(apidoc);
  }
}, {
  deep: true,
})
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  debounceFn.value = debounce((apidoc: HttpNode) => {
    const isEqual = checkApidocIsEqual(apidoc, apidocStore.originApidoc);
    if (!isEqual) {
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'saved',
        value: false,
      })
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'fixed',
        value: true,
      })
    } else {
      apidocTabsStore.changeTabInfoById({
        id: currentSelectTab.value?._id || "",
        field: 'saved',
        value: true,
      })
    }
    //缓存接口信息
    httpNodeCache.setHttpNode(apidoc);
  }, 200, {
    leading: true
  });
  initTabCache();
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // 清理计时器
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value)
    hoverTimer.value = null
  }
  if (hideTimer.value !== null) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
})
</script>
<style lang='scss' scoped>
.api-params {
  padding: 0 0 10px;
  height: calc(100vh - var(--apiflow-apidoc-operation-height) - var(--apiflow-doc-nav-height));
  overflow-y: auto;
  position: relative;
  &.vertical {
    height: auto;
  }
  .quick-actions {
    height: 35px;
    display: flex;
    align-items: flex-end;
    padding: 0 20px;
    justify-content: flex-end;
    position: relative;
    background: var(--white);
    position: sticky;
    top: 3px;
    z-index: var(--zIndex-request-info-wrap);
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
        
        .iconfont {
          line-height: 1;
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
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

      .history-footer {
        border-top: 1px solid var(--gray-200);
        padding: 12px 16px;
        background: var(--white);

        .clear-all-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 13px;
          color: var(--border-danger);
          background: transparent;
          border: 1px solid var(--border-danger);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: var(--bg-danger-10);
            border-color: var(--border-danger);
          }

          &:active {
            background: rgba(245, 108, 108, 0.15);
          }
        }
      }
    }
  }
  .el-tabs,
  .workbench {
    padding-right: 20px;
    padding-left: 20px;
  }
  .el-tabs__item {
    user-select: none;
  }
  .el-badge__content {
    transition: none;
    top: 10px;
    &.is-fixed.is-dot {
      top: 10px;
      right: 3px;
    }
  }
  .el-tabs__item {
    height: 30px;
    line-height: 30px;
  }
  .el-dropdown {
    line-height: initial;
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

// 历史记录详情框样式
.history-detail-panel {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 400px;
  max-height: 80vh;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  z-index: calc(var(--zIndex-history-dropdown) + 1);
  display: flex;
  flex-direction: column;
  animation: detailFadeIn 150ms ease-out;

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--gray-200);
    background: var(--gray-50);
    border-radius: 8px 8px 0 0;

    .detail-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--gray-800);
    }

    .close-icon {
      cursor: pointer;
      font-size: 18px;
      color: var(--gray-500);
      transition: color 0.2s;

      &:hover {
        color: var(--gray-800);
      }
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .detail-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--gray-200);
      }

      .section-content {
        .info-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
          font-size: 13px;

          .info-label {
            min-width: 80px;
            color: var(--gray-600);
            font-weight: 500;
          }

          .info-value {
            flex: 1;
            color: var(--gray-800);
            word-break: break-all;

            &.method-tag {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 12px;

              &.get {
                background: #e1f5fe;
                color: #0277bd;
              }

              &.post {
                background: #e8f5e9;
                color: #2e7d32;
              }

              &.put {
                background: #fff3e0;
                color: #ef6c00;
              }

              &.delete {
                background: #ffebee;
                color: #c62828;
              }

              &.patch {
                background: #f3e5f5;
                color: #6a1b9a;
              }
            }

            &.url-text {
              font-family: 'Consolas', 'Monaco', monospace;
              font-size: 12px;
            }
          }
        }

        .info-group {
          margin-top: 12px;

          .group-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--gray-700);
            margin-bottom: 8px;
            padding: 6px 10px;
            background: var(--gray-100);
            border-radius: 4px;
          }

          .param-list {
            padding-left: 10px;

            .param-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 6px;
              font-size: 12px;

              .param-key {
                min-width: 120px;
                color: var(--gray-700);
                font-weight: 500;
                font-family: 'Consolas', 'Monaco', monospace;
              }

              .param-value {
                flex: 1;
                color: var(--gray-600);
                word-break: break-all;
                font-family: 'Consolas', 'Monaco', monospace;
              }
            }
          }

          .body-content {
            padding-left: 10px;

            .json-code,
            .raw-code {
              background: var(--gray-50);
              border: 1px solid var(--gray-200);
              border-radius: 4px;
              padding: 10px;
              font-size: 12px;
              font-family: 'Consolas', 'Monaco', monospace;
              color: var(--gray-800);
              overflow-x: auto;
              max-height: 300px;
              line-height: 1.5;
              white-space: pre-wrap;
              word-break: break-all;
            }

            .binary-info {
              padding: 8px 10px;
              background: var(--gray-100);
              border-radius: 4px;
              font-size: 12px;
              color: var(--gray-700);
            }

            .empty-response {
              padding: 8px 10px;
              color: var(--gray-500);
              font-size: 12px;
              text-align: center;
            }
          }
        }
      }
    }
  }
}

@keyframes detailFadeIn {
  from {
    opacity: 0;
    transform: translateY(-45%);
  }
  to {
    opacity: 1;
    transform: translateY(-50%);
  }
}
</style>




