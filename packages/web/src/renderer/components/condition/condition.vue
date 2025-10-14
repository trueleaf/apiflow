<template>
  <div class="condition-config-section">
    <div class="section-header">
      <div class="section-title">
        <span>{{ t('触发条件配置') }}</span>
      </div>
      <el-icon class="delete-icon" @click="handleDelete">
        <Close />
      </el-icon>
    </div>
    
    <div class="section-content">
      <!-- 条件脚本 -->
      <div class="form-row">
        <div class="form-item full-width">
          <div class="script-editor-wrapper">
            <el-input
              v-model="response.conditions.scriptCode"
              type="textarea"
              :placeholder="t('// 示例：\nreturn ctx.query.userId === \'123\';')"
              :rows="8"
              class="script-textarea"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import type { MockHttpNode } from '@src/types/mockNode'

type Props = {
  response: MockHttpNode['response'][0]
  responseIndex: number
}

type Emits = {
  (e: 'delete', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// 删除触发条件配置
const handleDelete = () => {
  ElMessageBox.confirm(
    t('确定删除此触发条件配置吗？'),
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
.condition-config-section {
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

.full-width {
  flex: 1;
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

.script-hint {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  line-height: 1.5;
  margin-bottom: 4px;
}

.script-editor-wrapper {
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.script-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  border: none;
  border-radius: 0;
}
</style>
