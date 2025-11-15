<template>
  <div class="project-recovery">
    <div class="page-title">
      <h2>{{ $t('项目回收站') }}</h2>
      <p class="subtitle">{{ $t('管理已删除的项目，可以恢复到项目列表') }}</p>
    </div>

    <div class="search-toolbar">
      <el-input
        v-model="searchKeyword"
        :placeholder="$t('搜索项目名称')"
        clearable
        class="search-input"
      >
        <template #prefix>
          <Search :size="16" />
        </template>
      </el-input>
      <el-button 
        v-if="selectedProjects.length > 0"
        type="primary"
        @click="handleBatchRecover"
      >
        {{ $t('恢复选中') }} ({{ selectedProjects.length }})
      </el-button>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="40" class="loading-icon" />
      <p>{{ $t('加载中...') }}</p>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <Trash2 :size="64" :stroke-width="1.5" />
      <p class="empty-text">{{ $t('回收站为空') }}</p>
      <p class="empty-description">{{ $t('已删除的项目将在此处保留') }}</p>
    </div>

    <div v-else class="project-wrap">
      <div 
        v-for="project in filteredProjects" 
        :key="project._id"
        class="project-card"
        :class="{ selected: selectedProjects.includes(project._id) }"
      >
        <div class="project-header">
          <div class="title-section">
            <el-checkbox 
              :model-value="selectedProjects.includes(project._id)"
              class="project-checkbox"
              @click.stop
              @change="handleToggleSelect(project._id)"
            />
            <div class="project-name theme-color text-ellipsis" :title="project.projectName">
              {{ project.projectName }}
            </div>
          </div>
          <div class="operator">
            <div :title="$t('恢复')" @click="handleRecover(project._id)">
              <el-icon :size="16">
                <RotateCcw :size="16" />
              </el-icon>
            </div>
          </div>
        </div>
        <div class="project-meta">
          <span>{{ $t("删除时间") }}: {{ formatDeleteTime(project.deletedAt) }}</span>
        </div>
        <div class="project-meta">
          <span>{{ $t("创建者") }}: {{ project.owner?.name || '-' }}</span>
        </div>
        <div class="project-bottom">
          <div class="project-api-count">
            <span class="f-sm">{{ $t("接口数") }}:</span>
            <span class="teal">{{ project.docNum || 0 }}</span>
          </div>
          <div class="ml-auto">
            <el-button type="primary" @click="handleRecover(project._id)">{{ $t("恢复") }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Trash2, RotateCcw, Loader2 } from 'lucide-vue-next'
import { projectCache } from '@/cache/project/projectCache'
import { apiNodesCache } from '@/cache/standalone/apiNodesCache'
import type { ApidocProjectInfo } from '@src/types'
import { message } from '@/helper'

const loading = ref(false)
const searchKeyword = ref('')
const selectedProjects = ref<string[]>([])
const deletedProjects = ref<ApidocProjectInfo[]>([])
const filteredProjects = computed(() => {
  if (!searchKeyword.value) {
    return deletedProjects.value
  }
  return deletedProjects.value.filter(project =>
    project.projectName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})
const formatDeleteTime = (timestamp?: number): string => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
const loadDeletedProjects = async (): Promise<void> => {
  loading.value = true
  try {
    const projects = await projectCache.getDeletedProjectList()
    deletedProjects.value = projects
  } catch (error) {
    message.error('加载已删除项目失败')
  } finally {
    loading.value = false
  }
}
const handleToggleSelect = (projectId: string): void => {
  const index = selectedProjects.value.indexOf(projectId)
  if (index > -1) {
    selectedProjects.value.splice(index, 1)
  } else {
    selectedProjects.value.push(projectId)
  }
}
const handleRecover = async (projectId: string): Promise<void> => {
  const deletedProject = deletedProjects.value.find(p => p._id === projectId)
  if (!deletedProject) {
    message.error('项目不存在')
    return
  }
  try {
    const success = await projectCache.recoverProject(projectId)
    if (success) {
      const apiNodes = await apiNodesCache.getNodeList()
      const projectApiNodes = apiNodes.filter(node => node.projectId === projectId && node.isDeleted)
      if (projectApiNodes.length > 0) {
        for (const node of projectApiNodes) {
          const updatedNode = { ...node, isDeleted: false }
          await apiNodesCache.updateNode(updatedNode)
        }
      }
      message.success('项目恢复成功')
      await loadDeletedProjects()
      selectedProjects.value = selectedProjects.value.filter(id => id !== projectId)
    } else {
      message.error('项目恢复失败')
    }
  } catch (error) {
    message.error('项目恢复失败')
  }
}
const handleBatchRecover = async (): Promise<void> => {
  if (selectedProjects.value.length === 0) {
    return
  }
  loading.value = true
  try {
    let successCount = 0
    let failCount = 0
    for (const projectId of selectedProjects.value) {
      try {
        const success = await projectCache.recoverProject(projectId)
        if (success) {
          const apiNodes = await apiNodesCache.getNodeList()
          const projectApiNodes = apiNodes.filter(node => node.projectId === projectId && node.isDeleted)
          if (projectApiNodes.length > 0) {
            for (const node of projectApiNodes) {
              const updatedNode = { ...node, isDeleted: false }
              await apiNodesCache.updateNode(updatedNode)
            }
          }
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        failCount++
      }
    }
    if (successCount > 0) {
      message.success(`成功恢复 ${successCount} 个项目${failCount > 0 ? `，${failCount} 个失败` : ''}`)
      await loadDeletedProjects()
      selectedProjects.value = []
    } else {
      message.error('批量恢复失败')
    }
  } catch (error) {
    message.error('批量恢复失败')
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  loadDeletedProjects()
})
</script>

<style lang="scss" scoped>
.project-recovery {
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-title {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .search-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;

    .search-input {
      width: 300px;
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #909399;

    .loading-icon {
      animation: spin 1s linear infinite;
    }

    p {
      margin-top: 16px;
      font-size: 14px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #909399;

    .empty-text {
      margin-top: 20px;
      font-size: 18px;
      font-weight: 500;
      color: #606266;
    }

    .empty-description {
      margin-top: 8px;
      font-size: 14px;
    }
  }

  .project-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 30px 30px;

    @media only screen and (max-width: 720px) {
      justify-content: center;
    }
  }

  .project-card {
    width: 300px;
    border: 1px solid var(--gray-200);
    box-shadow: var(--box-shadow-sm);
    padding: 10px;
    position: relative;
    transition: all 0.3s ease;

    @media only screen and (max-width: 720px) {
      width: 100%;
    }

    &:hover {
      border-color: #c6e2ff;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    &.selected {
      border-color: #409eff;
      background-color: #ecf5ff;
    }

    .project-header {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title-section {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;

        .project-checkbox {
          flex-shrink: 0;
        }

        .project-name {
          font-size: 16px;
          flex: 1;
          min-width: 0;
        }
      }

      .operator {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;

        & > div {
          width: 25px;
          height: 25px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;

          &:hover {
            background: var(--gray-200);
          }
        }
      }
    }

    .project-meta {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      color: var(--gray-600);
      font-size: 13px;
      margin-top: 8px;
    }

    .project-bottom {
      width: 100%;
      padding: 10px 0 0;
      display: flex;
      align-items: center;

      .project-api-count {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
