import { useSkill } from '../skillStore'
import { AgentTool } from '@src/types/ai'

export const commonHeaderTools: AgentTool[] = [
  {
    name: 'deleteAllCommonHeaders',
    description: 'Permanently delete all common request headers in the project (DESTRUCTIVE OPERATION). Removes both global headers and all folder-level headers. This cannot be undone. Requires confirmation. Use this to completely reset header configurations.',
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
    description: 'Retrieve all global common request headers in the current project. Global headers are automatically included in every API request across the entire project. Returns header keys, values, descriptions, and enabled status.',
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
    description: 'Retrieve detailed information for a specific global common header by its unique identifier. Returns complete metadata including key, value, description, and enabled state.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerId: {
          type: 'string',
          description: 'The unique identifier of the global common header to retrieve',
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
    description: 'Create a new global common request header that automatically applies to all API requests in the project. Use this for project-wide headers like authentication tokens, API keys, or content types. For folder-specific headers, use addFolderCommonHeader instead.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'HTTP header name (e.g., "Authorization", "Content-Type", "X-API-Key")',
        },
        value: {
          type: 'string',
          description: 'Header value. Supports variable substitution using {{variableName}} syntax',
        },
        description: {
          type: 'string',
          description: 'Optional description explaining the purpose of this header',
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
    description: 'Modify an existing global common request header. Provide only the fields you want to change (key, value, description, or enabled status). Changes apply immediately to all project API requests.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerId: {
          type: 'string',
          description: 'The unique identifier of the global header to update',
        },
        key: {
          type: 'string',
          description: 'New HTTP header name (optional - only provide if renaming)',
        },
        value: {
          type: 'string',
          description: 'New header value (optional - only provide if changing value)',
        },
        description: {
          type: 'string',
          description: 'New description (optional - only provide if updating description)',
        },
        select: {
          type: 'boolean',
          description: 'Whether to enable this header (optional - true = enabled, false = disabled but retained)',
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
    description: 'Permanently delete one or more global common headers. Requires confirmation. After deletion, these headers will no longer be included in API requests. For project-wide header reset, use deleteAllCommonHeaders instead.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of global header IDs to permanently delete',
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
    description: 'Find global common headers by header key name using keyword matching. Returns all global headers whose keys contain the search term. Use this to quickly locate specific headers like "Authorization" or "X-API-Key".',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search term to match against header key names (case-insensitive partial matching)',
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
    description: 'Retrieve all common request headers defined for a specific folder. Folder-level headers apply to all API nodes within that folder and its subfolders. Returns header keys, values, descriptions, and enabled status.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the folder to inspect',
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
    description: 'Add a new common request header to a specific folder. This header will automatically apply to all API requests in this folder and its subfolders. Use this for folder-specific configurations like API versioning headers or endpoint-specific authentication.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the target folder',
        },
        key: {
          type: 'string',
          description: 'HTTP header name (e.g., "X-API-Version", "Authorization")',
        },
        value: {
          type: 'string',
          description: 'Header value. Supports variable substitution using {{variableName}} syntax',
        },
        description: {
          type: 'string',
          description: 'Optional description explaining this header\'s purpose',
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
    description: 'Modify an existing folder-level common header. Provide only the fields you want to change. Changes apply immediately to all API requests in the folder and its subfolders.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the folder containing the header',
        },
        headerId: {
          type: 'string',
          description: 'The unique identifier of the header to update',
        },
        key: {
          type: 'string',
          description: 'New HTTP header name (optional - only provide if renaming)',
        },
        value: {
          type: 'string',
          description: 'New header value (optional - only provide if changing value)',
        },
        description: {
          type: 'string',
          description: 'New description (optional - only provide if updating description)',
        },
        select: {
          type: 'boolean',
          description: 'Whether to enable this header (optional - true = enabled, false = disabled but retained)',
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
    description: 'Permanently delete one or more common headers from a specific folder. Requires confirmation. After deletion, these headers will no longer be included in API requests within this folder.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the folder containing the headers',
        },
        headerIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of header IDs to permanently delete from this folder',
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
    description: 'Replace all common headers in a folder with a new set (OVERWRITE OPERATION). Completely replaces existing folder headers with the provided array. Requires confirmation. Use addFolderCommonHeader to add individual headers without replacement.',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The unique identifier of the target folder',
        },
        headers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Header ID (optional when creating new headers, auto-generated if omitted)' },
              key: { type: 'string', description: 'HTTP header name (e.g., "Authorization", "Content-Type")' },
              value: { type: 'string', description: 'Header value (supports {{variableName}} substitution)' },
              description: { type: 'string', description: 'Optional description' },
              select: { type: 'boolean', description: 'Whether to enable this header (default: true)' },
            },
            required: ['key', 'value'],
          },
          description: 'Complete array of headers that will replace all existing folder headers',
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
