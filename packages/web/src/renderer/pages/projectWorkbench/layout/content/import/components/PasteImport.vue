<template>
  <div class="paste-import">
    <el-input
      v-model="content"
      type="textarea"
      :placeholder="t('请粘贴 JSON 或 YAML 格式的内容')"
      :rows="10"
      resize="none"
    />
    <div class="paste-actions">
      <el-button type="primary" :disabled="!content.trim()" @click="handleParse">
        {{ t('解析内容') }}
      </el-button>
      <el-button @click="handleClear">{{ t('清空') }}</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import jsyaml from 'js-yaml'

const emit = defineEmits<{
  (e: 'success', data: unknown): void
  (e: 'error', message: string): void
}>()
const { t } = useI18n()
const content = ref('')
// 解析内容
const handleParse = () => {
  if (!content.value.trim()) {
    ElMessage.warning(t('请输入内容'))
    return
  }
  try {
    let data: unknown
    try {
      data = JSON.parse(content.value)
    } catch {
      data = jsyaml.load(content.value)
    }
    emit('success', data)
    ElMessage.success(t('解析成功'))
  } catch (err) {
    const errorMsg = t('内容解析失败')
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  }
}
// 清空内容
const handleClear = () => {
  content.value = ''
}
</script>

<style lang="scss" scoped>
.paste-import {
  :deep(.el-textarea__inner) {
    font-family: var(--font-family-code);
    font-size: 13px;
  }

  .paste-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
}
</style>
