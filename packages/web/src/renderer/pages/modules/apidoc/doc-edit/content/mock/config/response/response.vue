<template>
  <div class="response-content">
    <!-- 标题栏：响应配置 + 新增按钮 -->
    <div class="header-section">
      <div class="main-title">{{ t('响应配置') }}</div>
      <el-tooltip effect="light" :content="t('新增一个条件返回')" placement="top" :show-after="1000">
        <div class="add-response-btn">
          <el-icon @click="handleAddResponse">
            <Plus />
          </el-icon>
        </div>
      </el-tooltip>
    </div>
    <div class="condition">
      <div 
        class="condition-btn" 
        :class="{ 'is-active': hasConditionConfig }"
        @click="handleToggleCondition"
      >
        {{ t('添加触发条件') }}
      </div>
      <div class="condition-btn">{{ t('添加返回头') }}</div>
    </div>
    <!-- 响应列表区域 -->
    <div class="response-list">
      <!-- 单个响应配置卡片 -->
      <div v-for="(response, index) in mockResponses" :key="index" class="response-card">
        <!-- 触发条件配置区域 -->
        <ConditionConfig
          v-if="showConditionConfig[index]"
          :response="response"
          :response-index="index"
          @delete="handleDeleteCondition"
        />

        <!-- 数据类型选择行 -->
        <div class="form-row mb-4">
          <!-- 返回数据结构 -->
          <div class="form-item flex-item">
            <label class="form-label mb-1">{{ t('返回数据结构') }}</label>
            <el-radio-group v-model="response.dataType" size="small">
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
        <JsonConfig v-if="response.dataType === 'json'" :response="response" />
        <TextConfig v-if="response.dataType === 'text'" :response="response" />
        <ImageConfig v-if="response.dataType === 'image'" :response="response" />
        <FileConfig v-if="response.dataType === 'file'" :response="response" />
        <BinaryConfig v-if="response.dataType === 'binary'" :response="response" />
        <SseConfig v-if="response.dataType === 'sse'" :response="response" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import { uuid, generateEmptyHttpMockNode } from '@/helper'
import JsonConfig from './components/json/json.vue'
import TextConfig from './components/text/text.vue'
import ImageConfig from './components/image/image.vue'
import FileConfig from './components/file/file.vue'
import BinaryConfig from './components/binary/binary.vue'
import SseConfig from './components/sse/sse.vue'
import ConditionConfig from './components/condition-config.vue'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)
const mockResponses = computed(() => httpMock.value.response)

// 控制每个响应是否显示触发条件配置
const showConditionConfig = ref<boolean[]>([])

// 判断是否存在触发条件配置
const hasConditionConfig = computed(() => {
  if (mockResponses.value.length === 0) {
    return false
  }
  const lastIndex = mockResponses.value.length - 1
  return showConditionConfig.value[lastIndex] === true
})

// 新增返回值
const handleAddResponse = () => {
  const mockNodeTemplate = generateEmptyHttpMockNode(uuid())
  const newResponse = mockNodeTemplate.response[0]
  newResponse.isDefault = false
  newResponse.jsonConfig.randomSize = 10
  newResponse.textConfig.randomSize = 100
  newResponse.imageConfig.mode = 'random'
  newResponse.imageConfig.randomWidth = 800
  newResponse.imageConfig.randomHeight = 600
  newResponse.imageConfig.randomSize = 10
  newResponse.fileConfig.fileType = 'pdf'
  httpMock.value.response.push(newResponse)
  showConditionConfig.value.push(false)
  ElMessage.success(t('添加成功'))
}

// 切换触发条件配置
const handleToggleCondition = () => {
  if (mockResponses.value.length === 0) {
    ElMessage.warning(t('请先添加一个响应配置'))
    return
  }
  
  // 默认为最后一个响应添加/删除触发条件
  const lastIndex = mockResponses.value.length - 1
  
  // 如果已存在，则删除
  if (showConditionConfig.value[lastIndex]) {
    handleDeleteCondition(lastIndex)
    return
  }
  
  // 初始化条件数据
  if (!mockResponses.value[lastIndex].conditions.scriptCode) {
    mockResponses.value[lastIndex].conditions = {
      name: '',
      scriptCode: '// 返回 true 时触发此响应\nreturn true;'
    }
  }
  
  // 显示条件配置
  showConditionConfig.value[lastIndex] = true
  ElMessage.success(t('添加成功'))
}

// 删除触发条件配置
const handleDeleteCondition = (index: number) => {
  showConditionConfig.value[index] = false
  // 清空条件数据
  mockResponses.value[index].conditions = {
    name: '',
    scriptCode: ''
  }
}
</script>

<style scoped>
.response-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.main-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
}

.add-response-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  cursor: pointer;
}

.add-response-btn .el-icon {
  width: 25px;
  height: 25px;
  transition: background 0.3s;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-response-btn .el-icon:hover {
  background-color: var(--gray-200);
}

/* 条件按钮区域 */
.condition {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  margin-left: 15px;
}

.condition-btn {
  padding: 3px 12px;
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  background-color: var(--gray-100);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.condition-btn:hover {
  color: var(--gray-700);
  background-color: var(--gray-200);
}

.condition-btn.is-active {
  color: var(--primary);
  background-color: var(--el-color-primary-light-9);
}

.condition-btn.is-active:hover {
  background-color: var(--el-color-primary-light-8);
}

/* 响应列表 */
.response-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 响应卡片 */
.response-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: white;
  flex: 1;
  min-height: 0;
}

/* 表单行 */
.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-shrink: 0;
}

/* 表单项 */
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
</style>
