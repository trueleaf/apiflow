<template>
  <div class="repo-import">
    <!-- AI 不可用提示 -->
    <div v-if="!isAiAvailable" class="ai-unavailable">
      <AlertCircle :size="20" class="warning-icon" />
      <span>{{ t('AI 功能不可用，请先配置 API Key') }}</span>
      <el-button type="primary" link @click="handleGoSettings">{{ t('前往配置') }}</el-button>
    </div>
    <!-- 输入区域 -->
    <div v-else class="repo-input-area">
      <!-- 框架选择 -->
      <div class="framework-select">
        <span class="select-label">{{ t('项目框架') }}：</span>
        <el-select v-model="selectedFramework" :placeholder="t('选择框架类型')" :disabled="loading">
          <el-option
            v-for="fw in frameworks"
            :key="fw.value"
            :label="fw.label"
            :value="fw.value"
          />
        </el-select>
      </div>
      <!-- 代码输入 -->
      <div class="code-input">
        <div class="input-header">
          <span>{{ t('路由代码') }}</span>
          <el-tooltip :content="t('粘贴包含路由定义的代码文件内容')">
            <HelpCircle :size="14" class="help-icon" />
          </el-tooltip>
        </div>
        <el-input
          v-model="codeContent"
          type="textarea"
          :placeholder="getPlaceholder()"
          :rows="12"
          resize="none"
          :disabled="loading"
        />
      </div>
      <!-- 操作按钮 -->
      <div class="repo-actions">
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!codeContent.trim() || !selectedFramework"
          @click="handleAnalyze"
        >
          <GitBranch v-if="!loading" :size="16" class="mr-1" />
          {{ loading ? t('分析中...') : t('分析代码') }}
        </el-button>
        <el-button :disabled="loading" @click="handleClear">{{ t('清空') }}</el-button>
      </div>
      <!-- 进度提示 -->
      <div v-if="loading" class="repo-progress">
        <el-progress :percentage="50" :indeterminate="true" :show-text="false" />
        <span class="progress-text">{{ t('AI 正在分析路由定义，请稍候...') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GitBranch, AlertCircle, HelpCircle } from 'lucide-vue-next'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { AiImportTranslator } from '../aiImport'
import { router } from '@/router/index'
import { ElMessage } from 'element-plus'

import type { HttpNode, FolderNode } from '@src/types'

const emit = defineEmits<{
  (e: 'success', data: { docs: (HttpNode | FolderNode)[]; type: 'ai' | 'repository' }): void
  (e: 'error', message: string): void
}>()
const props = defineProps<{
  projectId: string
}>()
const { t } = useI18n()
const llmStore = useLLMClientStore()
const codeContent = ref('')
const selectedFramework = ref('')
const loading = ref(false)
// 框架列表
const frameworks = [
  { label: 'Express (Node.js)', value: 'express', language: 'Node.js' },
  { label: 'Koa (Node.js)', value: 'koa', language: 'Node.js' },
  { label: 'Fastify (Node.js)', value: 'fastify', language: 'Node.js' },
  { label: 'NestJS (Node.js)', value: 'nestjs', language: 'Node.js' },
  { label: 'Gin (Go)', value: 'gin', language: 'Go' },
  { label: 'Echo (Go)', value: 'echo', language: 'Go' },
  { label: 'Spring Boot (Java)', value: 'spring', language: 'Java' },
  { label: 'Flask (Python)', value: 'flask', language: 'Python' },
  { label: 'FastAPI (Python)', value: 'fastapi', language: 'Python' },
  { label: 'Django (Python)', value: 'django', language: 'Python' },
]
// 检查 AI 是否可用
const isAiAvailable = computed(() => llmStore.isAvailable())
// 获取占位符
const getPlaceholder = () => {
  const examples: Record<string, string> = {
    express: `// Express 路由示例
router.get('/api/users', getUsers)
router.post('/api/users', createUser)
router.get('/api/users/:id', getUserById)`,
    gin: `// Gin 路由示例
r.GET("/api/users", GetUsers)
r.POST("/api/users", CreateUser)
r.GET("/api/users/:id", GetUserById)`,
    spring: `// Spring 控制器示例
@GetMapping("/api/users")
public List<User> getUsers() { }

@PostMapping("/api/users")
public User createUser(@RequestBody User user) { }`,
    flask: `# Flask 路由示例
@app.route('/api/users', methods=['GET'])
def get_users():
    pass

@app.route('/api/users', methods=['POST'])
def create_user():
    pass`,
  }
  return examples[selectedFramework.value] || t('粘贴包含路由定义的代码')
}
// 获取框架语言
const getFrameworkLanguage = () => {
  const fw = frameworks.find(f => f.value === selectedFramework.value)
  return fw?.language || 'Unknown'
}
// 跳转设置页
const handleGoSettings = () => {
  router.push({ name: 'Settings', query: { action: 'ai-settings' } })
}
// 开始分析
const handleAnalyze = async () => {
  if (!codeContent.value.trim()) {
    ElMessage.warning(t('请输入代码内容'))
    return
  }
  if (!selectedFramework.value) {
    ElMessage.warning(t('请选择框架类型'))
    return
  }
  loading.value = true
  try {
    const translator = new AiImportTranslator(props.projectId)
    const docs = await translator.analyzeCode(
      codeContent.value,
      selectedFramework.value,
      getFrameworkLanguage()
    )
    emit('success', { docs, type: 'repository' })
    ElMessage.success(t('分析成功'))
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : t('代码分析失败')
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  } finally {
    loading.value = false
  }
}
// 清空
const handleClear = () => {
  codeContent.value = ''
  selectedFramework.value = ''
}
</script>

<style lang="scss" scoped>
.repo-import {
  .ai-unavailable {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: var(--el-color-warning-light-9);
    border-radius: var(--border-radius);
    color: var(--el-color-warning);

    .warning-icon {
      flex-shrink: 0;
    }
  }

  .repo-input-area {
    .framework-select {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .select-label {
        font-size: 14px;
        color: var(--gray-700);
        white-space: nowrap;
      }

      .el-select {
        width: 200px;
      }
    }

    .code-input {
      .input-header {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--gray-700);

        .help-icon {
          color: var(--gray-400);
          cursor: help;
        }
      }

      :deep(.el-textarea__inner) {
        font-family: var(--font-family-code);
        font-size: 13px;
      }
    }

    .repo-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }

    .repo-progress {
      margin-top: 12px;

      .progress-text {
        display: block;
        margin-top: 8px;
        font-size: 13px;
        color: var(--gray-500);
      }
    }
  }
}
</style>
