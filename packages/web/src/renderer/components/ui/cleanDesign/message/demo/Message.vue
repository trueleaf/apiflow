<template>
  <div class="message-demo">
    <h2 class="demo-title">Message 消息提示组件</h2>
    <div class="demo-section">
      <h3>基础用法</h3>
      <el-button @click="showBasic">显示基础消息</el-button>
    </div>
    <div class="demo-section">
      <h3>带标题和描述</h3>
      <el-button @click="showWithTitle">显示带标题的消息</el-button>
    </div>
    <div class="demo-section">
      <h3>带复选框</h3>
      <el-button @click="showWithCheckbox">显示带复选框的消息</el-button>
    </div>
    <div class="demo-section">
      <h3>只有确认按钮</h3>
      <el-button @click="showConfirmOnly">只显示确认按钮</el-button>
    </div>
    <div class="demo-section">
      <h3>自定义按钮文本</h3>
      <el-button @click="showCustomButton">自定义按钮文本</el-button>
    </div>
    <div class="demo-section">
      <h3>多实例演示</h3>
      <el-button @click="showMultiple">连续显示多个消息</el-button>
    </div>
    <div class="demo-section">
      <h3>Promise 异步等待</h3>
      <el-button @click="showWithPromise" :loading="loading">异步等待用户操作</el-button>
      <p v-if="result" class="result-text">用户操作结果: {{ result }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showMessage } from '../message'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const result = ref('')
const showBasic = () => {
  showMessage({
    message: '这是一条基础消息提示',
  }).then(() => {
    ElMessage.success('用户点击了确认')
  }).catch(() => {
    ElMessage.info('用户点击了取消')
  })
}
const showWithTitle = () => {
  showMessage({
    title: '操作提示',
    message: '确定要执行此操作吗？此操作将不可撤销。',
  }).then(() => {
    ElMessage.success('操作已确认')
  }).catch(() => {
    ElMessage.info('操作已取消')
  })
}
const showWithCheckbox = () => {
  showMessage({
    title: '删除确认',
    message: '确定要删除这个项目吗？删除后将无法恢复。',
    showCheckbox: true,
    checkboxText: '不再询问',
  }).then((res) => {
    if (res.checked) {
      ElMessage.success('已确认删除，并勾选了不再询问')
    } else {
      ElMessage.success('已确认删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
const showConfirmOnly = () => {
  showMessage({
    title: '通知',
    message: '操作已完成！',
    showCancel: false,
  }).then(() => {
    ElMessage.success('已确认')
  })
}
const showCustomButton = () => {
  showMessage({
    title: '保存确认',
    message: '是否保存当前的修改内容？',
    confirmButtonText: '保存',
    cancelButtonText: '放弃',
  }).then(() => {
    ElMessage.success('已保存')
  }).catch(() => {
    ElMessage.warning('已放弃修改')
  })
}
const showMultiple = () => {
  showMessage({
    title: '第一个消息',
    message: '这是第一个消息',
  })
  setTimeout(() => {
    showMessage({
      title: '第二个消息',
      message: '这是第二个消息',
    })
  }, 500)
  setTimeout(() => {
    showMessage({
      title: '第三个消息',
      message: '这是第三个消息',
    })
  }, 1000)
}
const showWithPromise = async () => {
  loading.value = true
  result.value = ''
  try {
    const res = await showMessage({
      title: '异步确认',
      message: '请确认是否继续操作',
      showCheckbox: true,
    })
    result.value = `确认操作，复选框状态: ${res.checked}`
  } catch {
    result.value = '取消操作'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.message-demo {
  padding: 20px;
  max-width: 800px;
}
.demo-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}
.demo-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-base);
}
.demo-section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--text-primary);
}
.result-text {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
