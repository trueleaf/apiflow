<template>
  <div class="test-case-list">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchText"
          placeholder="搜索测试用例..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearch"
        />
      </div>
      <div class="toolbar-right">
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          style="width: 150px; margin-right: 12px"
          @change="handleFilter"
        >
          <el-option label="通过" value="passed" />
          <el-option label="失败" value="failed" />
          <el-option label="待执行" value="pending" />
        </el-select>
        <el-button type="primary" @click="handleResetStatus">
          重置状态
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
        :data="filteredTestCases"
        stripe
        highlight-current-row
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="id" label="用例ID" width="120" />
        <el-table-column prop="name" label="用例名称" min-width="200">
          <template #default="{ row }">
            <span 
              class="clickable-name"
              @click="handleRowClick(row)"
            >
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="执行状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executedAt" label="执行时间" width="180" />
        <el-table-column prop="remark" label="备注" width="200">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.remark"
              :content="row.remark"
              placement="top"
              :disabled="row.remark.length < 20"
            >
              <span class="remark-text">{{ row.remark }}</span>
            </el-tooltip>
            <span v-else class="empty-text">-</span>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <div v-if="row.images && row.images.length > 0" class="image-preview">
              <el-image
                :src="row.images[0]"
                fit="cover"
                :preview-src-list="row.images"
                class="thumbnail-image"
              />
              <span v-if="row.images.length > 1" class="image-count">
                +{{ row.images.length - 1 }}
              </span>
            </div>
            <span v-else class="empty-text">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button 
              type="success" 
              link
              size="small"
              @click.stop="handleStatusChange(row, 'passed')"
            >
              成功
            </el-button>
            <el-button 
              type="danger" 
              link
              size="small"
              @click.stop="handleStatusChange(row, 'failed')"
            >
              失败
            </el-button>
            <el-button 
              type="warning" 
              link
              size="small"
              @click.stop="handleResetSingleCase(row)"
            >
              重置
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty
        v-if="filteredTestCases.length === 0"
        description="暂无测试用例数据"
        :image-size="150"
      />
    </div>

    <!-- 详情展示区域 -->
    <div v-if="selectedTestCase" class="detail-section">
      <div class="detail-header">
        <h3>{{ selectedTestCase.name }}</h3>
        <el-tag :type="getStatusType(selectedTestCase.status)" size="small">
          {{ getStatusText(selectedTestCase.status) }}
        </el-tag>
      </div>
      
      <div class="detail-content">
        <!-- 左侧：测试步骤 -->
        <div class="detail-left">
          <h4 class="section-title">测试步骤</h4>
          <div v-if="selectedTestCase.steps.length > 0" class="steps-list">
            <div
              v-for="(step, index) in selectedTestCase.steps"
              :key="index"
              class="step-item"
            >
              <div class="step-number">步骤 {{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-description">
                  <strong>操作：</strong>{{ step.description }}
                </div>
                <div class="step-expected">
                  <strong>预期：</strong>{{ step.expectedResult }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-text">无测试步骤</div>
        </div>

        <!-- 右侧：实际执行结果 -->
        <div class="detail-right">
          <h4 class="section-title">实际执行结果</h4>
          <div v-if="selectedTestCase.results.length > 0" class="results-list">
            <div
              v-for="(result, index) in selectedTestCase.results"
              :key="index"
              class="result-item"
            >
              <el-icon color="#409eff" style="margin-right: 8px; flex-shrink: 0;">
                <InfoFilled />
              </el-icon>
              <span>{{ result.description }}</span>
            </div>
          </div>
          <div v-else class="empty-text">无执行结果</div>
          
          <!-- 备注区域 -->
          <div v-if="selectedTestCase.remark" class="remark-section">
            <h4 class="section-title" style="margin-top: 20px;">备注信息</h4>
            <div class="remark-content">
              {{ selectedTestCase.remark }}
            </div>
          </div>
          
          <!-- 图片区域 -->
          <div v-if="selectedTestCase.images && selectedTestCase.images.length > 0" class="images-section">
            <h4 class="section-title" style="margin-top: 20px;">相关图片</h4>
            <div class="images-grid">
              <el-image
                v-for="(image, index) in selectedTestCase.images"
                :key="index"
                :src="image"
                fit="cover"
                :preview-src-list="selectedTestCase.images"
                :initial-index="index"
                class="detail-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 失败对话框 -->
    <FailureDialog
      v-model:visible="failureDialogVisible"
      :remark="currentFailureCase?.remark"
      :images="currentFailureCase?.images"
      @confirm="handleFailureConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Search, InfoFilled } from '@element-plus/icons-vue'
import type { TestCase, TestStatus } from '../types'
import FailureDialog from './FailureDialog.vue'
import { saveTestCase, getTestCaseMap, type TestCaseStorageData } from '../utils/db'

// 定义 props
const props = defineProps<{
  testCases: TestCase[]
  defaultSelectedId?: string
}>()

// 定义 emits
const emit = defineEmits<{
  selectTestCase: [testCase: TestCase]
}>()

// 搜索和筛选状态
const searchText = ref('')
const filterStatus = ref<TestStatus | ''>('')

// 当前选中的用例
const selectedTestCase = ref<TestCase | null>(null)

// 失败对话框状态
const failureDialogVisible = ref(false)
const currentFailureCase = ref<TestCase | null>(null)

// 过滤后的测试用例
const filteredTestCases = computed(() => {
  let result = props.testCases

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(tc =>
      tc.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(tc => tc.status === filterStatus.value)
  }

  return result
})

// 获取状态标签类型
const getStatusType = (status: TestStatus) => {
  const typeMap = {
    passed: 'success',
    failed: 'danger',
    pending: ''
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: TestStatus) => {
  const textMap = {
    passed: '通过',
    failed: '失败',
    pending: '待执行'
  }
  return textMap[status] || '未知'
}

// 获取行的类名（用于高亮选中行）
const getRowClassName = ({ row }: { row: TestCase }) => {
  return selectedTestCase.value?.id === row.id ? 'selected-row' : ''
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑已在 computed 中处理
}

// 行点击处理
const handleRowClick = (row: TestCase) => {
  selectedTestCase.value = row
  emit('selectTestCase', row)
}

// 保存单个测试用例到 IndexedDB
const saveToIndexedDB = async (testCase: TestCase) => {
  const data: TestCaseStorageData = {
    id: testCase.id,
    status: testCase.status,
    executedAt: testCase.executedAt,
    remark: testCase.remark,
    images: testCase.images
  }
  await saveTestCase(data)
}

// 从 IndexedDB 恢复测试用例状态
const loadFromIndexedDB = async () => {
  try {
    const dataMap = await getTestCaseMap()
    props.testCases.forEach(tc => {
      const saved = dataMap[tc.id]
      if (saved) {
        tc.status = saved.status
        tc.executedAt = saved.executedAt
        tc.remark = saved.remark || ''
        tc.images = saved.images || []
      }
    })
  } catch (error) {
    console.error('Failed to load test case status from IndexedDB:', error)
  }
}

// 处理状态更改
const handleStatusChange = async (testCase: TestCase, newStatus: TestStatus) => {
  if (newStatus === 'failed') {
    // 失败状态：弹出对话框
    currentFailureCase.value = testCase
    failureDialogVisible.value = true
  } else if (newStatus === 'passed') {
    // 成功状态：直接更改
    testCase.status = newStatus
    testCase.executedAt = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    testCase.remark = ''
    testCase.images = []
    
    // 如果当前选中的是该测试用例，同步更新
    if (selectedTestCase.value?.id === testCase.id) {
      selectedTestCase.value = { ...testCase }
    }
    
    // 保存到 IndexedDB
    await saveToIndexedDB(testCase)
  }
}

// 处理失败对话框确认
const handleFailureConfirm = async (data: { remark: string; images: string[] }) => {
  if (!currentFailureCase.value) return
  
  const testCase = currentFailureCase.value
  testCase.status = 'failed'
  testCase.executedAt = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  testCase.remark = data.remark
  testCase.images = data.images
  
  // 如果当前选中的是该测试用例，同步更新
  if (selectedTestCase.value?.id === testCase.id) {
    selectedTestCase.value = { ...testCase }
  }
  
  // 保存到 IndexedDB
  await saveToIndexedDB(testCase)
  
  currentFailureCase.value = null
}

// 重置单个测试用例
const handleResetSingleCase = async (testCase: TestCase) => {
  testCase.status = 'pending'
  testCase.executedAt = ''
  testCase.remark = ''
  testCase.images = []
  
  // 如果当前选中的是该测试用例，同步更新
  if (selectedTestCase.value?.id === testCase.id) {
    selectedTestCase.value = { ...testCase }
  }
  
  // 保存到 IndexedDB
  await saveToIndexedDB(testCase)
}

// 重置当前模块所有测试用例状态
const handleResetStatus = async () => {
  for (const tc of props.testCases) {
    tc.status = 'pending'
    tc.executedAt = ''
    tc.remark = ''
    tc.images = []
    await saveToIndexedDB(tc)
  }
  
  // 如果当前有选中的测试用例，同步更新
  if (selectedTestCase.value) {
    selectedTestCase.value = { ...selectedTestCase.value, status: 'pending', executedAt: '', remark: '', images: [] }
  }
}

// 初始化选中的用例
const initSelection = () => {
  if (props.testCases.length === 0) {
    selectedTestCase.value = null
    return
  }

  let targetCase: TestCase | null = null

  // 如果有默认选中的ID，尝试恢复
  if (props.defaultSelectedId) {
    targetCase = props.testCases.find(tc => tc.id === props.defaultSelectedId) || null
  }

  // 如果没有找到，选中第一个用例
  if (!targetCase) {
    targetCase = props.testCases[0]
  }

  if (targetCase) {
    nextTick(() => {
      selectedTestCase.value = targetCase
      emit('selectTestCase', targetCase!)
    })
  }
}

// 设置选中的用例（供外部调用）
const setSelectedTestCase = (testCaseId: string) => {
  const testCase = props.testCases.find(tc => tc.id === testCaseId)
  if (testCase) {
    selectedTestCase.value = testCase
  }
}

// 监听 testCases 变化，自动初始化选中状态
watch(() => props.testCases, async () => {
  await loadFromIndexedDB()
  initSelection()
}, { immediate: true })

// 暴露方法给父组件
defineExpose({
  setSelectedTestCase,
  initSelection
})
</script>

<style scoped>
.test-case-list {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.table-wrapper {
  max-height: 50%;
  overflow-y: auto;
  flex-shrink: 0;
  margin-bottom: 16px;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.selected-row) {
  background-color: #ecf5ff !important;
}

:deep(.selected-row:hover) {
  background-color: #d9ecff !important;
}

:deep(.el-empty) {
  margin-top: 50px;
}

.clickable-name {
  cursor: pointer;
  color: #409eff;
  transition: color 0.2s;
}

.clickable-name:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.remark-text {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
  font-size: 13px;
}

.empty-text {
  color: #c0c4cc;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.thumbnail-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

.image-count {
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #409eff;
  color: #fff;
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 10px;
  line-height: 1;
}

/* 详情区域备注和图片 */
.remark-section {
  margin-top: 20px;
}

.remark-content {
  padding: 12px;
  background-color: #fff9e6;
  border-left: 3px solid #e6a23c;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.images-section {
  margin-top: 20px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding-right: 8px;
}

.detail-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  transition: transform 0.2s;
}

.detail-image:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 详情区域 */
.detail-section {
  flex: 1;
  border-top: 2px solid #e4e7ed;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.detail-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-content {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.detail-left,
.detail-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  flex-shrink: 0;
}

.steps-list,
.results-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.step-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.step-item:last-child {
  border-bottom: none;
}

.step-number {
  flex-shrink: 0;
  width: 60px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background-color: #409eff;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-description,
.step-expected {
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.step-expected {
  color: #67c23a;
}

.result-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.empty-text {
  color: #909399;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* 滚动条样式 */
.steps-list::-webkit-scrollbar,
.results-list::-webkit-scrollbar,
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.steps-list::-webkit-scrollbar-thumb,
.results-list::-webkit-scrollbar-thumb,
.table-wrapper::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.steps-list::-webkit-scrollbar-thumb:hover,
.results-list::-webkit-scrollbar-thumb:hover,
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}
</style>
