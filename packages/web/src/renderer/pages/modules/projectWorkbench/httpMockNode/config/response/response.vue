<template>
  <div class="response-content">
    <!-- 顶部标题栏 + Tab页签 -->
    <div class="header-with-tabs">
      <!-- 左侧：响应配置标题 -->
      <div class="main-title">{{ t('响应配置') }}</div>
      <!-- Tab页签组件 -->
      <el-tabs v-model="activeTabName" type="card" class="response-tabs" editable @tab-click="handleTabClick" @edit="handleTabEdit">
        <el-tab-pane
          v-for="(tab, index) in responseTabs"
          :key="tab.id"
          :name="tab.id"
          :closable="!tab.isDefault"
        >
          <template #label>
            <div class="tab-label">
              <!-- 正常显示模式 -->
              <span 
                v-if="editingTabIndex !== index"
                class="tab-name"
                @dblclick="handleEditTabName(index)"
              >
                {{ tab.name }}
              </span>
              <!-- 编辑模式 -->
              <input
                v-else
                ref="tabNameInputRef"
                v-model="editingTabName"
                class="tab-name-input"
                @blur="handleSaveTabName(index)"
                @keyup.enter="handleSaveTabName(index)"
                @click.stop
              />
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 当前Tab内容区域 -->
    <div class="tab-content-area">
      <div v-if="currentResponse" class="response-config">
        <!-- 条件按钮区域（仅非默认返回显示） -->
        <div v-if="!currentResponse.isDefault" class="condition">
          <div 
            class="condition-btn" 
            :class="{ 'is-active': hasConditionConfig }"
            @click="handleToggleCondition"
          >
            {{ t('添加触发条件') }}
          </div>
          <div class="condition-btn">{{ t('添加返回头') }}</div>
        </div>
        <!-- 触发条件配置区域 -->
        <ConditionConfig
          v-if="currentResponse.conditions.enabled"
          :response="currentResponse"
          :response-index="activeTabIndex"
          :mock-node-id="httpMock._id"
          @delete="handleDeleteCondition"
        />
        <!-- 数据类型选择行 -->
        <div class="form-row mb-4">
          <div class="form-item flex-item">
            <label class="form-label mb-1">{{ t('返回数据结构') }}</label>
            <el-radio-group v-model="currentResponse.dataType" size="small">
              <el-radio-button label="json">JSON</el-radio-button>
              <el-radio-button label="text">Text</el-radio-button>
              <el-radio-button label="image">Image</el-radio-button>
              <el-radio-button label="file">File</el-radio-button>
              <el-radio-button label="binary">Binary</el-radio-button>
              <el-radio-button label="sse">SSE</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <!-- 根据数据类型渲染对应的子组件 -->
        <JsonConfig v-if="currentResponse.dataType === 'json'" :response="currentResponse" />
        <TextConfig v-if="currentResponse.dataType === 'text'" :response="currentResponse" />
        <ImageConfig v-if="currentResponse.dataType === 'image'" :response="currentResponse" />
        <FileConfig v-if="currentResponse.dataType === 'file'" :response="currentResponse" />
        <BinaryConfig v-if="currentResponse.dataType === 'binary'" :response="currentResponse" />
        <SseConfig v-if="currentResponse.dataType === 'sse'" :response="currentResponse" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TabPaneName } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import { uuid, generateEmptyHttpMockNode } from '@/helper'
import JsonConfig from './components/json/json.vue'
import TextConfig from './components/text/text.vue'
import ImageConfig from './components/image/image.vue'
import FileConfig from './components/file/file.vue'
import BinaryConfig from './components/binary/binary.vue'
import SseConfig from './components/sse/sse.vue'
import ConditionConfig from './components/condition/condition.vue'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)
const mockResponses = computed(() => httpMock.value.response)
// 当前激活的Tab名称（用于el-tabs）
const activeTabName = ref('tab-0')
// 当前激活的Tab索引
const activeTabIndex = ref(0)
// 正在编辑的Tab索引（-1表示无编辑）
const editingTabIndex = ref(-1)
// 编辑中的Tab名称
const editingTabName = ref('')
// Tab名称输入框引用
const tabNameInputRef = ref<HTMLInputElement[]>([])
// 计算Tab列表
const responseTabs = computed(() => {
  return mockResponses.value.map((response, index) => {
    let defaultName = '默认返回'
    if (!response.isDefault) {
      const conditionIndex = mockResponses.value.slice(0, index).filter(r => !r.isDefault).length + 1
      defaultName = `条件返回${conditionIndex}`
    }
    return {
      id: `tab-${index}`,
      name: response.name || defaultName,
      isDefault: response.isDefault,
      responseIndex: index,
    }
  })
})
// 监听activeTabName变化，更新activeTabIndex
watch(activeTabName, (newVal) => {
  const index = responseTabs.value.findIndex(tab => tab.id === newVal)
  if (index !== -1) {
    activeTabIndex.value = index
  }
})
// 当前激活的响应配置
const currentResponse = computed(() => {
  return mockResponses.value[activeTabIndex.value]
})
// 判断是否存在触发条件配置
const hasConditionConfig = computed(() => {
  if (!currentResponse.value) {
    return false
  }
  return currentResponse.value.conditions.enabled === true
})
// 点击Tab切换
const handleTabClick = () => {
  if (editingTabIndex.value !== -1) {
    editingTabIndex.value = -1
  }
}
// 处理Tab编辑事件（新增/删除）
const handleTabEdit = (targetName: TabPaneName | undefined, action: 'add' | 'remove') => {
  if (action === 'add') {
    handleAddTab()
  } else if (action === 'remove' && targetName) {
    const index = responseTabs.value.findIndex(tab => tab.id === targetName)
    if (index !== -1) {
      handleCloseTab(index)
    }
  }
}
// 双击编辑Tab名称
const handleEditTabName = (index: number) => {
  editingTabIndex.value = index
  editingTabName.value = responseTabs.value[index].name
  nextTick(() => {
    const input = tabNameInputRef.value[0]
    if (input) {
      input.focus()
      input.select()
    }
  })
}
// 保存Tab名称
const handleSaveTabName = (index: number) => {
  const trimmedName = editingTabName.value.trim()
  if (trimmedName) {
    mockResponses.value[index].name = trimmedName
  }
  editingTabIndex.value = -1
}
// 新增Tab
const handleAddTab = () => {
  const mockNodeTemplate = generateEmptyHttpMockNode(uuid())
  const newResponse = mockNodeTemplate.response[0]
  const conditionCount = mockResponses.value.filter(r => !r.isDefault).length
  newResponse.name = `条件返回${conditionCount + 1}`
  newResponse.isDefault = false
  newResponse.jsonConfig.randomSize = 10
  newResponse.textConfig.randomSize = 100
  newResponse.imageConfig.mode = 'random'
  newResponse.imageConfig.randomWidth = 800
  newResponse.imageConfig.randomHeight = 600
  newResponse.imageConfig.randomSize = 10
  newResponse.fileConfig.fileType = 'pdf'
  httpMock.value.response.push(newResponse)
  activeTabIndex.value = mockResponses.value.length - 1
  activeTabName.value = `tab-${activeTabIndex.value}`
  ElMessage.success(t('添加成功'))
}
// 关闭Tab
const handleCloseTab = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      t('确定要删除此条件返回吗？'),
      t('提示'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning',
      }
    )
    mockResponses.value.splice(index, 1)
    if (activeTabIndex.value === index) {
      activeTabIndex.value = 0
      activeTabName.value = 'tab-0'
    } else if (activeTabIndex.value > index) {
      activeTabIndex.value--
      activeTabName.value = `tab-${activeTabIndex.value}`
    }
    ElMessage.success(t('删除成功'))
  } catch {
    // 用户取消删除
  }
}
// 切换触发条件配置
const handleToggleCondition = () => {
  if (!currentResponse.value) {
    return
  }
  if (currentResponse.value.conditions.enabled) {
    handleDeleteCondition(activeTabIndex.value)
    return
  }
  currentResponse.value.conditions.enabled = true
}
// 删除触发条件配置
const handleDeleteCondition = (index: number) => {
  mockResponses.value[index].conditions.enabled = false
}
</script>

<style scoped>
.response-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
}
.header-with-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.main-title {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  padding: 0;
}
.response-tabs {
  flex: 1;
  min-width: 0;
}
.response-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom: none;
}
.response-tabs :deep(.el-tabs__nav) {
  border: none;
}
.response-tabs :deep(.el-tabs__item) {
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  margin-right: 4px;
  padding: 0;
  height: auto;
}
.response-tabs :deep(.el-tabs__item.is-active) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
.response-tabs :deep(.el-tabs__item .is-icon-close) {
  color: var(--gray-400);
  transition: color 0.2s;
}
.response-tabs :deep(.el-tabs__item .is-icon-close:hover) {
  color: var(--danger);
  background: transparent;
}
.response-tabs :deep(.el-tabs__item.is-active .is-icon-close) {
  color: rgba(255, 255, 255, 0.8);
}
.response-tabs :deep(.el-tabs__item.is-active .is-icon-close:hover) {
  color: white;
  background: transparent;
}
.response-tabs :deep(.el-tabs__new-tab) {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 4px;
  margin-left: 4px;
  color: var(--gray-600);
}
.response-tabs :deep(.el-tabs__new-tab:hover) {
  background: var(--gray-100);
  color: var(--gray-700);
}
.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
}
.tab-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tab-name-input {
  min-width: 60px;
  max-width: 120px;
  padding: 2px 6px;
  border: 1px solid var(--primary);
  border-radius: 3px;
  outline: none;
  font-size: 13px;
  background: white;
}
.tab-content-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  background: var(--gray-50);
}
.response-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.condition {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
.condition-btn {
  padding: 4px 14px;
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.condition-btn:hover {
  color: var(--gray-700);
  background-color: var(--gray-50);
  border-color: var(--gray-300);
}
.condition-btn.is-active {
  color: var(--primary);
  background-color: var(--el-color-primary-light-9);
  border-color: var(--primary);
}
.condition-btn.is-active:hover {
  background-color: var(--el-color-primary-light-8);
}
.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-shrink: 0;
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
.mb-1 {
  margin-bottom: 4px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
