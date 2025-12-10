<template>
  <div class="format-selector">
    <div class="format-label">{{ t('文档格式') }}</div>
    <div class="format-items">
      <div
        v-for="format in formats"
        :key="format.value"
        :class="['format-item', { active: modelValue === format.value, disabled: format.disabled }]"
        @click="handleSelect(format)"
      >
        <component :is="format.icon" :size="20" :stroke-width="1.5" class="format-icon" />
        <span class="format-name">{{ t(format.label) }}</span>
        <span v-if="detectedFormat === format.value && modelValue === format.value" class="auto-badge">
          {{ t('自动识别') }}
        </span>
      </div>
    </div>
    <div v-if="detectedFormat && detectedFormat !== 'unknown'" class="format-hint">
      {{ t('已识别格式') }}: <span class="detected-name">{{ detectedFormatLabel }}</span>
      <span v-if="formatVersion">({{ formatVersion }})</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileJson, FileCode, Mail, Sparkles, GitBranch } from 'lucide-vue-next'
import type { ImportFormatType } from '@/composables/useImport'

const props = defineProps<{
  modelValue: ImportFormatType
  detectedFormat?: ImportFormatType
  formatVersion?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: ImportFormatType): void
}>()
const { t } = useI18n()
const formats = computed(() => [
  { value: 'apiflow' as ImportFormatType, label: 'Apiflow', icon: FileJson, disabled: false },
  { value: 'openapi' as ImportFormatType, label: 'OpenAPI', icon: FileCode, disabled: false },
  { value: 'postman' as ImportFormatType, label: 'Postman', icon: Mail, disabled: false },
  { value: 'ai' as ImportFormatType, label: 'AI识别', icon: Sparkles, disabled: true },
  { value: 'repository' as ImportFormatType, label: '代码仓库', icon: GitBranch, disabled: true },
])
const detectedFormatLabel = computed(() => {
  const format = formats.value.find(f => f.value === props.detectedFormat)
  return format ? format.label : props.detectedFormat
})
const handleSelect = (format: typeof formats.value[number]) => {
  if (format.disabled) return
  emit('update:modelValue', format.value)
}
</script>

<style lang="scss" scoped>
.format-selector {
  margin-bottom: 16px;

  .format-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--gray-700);
    margin-bottom: 8px;
  }

  .format-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .format-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover:not(.disabled) {
      border-color: var(--theme-color);
      background: var(--gray-50);
    }

    &.active {
      border-color: var(--theme-color);
      background: var(--theme-color-light);
      color: var(--theme-color);

      .format-icon {
        color: var(--theme-color);
      }
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .format-icon {
      color: var(--gray-600);
    }

    .format-name {
      font-size: 13px;
    }

    .auto-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 10px;
      padding: 2px 6px;
      background: var(--green);
      color: var(--white);
      border-radius: 8px;
    }
  }

  .format-hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--gray-500);

    .detected-name {
      color: var(--theme-color);
      font-weight: 500;
    }
  }
}
</style>
