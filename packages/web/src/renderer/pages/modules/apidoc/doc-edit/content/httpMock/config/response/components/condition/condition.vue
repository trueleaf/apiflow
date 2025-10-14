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
            <code-editor
              v-model="response.conditions.scriptCode"
              :config="editorConfig"
              :min-height="200"
              :max-height="400"
              :auto-height="true"
              :show-format-button="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import CodeEditor from '@/components/common/code-editor/code-editor.vue'
import { reqCompletionSuggestions } from './completionSuggestions'
import type { MockHttpNode } from '@src/types/mockNode'
import type { EditorConfig } from '@/components/common/code-editor/types'

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
// 编辑器配置
const editorConfig = computed<EditorConfig>(() => ({
  enableCompletion: true,
  triggerCharacters: ['.', '('],
  completionSuggestions: reqCompletionSuggestions,
  editorOptions: {
    fontSize: 14,
    lineNumbers: 'on',
    tabSize: 2
  }
}))
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
  color: var(--gray-600);
  line-height: 1.6;
  padding: 12px;
  background: var(--gray-50);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--gray-200);
}
.hint-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--gray-700);
}
.hint-content {
  margin-bottom: 8px;
  line-height: 1.8;
}
.hint-content code {
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: var(--font-size-xs);
  color: var(--primary);
}
.hint-note {
  font-style: italic;
  color: var(--warning);
  margin-top: 6px;
}
.script-editor-wrapper {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}
</style>
