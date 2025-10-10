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

    <!-- 响应列表区域 -->
    <div class="response-list">
      <!-- 单个响应配置卡片 -->
      <div v-for="(response, index) in mockResponses" :key="index" class="response-card">
        <!-- 数据类型选择行 -->
        <div class="form-row">
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
import { computed } from 'vue'
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

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)
const mockResponses = computed(() => httpMock.value.response)

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
  ElMessage.success(t('添加成功'))
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
