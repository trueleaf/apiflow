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
    description: '获取当前项目中打开的所有Tab列表',
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
    description: '关闭指定的Tab（通过Tab的_id）',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        tabId: {
          type: 'string',
          description: 'Tab的_id',
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
    description: '关闭当前项目中的所有Tab',
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
    description: '切换到指定的Tab（通过Tab的_id）',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        tabId: {
          type: 'string',
          description: 'Tab的_id',
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
    description: '获取当前选中的Tab信息',
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
    description: '导航到指定项目的编辑页面（通过项目ID和项目名称）',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        projectName: {
          type: 'string',
          description: '项目名称',
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
    description: '导航到首页（项目列表页）',
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
    description: '导航到设置页面',
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
    description: '获取当前项目中已删除的节点列表（回收站数据）',
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
    description: '从回收站恢复指定的节点（通过节点ID）',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '要恢复的节点ID',
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
    description: '在当前项目中创建一个文件夹节点',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '文件夹名称',
        },
        pid: {
          type: 'string',
          description: '父节点ID，不填则创建在根目录',
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
    description: '在当前项目中批量创建文件夹节点',
    type: 'common',
    parameters: {
      type: 'object',
      properties: {
        folders: {
          type: 'array',
          description: '文件夹列表',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: '文件夹名称',
              },
              pid: {
                type: 'string',
                description: '父节点ID，不填则创建在根目录',
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
