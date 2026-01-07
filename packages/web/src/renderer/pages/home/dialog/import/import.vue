<template>
  <el-dialog
    :model-value="modelValue"
    width="45vw"
    top="8vh"
    :title="t('导入项目')"
    :before-close="handleClose"
  >
    <div class="import-dialog__body">
      <!-- 导入来源选择 -->
      <div class="import-source-section">
        <div class="section-label">{{ t('导入来源') }}</div>
        <div class="import-source-options">
          <div class="source-option is-disabled">
            <div class="radio-content">
              <div class="radio-icon-wrapper">
                <FileText :size="24" class="radio-icon" />
              </div>
              <div class="radio-text">
                <span class="radio-label">{{ t('从本地文件导入') }}</span>
                <span class="radio-desc disabled-hint">{{ t('功能开发中，敬请期待') }}</span>
              </div>
            </div>
          </div>
          <div
            class="source-option"
            :class="{ 
              'is-checked': importSource === 'online',
              'is-disabled': !isOfflineMode
            }"
            @click="isOfflineMode && (importSource = 'online')"
          >
            <div class="radio-content">
              <div class="radio-icon-wrapper">
                <Cloud :size="24" class="radio-icon" />
              </div>
              <div class="radio-text">
                <span class="radio-label">{{ t('从在线账号导入到本地') }}</span>
                <span v-if="isOfflineMode" class="radio-desc">{{ t('将在线账号的项目数据同步到本地') }}</span>
                <span v-else class="radio-desc disabled-hint">{{ t('仅离线模式可用') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 从本地文件导入（占位区域） -->
      <div v-if="importSource === 'file'" class="file-import-placeholder">
        <div class="placeholder-icon">
          <FileText :size="48" />
        </div>
        <div class="placeholder-text">{{ t('从本地文件导入功能开发中') }}</div>
        <div class="placeholder-hint">{{ t('敬请期待') }}</div>
      </div>

      <!-- 从在线账号导入 -->
      <div v-if="importSource === 'online' && isOfflineMode" class="online-import-section">
        <!-- 导入模式选择 -->
        <div class="section-label">{{ t('导入模式') }}</div>
        <div class="import-mode-section">
          <el-radio-group v-model="importMode" class="import-mode-options">
            <el-radio value="append">
              <div class="radio-content">
                <span class="radio-label">{{ t('追加模式') }}</span>
                <span class="radio-desc">{{ t('保留本地数据，追加新项目') }}</span>
              </div>
            </el-radio>
            <el-radio value="overwrite">
              <div class="radio-content">
                <span class="radio-label">{{ t('覆盖模式') }}</span>
                <span class="radio-desc warning">{{ t('将覆盖相同id的项目') }}</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 项目列表 -->
        <div class="project-section">
          <div class="section-label">{{ t('选择需要导入的项目') }}</div>

          <div v-if="!isLoggedIn" class="login-prompt">
            <div class="prompt-icon">
              <UserCircle :size="48" />
            </div>
            <div class="prompt-text">{{ t('请先登录以查看在线项目') }}</div>
            <el-button type="primary" @click="handleShowLogin">{{ t('立即登录') }}</el-button>
          </div>

          <div v-else-if="projectsLoading" class="loading-state">
            <el-icon class="is-loading" :size="32">
              <Loading />
            </el-icon>
            <div class="loading-text">{{ t('加载项目列表中...') }}</div>
          </div>

          <div v-else-if="onlineProjects.length === 0" class="empty-state">
            <div class="empty-icon">
              <FolderOpen :size="48" />
            </div>
            <div class="empty-text">{{ t('暂无在线项目') }}</div>
            <div class="empty-hint">{{ t('您还没有创建任何在线项目') }}</div>
          </div>

          <div v-else class="project-list">
            <div
              v-for="project in onlineProjects"
              :key="project.id"
              class="project-item"
              :class="{ disabled: project.isReadOnly }"
            >
              <div class="project-row">
                <el-checkbox
                  v-model="project.checked"
                  :disabled="project.isReadOnly"
                  @change="handleProjectCheck(project)"
                >
                  <span class="project-name">{{ project.name }}</span>
                </el-checkbox>
                <div class="project-info">
                  <span class="permission-tag" :class="project.permission">
                    {{ getPermissionText(project.permission) }}
                  </span>
                  <span class="node-count">{{ project.nodeCount }} {{ t('个节点') }}</span>
                  <el-button
                    v-if="!project.isReadOnly"
                    link
                    type="primary"
                    @click="toggleAdvanced(project)"
                  >
                    {{ project.showAdvanced ? t('收起') : t('更新操作') }}
                    <ChevronDown v-if="!project.showAdvanced" :size="16" />
                    <ChevronUp v-else :size="16" />
                  </el-button>
                </div>
              </div>

              <!-- 节点树展开区域 -->
              <div v-if="project.showAdvanced" class="nodes-tree-container">
                <div class="tree-header">
                  <span class="tree-title">{{ t('选择节点') }}</span>
                  <span class="tree-count">{{ t('已选{count}个节点', { count: getProjectSelectedNodeCount(project) }) }}</span>
                </div>
                <el-tree
                  :ref="(el) => setTreeRef(project.id, el)"
                  :data="project.nodes"
                  node-key="id"
                  show-checkbox
                  :default-expand-all="false"
                  :props="{ label: 'name', children: 'children' }"
                  class="project-tree"
                >
                  <template #default="scope">
                    <div class="custom-tree-node" tabindex="0">
                      <!-- 节点渲染 -->
                      <template v-if="scope.data.type !== 'folder'">
                        <template v-if="scope.data.type === 'http'">
                          <template v-for="req in requestMethods">
                            <span
                              v-if="scope.data.method?.toLowerCase() === req.value.toLowerCase()"
                              :key="req.name"
                              :class="['file-icon', getHttpMethodIconClass(req.value)]"
                            >
                              {{ req.name }}
                            </span>
                          </template>
                        </template>
                        <template v-else-if="scope.data.type === 'httpMock' || scope.data.type === 'httpMockNode'">
                          <span
                            class="file-icon"
                            :class="scope.data.method === 'ALL' ? 'file-icon--all' : 'file-icon--mock'"
                          >
                            {{ scope.data.method === 'ALL' ? 'ALL' : 'MOCK' }}
                          </span>
                        </template>
                        <template v-else-if="scope.data.type === 'websocket'">
                          <span class="file-icon file-icon--ws">WS</span>
                        </template>
                        <template v-else-if="scope.data.type === 'websocketMock' || scope.data.type === 'websocketMockNode'">
                          <span class="file-icon file-icon--ws-mock">WSM</span>
                        </template>
                        <div class="node-label-wrap">
                          <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" />
                        </div>
                      </template>
                      <!-- 文件夹渲染 -->
                      <template v-if="scope.data.type === 'folder'">
                        <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                        <div class="node-label-wrap">
                          <SEmphasize class="node-top" :title="scope.data.name" :value="scope.data.name" />
                        </div>
                      </template>
                    </div>
                  </template>
                </el-tree>
              </div>
            </div>
          </div>
        </div>

        <!-- 已选择项目统计 -->
        <div v-if="isLoggedIn && onlineProjects.length > 0" class="import-summary">
          <div class="summary-item">
            <span class="summary-label">{{ t('已选择{count}个项目', { count: selectedProjectCount }) }}</span>
            <span class="summary-value">{{ t('共{total}个节点', { total: totalSelectedNodeCount }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('取消') }}</el-button>
        <el-button
          v-if="importSource === 'online' && isOfflineMode"
          type="primary"
          :disabled="!canImport"
          :loading="importLoading"
          @click="handleImport"
        >
          {{ t('开始导入') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 登录弹框 -->
  <Login v-if="loginVisible" v-model="loginVisible" @success="handleLoginSuccess" />
</template>

<script lang="ts" setup>
import { Cloud, FileText, UserCircle, FolderOpen, ChevronDown, ChevronUp, Loader2 as Loading } from 'lucide-vue-next'
import Login from '../login/Login.vue'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { message } from '@/helper'
import { request } from '@/api/api'
import type { CommonResponse, ApidocProjectInfo, ApidocProjectListInfo, ApidocProjectPermission, ApidocBanner, PermissionUserInfo } from '@src/types'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm'
import { requestMethods } from '@/data/data'
import SEmphasize from '@/components/common/emphasize/ClEmphasize.vue'
import type { Method } from 'got'

type ProjectItem = {
  id: string
  name: string
  permission: ApidocProjectPermission
  nodeCount: number
  isReadOnly: boolean
  checked: boolean
  showAdvanced: boolean
  nodes: TreeNode[]
  _nodesLoaded?: boolean
  _rawBanners?: ApidocBanner[]
}

type TreeNode = {
  id: string
  name: string
  type: 'http' | 'httpMock' | 'httpMockNode' | 'websocket' | 'websocketMock' | 'websocketMockNode' | 'folder'
  method?: Method | 'ALL'
  children?: TreeNode[]
}

//变量定义
const { t } = useI18n()
const modelValue = defineModel<boolean>({ required: true })
const runtimeStore = useRuntime()
const isOfflineMode = computed(() => runtimeStore.networkMode === 'offline')
const importSource = ref<'file' | 'online'>('online')
const importMode = ref<'append' | 'overwrite'>('append')
const loginVisible = ref(false)
const isLoggedIn = ref(false)
const projectsLoading = ref(false)
const importLoading = ref(false)
const onlineProjects = ref<ProjectItem[]>([])
const treeRefs = ref<Record<string, InstanceType<typeof import('element-plus')['ElTree']>>>({})
//计算属性
const selectedProjectCount = computed(() => {
  return onlineProjects.value.filter(p => p.checked && !p.isReadOnly).length
})
const totalSelectedNodeCount = computed(() => {
  return onlineProjects.value.reduce((total, project) => {
    if (!project.checked || project.isReadOnly) return total
    if (project.showAdvanced) {
      return total + getProjectSelectedNodeCount(project)
    }
    return total + project.nodeCount
  }, 0)
})
const canImport = computed(() => {
  return isLoggedIn.value && selectedProjectCount.value > 0
})
//设置树引用
const setTreeRef = (projectId: string, el: unknown) => {
  if (el) {
    treeRefs.value[projectId] = el as InstanceType<typeof import('element-plus')['ElTree']>
  }
}
//获取项目选中节点数量
const getProjectSelectedNodeCount = (project: ProjectItem): number => {
  if (!project.showAdvanced) return 0
  const tree = treeRefs.value[project.id]
  if (!tree) return 0
  const checkedKeys = tree.getCheckedKeys()
  return checkedKeys.length
}
//获取权限文本
const getPermissionText = (permission: ApidocProjectPermission): string => {
  const permissionMap = {
    admin: t('管理员'),
    readAndWrite: t('读写'),
    readOnly: t('只读')
  }
  return permissionMap[permission] || permission
}
//验证登录状态
const verifyLogin = async (): Promise<boolean> => {
  if (!runtimeStore.userInfo.token) {
    return false
  }
  try {
    const res = await request.get<CommonResponse<{ isValid: boolean }>, CommonResponse<{ isValid: boolean }>>(
      '/api/security/verify_login'
    )
    return res.data.isValid === true
  } catch {
    return false
  }
}
//显示登录弹框
const handleShowLogin = () => {
  loginVisible.value = true
}
//登录成功处理
const handleLoginSuccess = async (_userInfo: PermissionUserInfo) => {
  isLoggedIn.value = true
  loginVisible.value = false
  await getOnlineProjects()
}
//获取在线项目列表
const getOnlineProjects = async () => {
  projectsLoading.value = true
  try {
    const res = await request.get<CommonResponse<ApidocProjectListInfo>, CommonResponse<ApidocProjectListInfo>>(
      '/api/project/project_list'
    )
    const projectListInfo = res.data
    if (projectListInfo) {
      onlineProjects.value = projectListInfo.list.map((project: ApidocProjectInfo) => {
        const currentUserPermission = getCurrentUserPermission(project)
        return {
          id: project._id,
          name: project.projectName,
          permission: currentUserPermission,
          nodeCount: project.docNum,
          isReadOnly: currentUserPermission === 'readOnly',
          checked: false,
          showAdvanced: false,
          nodes: [],
          _nodesLoaded: false,
        }
      })
    }
  } catch (error) {
    message.error(t('获取项目列表失败'))
  } finally {
    projectsLoading.value = false
  }
}
//获取当前用户权限
const getCurrentUserPermission = (project: ApidocProjectInfo): ApidocProjectPermission => {
  const currentUserId = runtimeStore.userInfo.id
  if (project.owner.id === currentUserId) {
    return 'admin'
  }
  const member = project.members.find(m => m.id === currentUserId)
  return member?.permission || 'readOnly'
}
//展开/收起更新操作
const toggleAdvanced = async (project: ProjectItem) => {
  project.showAdvanced = !project.showAdvanced
  if (project.showAdvanced && !project._nodesLoaded) {
    try {
      const res = await request.get<CommonResponse<ApidocBanner[]>, CommonResponse<ApidocBanner[]>>('/api/project/doc_tree_node', {
        params: { projectId: project.id },
      })
      if (res.data) {
        project._rawBanners = res.data
        project.nodes = res.data.map(convertBannerToTreeNode)
        project._nodesLoaded = true
        if (project.checked) {
          setTimeout(() => {
            const tree = treeRefs.value[project.id]
            if (tree) {
              tree.setCheckedKeys(getAllNodeIds(project.nodes))
            }
          }, 0)
        }
      }
    } catch (error) {
      message.error(t('获取项目节点失败'))
    }
  } else if (project.showAdvanced && project.checked) {
    setTimeout(() => {
      const tree = treeRefs.value[project.id]
      if (tree) {
        tree.setCheckedKeys(getAllNodeIds(project.nodes))
      }
    }, 0)
  }
}
//转换Banner为TreeNode
const convertBannerToTreeNode = (banner: ApidocBanner): TreeNode => {
  const node: TreeNode = {
    id: banner._id,
    name: banner.name,
    type: banner.type,
    children: banner.children?.map(convertBannerToTreeNode) || []
  }
  if ('method' in banner) {
    node.method = banner.method
  }
  return node
}
const getHttpMethodIconClass = (method: string): string => {
  const lowerMethod = method.toLowerCase()
  if (lowerMethod === 'delete') return 'file-icon--delete'
  return `file-icon--${lowerMethod}`
}
//递归获取所有节点ID
const getAllNodeIds = (nodes: TreeNode[]): string[] => {
  const ids: string[] = []
  const traverse = (items: TreeNode[]) => {
    items.forEach(item => {
      ids.push(item.id)
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  traverse(nodes)
  return ids
}
//处理项目勾选
const handleProjectCheck = (project: ProjectItem) => {
  if (project.checked && project.showAdvanced) {
    setTimeout(() => {
      const tree = treeRefs.value[project.id]
      if (tree) {
        tree.setCheckedKeys(getAllNodeIds(project.nodes))
      }
    }, 0)
  } else if (!project.checked && project.showAdvanced) {
    setTimeout(() => {
      const tree = treeRefs.value[project.id]
      if (tree) {
        tree.setCheckedKeys([])
      }
    }, 0)
  }
}
//处理导入
const handleImport = async () => {
  if (selectedProjectCount.value === 0) {
    message.warning(t('请至少选择一个项目'))
    return
  }
  if (importMode.value === 'overwrite') {
    try {
      await ClConfirm({
        content: t('覆盖模式将删除本地相同id项目的所有数据，此操作不可恢复！是否继续？'),
        title: t('警告'),
        confirmButtonText: t('确定'),
          cancelButtonText: t('取消'),
          type: 'warning',
        }
      )
    } catch {
      return
    }
  }
  importLoading.value = true
  try {
    const importData = onlineProjects.value
      .filter(p => p.checked && !p.isReadOnly)
      .map(project => {
        let selectedNodeIds: (string | number)[]
        if (project.showAdvanced && project._rawBanners) {
          const tree = treeRefs.value[project.id]
          selectedNodeIds = tree?.getCheckedKeys() || []
          return {
            projectId: project.id,
            projectName: project.name,
            permission: project.permission,
            selectedNodeIds: selectedNodeIds,
          }
        } else {
          return {
            projectId: project.id,
            projectName: project.name,
            permission: project.permission,
            selectedNodeIds: [],
            note: '全选模式，未展开更新操作',
          }
        }
      })
    console.log('=== 开始导入数据 ===')
    console.log('导入模式:', importMode.value)
    console.log('选中项目数:', importData.length)
    console.log('总节点数:', totalSelectedNodeCount.value)
    console.log('详细数据:', JSON.stringify(importData, null, 2))
    console.log('===================')
    message.success(t('数据已打印到控制台，实际导入逻辑待实现'))
    modelValue.value = false
  } catch (error) {
    message.error(t('导入失败'))
  } finally {
    importLoading.value = false
  }
}
//关闭弹框
const handleClose = () => {
  modelValue.value = false
}
//初始化
onMounted(async () => {
  if (isOfflineMode.value) {
    isLoggedIn.value = await verifyLogin()
    if (isLoggedIn.value) {
      await getOnlineProjects()
    }
  }
})
</script>

<style lang="scss" scoped>
.import-dialog__body {
  min-height: 450px;
  .import-source-section {
    margin-bottom: 24px;
    .section-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 12px;
    }
    .import-source-options {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px;
      .source-option {
        flex: 1 1 320px;
        width: auto;
        height: auto;
        margin-right: 0;
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        padding: 16px;
        transition: all 0.3s;
        cursor: pointer;
        &.is-checked {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
          .radio-icon-wrapper {
            background-color: var(--el-color-primary);
            .radio-icon {
              color: #fff;
            }
          }
        }
        &.is-disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .radio-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
          .radio-icon-wrapper {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: var(--el-color-primary-light-9);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            .radio-icon {
              color: var(--el-color-primary);
            }
          }
          .radio-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-top: 2px;
            .radio-label {
              font-size: 15px;
              font-weight: 500;
              color: var(--gray-800);
            }
            .radio-desc {
              font-size: 13px;
              color: var(--gray-600);
              &.warning {
                color: var(--el-color-warning);
              }
              &.disabled-hint {
                color: var(--gray-400);
              }
            }
          }
        }
      }
    }
  }
  .file-import-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background-color: var(--gray-50);
    border: 2px dashed var(--gray-300);
    border-radius: 8px;
    margin-top: 20px;
    .placeholder-icon {
      color: var(--gray-400);
      margin-bottom: 16px;
    }
    .placeholder-text {
      font-size: 16px;
      color: var(--gray-600);
      margin-bottom: 8px;
    }
    .placeholder-hint {
      font-size: 14px;
      color: var(--gray-400);
    }
  }
  .online-import-section {
    .section-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-700);
    }
    .import-mode-section {
      margin-bottom: 24px;
      padding: 16px;
      background-color: var(--gray-50);
      border-radius: 8px;
      .section-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 12px;
      }
      .import-mode-options {
        display: flex;
        gap: 16px;
        :deep(.el-radio) {
          margin-right: 0;
        }
        .radio-content {
          display: flex;
          flex-direction: column;
          .radio-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--gray-800);
            margin-bottom: 2px;
          }
          .radio-desc {
            font-size: 12px;
            color: var(--gray-500);
            &.warning {
              color: var(--el-color-warning);
            }
          }
        }
      }
    }
    .project-section {
      .section-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 16px;
      }
      .login-prompt {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        .prompt-icon {
          color: var(--gray-400);
          margin-bottom: 16px;
        }
        .prompt-text {
          font-size: 16px;
          color: var(--gray-600);
          margin-bottom: 20px;
        }
      }
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        .loading-text {
          margin-top: 16px;
          font-size: 14px;
          color: var(--gray-600);
        }
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        .empty-icon {
          color: var(--gray-400);
          margin-bottom: 16px;
        }
        .empty-text {
          font-size: 16px;
          color: var(--gray-600);
          margin-bottom: 8px;
        }
        .empty-hint {
          font-size: 14px;
          color: var(--gray-400);
        }
      }
      .project-list {
        max-height: 400px;
        margin-left: 20px;
        overflow-y: auto;
        .project-item {
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s;
          &:hover {
            box-shadow: var(--box-shadow-sm);
          }
          &.disabled {
            opacity: 0.6;
            background-color: var(--gray-50);
          }
          .project-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .project-name {
              font-size: 15px;
              font-weight: 500;
              color: var(--gray-800);
            }
            .project-info {
              display: flex;
              align-items: center;
              gap: 12px;
              .permission-tag {
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                &.admin {
                  background-color: var(--el-color-danger-light-9);
                  color: var(--el-color-danger);
                }
                &.readAndWrite {
                  background-color: var(--el-color-success-light-9);
                  color: var(--el-color-success);
                }
                &.readOnly {
                  background-color: var(--gray-200);
                  color: var(--gray-600);
                }
              }
              .node-count {
                font-size: 13px;
                color: var(--gray-600);
              }
            }
          }
          .nodes-tree-container {
            margin-top: 16px;
            border-top: 1px solid var(--gray-200);
            padding-top: 16px;
            .tree-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              .tree-title {
                font-size: 13px;
                font-weight: 500;
                color: var(--gray-700);
              }
              .tree-count {
                font-size: 12px;
                color: var(--gray-500);
              }
            }
            .project-tree {
              max-height: 300px;
              overflow-y: auto;
              border: 1px solid var(--gray-200);
              border-radius: 4px;
              padding: 8px;
              .custom-tree-node {
                display: flex;
                align-items: center;
                width: 100%;
                overflow: hidden;
                height: 30px;
                .file-icon {
                  font-size: 14px;
                  margin-right: 5px;
                  &.file-icon--get {
                    color: #28a745;
                  }
                  &.file-icon--post {
                    color: #ffc107;
                  }
                  &.file-icon--put {
                    color: #409EFF;
                  }
                  &.file-icon--delete {
                    color: #f56c6c;
                  }
                  &.file-icon--patch,
                  &.file-icon--head,
                  &.file-icon--options,
                  &.file-icon--all {
                    color: #17a2b8;
                  }
                  &.file-icon--mock {
                    color: #e6a23c;
                  }
                  &.file-icon--ws {
                    color: #409EFF;
                  }
                  &.file-icon--ws-mock {
                    color: #f56c6c;
                  }
                }
                .folder-icon {
                  color: var(--yellow);
                  flex: 0 0 auto;
                  width: 16px;
                  height: 16px;
                  margin-right: 5px;
                }
                .node-label-wrap {
                  display: flex;
                  flex-direction: column;
                  flex: 1;
                  overflow: hidden;
                  .node-top {
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }
                }
              }
              :deep(.el-tree-node__content) {
                height: 30px;
                display: flex;
                align-items: center;
              }
              :deep(.el-tree-node__content > .el-tree-node__expand-icon) {
                transition: none;
                padding-top: 0;
                padding-bottom: 0;
                margin-top: -1px;
              }
            }
          }
        }
      }
    }
    .import-summary {
      margin-top: 24px;
      padding: 16px;
      background-color: var(--el-color-primary-light-9);
      border-radius: 8px;
      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .summary-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-800);
        }
        .summary-value {
          font-size: 14px;
          color: var(--gray-600);
        }
      }
    }
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
