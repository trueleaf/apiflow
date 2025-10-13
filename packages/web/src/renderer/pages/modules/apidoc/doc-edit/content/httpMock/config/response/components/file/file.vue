<template>
  <div class="file-config-wrapper">
    <div class="form-row">
      <div class="form-item full-width">
        <label class="form-label">{{ t('文件类型') }}</label>
        <div class="file-type-grid">
          <!-- PDF -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'pdf' }"
            @click="response.fileConfig.fileType = 'pdf'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconpdfwenjian"></use>
            </svg>
            <div class="file-type-label">PDF</div>
          </div>

          <!-- DOC -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'doc' }"
            @click="response.fileConfig.fileType = 'doc'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconWORD"></use>
            </svg>
            <div class="file-type-label">DOC</div>
          </div>

          <!-- DOCX -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'docx' }"
            @click="response.fileConfig.fileType = 'docx'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconWORD"></use>
            </svg>
            <div class="file-type-label">DOCX</div>
          </div>

          <!-- XLS -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'xls' }"
            @click="response.fileConfig.fileType = 'xls'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconexcel"></use>
            </svg>
            <div class="file-type-label">XLS</div>
          </div>

          <!-- XLSX -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'xlsx' }"
            @click="response.fileConfig.fileType = 'xlsx'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconexcel"></use>
            </svg>
            <div class="file-type-label">XLSX</div>
          </div>

          <!-- PPT -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'ppt' }"
            @click="response.fileConfig.fileType = 'ppt'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconppt"></use>
            </svg>
            <div class="file-type-label">PPT</div>
          </div>

          <!-- PPTX -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'pptx' }"
            @click="response.fileConfig.fileType = 'pptx'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconppt"></use>
            </svg>
            <div class="file-type-label">PPTX</div>
          </div>

          <!-- ZIP -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === 'zip' }"
            @click="response.fileConfig.fileType = 'zip'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconyasuobao"></use>
            </svg>
            <div class="file-type-label">ZIP</div>
          </div>

          <!-- 7Z -->
          <div 
            class="file-type-item"
            :class="{ 'is-selected': response.fileConfig.fileType === '7z' }"
            @click="response.fileConfig.fileType = '7z'">
            <svg class="icon file-type-icon" aria-hidden="true">
              <use xlink:href="#iconyasuobao"></use>
            </svg>
            <div class="file-type-label">7Z</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { MockHttpNode } from '@src/types'

type ResponseItem = MockHttpNode['response'][0]

type Props = {
  response: ResponseItem
}

defineProps<Props>()
const { t } = useI18n()
</script>

<style scoped>
.file-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.full-width {
  width: 100%;
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

.form-label {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

/* 文件类型网格布局 */
.file-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 80px);
  gap: 12px;
  margin-top: 8px;
}

/* 单个文件类型卡片 */
.file-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  padding: 12px;
  border: 1px solid var(--gray-300);
  background: white;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    border-color: var(--primary);
    background: var(--el-color-primary-light-9);
  }
  
  &.is-selected {
    border-color: var(--primary);
    background: var(--el-color-primary-light-9);
    
    .file-type-label {
      color: var(--primary);
      font-weight: 600;
    }
  }
}

/* 文件类型图标 */
.file-type-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}

/* 文件类型标签 */
.file-type-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  text-align: center;
}
</style>
