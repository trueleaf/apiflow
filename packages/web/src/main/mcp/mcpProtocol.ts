import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv'
import type { JsonSchemaValidator } from '@modelcontextprotocol/sdk/validation'
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  McpError,
  type CallToolResult,
  type ListResourceTemplatesResult,
  type ListResourcesResult,
  type ListToolsResult,
  type ReadResourceResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import type { McpProtocolOptions, McpResourceReadResult, McpToolCallResult, McpToolDefinition } from '@src/types/mcp'

const appName = __APP_BRAND_NAME__
const schemaValidator = new AjvJsonSchemaValidator()
const toolValidators = new Map<string, JsonSchemaValidator<Record<string, unknown>>>()
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
    if (['name', 'newName', 'projectName', 'projectId', 'nodeId', 'variableId'].includes(key)) properties[key] = { ...properties[key], minLength: 1, pattern: '\\S' }
  })
  return {
    type: 'object',
    properties,
    required: tool.inputSchema.required,
    additionalProperties: false,
  }
}
// 复用工具参数校验器
const validateArguments = (tool: McpToolDefinition, args: Record<string, unknown>) => {
  let validate = toolValidators.get(tool.name)
  if (!validate) {
    validate = schemaValidator.getValidator<Record<string, unknown>>(normalizeInputSchema(tool))
    toolValidators.set(tool.name, validate)
  }
  return validate(args)
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
    structuredContent: result,
  }
}
const createResourceResult = (uri: string, result: McpResourceReadResult): ReadResourceResult => {
  if (result.code !== 0) {
    const code = result.error?.code === 'RESOURCE_NOT_FOUND' ? -32002 : result.error?.code === 'INVALID_RESOURCE_URI' ? -32602 : -32603
    throw new McpError(code, result.error?.message || 'Resource read failed', { uri })
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
      name: appName,
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
      instructions: `${appName} local offline MCP server. Tools operate on local IndexedDB data only.`,
    }
  )
  server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
    const tools = await options.listTools()
    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        annotations: tool.annotations,
        inputSchema: normalizeInputSchema(tool),
      })),
    }
  })
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const args = toRecord(request.params.arguments)
    const tool = (await options.listTools()).find(item => item.name === request.params.name)
    if (!tool) throw new McpError(-32602, `Unknown tool: ${request.params.name}`)
    if (options.accessPolicy.readOnly && !tool.annotations.readOnlyHint) {
      return createToolResult({ code: 1, error: { code: 'READ_ONLY', message: 'MCP is configured for read-only access' } })
    }
    if (!options.accessPolicy.allowDestructive && tool.annotations.destructiveHint) {
      return createToolResult({ code: 1, error: { code: 'DESTRUCTIVE_TOOL_DISABLED', message: 'Enable destructive operations in MCP settings before using this tool' } })
    }
    const validation = validateArguments(tool, args)
    if (!validation.valid) return createToolResult({ code: 1, error: { code: 'INVALID_PARAMS', message: validation.errorMessage } })
    if (tool.requiresConfirmation && args.confirmed !== true) return createToolResult({ code: 1, error: { code: 'CONFIRMATION_REQUIRED', message: 'Obtain user approval and pass confirmed: true before executing this operation' } })
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
          description: `All offline ${appName} projects`,
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
