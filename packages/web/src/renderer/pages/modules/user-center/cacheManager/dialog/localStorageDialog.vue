<template>
  <el-dialog
    :title="`${currentItem?.description || 'localStorage'} ${t('详情')}`"
    v-model="visible"
    width="70%"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <div class="item-info">
        <div class="info-item">
          <span class="label">{{ t('键名') }}：</span>
          <span class="value">{{ currentItem?.key }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('大小') }}：</span>
          <span class="value">{{ formatBytes(currentItem?.size || 0) }}</span>
        </div>
      </div>
      
      <div class="json-editor-container">
        <SJsonEditor 
          :model-value="formattedValue" 
          :read-only="true" 
          :auto-height="true"
          :max-height="500" 
          :min-height="200" 
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { formatBytes } from '@/helper'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { LocalStorageItem } from '@src/types/apidoc/cache'
import { useTranslation } from 'i18next-vue'

// 获取翻译函数
const { t } = useTranslation()

// 定义属性
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  currentItem: {
    type: Object as () => LocalStorageItem,
    required: true
  }
})

const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// 格式化JSON数据
const formattedValue = computed(() => {
  if (!props.currentItem) return ''
  
  try {
    // 尝试从localStorage获取实际值
    const value = localStorage.getItem(props.currentItem.key) || ''
    
    // 尝试解析为JSON并格式化
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch {
      // 如果不是JSON，直接返回字符串
      return value
    }
  } catch (error) {
    console.error('获取或解析localStorage数据失败:', error)
    return t('无法解析数据')
  }
})

// 定义事件
const emit = defineEmits(['update:visible', 'close'])

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style lang="scss" scoped>
.dialog-content {
  padding: 0;
  min-height: 200px;
}

/* 项目信息区域 */
.item-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.info-item .label {
  font-weight: 500;
  color: #495057;
  margin-right: 8px;
  white-space: nowrap;
}

.info-item .value {
  color: #212529;
  font-size: 13px;
  word-break: break-all;
}

/* JSON编辑器容器 */
.json-editor-container {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 16px;
}
</style>
