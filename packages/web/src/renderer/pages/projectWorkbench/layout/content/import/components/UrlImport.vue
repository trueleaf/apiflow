<template>
  <div class="url-import">
    <div class="url-input-wrap">
      <el-input
        v-model="url"
        :placeholder="t('请输入URL地址')"
        clearable
        size="large"
      >
        <template #prefix>
          <Link :size="16" class="input-icon" />
        </template>
        <template #append>
          <el-button :loading="loading" type="primary" @click="handleFetch">
            {{ t('获取') }}
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="url-hint">
      {{ t('支持 OpenAPI、Postman、Apiflow 等格式的 JSON/YAML 文件 URL') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Link } from 'lucide-vue-next'
import jsyaml from 'js-yaml'

const emit = defineEmits<{
  (e: 'success', data: unknown): void
  (e: 'error', message: string): void
}>()
const { t } = useI18n()
const url = ref('')
const loading = ref(false)
// 获取 URL 内容
const handleFetch = async () => {
  if (!url.value.trim()) {
    ElMessage.warning(t('请输入URL地址'))
    return
  }
  try {
    loading.value = true
    const response = await fetch(url.value)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const content = await response.text()
    const isYaml = url.value.endsWith('.yaml') || url.value.endsWith('.yml')
    const data = isYaml ? jsyaml.load(content) : JSON.parse(content)
    emit('success', data)
    ElMessage.success(t('获取成功'))
  } catch (err) {
    const errorMsg = t('URL获取失败')
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.url-import {
  .url-input-wrap {
    :deep(.el-input-group__append) {
      background-color: var(--theme-color);
      border-color: var(--theme-color);

      .el-button {
        color: var(--white);
      }
    }
  }

  .url-hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--gray-500);
  }
}
</style>
