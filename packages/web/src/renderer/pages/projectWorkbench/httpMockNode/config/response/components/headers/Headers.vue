<template>
  <div class="response-headers-section">
    <div class="section-header">
      <div class="section-title">
        <el-icon class="collapse-icon" @click="handleToggleCollapse">
          <ArrowRight v-if="isCollapsed" />
          <ArrowDown v-if="!isCollapsed" />
        </el-icon>
        <span>{{ t('返回头配置') }}</span>
      </div>
      <el-icon class="delete-icon" @click="handleDelete">
        <Close />
      </el-icon>
    </div>

    <div v-if="!isCollapsed" class="section-content">
      <!-- 默认返回头（可隐藏） -->
      <div v-if="!hideDefaultHeaders">
        <span class="cursor-pointer no-select" @click="hideDefaultHeaders = true">
          <span>{{ t('点击隐藏') }}</span>
        </span>
        <SParamsTree
          :drag="false"
          show-checkbox
          :data="response.headers.defaultHeaders"
          no-add
        />
      </div>
      <div v-else class="cursor-pointer no-select d-flex a-center" @click="hideDefaultHeaders = false">
        <span>{{ response.headers.defaultHeaders.length }}{{ t('个隐藏') }}</span>
        <el-icon :size="16" class="ml-1">
          <View />
        </el-icon>
      </div>

      <!-- 自定义返回头 -->
      <SParamsTree
        :drag="false"
        show-checkbox
        :data="response.headers.customHeaders"
        no-add
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, ArrowRight, ArrowDown, View } from '@element-plus/icons-vue'
import SParamsTree from '@/components/apidoc/paramsTree/GParamsTree3.vue'
import { userState } from '@/cache/userState/userStateCache'
import type { MockHttpNode } from '@src/types/mockNode'

type Props = {
  response: MockHttpNode['response'][0]
  responseIndex: number
  mockNodeId: string
}

type Emits = {
  (e: 'delete', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const isCollapsed = ref(false)
const hideDefaultHeaders = ref(true)

// 初始化折叠状态
onMounted(() => {
  isCollapsed.value = userState.getHttpMockResponseHeadersCollapseState(props.mockNodeId, props.responseIndex)
})

// 切换折叠状态
const handleToggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  userState.setHttpMockResponseHeadersCollapseState(props.mockNodeId, props.responseIndex, isCollapsed.value)
}

// 删除返回头配置
const handleDelete = () => {
  ElMessageBox.confirm(
    t('确定删除此返回头配置吗？'),
    t('提示'),
    {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning',
    }
  ).then(() => {
    emit('delete', props.responseIndex)
    ElMessage.success(t('删除成功'))
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.response-headers-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.collapse-icon {
  cursor: pointer;
  color: var(--gray-500);
  transition: all 0.3s;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-icon:hover {
  color: var(--gray-700);
}

.delete-icon {
  cursor: pointer;
  color: var(--gray-400);
  transition: color 0.3s;
  font-size: 16px;
}

.delete-icon:hover {
  color: var(--danger);
}

.section-content {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.cursor-pointer {
  cursor: pointer;
}

.no-select {
  user-select: none;
}

.d-flex {
  display: flex;
}

.a-center {
  align-items: center;
}

.ml-1 {
  margin-left: 4px;
}
</style>
