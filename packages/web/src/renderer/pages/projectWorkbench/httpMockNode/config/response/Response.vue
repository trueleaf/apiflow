<template>
  <div class="response-content">
    <!-- 顶部标题栏 + Tag标签 -->
    <div class="header-with-tabs">
      <!-- 左侧：响应配置标题 -->
      <div class="main-title">{{ t('响应配置') }}</div>
      <!-- Tag标签组件 -->
      <div class="response-tags">
        <template v-for="(tag, index) in responseTags" :key="tag.id">
          <!-- 正常显示模式 -->
          <el-tag
            v-if="editingTagIndex !== index"
            v-show="responseTags.length > 1"
            size="small"
            :type="activeTagIndex === index ? 'primary' : 'info'"
            :effect="activeTagIndex === index ? 'dark' : 'plain'"
            :closable="responseTags.length > 1"
            class="response-tag"
            @click="handleTagClick(index)"
            @close="handleCloseTag(index)"
            @dblclick.stop.prevent="handleEditTagName(index)"
          >
            {{ tag.name }}
          </el-tag>
          <!-- 编辑模式 -->
          <div
            v-else
            class="tag-editing-wrapper"
          >
            <input
              ref="tagNameInputRef"
              v-model="editingTagName"
              class="tag-name-input"
              @blur="handleSaveTagName(index)"
              @keyup.enter="handleSaveTagName(index)"
              @click.stop
            />
          </div>
        </template>
        <!-- 新增按钮 -->
        <el-icon class="add-btn" @click="handleAddTag"><Plus /></el-icon>
      </div>
    </div>
    <!-- 当前Tab内容区域 -->
    <div class="tab-content-area">
      <div v-if="currentResponse" class="response-config">
        <!-- 条件按钮区域 -->
        <div class="condition">
          <div 
            class="condition-btn" 
            :class="{ 'is-active': hasConditionConfig }"
            @click="handleToggleCondition"
          >
            {{ t('添加触发条件') }}
          </div>
          <div
            class="condition-btn"
            :class="{ 'is-active': hasResponseHeaders }"
            @click="handleToggleResponseHeaders"
          >
            {{ t('添加返回头') }}
          </div>
        </div>
        <!-- 配置区域包裹容器 -->
        <div
          v-if="currentResponse.conditions.enabled || currentResponse.headers.enabled"
          class="config-wrapper"
        >
          <!-- 触发条件配置区域 -->
          <ConditionConfig
            v-if="currentResponse.conditions.enabled"
            :response="currentResponse"
            :response-index="activeTagIndex"
            :mock-node-id="httpMock._id"
            @delete="handleDeleteCondition"
          />
          <!-- 返回头配置区域 -->
          <ResponseHeaders
            v-if="currentResponse.headers.enabled"
            :response="currentResponse"
            :response-index="activeTagIndex"
            :mock-node-id="httpMock._id"
            @delete="handleDeleteResponseHeaders"
          />
        </div>
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
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMockStore'
import { generateEmptyHttpMockNode } from '@/helper'
import { nanoid } from 'nanoid/non-secure'
import JsonConfig from './components/json/Json.vue'
import TextConfig from './components/text/Text.vue'
import ImageConfig from './components/image/Image.vue'
import FileConfig from './components/file/File.vue'
import BinaryConfig from './components/binary/Binary.vue'
import SseConfig from './components/sse/Sse.vue'
import ConditionConfig from './components/condition/Condition.vue'
import ResponseHeaders from './components/headers/Headers.vue'


import { message } from '@/helper'
const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)
const mockResponses = computed(() => httpMock.value.response)
// 当前激活的Tag索引
const activeTagIndex = ref(0)
// 正在编辑的Tag索引（-1表示无编辑）
const editingTagIndex = ref(-1)
// 编辑中的Tag名称
const editingTagName = ref('')
// Tag名称输入框引用
const tagNameInputRef = ref<HTMLInputElement[]>([])
// 计算Tag列表
const responseTags = computed(() => {
  return mockResponses.value.map((response, index) => {
    let defaultName = '默认返回'
    if (!response.isDefault) {
      const conditionIndex = mockResponses.value.slice(0, index).filter(r => !r.isDefault).length + 1
      defaultName = `条件返回${conditionIndex}`
    }
    return {
      id: `tag-${index}`,
      name: response.name || defaultName,
      isDefault: response.isDefault,
      responseIndex: index,
    }
  })
})
// 当前激活的响应配置
const currentResponse = computed(() => {
  return mockResponses.value[activeTagIndex.value]
})
// 判断是否存在触发条件配置
const hasConditionConfig = computed(() => {
  if (!currentResponse.value) {
    return false
  }
  return currentResponse.value.conditions.enabled === true
})
// 判断是否存在返回头配置
const hasResponseHeaders = computed(() => {
  if (!currentResponse.value) {
    return false
  }
  return currentResponse.value.headers.enabled === true
})
// 点击Tag切换
const handleTagClick = (index: number) => {
  if (editingTagIndex.value !== -1) {
    editingTagIndex.value = -1
  }
  activeTagIndex.value = index
}
// 双击编辑Tag名称
const handleEditTagName = (index: number) => {
  editingTagIndex.value = index
  editingTagName.value = responseTags.value[index].name
  nextTick(() => {
    const input = tagNameInputRef.value[0]
    if (input) {
      input.focus()
      input.select()
    }
  })
}
// 保存Tag名称
const handleSaveTagName = (index: number) => {
  const trimmedName = editingTagName.value.trim()
  if (trimmedName) {
    mockResponses.value[index].name = trimmedName
  }
  editingTagIndex.value = -1
}
// 新增Tag
const handleAddTag = () => {
  const mockNodeTemplate = generateEmptyHttpMockNode(nanoid())
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
  activeTagIndex.value = mockResponses.value.length - 1
  message.success(t('添加成功'))
}
// 关闭Tag
const handleCloseTag = async (index: number) => {
  // 如果只剩一个，不允许删除
  if (mockResponses.value.length <= 1) {
    message.warning(t('至少需要保留一个返回配置'))
    return
  }

  const isDefaultResponse = mockResponses.value[index].isDefault
  const confirmMessage = isDefaultResponse 
    ? t('确定要删除默认返回吗？删除后第一个条件返回将成为默认返回。')
    : t('确定要删除此条件返回吗？')

  try {
    await ElMessageBox.confirm(
      confirmMessage,
      t('提示'),
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning',
      }
    )
    
    mockResponses.value.splice(index, 1)
    
    // 维护 isDefault 状态：确保第一个始终是默认返回
    if (mockResponses.value.length > 0) {
      mockResponses.value[0].isDefault = true
      // 其他项设为非默认
      for (let i = 1; i < mockResponses.value.length; i++) {
        mockResponses.value[i].isDefault = false
      }
    }
    
    // 调整激活的 tag 索引
    if (activeTagIndex.value === index) {
      activeTagIndex.value = 0
    } else if (activeTagIndex.value > index) {
      activeTagIndex.value--
    }
    
    message.success(t('删除成功'))
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
    handleDeleteCondition(activeTagIndex.value)
    return
  }
  currentResponse.value.conditions.enabled = true
}
// 删除触发条件配置
const handleDeleteCondition = (index: number) => {
  mockResponses.value[index].conditions.enabled = false
}
// 切换返回头配置
const handleToggleResponseHeaders = () => {
  if (!currentResponse.value) {
    return
  }
  if (currentResponse.value.headers.enabled) {
    handleDeleteResponseHeaders(activeTagIndex.value)
    return
  }
  currentResponse.value.headers.enabled = true
}
// 删除返回头配置
const handleDeleteResponseHeaders = (index: number) => {
  mockResponses.value[index].headers.enabled = false
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
}
.response-tags {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.response-tag {
  cursor: pointer;
  user-select: none;
}
.response-tag:hover {
  opacity: 0.85;
}
.tag-editing-wrapper {
  display: inline-flex;
  align-items: center;
  padding: 0 9px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--gray-500);
}
.tag-name-input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--gray-600);
  font-size: 12px;
  font-weight: 500;
  padding: 0;
  margin: 0;
  width: auto;
  min-width: 60px;
  height: 18px;
  line-height: 18px;
  ElMessageBox-sizing: border-ElMessageBox;
}
.add-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
}
.add-btn:hover {
  color: var(--primary);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.tab-content-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: var(--gray-50);
  min-height: 0;
}
.response-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}
.condition {
  display: flex;
  gap: 12px;
}
.condition-btn {
  padding: 2px 10px;
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  background-color: white;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  cursor: pointer;
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
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
.config-wrapper {
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: 16px;
  background-color: white;
  margin-bottom: 16px;
}
</style>
