import { useSkill } from '../skillStore'
import { useLLMClientStore } from '../llmClientStore'
import { AgentTool } from '@src/types/ai'
import type { Language } from '@src/types'
import { simpleCreateProjectPrompt } from '@/store/ai/prompt/prompt'

export const projectTools: AgentTool[] = [
  {
    name: 'simpleCreateProject',
    description: 'Create a project from natural language description (Smart Mode - Recommended). Automatically extracts and infers project name from user input. Use this when the user describes a project concept without explicitly stating a name. Example: "Create an e-commerce system project" will auto-generate a project named "E-commerce System". Note: This tool only creates the project and does NOT navigate to it. If the user needs to perform subsequent operations within the project, you must call navigateToProject separately.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Natural language description of the project purpose or domain. The AI will extract a meaningful project name from this',
        },
      },
      required: ['description'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const llmClientStore = useLLMClientStore()
      const description = args.description as string
      const targetLanguage = (args._targetLanguage as Language) || 'zh-cn'
      const languageInstruction = {
        'zh-cn': '[CRITICAL] You MUST generate the projectName in Simplified Chinese.',
        'zh-tw': '[CRITICAL] You MUST generate the projectName in Traditional Chinese.',
        'en': '[CRITICAL] You MUST generate the projectName in English.',
        'ja': '[CRITICAL] You MUST generate the projectName in Japanese.',
      }[targetLanguage]
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: simpleCreateProjectPrompt },
            { role: 'system', content: languageInstruction },
            { role: 'user', content: description }
          ],
          response_format: { type: 'json_object' }
        })
        const content = response.choices[0]?.message?.content || '{}'
        const inferredParams: { projectName?: string } = JSON.parse(content)
        const projectName = inferredParams.projectName || '未命名项目'
        const result = await skillStore.createProject(projectName)
        return { code: result ? 0 : 1, data: result }
      } catch (error) {
        return { code: 1, data: { error: error instanceof Error ? error.message : '创建失败' } }
      }
    },
  },
  {
    name: 'getProjectList',
    description: 'Retrieve all projects in the workspace. Returns a list with project IDs, names, creation times, and other metadata. Use this when the user wants to see all available projects or needs to select from existing projects.',
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
    description: 'Retrieve detailed information for a specific project by its ID. Returns project name, creator, creation time, and other attributes. Use this to inspect or verify project details before performing operations.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to retrieve',
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
    description: 'Create a new project with an explicit name (Precise Mode). Use this when the user provides a specific project name. For automatic name inference from description, prefer simpleCreateProject instead.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: 'The exact name for the new project',
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
    name: 'batchCreateProjects',
    description: 'Create multiple projects at once for efficient workspace setup. Use this when the user wants to initialize multiple projects simultaneously. Returns success/failure counts and details. Requires confirmation as it creates multiple items.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectNames: {
          type: 'array',
          description: 'Array of project names to create',
          items: {
            type: 'string',
            description: 'Individual project name',
          },
        },
      },
      required: ['projectNames'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectNames = args.projectNames as string[]
      if (!projectNames || projectNames.length === 0) {
        return { code: 1, data: { message: '项目名称列表不能为空' } }
      }
      const result = await skillStore.batchCreateProjects(projectNames)
      return {
        code: 0,
        data: {
          message: '批量创建项目完成',
          successCount: result.success.length,
          failedCount: result.failed.length,
          createdProjects: result.success,
        },
      }
    },
  },
  {
    name: 'searchProject',
    description: 'Search for projects using flexible criteria with fuzzy matching. Use this when the user wants to find projects by name, creator, starred status, or keyword. Supports both general keyword search across multiple fields and specific field filtering.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'General search term that matches against both project name and description (fuzzy matching)',
        },
        projectName: {
          type: 'string',
          description: 'Filter by project name with fuzzy matching',
        },
        creator: {
          type: 'string',
          description: 'Filter by creator username or name with fuzzy matching',
        },
        isStared: {
          type: 'boolean',
          description: 'Filter by starred status. True returns only starred projects, false only non-starred, omit to return all',
        },
      },
      required: [],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.searchProject({
        keyword: args.keyword as string | undefined,
        projectName: args.projectName as string | undefined,
        creator: args.creator as string | undefined,
        isStared: args.isStared as boolean | undefined,
      })
      return {
        code: 0,
        data: result,
      }
    },
  },
  {
    name: 'updateProjectName',
    description: 'Rename an existing project. Use this when the user wants to change a project\'s display name. The project ID remains unchanged.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to rename',
        },
        projectName: {
          type: 'string',
          description: 'The new name for the project',
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
    description: 'Permanently delete a single project and all its contents (APIs, folders, variables, etc.). Requires confirmation. For deleting multiple projects, use batchDeleteProjects. For deleting all projects, use deleteAllProjects.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to delete',
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
    name: 'batchDeleteProjects',
    description: 'Permanently delete multiple projects at once. Each project and all its contents (APIs, folders, variables) will be removed. Requires confirmation. Returns success/failure counts. Use this for bulk cleanup operations.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectIds: {
          type: 'array',
          description: 'Array of project IDs to delete',
          items: {
            type: 'string',
            description: 'Individual project ID',
          },
        },
      },
      required: ['projectIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectIds = args.projectIds as string[]
      if (!projectIds || projectIds.length === 0) {
        return { code: 1, data: { message: '项目ID列表不能为空' } }
      }
      const result = await skillStore.batchDeleteProjects(projectIds)
      return {
        code: 0,
        data: {
          message: '批量删除项目完成',
          successCount: result.success.length,
          failedCount: result.failed.length,
          deletedProjectIds: result.success,
        },
      }
    },
  },
  {
    name: 'deleteAllProjects',
    description: 'Permanently delete ALL projects in the entire workspace (DANGEROUS OPERATION). This will remove every project and all their contents without exception. Requires confirmation. Only use this when the user explicitly wants to completely reset the workspace or remove everything.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: true,
    execute: async () => {
      const skillStore = useSkill()
      const result = await skillStore.deleteAllProjects()
      return {
        code: 0,
        data: {
          message: '已删除所有项目',
          deletedCount: result.deletedCount,
          deletedProjectIds: result.projectIds,
        },
      }
    },
  },
  {
    name: 'starProject',
    description: 'Mark a project as starred/favorite for quick access. Starred projects appear at the top of the project list or in a favorites section. Use this when the user wants to mark important or frequently used projects.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to star',
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
    description: 'Remove the starred/favorite mark from a project. The project will return to normal display in the project list. Use this when the user no longer wants quick access to this project.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to unstar',
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
    name: 'navigateToProject',
    description: 'Navigate to a specific project workspace. Use this ONLY when the user needs to perform subsequent operations within a project (such as creating nodes, modifying settings, etc.). Do NOT use this tool when: (1) The user is batch creating multiple projects without subsequent operations, (2) The user only wants to create a project without specifying follow-up actions, (3) The user explicitly says "do not open" or similar. IMPORTANT: This tool changes the current view context, so call it carefully based on user intent.',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to navigate to',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.navigateToProject(projectId)
      return {
        code: result ? 0 : 1,
        data: { message: result ? '已跳转到项目工作台' : '项目不存在或跳转失败' },
      }
    },
  },
]
