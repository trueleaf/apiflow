import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolResult,
  type ListResourceTemplatesResult,
  type ListResourcesResult,
  type ListToolsResult,
  type ReadResourceResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import type { McpResourceReadResult, McpToolCallResult, McpToolDefinition } from '@src/types/mcp'

type McpProtocolOptions = {
  listTools: () => Promise<McpToolDefinition[]>
  callTool: (name: string, args: Record<string, unknown>) => Promise<McpToolCallResult>
  readResource: (uri: string) => Promise<McpResourceReadResult>
}
const toJsonText = (value: unknown): string => {
  return JSON.stringify(value, null, 2)
}
const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}
const isSchemaProperty = (value: unknown): value is object => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
const normalizeInputSchema = (tool: McpToolDefinition): Tool['inputSchema'] => {
  const properties: Record<string, object> = {}
  Object.entries(tool.inputSchema.properties).forEach(([key, value]) => {
    properties[key] = isSchemaProperty(value) ? value : {}
  })
  return {
    type: 'object',
    properties,
    required: tool.inputSchema.required,
  }
}
const createToolResult = (result: McpToolCallResult): CallToolResult => {
  return {
    content: [
      {
        type: 'text',
        text: toJsonText(result),
      },
    ],
    isError: result.code !== 0,
  }
}
const createResourceResult = (uri: string, result: McpResourceReadResult): ReadResourceResult => {
  if (result.code !== 0) {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: toJsonText(result),
        },
      ],
    }
  }
  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: toJsonText(result.data ?? null),
      },
    ],
  }
}
export const createMcpProtocolServer = (options: McpProtocolOptions): Server => {
  const server = new Server(
    {
      name: 'apiflow',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
      instructions: 'ApiFlow local offline MCP server. Tools operate on local IndexedDB data only.',
    }
  )
  server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
    const tools = await options.listTools()
    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: normalizeInputSchema(tool),
      })),
    }
  })
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const args = toRecord(request.params.arguments)
    const result = await options.callTool(request.params.name, args)
    return createToolResult(result)
  })
  server.setRequestHandler(ListResourcesRequestSchema, async (): Promise<ListResourcesResult> => {
    return {
      resources: [
        {
          uri: 'apiflow://projects',
          name: 'projects',
          title: 'Projects',
          description: 'All offline ApiFlow projects',
          mimeType: 'application/json',
        },
      ],
    }
  })
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async (): Promise<ListResourceTemplatesResult> => {
    return {
      resourceTemplates: [
        {
          uriTemplate: 'apiflow://projects/{projectId}',
          name: 'project',
          title: 'Project',
          description: 'Offline project detail',
          mimeType: 'application/json',
        },
        {
          uriTemplate: 'apiflow://projects/{projectId}/tree',
          name: 'project-tree',
          title: 'Project Tree',
          description: 'Offline project node tree',
          mimeType: 'application/json',
        },
        {
          uriTemplate: 'apiflow://projects/{projectId}/variables',
          name: 'project-variables',
          title: 'Project Variables',
          description: 'Offline project variables',
          mimeType: 'application/json',
        },
        {
          uriTemplate: 'apiflow://projects/{projectId}/common-headers',
          name: 'project-common-headers',
          title: 'Project Common Headers',
          description: 'Offline project common headers',
          mimeType: 'application/json',
        },
        {
          uriTemplate: 'apiflow://nodes/{nodeId}',
          name: 'node',
          title: 'Node',
          description: 'Offline node detail',
          mimeType: 'application/json',
        },
      ],
    }
  })
  server.setRequestHandler(ReadResourceRequestSchema, async (request): Promise<ReadResourceResult> => {
    const uri = request.params.uri
    const result = await options.readResource(uri)
    return createResourceResult(uri, result)
  })
  return server
}
