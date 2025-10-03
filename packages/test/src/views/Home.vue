<template>
  <div class="home-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧模块树 -->
      <div class="left-panel">
        <ModuleTree
          ref="moduleTreeRef"
          :tree-data="moduleTreeData"
          :default-selected-key="userPreferenceStore.currentModuleId"
          @node-click="handleModuleSelect"
        />
      </div>

      <!-- 右侧用例列表 -->
      <div class="right-panel">
        <TestCaseList
          ref="testCaseListRef"
          :test-cases="currentTestCases"
          :default-selected-id="userPreferenceStore.currentTestCaseId"
          @select-test-case="handleTestCaseSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import ModuleTree from '../components/ModuleTree.vue'
import TestCaseList from '../components/TestCaseList.vue'
import { moduleTreeData, testModulesData } from '../mock/testCaseData'
import { useUserPreferenceStore } from '../stores/userPreference'
import type { ModuleTreeNode, TestCase } from '../types'

// 用户偏好 store
const userPreferenceStore = useUserPreferenceStore()

// 组件引用
const moduleTreeRef = ref()
const testCaseListRef = ref()

// 当前选中的模块
const selectedModuleId = ref<string>('')

// 当前展示的测试用例
const currentTestCases = computed(() => {
  if (!selectedModuleId.value) {
    return []
  }
  const module = testModulesData.find(m => m.id === selectedModuleId.value)
  return module ? module.testCases : []
})

// 处理模块选择
const handleModuleSelect = (node: ModuleTreeNode) => {
  if (node.moduleId) {
    selectedModuleId.value = node.moduleId
    // 保存选中的模块到 store
    userPreferenceStore.setSelectedModule(node.moduleId)
  }
}

// 处理测试用例选择
const handleTestCaseSelect = (testCase: TestCase) => {
  // 保存选中的用例到 store
  userPreferenceStore.setSelectedTestCase(testCase.id)
}

// 初始化页面状态
const initPageState = () => {
  // 加载用户偏好
  userPreferenceStore.loadPreference()

  nextTick(() => {
    const savedModuleId = userPreferenceStore.currentModuleId
    const savedTestCaseId = userPreferenceStore.currentTestCaseId

    // ModuleTree 会自动初始化选中第一个模块或恢复选中状态
    // 这里不需要手动处理，因为 ModuleTree 的 onMounted 会处理

    // 如果有保存的用例ID，在 TestCaseList 加载后恢复
    if (savedTestCaseId && testCaseListRef.value) {
      setTimeout(() => {
        testCaseListRef.value?.setSelectedTestCase(savedTestCaseId)
      }, 100)
    }
  })
}

// 组件挂载
onMounted(() => {
  initPageState()
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.page-header .subtitle {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #909399;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}

.left-panel {
  width: 280px;
  flex-shrink: 0;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>