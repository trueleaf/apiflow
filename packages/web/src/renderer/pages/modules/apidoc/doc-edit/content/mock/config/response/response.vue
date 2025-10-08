<template>
  <div class="response-content">
    <!-- 标题栏：响应配置 + 新增按钮 -->
    <div class="header-section">
      <div class="main-title">{{ t('响应配置') }}</div>
      <el-tooltip effect="light" :content="t('新增一个条件返回')" placement="top" :show-after="1000">
        <div class="add-response-btn">
          <el-icon @click="handleAddResponse">
            <Plus />
          </el-icon>
        </div>
      </el-tooltip>
    </div>

    <!-- 响应列表区域 -->
    <div class="response-list">
      <!-- 单个响应配置卡片 -->
      <div v-for="(response, index) in mockResponses" :key="index" class="response-card">
        <!-- 数据类型选择行 -->
        <div class="form-row">
          <!-- 返回数据结构 -->
          <div class="form-item flex-item">
            <label class="form-label">{{ t('返回数据结构') }}</label>
            <el-radio-group v-model="response.dataType" size="small">
              <el-radio-button label="json">JSON</el-radio-button>
              <el-radio-button label="text">Text</el-radio-button>
              <el-radio-button label="image">Image</el-radio-button>
              <el-radio-button label="file">File</el-radio-button>
              <el-radio-button label="binary">Binary</el-radio-button>
              <el-radio-button label="sse">SSE</el-radio-button>
            </el-radio-group>
          </div>
          
          <!-- 数据模式（仅 JSON 类型显示） -->
          <div v-if="response.dataType === 'json'" class="form-item flex-item">
            <label class="form-label">{{ t('数据模式') }}</label>
            <el-radio-group v-model="response.jsonConfig.mode">
              <el-radio label="fixed">{{ t('固定JSON返回') }}</el-radio>
              <el-radio label="randomAi">{{ t('AI生成') }}</el-radio>
              <el-radio label="random">{{ t('随机JSON返回') }}</el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 随机JSON大小配置（仅随机模式显示） -->
        <div v-if="response.dataType === 'json' && response.jsonConfig.mode === 'random'" class="form-row">
          <div class="form-item flex-item">
            <label class="form-label">{{ t('随机字段个数') }}</label>
            <el-input-number 
              v-model="response.jsonConfig.randomSize" 
              :min="1" 
              :max="500" 
              :step="1"
              size="small"
              controls-position="right"
            />
            <!-- 提示信息 -->
            <div v-if="showRandomSizeHint" class="hint-text">
              <span class="hint-message">{{ t('字段个数，最多500个字段') }}</span>
              <span class="hint-dismiss" @click="handleDismissHint">{{ t('不再提示') }}</span>
            </div>
          </div>
        </div>

        <!-- 固定JSON编辑器区域 -->
        <div 
          v-if="response.dataType === 'json' && response.jsonConfig.mode === 'fixed'" 
          class="json-editor-wrapper">
          <SJsonEditor 
            v-model="response.jsonConfig.fixedData"
            :config="{ fontSize: 13, language: 'json' }">
          </SJsonEditor>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useHttpMock } from '@/store/httpMock/httpMock'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { getMockJsonRandomSizeHintVisible, setMockJsonRandomSizeHintVisible } from '@/cache/common/common'

const { t } = useI18n()
const httpMockStore = useHttpMock()
const { httpMock } = storeToRefs(httpMockStore)

// 从 store 中获取响应配置
const mockResponses = computed(() => httpMock.value.response)

// 提示信息显示状态
const showRandomSizeHint = ref(true)

// 初始化提示状态
onMounted(() => {
  showRandomSizeHint.value = getMockJsonRandomSizeHintVisible()
})

// 处理"不再提示"点击
const handleDismissHint = () => {
  showRandomSizeHint.value = false
  setMockJsonRandomSizeHintVisible(false)
}

// 新增返回值
const handleAddResponse = () => {
  httpMock.value.response.push({
    isDefault: false,
    conditions: {
      name: '',
      scriptCode: '',
    },
    statusCode: 200,
    headers: {},
    dataType: 'json',
    sseConfig: {
      event: {
        id: {
          enable: false,
          valueMode: 'increment',
        },
        event: {
          enable: false,
          value: '',
        },
        data: {
          mode: 'json',
          value: '',
        },
        retry: {
          enable: false,
          value: 3000,
        },
      },
      interval: 1000,
      maxNum: 10,
    },
    jsonConfig: {
      mode: 'fixed',
      fixedData: '',
      randomSize: 10,
      prompt: '',
    },
    textConfig: {
      mode: 'fixed',
      fixedData: '',
      randomSize: 100,
      prompt: '',
    },
    imageConfig: {
      mode: 'random',
      imageConfig: 'png',
      randomSize: 1,
      randomWidth: 800,
      randomHeight: 600,
      fixedFilePath: '',
    },
    fileConfig: {
      fileType: 'pdf',
    },
    binaryConfig: {
      filePath: '',
    },
  })
  ElMessage.success(t('添加成功'))
}
</script>

<style scoped>
.response-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.main-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
}

.add-response-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  cursor: pointer;

  .el-icon {
    width: 25px;
    height: 25px;
    transition: background 0.3s;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: var(--gray-200);
    }
  }
}

/* 响应列表 */
.response-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 20px;
  flex: 1;
  min-height: 0;
}

/* 响应卡片 */
.response-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: white;
  flex: 1;
  min-height: 0;
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

.form-label {
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  font-weight: 500;
}

/* JSON编辑器容器 */
.json-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  margin-top: 12px;
}

/* 提示信息样式 */
.hint-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.hint-message {
  color: var(--gray-500);
  flex: 1;
}

.hint-dismiss {
  color: var(--color-primary);
  cursor: pointer;
  margin-left: 12px;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}
</style>