<template>
  <div v-loading="httpMockStore.saveLoading" class="mock-layout">
    <CleanTabs v-model="activeTab" type="card" class="mock-tabs">
      <!-- 配置与响应 Tab -->
      <CleanTabPane :label="t('配置与响应')" name="config">
        <div class="mock-config-content">
          <!-- 触发条件配置区域 -->
          <div class="config-section">
            <div class="config-title">{{ t('触发条件配置') }}</div>
            <div class="config-form">
              <!-- 端口和HTTP方法 -->
              <div class="form-row">
                <div class="form-item flex-item">
                  <label class="form-label">{{ t('端口') }} *</label>
                  <el-input v-model.number="httpMock.requestCondition.port" type="number" :placeholder="t('端口')"
                    :min="1" :max="65535" class="port-input" />
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

              <!-- 请求URL输入框和启用Mock API -->
              <div class="form-row">
                <div class="form-item flex-item">
                  <label class="form-label">{{ t('请求URL') }}</label>
                  <el-input v-model="httpMock.requestCondition.url" :placeholder="t('请求URL')" class="url-input" />
                  <div class="hint-text">{{ t('标准URL路径') }}</div>
                </div>
                <div class="form-item flex-item">
                  <label class="form-label">{{ t('启用Mock API') }}</label>
                  <el-switch v-model="httpMock.requestCondition.enabled" />
                </div>
              </div>
            </div>
          </div>

          <!-- 响应配置区域 -->
          <div class="config-section">
            <div class="response-header">
              <div class="config-title">{{ t('响应配置') }}</div>
              <el-button type="primary" @click="handleAddCondition">
                {{ t('添加条件') }}
              </el-button>
            </div>

            <!-- 未配置提示 -->
            <div class="empty-response">
              <div class="empty-text">{{ t('未配置响应条件') }}</div>
              <div class="empty-hint">{{ t('点击"添加条件"创建你的第一个响应') }}</div>
            </div>
          </div>
        </div>
      </CleanTabPane>

      <!-- 日志 Tab -->
      <CleanTabPane :label="t('日志')" name="logs">
        <div class="mock-logs-content">
          <el-empty :description="t('日志功能暂未实现')" />
        </div>
      </CleanTabPane>
    </CleanTabs>

    <!-- 底部保存按钮 -->
    <div class="save-footer">
      <el-button type="primary" :loading="httpMockStore.saveLoading" @click="handleSave">
        {{ t('保存') }}
      </el-button>
      <el-button type="default" :icon="Refresh" :loading="httpMockStore.refreshLoading" @click="handleRefresh">
        {{ t('刷新') }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { ElSwitch, ElInput, ElCheckboxGroup, ElCheckbox, ElButton, ElEmpty } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { CleanTabs, CleanTabPane } from '@/components/ui/cleanDesign/tabs'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import { useApidocTas } from '@/store/apidoc/tabs'
import { debounce } from '@/helper'
import type { MockHttpNode } from '@src/types/mock/mock'
import type { DebouncedFunc } from 'lodash'
import { router } from '@/router'
import { useShortcut } from '@/hooks/use-shortcut'

const { t } = useI18n()
const activeTab = ref('config')
const httpMockStore = useHttpMock()
const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const { httpMock, originHttpMock } = storeToRefs(httpMockStore)
const debounceHttpMockDataChange = ref<null | DebouncedFunc<(mock: MockHttpNode) => void>>(null)

/*
|--------------------------------------------------------------------------
| 方法定义
|--------------------------------------------------------------------------
*/
// 获取HttpMock数据
const getHttpMockInfo = () => {
  if (!currentSelectTab.value) {
    return
  }
  if (currentSelectTab.value.saved) { // 取最新值
    httpMockStore.getHttpMockDetail({
      id: currentSelectTab.value._id,
      projectId: router.currentRoute.value.query.id as string,
    })
  } else { // 取缓存值
    const cachedHttpMock = httpMockStore.getCachedHttpMockById(currentSelectTab.value._id)
    if (cachedHttpMock) {
      httpMockStore.changeHttpMock(cachedHttpMock)
    } else {
      // 如果缓存中也没有，尝试获取最新数据
      httpMockStore.getHttpMockDetail({
        id: currentSelectTab.value._id,
        projectId: router.currentRoute.value.query.id as string,
      })
    }
  }
}
// 处理HttpMock数据变化
const handleHttpMockDataChange = (mock: MockHttpNode) => {
  const isEqual = httpMockStore.checkHttpMockIsEqual(mock, originHttpMock.value)
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
  // 缓存HttpMock数据
  httpMockStore.cacheHttpMock()
}



// 初始化防抖数据变化处理
const initDebouncDataChange = () => {
  debounceHttpMockDataChange.value = debounce(handleHttpMockDataChange, 200, {
    leading: true
  });
};

// 监听方法选择变化，实现ALL与其他选项的互斥
watch(
  () => httpMock.value.requestCondition.method,
  (newMethods, oldMethods) => {
    if (!Array.isArray(newMethods) || !Array.isArray(oldMethods)) return

    // 如果没有选择任何项，默认选择ALL
    if (newMethods.length === 0) {
      httpMockStore.changeHttpMethod(['ALL'])
      return
    }

    // 检查是否新选择了ALL
    const hasNewAll = newMethods.includes('ALL') && !oldMethods.includes('ALL')
    // 检查是否新选择了其他项（除了ALL）
    const hasNewOther = newMethods.some((method) => method !== 'ALL' && !oldMethods.includes(method))

    if (hasNewAll) {
      // 选择了ALL，只保留ALL
      httpMockStore.changeHttpMethod(['ALL'])
    } else if (hasNewOther && newMethods.includes('ALL')) {
      // 选择了其他选项且当前包含ALL，移除ALL
      const methodsWithoutAll = newMethods.filter((method) => method !== 'ALL')
      httpMockStore.changeHttpMethod(methodsWithoutAll as any)
    }
  }
)

// 监听tab变化
watch(currentSelectTab, (val, oldVal) => {
  const isHttpMock = val?.tabType === 'httpMock'
  if (isHttpMock && val?._id !== oldVal?._id) {
    getHttpMockInfo();
  }
}, {
  deep: true,
  immediate: true,
})

// 监听httpMock数据变化
watch(() => httpMock.value, (mock: MockHttpNode) => {
  debounceHttpMockDataChange.value?.(mock);
}, {
  deep: true,
})

// 添加条件按钮点击事件
const handleAddCondition = () => {
  console.log('添加条件按钮被点击')
}

// 保存HttpMock
const handleSave = () => {
  httpMockStore.saveHttpMock()
}

// 刷新HttpMock
const handleRefresh = async () => {
  if (!currentSelectTab.value) {
    return
  }
  httpMockStore.refreshLoading = true
  try {
    const nodeId = currentSelectTab.value._id
    if (nodeId) {
      // 清除缓存的HttpMock数据
      httpMockStore.cacheHttpMock()
    }
    
    // 重新获取HttpMock数据
    if (currentSelectTab.value) {
      await httpMockStore.getHttpMockDetail({
        id: currentSelectTab.value._id,
        projectId: router.currentRoute.value.query.id as string,
      })
    }
  } catch (error) {
    console.error('刷新HttpMock数据失败:', error)
  } finally {
    setTimeout(() => {
      httpMockStore.refreshLoading = false
    }, 100)
  }
}
// 快捷键保存
useShortcut('ctrl+s', (event: KeyboardEvent) => {
  event.preventDefault();
  handleSave();
})
onMounted(() => {
  initDebouncDataChange()
})
</script>

<style scoped>
.mock-layout {
  --footer-height: 40px;
  height: calc(100vh - var(--footer-height) - var(--apiflow-doc-nav-height));
  background: var(--white);
  padding: 30px 30px 0;

  /* 保存按钮区域 */
  .save-footer {
    height: var(--footer-height);
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

/* CleanTabs 样式 */
.mock-tabs {
  height: 100%;
}

/* 配置内容区域 */
.mock-config-content {
  margin: 0 auto;
}

/* 配置区块 */
.config-section {
  margin-bottom: 12px;
}

.config-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 16px;
}

/* 表单样式 */
.config-form {
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

.hint-text {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-top: 4px;
}

/* 响应配置区域 */
.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.empty-response {
  text-align: center;
  padding: 40px 20px;
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
  border: 1px dashed var(--gray-300);
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--gray-600);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

/* 日志内容区域 */
.mock-logs-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
}



/* 响应式布局 - 小屏适配 */
@media (max-width: 960px) {
  .mock-layout {
    padding: 12px;
  }

  .config-form {
    gap: 14px;
  }

  .form-row {
    flex-direction: column;
    gap: 14px;
  }

  .port-input,
  .url-input {
    max-width: 100%;
  }

  .methods-group {
    min-width: auto;
    gap: 6px;
  }

  .response-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .methods-group {
    gap: 8px;
  }
}

@media (max-width: 760px) {
  .mock-layout {
    padding: 8px;
  }

  .mock-config-content {
    max-width: 100%;
  }

  .config-section {
    margin-bottom: 24px;
  }

  .config-title {
    font-size: var(--font-size-base);
    margin-bottom: 12px;
  }

  .methods-group {
    :deep(.el-checkbox) {
      .el-checkbox__label {
        font-size: var(--font-size-xs);
      }
    }
  }

  .empty-response {
    padding: 30px 16px;
  }

}
</style>

