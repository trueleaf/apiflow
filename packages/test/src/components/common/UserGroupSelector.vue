<template>
  <div class="user-group-selector">
    <el-input
      v-model="queryText"
      :placeholder="placeholder"
      clearable
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="handleBlur"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    
    <!-- 下拉选择框 -->
    <div 
      v-if="showDropdown && (searchStore.searchResults.length > 0 || searchStore.loading)"
      class="dropdown-panel"
    >
      <div v-if="searchStore.loading" class="loading-item">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>搜索中...</span>
      </div>
      
      <div 
        v-for="item in searchStore.searchResults" 
        :key="item.id"
        class="dropdown-item"
        @click="handleSelect(item)"
      >
        <div class="item-content">
          <span class="item-name">{{ item.name }}</span>
          <el-tag v-if="item.type === 'user'" size="small">用户</el-tag>
          <el-tag v-else type="success" size="small">组</el-tag>
        </div>
      </div>
      
      <div 
        v-if="searchStore.searchResults.length === 0 && !searchStore.loading"
        class="empty-item"
      >
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Loading } from '@element-plus/icons-vue'
import { useSearchStore } from '@/stores'
import type { UserOrGroup } from '@/types'

// Props
interface Props {
  modelValue: Array<UserOrGroup & { permission: string }>
  placeholder?: string
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: Array<UserOrGroup & { permission: string }>): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索用户或组...'
})

const emit = defineEmits<Emits>()

const searchStore = useSearchStore()
const queryText = ref('')
const showDropdown = ref(false)

let searchTimer: NodeJS.Timeout | null = null

// 监听输入变化
const handleInput = (value: string) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = setTimeout(() => {
    if (value.trim()) {
      searchStore.searchUserOrGroup(value.trim())
      showDropdown.value = true
    } else {
      searchStore.clearResults()
      showDropdown.value = false
    }
  }, 300)
}

// 处理失焦
const handleBlur = () => {
  // 延迟隐藏下拉框，确保点击事件能够触发
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// 选择项目
const handleSelect = (item: UserOrGroup) => {
  // 检查是否已经选中
  const isSelected = props.modelValue.some(selected => selected.id === item.id)
  if (isSelected) {
    return
  }
  
  // 添加到选中列表，默认权限为读写
  const newMember = {
    ...item,
    permission: 'readAndWrite'
  }
  
  const updatedValue = [...props.modelValue, newMember]
  emit('update:modelValue', updatedValue)
  
  // 清空搜索
  queryText.value = ''
  searchStore.clearResults()
  showDropdown.value = false
}

// 清理定时器
watch(() => props.modelValue, () => {
  // 可以在这里处理其他逻辑
}, { deep: true })
</script>

<style scoped>
.user-group-selector {
  position: relative;
  width: 100%;
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: var(--z-index-dropdown);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-md);
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--duration-slow) ease;
}

.dropdown-item:hover {
  background-color: var(--color-bg-secondary);
}

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  flex: 1;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.loading-item,
.empty-item {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.loading-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}
</style>