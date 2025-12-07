import { useSkill } from '../skillStore'
import { AgentTool } from '@src/types/ai'

export const projectTools: AgentTool[] = [
  {
    name: 'getProjectList',
    description: '获取项目列表',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const skillStore = useSkill()
      const result = await skillStore.getProjectList()
      return {
        code: 0,
        data: result,
      }
    },
  },
  {
    name: 'getProjectById',
    description: '根据项目ID获取项目信息',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.getProjectById(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'createProject',
    description: '创建一个新项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: '项目名称',
        },
      },
      required: ['projectName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectName = args.projectName as string
      const result = await skillStore.createProject(projectName)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateProjectName',
    description: '更新项目名称',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        projectName: {
          type: 'string',
          description: '新的项目名称',
        },
      },
      required: ['projectId', 'projectName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const projectName = args.projectName as string
      const result = await skillStore.updateProjectName(projectId, projectName)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteProject',
    description: '删除项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '要删除的项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.deleteProject(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'starProject',
    description: '收藏项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '要收藏的项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.starProject(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'unstarProject',
    description: '取消收藏项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '要取消收藏的项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.unstarProject(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'getFolderList',
    description: '获取项目下所有文件夹（目录）列表，包括子文件夹',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.getFolderList(projectId)
      return {
        code: 0,
        data: result.map(folder => ({
          _id: folder._id,
          pid: folder.pid,
          name: folder.info.name,
          description: folder.info.description,
        })),
      }
    },
  },
  {
    name: 'renameFolder',
    description: '重命名单个文件夹（目录）',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID',
        },
        newName: {
          type: 'string',
          description: '新的文件夹名称',
        },
      },
      required: ['folderId', 'newName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const newName = args.newName as string
      const result = await skillStore.renameFolder(folderId, newName)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'batchRenameFolders',
    description: '批量重命名多个文件夹（目录）',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: '重命名项列表',
          items: {
            type: 'object',
            properties: {
              folderId: {
                type: 'string',
                description: '文件夹ID',
              },
              newName: {
                type: 'string',
                description: '新的文件夹名称',
              },
            },
            required: ['folderId', 'newName'],
          },
        },
      },
      required: ['items'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const items = args.items as { folderId: string; newName: string }[]
      const result = await skillStore.batchRenameFolders(items)
      return {
        code: result.failed.length === 0 ? 0 : 1,
        data: result,
      }
    },
  },
]
