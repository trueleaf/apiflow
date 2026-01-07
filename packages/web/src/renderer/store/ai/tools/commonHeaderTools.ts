import { useSkill } from '../skillStore'
import { AgentTool } from '@src/types/ai'

export const commonHeaderTools: AgentTool[] = [
  {
    name: 'deleteAllCommonHeaders',
    description: 'Delete all common request headers in the current project (including global headers and all folder headers). This is a dangerous operation and cannot be undone',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: true,
    execute: async () => {
      const skillStore = useSkill()
      const result = await skillStore.deleteAllCommonHeaders()
      return { code: result.ok ? 0 : 1, data: result }
    },
  },
  // ==================== Global Common Request Header Tools ====================
  {
    name: 'getGlobalCommonHeaders',
    description: 'Get the list of all global common request headers in the current project',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const skillStore = useSkill()
      const result = await skillStore.getGlobalCommonHeaders()
      return { code: 0, data: result }
    },
  },
  {
    name: 'getGlobalCommonHeaderById',
    description: 'Get detailed information of a single global common request header by ID',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerId: {
          type: 'string',
          description: 'Common request header ID',
        },
      },
      required: ['headerId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const headerId = args.headerId as string
      const result = await skillStore.getGlobalCommonHeaderById(headerId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'createGlobalCommonHeader',
    description: 'Create a new global common request header that applies to all APIs in the project',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Header key name, such as Authorization, Content-Type, etc.',
        },
        value: {
          type: 'string',
          description: 'Header value',
        },
        description: {
          type: 'string',
          description: 'Header description',
        },
      },
      required: ['key', 'value'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.createGlobalCommonHeader({
        key: args.key as string,
        value: args.value as string,
        description: args.description as string | undefined,
      })
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateGlobalCommonHeader',
    description: 'Update the information of the specified global common request header',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerId: {
          type: 'string',
          description: 'Common request header ID to update',
        },
        key: {
          type: 'string',
          description: 'New header key name',
        },
        value: {
          type: 'string',
          description: 'New header value',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        select: {
          type: 'boolean',
          description: 'Whether to enable this header',
        },
      },
      required: ['headerId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const headerId = args.headerId as string
      const updates: Partial<{ key: string; value: string; description: string; select: boolean }> = {}
      if (args.key !== undefined) {
        updates.key = args.key as string
      }
      if (args.value !== undefined) {
        updates.value = args.value as string
      }
      if (args.description !== undefined) {
        updates.description = args.description as string
      }
      if (args.select !== undefined) {
        updates.select = args.select as boolean
      }
      const result = await skillStore.updateGlobalCommonHeader(headerId, updates)
      return {
        code: result ? 0 : 1,
        data: { updated: result },
      }
    },
  },
  {
    name: 'deleteGlobalCommonHeaders',
    description: 'Batch delete global common request headers',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of common request header IDs to delete',
        },
      },
      required: ['headerIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const headerIds = args.headerIds as string[]
      const result = await skillStore.deleteGlobalCommonHeaders(headerIds)
      return {
        code: result ? 0 : 1,
        data: { deleted: result },
      }
    },
  },
  {
    name: 'searchGlobalCommonHeaders',
    description: 'Search global common request headers by key name',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search keyword that matches header key names',
        },
      },
      required: ['keyword'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const keyword = args.keyword as string
      const result = await skillStore.searchGlobalCommonHeaders(keyword)
      return { code: 0, data: result }
    },
  },
  // ==================== Folder-level Common Request Header Tools ====================
  {
    name: 'getFolderCommonHeaders',
    description: 'Get the list of common request headers for a specified folder, which will be applied to all APIs in the folder',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'Folder ID',
        },
      },
      required: ['folderId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const result = await skillStore.getFolderCommonHeaders(folderId)
      return {
        code: result !== null ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'addFolderCommonHeader',
    description: 'Add a common request header to a specified folder, which will be applied to all APIs in the folder',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'Folder ID',
        },
        key: {
          type: 'string',
          description: 'Header key name',
        },
        value: {
          type: 'string',
          description: 'Header value',
        },
        description: {
          type: 'string',
          description: 'Header description',
        },
      },
      required: ['folderId', 'key', 'value'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const result = await skillStore.addFolderCommonHeader(folderId, {
        key: args.key as string,
        value: args.value as string,
        description: args.description as string | undefined,
      })
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateFolderCommonHeader',
    description: 'Update the information of a common request header in a specified folder',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'Folder ID',
        },
        headerId: {
          type: 'string',
          description: 'Common request header ID to update',
        },
        key: {
          type: 'string',
          description: 'New header key name',
        },
        value: {
          type: 'string',
          description: 'New header value',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        select: {
          type: 'boolean',
          description: 'Whether to enable this header',
        },
      },
      required: ['folderId', 'headerId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const headerId = args.headerId as string
      const updates: Partial<{ key: string; value: string; description: string; select: boolean }> = {}
      if (args.key !== undefined) {
        updates.key = args.key as string
      }
      if (args.value !== undefined) {
        updates.value = args.value as string
      }
      if (args.description !== undefined) {
        updates.description = args.description as string
      }
      if (args.select !== undefined) {
        updates.select = args.select as boolean
      }
      const result = await skillStore.updateFolderCommonHeader(folderId, headerId, updates)
      return {
        code: result ? 0 : 1,
        data: { updated: result },
      }
    },
  },
  {
    name: 'deleteFolderCommonHeaders',
    description: 'Batch delete common request headers in a specified folder',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'Folder ID',
        },
        headerIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of common request header IDs to delete',
        },
      },
      required: ['folderId', 'headerIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const headerIds = args.headerIds as string[]
      const result = await skillStore.deleteFolderCommonHeaders(folderId, headerIds)
      return {
        code: result ? 0 : 1,
        data: { deleted: result },
      }
    },
  },
  {
    name: 'setFolderCommonHeaders',
    description: 'Set all common request headers for a folder (overwrite update), will replace all existing common request headers',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'Folder ID',
        },
        headers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Header ID, optional when creating new' },
              key: { type: 'string', description: 'Header key name' },
              value: { type: 'string', description: 'Header value' },
              description: { type: 'string', description: 'Description' },
              select: { type: 'boolean', description: 'Whether to enable' },
            },
            required: ['key', 'value'],
          },
          description: 'Array of common request headers',
        },
      },
      required: ['folderId', 'headers'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const { nanoid } = await import('nanoid')
      const folderId = args.folderId as string
      const inputHeaders = args.headers as { _id?: string; key: string; value: string; description?: string; select?: boolean }[]
      const headers = inputHeaders.map(h => ({
        _id: h._id || nanoid(),
        key: h.key,
        value: h.value,
        type: 'string' as const,
        required: false,
        description: h.description || '',
        select: h.select !== undefined ? h.select : true,
      }))
      const result = await skillStore.setFolderCommonHeaders(folderId, headers)
      return {
        code: result ? 0 : 1,
        data: { updated: result },
      }
    },
  },
]
