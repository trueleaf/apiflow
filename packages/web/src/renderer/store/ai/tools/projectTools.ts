import { useSkill } from '../skillStore'
import { useAiChatStore } from '../aiChatStore'
import { useLLMProvider } from '../llmProviderStore'
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
  {
    name: 'getFolderChildrenForRename',
    description: '获取指定文件夹及其所有子节点内容，用于根据子节点内容生成有意义的文件夹命名。返回目标文件夹、所有子文件夹和所有类型的子节点信息。',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '目标文件夹ID',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['folderId', 'projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const projectId = args.projectId as string
      const result = await skillStore.getFolderChildrenForRename(folderId, projectId)
      if (!result) {
        return {
          code: 1,
          data: '文件夹不存在',
        }
      }
      return {
        code: 0,
        data: result,
      }
    },
  },
  {
    name: 'autoRenameFoldersByContent',
    description: '根据文件夹下所有子节点内容，自动调用AI生成有意义的文件夹命名并执行重命名。适用于用户希望批量重命名目录但未指定具体名称的场景。',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '目标文件夹ID',
        },
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['folderId', 'projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const aiChatStore = useAiChatStore()
      const llmProvider = useLLMProvider()
      const folderId = args.folderId as string
      const projectId = args.projectId as string
      const folderData = await skillStore.getFolderChildrenForRename(folderId, projectId)
      if (!folderData) {
        return { code: 1, data: { success: false, message: '文件夹不存在' } }
      }
      const foldersToRename = [
        { _id: folderData.folder._id, name: folderData.folder.name },
        ...folderData.childFolders.map(f => ({ _id: f._id, name: f.name })),
      ]
      if (foldersToRename.length === 0) {
        return { code: 0, data: { success: true, message: '没有需要重命名的文件夹', renamed: [] } }
      }
      const systemPrompt = '你是一个命名助手，根据内容生成简洁有意义的文件夹名称。只返回JSON数据，不要包含任何其他内容。'
      const userMessage = `根据以下文件夹及其子节点内容，为每个文件夹生成一个有意义的名称（不超过10个字）。

文件夹结构：
${JSON.stringify(folderData, null, 2)}

请严格按以下JSON格式返回，不要包含任何其他内容：
[{"_id": "文件夹ID", "newName": "新名称"}]`
      try {
        const response = await aiChatStore.chat({
          model: llmProvider.activeProvider.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        })
        const content = response.choices[0]?.message?.content || ''
        const jsonMatch = content.match(/\[.*\]/s)
        if (!jsonMatch) {
          return { code: 1, data: { success: false, message: 'AI返回格式错误', raw: content } }
        }
        const renameItems = JSON.parse(jsonMatch[0]) as { _id: string; newName: string }[]
        const result = await skillStore.batchRenameFolders(renameItems.map(item => ({ folderId: item._id, newName: item.newName })))
        return {
          code: result.failed.length === 0 ? 0 : 1,
          data: { success: result.failed.length === 0, renamed: renameItems, result },
        }
      } catch (error) {
        return {
          code: 1,
          data: { success: false, message: error instanceof Error ? error.message : '重命名失败' },
        }
      }
    },
  },
]
