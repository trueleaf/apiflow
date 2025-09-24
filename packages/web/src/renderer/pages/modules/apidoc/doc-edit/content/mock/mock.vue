<template>
  <div class="mock-layout">
    <CleanTabs v-model="activeTab" type="card" class="mock-tabs">
      <!-- 配置与响应 Tab -->
      <CleanTabPane :label="t('配置与响应')" name="config">
        <div class="mock-config-content">
          <!-- 基础配置区域 -->
          <div class="config-section">
            <div class="config-title">{{ t('基础配置') }}</div>
            <div class="config-form">
              <!-- 启用Mock API开关 -->
              <div class="form-item">
                <label class="form-label">{{ t('启用Mock API') }}</label>
                <el-switch v-model="mockConfig.enabled" />
              </div>
              
              <!-- 端口输入框 -->
              <div class="form-item">
                <label class="form-label">{{ t('端口') }} *</label>
                <el-input 
                  v-model.number="mockConfig.port" 
                  type="number"
                  :placeholder="t('端口')"
                  :min="1"
                  :max="65535"
                  class="port-input"
                  @blur="validatePort"
                />
                <div v-if="portError" class="error-text">{{ portError }}</div>
              </div>
              
              <!-- HTTP方法多选框 -->
              <div class="form-item">
                <label class="form-label">{{ t('HTTP方法') }}</label>
                <el-checkbox-group v-model="mockConfig.methods" class="methods-group">
                  <el-checkbox label="GET">GET</el-checkbox>
                  <el-checkbox label="POST">POST</el-checkbox>
                  <el-checkbox label="PUT">PUT</el-checkbox>
                  <el-checkbox label="PATCH">PATCH</el-checkbox>
                  <el-checkbox label="DELETE">DELETE</el-checkbox>
                  <el-checkbox label="OPTIONS">OPTIONS</el-checkbox>
                  <el-checkbox label="HEAD">HEAD</el-checkbox>
                  <el-checkbox label="ALL">ALL</el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 请求URL输入框 -->
              <div class="form-item">
                <label class="form-label">{{ t('请求URL') }}</label>
                <el-input 
                  v-model="mockConfig.requestUrl" 
                  :placeholder="t('请求URL')"
                  class="url-input"
                />
                <div class="hint-text">{{ t('标准URL路径') }}</div>
              </div>
            </div>
          </div>
          
          <!-- 响应配置区域 -->
          <div class="config-section">
            <div class="response-header">
              <div class="config-title">{{ t('响应配置') }}</div>
              <el-button type="primary" @click="handleAddCondition">
                {{ t('添加条件') }}
              </el-button>
            </div>
            
            <!-- 未配置提示 -->
            <div class="empty-response">
              <div class="empty-text">{{ t('未配置响应条件') }}</div>
              <div class="empty-hint">{{ t('点击"添加条件"创建你的第一个响应') }}</div>
            </div>
          </div>
        </div>
      </CleanTabPane>
      
      <!-- 日志 Tab -->
      <CleanTabPane :label="t('日志')" name="logs">
        <div class="mock-logs-content">
          <el-empty :description="t('日志功能暂未实现')" />
        </div>
      </CleanTabPane>
    </CleanTabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElSwitch, ElInput, ElCheckboxGroup, ElCheckbox, ElButton, ElEmpty } from 'element-plus'
import { CleanTabs, CleanTabPane } from '@/components/ui/cleanDesign/tabs'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 当前激活的tab
const activeTab = ref('config')

// Mock配置数据
const mockConfig = reactive({
  enabled: true,
  port: 3000,
  methods: ['ALL'],
  requestUrl: '/api/test'
})

// 端口验证错误信息
const portError = ref('')

// 验证端口号
const validatePort = () => {
  const port = mockConfig.port
  if (!port || port < 1 || port > 65535) {
    portError.value = t('端口范围为1-65535')
  } else {
    portError.value = ''
  }
}

// 添加条件按钮点击事件
const handleAddCondition = () => {
  console.log('添加条件按钮被点击')
}
</script>

<style scoped>
.mock-layout {
  height: 100%;
  background: var(--white);
  padding: 30px;
}

/* CleanTabs 样式 */
.mock-tabs {
  height: 100%;
  
  :deep(.clean-tabs__header) {
    margin-bottom: 16px;
  }
  
  :deep(.clean-tabs__content) {
    height: calc(100% - 60px);
    overflow-y: auto;
    padding: 0;
  }
}

/* 配置内容区域 */
.mock-config-content {
  margin: 0 auto;
}

/* 配置区块 */
.config-section {
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.config-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 16px;
}

/* 表单样式 */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  max-width: 400px;
}

.methods-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  :deep(.el-checkbox) {
    margin-right: 0;
    
    .el-checkbox__label {
      font-size: var(--font-size-sm);
    }
  }
}

.hint-text {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-top: 4px;
}

.error-text {
  font-size: var(--font-size-xs);
  color: var(--red);
  margin-top: 4px;
}

/* 响应配置区域 */
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

/* 日志内容区域 */
.mock-logs-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
}

/* 响应式布局 - 小屏适配 */
@media (max-width: 960px) {
  .mock-layout {
    padding: 12px;
  }
  
  .config-form {
    gap: 16px;
  }
  
  .port-input,
  .url-input {
    max-width: 100%;
  }
  
  .response-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .methods-group {
    gap: 8px;
  }
}

@media (max-width: 760px) {
  .mock-layout {
    padding: 8px;
  }
  
  .mock-config-content {
    max-width: 100%;
  }
  
  .config-section {
    margin-bottom: 24px;
  }
  
  .config-title {
    font-size: var(--font-size-base);
    margin-bottom: 12px;
  }
  
  .methods-group {
    :deep(.el-checkbox) {
      .el-checkbox__label {
        font-size: var(--font-size-xs);
      }
    }
  }
  
  .empty-response {
    padding: 30px 16px;
  }
  
  :deep(.el-tabs__item) {
    padding: 6px 12px;
    font-size: var(--font-size-xs);
  }
}
</style>
