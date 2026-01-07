import { AgentTool } from '@src/types/ai'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { router } from '@/router'
import { i18n } from '@/i18n'
import { useSkill } from '@/store/ai/skillStore'

export const commonTools: AgentTool[] = [
  // 获取当前打开的所有Tab列表
  {
    name: 'getOpenTabs',
    description: 'Get all currently open tabs in the workspace. Returns tab ID, label, type, and save status. Use this when you need to view what API nodes or documents are currently open for editing.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const projectNavStore = useProjectNav()
      const projectWorkbenchStore = useProjectWorkbench()
      const projectId = projectWorkbenchStore.projectId
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      const navs = projectNavStore.navs[projectId] || []
      const tabList = navs.map(nav => ({
        _id: nav._id,
        label: nav.label,
        tabType: nav.tabType,
        selected: nav.selected,
        saved: nav.saved,
        fixed: nav.fixed,
      }))
      return { code: 0, data: tabList }
    },
  },
  // 关闭指定的Tab
  {
    name: 'closeTab',
    description: 'Close a specific tab in the workspace. Use this when the user wants to close an API editor or document tab. Requires confirmation to prevent accidental closure. The tab must be identified by its _id from getOpenTabs.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        tabId: {
          type: 'string',
          description: 'The unique identifier (_id) of the tab to close, obtained from getOpenTabs',
        },
      },
      required: ['tabId'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const projectNavStore = useProjectNav()
      const projectWorkbenchStore = useProjectWorkbench()
      const projectId = projectWorkbenchStore.projectId
      const tabId = args.tabId as string
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      const navs = projectNavStore.navs[projectId] || []
      const targetNav = navs.find(nav => nav._id === tabId)
      if (!targetNav) {
        return { code: 1, data: { message: i18n.global.t('未找到指定的Tab') } }
      }
      await projectNavStore.deleteNavByIds({ ids: [tabId], projectId, force: true })
      return { code: 0, data: { message: i18n.global.t('Tab已关闭') } }
    },
  },
  // 关闭所有Tab
  {
    name: 'closeAllTabs',
    description: 'Close all open tabs in the current project workspace. Use this for workspace cleanup when the user wants a fresh start or to close multiple tabs at once. Requires confirmation as this is a potentially disruptive action.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: true,
    execute: async () => {
      const projectNavStore = useProjectNav()
      const projectWorkbenchStore = useProjectWorkbench()
      const projectId = projectWorkbenchStore.projectId
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      projectNavStore.forceDeleteAllNav(projectId)
      return { code: 0, data: { message: i18n.global.t('所有Tab已关闭') } }
    },
  },
  // 切换到指定Tab
  {
    name: 'switchTab',
    description: 'Switch focus to a specific tab in the workspace. Use this to navigate between open API editors or documents when the user wants to view or edit a different node. The tab must be already open (check with getOpenTabs first).',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        tabId: {
          type: 'string',
          description: 'The unique identifier (_id) of the tab to switch to, obtained from getOpenTabs',
        },
      },
      required: ['tabId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const projectNavStore = useProjectNav()
      const projectWorkbenchStore = useProjectWorkbench()
      const projectId = projectWorkbenchStore.projectId
      const tabId = args.tabId as string
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      const navs = projectNavStore.navs[projectId] || []
      const targetNav = navs.find(nav => nav._id === tabId)
      if (!targetNav) {
        return { code: 1, data: { message: i18n.global.t('未找到指定的Tab') } }
      }
      projectNavStore.selectNavById({ id: tabId, projectId })
      return { code: 0, data: { message: i18n.global.t('已切换到指定Tab'), tab: targetNav.label } }
    },
  },
  // 获取当前选中的Tab
  {
    name: 'getCurrentTab',
    description: 'Get detailed information about the currently focused tab. Returns tab ID, label, type, and save status. Use this to understand what the user is currently viewing or editing before performing operations.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const projectNavStore = useProjectNav()
      const currentNav = projectNavStore.currentSelectNav
      if (!currentNav) {
        return { code: 1, data: { message: i18n.global.t('当前没有选中的Tab') } }
      }
      return {
        code: 0,
        data: {
          _id: currentNav._id,
          label: currentNav.label,
          tabType: currentNav.tabType,
          saved: currentNav.saved,
          fixed: currentNav.fixed,
        },
      }
    },
  },
  // 导航到指定项目
  {
    name: 'navigateToProject',
    description: 'Open a project in edit mode. Use this when the user wants to switch to a different project or open a project from the project list. Both project ID and name are required for navigation.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the target project',
        },
        projectName: {
          type: 'string',
          description: 'The display name of the target project',
        },
      },
      required: ['projectId', 'projectName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const projectWorkbenchStore = useProjectWorkbench()
      const projectId = args.projectId as string
      const projectName = args.projectName as string
      router.push({
        path: '/workbench',
        query: {
          id: projectId,
          name: projectName,
          mode: 'edit',
        },
      })
      projectWorkbenchStore.changeProjectId(projectId)
      return { code: 0, data: { message: i18n.global.t('已导航到项目'), projectName } }
    },
  },
  // 导航到首页
  {
    name: 'navigateToHome',
    description: 'Navigate to the home page where all projects are listed. Use this when the user wants to return to the project list, create a new project, or switch between projects.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      router.push({ path: '/home' })
      return { code: 0, data: { message: i18n.global.t('已导航到首页') } }
    },
  },
  // 导航到设置页面
  {
    name: 'navigateToSettings',
    description: 'Navigate to the application settings page. Use this when the user wants to configure preferences, manage account information, or adjust application behavior.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      router.push({ path: '/settings' })
      return { code: 0, data: { message: i18n.global.t('已导航到设置页面') } }
    },
  },
  // 获取已删除的节点列表（回收站）
  {
    name: 'getDeletedNodes',
    description: 'Retrieve all deleted nodes from the recycle bin for the current project. Returns node ID, name, type, and deletion time. Use this when the user wants to view or restore previously deleted API nodes or folders.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const projectWorkbenchStore = useProjectWorkbench()
      const projectId = projectWorkbenchStore.projectId
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      const deletedNodes = await apiNodesCache.getDeletedNodesList(projectId)
      const nodeList = deletedNodes.map(node => ({
        _id: node._id,
        name: node.info.name,
        type: node.info.type,
        updatedAt: node.updatedAt,
      }))
      return { code: 0, data: nodeList }
    },
  },
  // 恢复已删除的节点
  {
    name: 'restoreNode',
    description: 'Restore a deleted node from the recycle bin back to its original location in the project tree. Use this to recover accidentally deleted API nodes or folders. Requires confirmation and the node ID must exist in the recycle bin.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the deleted node to restore, obtained from getDeletedNodes',
        },
      },
      required: ['nodeId'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const projectWorkbenchStore = useProjectWorkbench()
      const bannerStore = useBanner()
      const projectId = projectWorkbenchStore.projectId
      const nodeId = args.nodeId as string
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      const restoredIds = await apiNodesCache.restoreNode(nodeId)
      if (restoredIds.length === 0) {
        return { code: 1, data: { message: i18n.global.t('恢复节点失败') } }
      }
      bannerStore.getDocBanner({ projectId })
      return { code: 0, data: { message: i18n.global.t('节点已恢复'), restoredIds } }
    },
  },
  // 创建文件夹节点
  {
    name: 'createFolder',
    description: 'Create a new folder to organize API nodes in the project tree. Use this when the user wants to add structure to their project by grouping related APIs. Folders can be nested by specifying a parent ID.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The display name for the new folder',
        },
        pid: {
          type: 'string',
          description: 'Optional parent folder ID. If omitted, the folder will be created at the root level of the project',
        },
      },
      required: ['name'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const projectWorkbenchStore = useProjectWorkbench()
      const skillStore = useSkill()
      const projectId = projectWorkbenchStore.projectId
      const name = args.name as string
      const pid = args.pid as string | undefined
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      const folder = await skillStore.createFolderNode({ projectId, name, pid })
      if (!folder) {
        return { code: 1, data: { message: i18n.global.t('创建文件夹失败') } }
      }
      return { code: 0, data: { message: i18n.global.t('文件夹创建成功'), folder: { _id: folder._id, name: folder.info.name, pid: folder.pid } } }
    },
  },
  // 批量创建文件夹节点
  {
    name: 'batchCreateFolders',
    description: 'Create multiple folders at once to quickly establish project structure. Use this when the user wants to set up an organized folder hierarchy efficiently. Returns success/failure counts and details. Requires confirmation as it creates multiple items.',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        folders: {
          type: 'array',
          description: 'Array of folder definitions to create',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The display name for this folder',
              },
              pid: {
                type: 'string',
                description: 'Optional parent folder ID. If omitted, the folder will be created at the root level',
              },
            },
            required: ['name'],
          },
        },
      },
      required: ['folders'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const projectWorkbenchStore = useProjectWorkbench()
      const skillStore = useSkill()
      const projectId = projectWorkbenchStore.projectId
      const folders = args.folders as { name: string; pid?: string }[]
      if (!projectId) {
        return { code: 1, data: { message: i18n.global.t('当前未打开任何项目') } }
      }
      if (!folders || folders.length === 0) {
        return { code: 1, data: { message: i18n.global.t('文件夹列表不能为空') } }
      }
      const result = await skillStore.batchCreateFolderNodes({ projectId, folders })
      return {
        code: 0,
        data: {
          message: i18n.global.t('批量创建文件夹完成'),
          successCount: result.success.length,
          failedCount: result.failed.length,
          createdFolders: result.success.map(f => ({ _id: f._id, name: f.info.name, pid: f.pid })),
        },
      }
    },
  },
]
