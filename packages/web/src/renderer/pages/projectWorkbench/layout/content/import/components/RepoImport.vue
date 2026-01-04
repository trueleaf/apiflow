<template>
  <div class="repo-import">
    <!-- AI 不可用提示 -->
    <div v-if="!isAiAvailable" class="ai-unavailable">
      <AlertCircle :size="20" class="warning-icon" />
      <span>{{ t('AI 功能不可用，请先配置 API Key') }}</span>
      <el-button type="primary" link @click="handleGoSettings">{{ t('前往配置') }}</el-button>
    </div>
    <!-- 非 Electron 环境提示 -->
    <div v-else-if="!isElectronEnv" class="ai-unavailable">
      <AlertCircle :size="20" class="warning-icon" />
      <span>{{ t('此功能仅在桌面客户端可用') }}</span>
    </div>
    <!-- 主内容区 -->
    <div v-else class="repo-input-area">
      <!-- 文件夹选择 -->
      <div class="folder-select">
        <el-button type="primary" :disabled="loading" @click="handleSelectFolder">
          <FolderOpen :size="16" class="mr-1" />
          {{ t('选择项目文件夹') }}
        </el-button>
        <span v-if="selectedFolder" class="folder-path">{{ selectedFolder.name }}</span>
      </div>
      <!-- 文件列表预览 -->
      <div v-if="projectFiles.length > 0" class="file-list">
        <div class="file-list-header">
          <span>{{ t('已扫描文件') }} ({{ projectFiles.length }})</span>
        </div>
        <div class="file-list-content">
          <div v-for="file in projectFiles.slice(0, 20)" :key="file.relativePath" class="file-item">
            <FileCode :size="14" class="file-icon" />
            <span class="file-name">{{ file.relativePath }}</span>
          </div>
          <div v-if="projectFiles.length > 20" class="file-more">
            {{ t('还有 {count} 个文件...', { count: projectFiles.length - 20 }) }}
          </div>
        </div>
      </div>
      <!-- 操作按钮 -->
      <div class="repo-actions">
        <el-button
          type="primary"
          :loading="loading"
          :disabled="projectFiles.length === 0"
          @click="handleAnalyze"
        >
          <Sparkles v-if="!loading" :size="16" class="mr-1" />
          {{ loading ? t('分析中...') : t('开始分析') }}
        </el-button>
        <el-button v-if="selectedFolder" :disabled="loading" @click="handleClear">{{ t('清空') }}</el-button>
      </div>
      <!-- 进度提示 -->
      <div v-if="loading" class="repo-progress">
        <el-progress :percentage="progressPercent" :stroke-width="8" />
        <div class="progress-info">
          <span class="progress-step">{{ progressStep }}</span>
          <span class="progress-text">{{ progressText }}</span>
        </div>
        <el-button type="danger" plain size="small" class="cancel-btn" @click="handleCancel">
          <X :size="14" class="mr-1" />
          {{ t('取消分析') }}
        </el-button>
      </div>
      <!-- Token 消耗显示 -->
      <div v-if="tokenUsage" class="token-usage">
        <Coins :size="16" class="token-icon" />
        <span>{{ t('Token 消耗') }}: {{ formatTokens(tokenUsage.totalTokens) }}</span>
        <span class="token-detail">({{ t('输入') }}: {{ formatTokens(tokenUsage.promptTokens) }}, {{ t('输出') }}: {{ formatTokens(tokenUsage.completionTokens) }})</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FolderOpen, FileCode, AlertCircle, Sparkles, X, Coins } from 'lucide-vue-next'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { analyzeProject } from '../aiImport'
import { router } from '@/router/index'
import { ElMessage } from 'element-plus'
import { isElectron } from '@/helper'
import type { HttpNode, FolderNode } from '@src/types'

type ProjectFile = {
  relativePath: string
  content: string
}
const emit = defineEmits<{
  (e: 'success', data: { docs: (HttpNode | FolderNode)[]; type: 'ai' | 'repository' }): void
  (e: 'error', message: string): void
}>()
const props = defineProps<{
  projectId: string
}>()
const { t } = useI18n()
const llmStore = useLLMClientStore()
const loading = ref(false)
const progressText = ref('')
const progressStep = ref('')
const progressPercent = ref(0)
const selectedFolder = ref<{ path: string; name: string } | null>(null)
const projectFiles = ref<ProjectFile[]>([])
const abortController = ref<AbortController | null>(null)
const tokenUsage = ref<{ promptTokens: number; completionTokens: number; totalTokens: number } | null>(null)
// 检查 AI 是否可用
const isAiAvailable = computed(() => llmStore.isAvailable())
// 检查是否 Electron 环境
const isElectronEnv = computed(() => isElectron())
// 跳转设置页
const handleGoSettings = () => {
  router.push({ name: 'Settings', query: { action: 'ai-settings' } })
}
// 选择文件夹
const handleSelectFolder = async () => {
  if (!window.electronAPI?.projectScan) return
  try {
    const selectResult = await window.electronAPI.projectScan.selectFolder()
    if (selectResult.code !== 0 || selectResult.data?.canceled) {
      return
    }
    selectedFolder.value = {
      path: selectResult.data.folderPath,
      name: selectResult.data.folderName,
    }
    // 读取文件
    const readResult = await window.electronAPI.projectScan.readFiles(selectResult.data.folderPath)
    if (readResult.code !== 0) {
      ElMessage.error(readResult.msg || t('读取文件失败'))
      return
    }
    projectFiles.value = readResult.data.files
    ElMessage.success(t('已扫描 {count} 个文件', { count: readResult.data.totalFiles }))
  } catch {
    ElMessage.error(t('选择文件夹失败'))
  }
}
// 开始分析
const handleAnalyze = async () => {
  if (projectFiles.value.length === 0) {
    ElMessage.warning(t('请先选择项目文件夹'))
    return
  }
  loading.value = true
  progressPercent.value = 0
  progressStep.value = t('步骤 1/3')
  progressText.value = t('准备分析...')
  tokenUsage.value = null
  abortController.value = new AbortController()
  try {
    const files = projectFiles.value.map(f => ({ path: f.relativePath, content: f.content }))
    const docs = await analyzeProject(
      props.projectId,
      llmStore,
      files,
      (stage, message, percent) => {
        progressText.value = message
        progressPercent.value = percent
        if (stage === 'analyzing') progressStep.value = t('步骤 1/3')
        else if (stage === 'extracting') progressStep.value = t('步骤 2/3')
        else if (stage === 'converting') progressStep.value = t('步骤 3/3')
      },
      (usage) => {
        tokenUsage.value = usage
      },
      abortController.value.signal
    )
    progressPercent.value = 100
    emit('success', { docs, type: 'repository' })
    ElMessage.success(t('分析成功'))
  } catch (err) {
    if (err instanceof Error && err.message === '请求已取消') {
      return
    }
    const errorMsg = err instanceof Error ? err.message : t('代码分析失败')
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  } finally {
    loading.value = false
    progressText.value = ''
    progressStep.value = ''
    progressPercent.value = 0
    abortController.value = null
  }
}
// 取消分析
const handleCancel = () => {
  abortController.value?.abort()
}
// 格式化 Token 数量
const formatTokens = (tokens: number) => {
  if (tokens > 1000) {
    return `${(tokens / 1000).toFixed(1)}k`
  }
  return tokens.toString()
}
// 清空
const handleClear = () => {
  selectedFolder.value = null
  projectFiles.value = []
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
    .folder-select {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .folder-path {
        font-size: 14px;
        color: var(--gray-600);
        padding: 4px 8px;
        background: var(--gray-100);
        border-radius: var(--border-radius);
      }
    }

    .file-list {
      margin-bottom: 16px;
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius);

      .file-list-header {
        padding: 8px 12px;
        background: var(--gray-50);
        border-bottom: 1px solid var(--gray-200);
        font-size: 13px;
        color: var(--gray-600);
      }

      .file-list-content {
        max-height: 200px;
        overflow-y: auto;
        padding: 8px 0;
      }

      .file-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        font-size: 13px;
        color: var(--gray-700);

        .file-icon {
          color: var(--gray-400);
          flex-shrink: 0;
        }

        .file-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .file-more {
        padding: 4px 12px;
        font-size: 12px;
        color: var(--gray-400);
      }
    }

    .repo-actions {
      display: flex;
      gap: 8px;
    }

    .repo-progress {
      margin-top: 16px;

      .progress-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
      }

      .progress-step {
        font-size: 12px;
        color: var(--el-color-primary);
        font-weight: 500;
        white-space: nowrap;
      }

      .progress-text {
        font-size: 13px;
        color: var(--gray-500);
      }

      .cancel-btn {
        margin-top: 8px;
      }
    }

    .token-usage {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: var(--el-color-success-light-9);
      border-radius: var(--border-radius);
      font-size: 13px;
      color: var(--el-color-success);

      .token-icon {
        flex-shrink: 0;
      }

      .token-detail {
        color: var(--gray-500);
        font-size: 12px;
      }
    }
  }
}
</style>
