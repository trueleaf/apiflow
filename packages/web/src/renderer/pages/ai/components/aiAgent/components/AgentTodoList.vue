<template>
  <div v-if="todoList.length > 0" class="agent-todo-list">
    <div class="todo-header">
      <ListTodo :size="14" class="todo-header-icon" />
      <span class="todo-header-title">{{ t('任务计划') }}</span>
      <span class="todo-header-progress">{{ completedCount }}/{{ todoList.length }}</span>
    </div>
    <div class="todo-items">
      <div
        v-for="item in todoList"
        :key="item.id"
        class="todo-item"
        :class="[`status-${item.status}`, { 'is-current': item.id === currentTodoId }]"
      >
        <div class="todo-item-icon">
          <component :is="getStatusIcon(item.status)" :size="14" class="status-icon" />
        </div>
        <div class="todo-item-content">
          <span class="todo-step-number">{{ item.stepNumber }}.</span>
          <span class="todo-step-title">{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ListTodo, Circle, Loader2, CheckCircle2, XCircle, SkipForward } from 'lucide-vue-next'
import type { TodoItem, TodoItemStatus } from '@src/types/ai'

const props = defineProps<{
  todoList: TodoItem[]
  currentTodoId?: string
}>()
const { t } = useI18n()
const completedCount = computed(() => {
  return props.todoList.filter(item => item.status === 'success').length
})
const getStatusIcon = (status: TodoItemStatus) => {
  const icons = {
    pending: Circle,
    running: Loader2,
    success: CheckCircle2,
    error: XCircle,
    skipped: SkipForward
  }
  return icons[status]
}
</script>

<style scoped>
.agent-todo-list {
  background: var(--ai-bubble-ai-bg);
  border-radius: 8px;
  border: 1px solid var(--ai-tool-border);
  padding: 10px 12px;
  margin-bottom: 8px;
}
.todo-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ai-tool-border);
}
.todo-header-icon {
  color: var(--ai-primary-color);
}
.todo-header-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ai-text-primary);
}
.todo-header-progress {
  margin-left: auto;
  font-size: 12px;
  color: var(--ai-text-secondary);
  background: var(--ai-action-hover-bg);
  padding: 2px 8px;
  border-radius: 10px;
}
.todo-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
}
.todo-item.is-current {
  background: var(--ai-action-hover-bg);
}
.todo-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.todo-item-icon .status-icon {
  color: var(--ai-text-muted);
}
.todo-item.status-pending .status-icon {
  color: var(--ai-text-muted);
}
.todo-item.status-running .status-icon {
  color: var(--ai-primary-color);
  animation: spin 1s linear infinite;
}
.todo-item.status-success .status-icon {
  color: var(--el-color-success);
}
.todo-item.status-error .status-icon {
  color: var(--el-color-danger);
}
.todo-item.status-skipped .status-icon {
  color: var(--ai-text-muted);
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.todo-item-content {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--ai-text-primary);
}
.todo-step-number {
  font-weight: 500;
  color: var(--ai-text-secondary);
}
.todo-item.status-success .todo-item-content {
  color: var(--ai-text-secondary);
}
.todo-item.status-success .todo-step-title {
  text-decoration: line-through;
}
</style>
