<template>
  <div class="mock-config-content">
    <div class="config-section">
      <div class="config-title">{{ t('触发条件配置') }}</div>
      <div class="config-form">
        <div class="form-row">
          <div class="form-item flex-item">
            <label class="form-label">{{ t('端口') }} *</label>
            <el-input
              v-model.number="httpMock.requestCondition.port"
              type="number"
              :placeholder="t('端口')"
              :min="1"
              :max="65535"
              class="port-input"
            />
          </div>
          <div class="form-item flex-item">
            <label class="form-label">{{ t('HTTP方法') }}</label>
            <el-checkbox-group v-model="httpMock.requestCondition.method" class="methods-group">
              <el-checkbox label="ALL">ALL</el-checkbox>
              <el-checkbox label="GET">GET</el-checkbox>
              <el-checkbox label="POST">POST</el-checkbox>
              <el-checkbox label="PUT">PUT</el-checkbox>
              <el-checkbox label="PATCH">PATCH</el-checkbox>
              <el-checkbox label="DELETE">DELETE</el-checkbox>
              <el-checkbox label="OPTIONS">OPTIONS</el-checkbox>
              <el-checkbox label="HEAD">HEAD</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item flex-item">
            <label class="form-label">{{ t('请求URL') }}</label>
            <el-input
              v-model="httpMock.requestCondition.url"
              :placeholder="t('请求URL')"
              class="url-input"
            />
            <div class="hint-text">{{ t('标准URL路径') }}</div>
          </div>
          <div class="form-item flex-item">
            <label class="form-label">{{ t('启用Mock API') }}</label>
            <el-switch v-model="httpMock.requestCondition.enabled" />
          </div>
        </div>
      </div>
    </div>
    <div class="config-section">
      <div class="response-header">
        <div class="config-title">{{ t('响应配置') }}</div>
        <el-button type="primary" @click="handleAddCondition">
          {{ t('添加条件') }}
        </el-button>
      </div>
      <div class="empty-response">
        <div class="empty-text">{{ t('未配置响应条件') }}</div>
        <div class="empty-hint">{{ t('点击"添加条件"创建你的第一个响应') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { ElSwitch, ElInput, ElCheckboxGroup, ElCheckbox, ElButton } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)

const handleAddCondition = () => {
  console.log('添加条件按钮被点击')
}

watch(
  () => httpMock.value.requestCondition.method,
  (newMethods, oldMethods) => {
    if (!Array.isArray(newMethods) || !Array.isArray(oldMethods)) {
      return
    }

    if (newMethods.length === 0) {
      httpMockStore.changeHttpMethod(['ALL'])
      return
    }

    const hasNewAll = newMethods.includes('ALL') && !oldMethods.includes('ALL')
    const hasNewOther = newMethods.some((method) => method !== 'ALL' && !oldMethods.includes(method))

    if (hasNewAll) {
      httpMockStore.changeHttpMethod(['ALL'])
    } else if (hasNewOther && newMethods.includes('ALL')) {
      const methodsWithoutAll = newMethods.filter((method) => method !== 'ALL')
      httpMockStore.changeHttpMethod(methodsWithoutAll as any)
    }
  }
)
</script>

<style scoped>
.mock-config-content {
  margin: 0 auto;
}

.config-section {
  margin-bottom: 12px;
}

.config-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 16px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-item {
  flex: 0 0 auto;
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

.port-input {
  max-width: 200px;
}

.url-input {
  width: 520px;
}

.methods-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 400px;
}

.methods-group :deep(.el-checkbox) {
  margin-right: 20px;
}

.hint-text {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-top: 4px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.empty-response {
  text-align: center;
  padding: 40px 20px;
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
  border: 1px dashed var(--gray-300);
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--gray-600);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

@media (max-width: 960px) {
  .config-form {
    gap: 14px;
  }

  .form-row {
    flex-direction: column;
    gap: 14px;
  }

  .port-input,
  .url-input {
    max-width: 100%;
  }

  .methods-group {
    min-width: auto;
    gap: 6px;
  }

  .response-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 760px) {
  .config-section {
    margin-bottom: 24px;
  }

  .config-title {
    font-size: var(--font-size-base);
    margin-bottom: 12px;
  }

  .methods-group {
    gap: 8px;
  }

  .methods-group :deep(.el-checkbox) .el-checkbox__label {
    font-size: var(--font-size-xs);
  }

  .empty-response {
    padding: 30px 16px;
  }
}
</style>
