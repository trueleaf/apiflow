import { tool, type ToolSet } from 'ai'
import { agentToolInputSchemas } from '@src/shared/ai/toolSchemas'
import type { AgentToolContext, AgentToolDefinition } from '@src/types/ai'

import type { ClientToolExecutor } from '@src/types/ai/agentInternals'
// 创建 client tool 定义
const defineClientTool = (executor: ClientToolExecutor, definition: Omit<AgentToolDefinition, 'scope' | 'execute'>): AgentToolDefinition => ({
  ...definition,
  scope: 'offline',
  execute: (input, context) => executor(definition.name, input, context),
})
// 创建高语义 Agent 工具清单
export const createAgentToolDefinitions = (executor: ClientToolExecutor): AgentToolDefinition[] => [
  defineClientTool(executor, { name: 'getWorkspaceContext', title: 'Workspace context', description: 'Read the active project, node, tab, variables and headers.', domain: 'workspace', effect: 'read', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.getWorkspaceContext }),
  defineClientTool(executor, { name: 'searchProjects', title: 'Search projects', description: 'Search offline projects by name.', domain: 'project', effect: 'read', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.searchProjects }),
  defineClientTool(executor, { name: 'searchNodes', title: 'Search nodes', description: 'Search nodes in an offline project.', domain: 'workspace', effect: 'read', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.searchNodes }),
  defineClientTool(executor, { name: 'listNodeTree', title: 'Node tree', description: 'List the compact node tree for a project.', domain: 'workspace', effect: 'read', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.listNodeTree }),
  defineClientTool(executor, { name: 'getNodeDetail', title: 'Node detail', description: 'Read one node after obtaining its ID from context or search.', domain: 'workspace', effect: 'read', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.getNodeDetail }),
  defineClientTool(executor, { name: 'getDeletedNodes', title: 'Deleted nodes', description: 'List deleted nodes for a project.', domain: 'workspace', effect: 'read', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.getDeletedNodes }),
  defineClientTool(executor, { name: 'openProject', title: 'Open project', description: 'Navigate to a project returned by search.', domain: 'project', effect: 'navigate', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.openProject }),
  defineClientTool(executor, { name: 'createDesignChange', title: 'Create design change', description: 'Propose project or node creation without applying it.', domain: 'workspace', effect: 'propose', riskLevel: 'medium', requiresApproval: false, inputSchema: agentToolInputSchemas.createDesignChange }),
  defineClientTool(executor, { name: 'updateDesignChange', title: 'Update design change', description: 'Propose node updates without applying them.', domain: 'workspace', effect: 'propose', riskLevel: 'medium', requiresApproval: false, inputSchema: agentToolInputSchemas.updateDesignChange }),
  defineClientTool(executor, { name: 'moveNodesChange', title: 'Move nodes change', description: 'Propose moving nodes without applying it.', domain: 'workspace', effect: 'propose', riskLevel: 'medium', requiresApproval: false, inputSchema: agentToolInputSchemas.moveNodesChange }),
  defineClientTool(executor, { name: 'deleteNodesChange', title: 'Delete nodes change', description: 'Propose deleting nodes without applying it.', domain: 'workspace', effect: 'propose', riskLevel: 'high', requiresApproval: false, inputSchema: agentToolInputSchemas.deleteNodesChange }),
  defineClientTool(executor, { name: 'restoreNodesChange', title: 'Restore nodes change', description: 'Propose restoring deleted nodes.', domain: 'workspace', effect: 'propose', riskLevel: 'medium', requiresApproval: false, inputSchema: agentToolInputSchemas.restoreNodesChange }),
  defineClientTool(executor, { name: 'updateVariablesChange', title: 'Variables change', description: 'Propose replacing project variables.', domain: 'variables', effect: 'propose', riskLevel: 'high', requiresApproval: false, inputSchema: agentToolInputSchemas.updateVariablesChange }),
  defineClientTool(executor, { name: 'updateCommonHeadersChange', title: 'Global headers change', description: 'Propose replacing global common headers affecting ALL projects; projectId only identifies the initiating context.', domain: 'variables', effect: 'propose', riskLevel: 'high', requiresApproval: false, inputSchema: agentToolInputSchemas.updateCommonHeadersChange }),
  defineClientTool(executor, { name: 'previewChangeSet', title: 'Preview change set', description: 'Validate and preview a proposed change set.', domain: 'workspace', effect: 'read', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.previewChangeSet }),
  defineClientTool(executor, { name: 'applyChangeSet', title: 'Apply change set', description: 'Atomically apply an approved change set.', domain: 'workspace', effect: 'write', riskLevel: 'high', requiresApproval: true, inputSchema: agentToolInputSchemas.applyChangeSet }),
  defineClientTool(executor, { name: 'discardChangeSet', title: 'Discard change set', description: 'Discard a proposed change set.', domain: 'workspace', effect: 'propose', riskLevel: 'low', requiresApproval: false, inputSchema: agentToolInputSchemas.discardChangeSet }),
  defineClientTool(executor, { name: 'sendHttpRequest', title: 'Send HTTP request', description: 'Send the current saved HTTP request.', domain: 'http', effect: 'runtime', riskLevel: 'medium', requiresApproval: true, inputSchema: agentToolInputSchemas.sendHttpRequest }),
  defineClientTool(executor, { name: 'manageWebSocketConnection', title: 'Manage WebSocket', description: 'Read or change the active WebSocket connection.', domain: 'websocket', effect: 'runtime', riskLevel: 'high', requiresApproval: input => input.action !== 'status', inputSchema: agentToolInputSchemas.manageWebSocketConnection }),
  defineClientTool(executor, { name: 'manageMockServer', title: 'Manage mock server', description: 'Read, start or stop a saved mock server.', domain: 'mock', effect: 'runtime', riskLevel: 'high', requiresApproval: input => input.action !== 'status', inputSchema: agentToolInputSchemas.manageMockServer }),
]
// 将业务工具适配为 AI SDK 工具
export const createAISDKTools = (definitions: AgentToolDefinition[], context: AgentToolContext): ToolSet => Object.fromEntries(definitions.map(definition => [definition.name, tool({
  title: definition.title,
  description: definition.description,
  inputSchema: definition.inputSchema,
  needsApproval: definition.requiresApproval,
  strict: true,
  execute: (input, options) => definition.execute(input, { ...context, abortSignal: options.abortSignal ?? context.abortSignal, toolCallId: options.toolCallId }),
  toModelOutput: ({ output }) => ({ type: 'text', value: JSON.stringify({ success: output.success, summary: output.summary, errorCode: output.errorCode, retryable: output.retryable, modelData: output.modelData, changeSetId: output.changeSetId }) }),
})]))
// 按当前上下文筛选工具
export const getActiveToolNames = (definitions: AgentToolDefinition[], context: AgentToolContext): string[] => definitions.filter(definition => {
  if (context.networkMode !== 'offline') return false
  if (!context.activeTabType) return definition.domain === 'workspace' || definition.domain === 'project' || definition.domain === 'variables'
  if (context.activeTabType === 'websocket') return definition.domain !== 'http' && definition.domain !== 'mock'
  if (context.activeTabType === 'http') return definition.domain !== 'websocket' && definition.domain !== 'mock'
  if (context.activeTabType === 'httpMock' || context.activeTabType === 'websocketMock') return definition.domain !== 'http' && definition.domain !== 'websocket'
  return definition.domain !== 'http' && definition.domain !== 'websocket' && definition.domain !== 'mock'
}).map(definition => definition.name)
