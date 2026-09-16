import { z } from 'zod'

const emptySchema = z.object({}).strict()
const projectIdSchema = z.object({ projectId: z.string().min(1) }).strict()
const nodeIdSchema = z.object({ nodeId: z.string().min(1) }).strict()
const changeSetIdSchema = z.object({ changeSetId: z.string().min(1) }).strict()
const propertySchema = z.object({ _id: z.string().min(1).optional(), key: z.string().max(1000), value: z.string().max(100000), required: z.boolean().optional(), description: z.string().max(10000).optional(), select: z.boolean().optional() }).strict()
const nodeDataSchema = z.object({ description: z.string().max(10000).optional(), method: z.string().regex(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)$/i).optional(), url: z.string().max(10000).optional(), path: z.string().max(10000).optional(), port: z.number().int().min(1).max(65535).optional(), headers: z.array(propertySchema).max(500).optional(), queryParams: z.array(propertySchema).max(500).optional(), rawBody: z.string().max(1000000).optional(), message: z.string().max(1000000).optional(), response: z.string().max(1000000).optional() }).strict()
const nodePatchSchema = nodeDataSchema.extend({ name: z.string().min(1).max(1000).optional(), parentId: z.string().optional(), sort: z.number().int().optional() }).refine(value => Object.keys(value).length > 0, { message: 'At least one patch field is required' })
const variableSchema = z.object({ _id: z.string().min(1).optional(), name: z.string().min(1).max(1000), value: z.string().max(1000000), type: z.union([z.literal('string'), z.literal('number'), z.literal('boolean'), z.literal('null'), z.literal('any'), z.literal('file')]).default('string') }).strict()
const createOperationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('createProject'), name: z.string().min(1), description: z.string().optional() }).strict(),
  z.object({ type: z.literal('createNode'), projectId: z.string().optional(), nodeType: z.union([z.literal('folder'), z.literal('http'), z.literal('websocket'), z.literal('httpMock'), z.literal('websocketMock')]), parentId: z.string().optional(), name: z.string().min(1), data: nodeDataSchema.optional() }).strict(),
])
const updateOperationSchema = z.object({ type: z.literal('updateNode'), projectId: z.string().min(1), nodeId: z.string().min(1), patch: nodePatchSchema }).strict()
const moveOperationSchema = z.object({ type: z.literal('moveNode'), projectId: z.string().min(1), nodeId: z.string().min(1), parentId: z.string(), sort: z.number().int().optional() }).strict()
const deleteOperationSchema = z.object({ type: z.literal('deleteNode'), projectId: z.string().min(1), nodeId: z.string().min(1), includeChildren: z.boolean() }).strict()
const restoreOperationSchema = z.object({ type: z.literal('restoreNode'), projectId: z.string().min(1), nodeId: z.string().min(1) }).strict()
const variablesOperationSchema = z.object({ type: z.literal('updateVariables'), projectId: z.string().min(1), variables: z.array(variableSchema).max(1000) }).strict()
const headersOperationSchema = z.object({ type: z.literal('updateCommonHeaders'), projectId: z.string().min(1), headers: z.array(propertySchema).max(1000) }).strict()
const createChangeSchema = z.object({ targetProjectId: z.string().nullable().optional(), title: z.string().min(1), description: z.string().default(''), operations: z.array(createOperationSchema).min(1) }).strict()
const updateChangeSchema = z.object({ targetProjectId: z.string().min(1), title: z.string().min(1), description: z.string().default(''), operations: z.array(updateOperationSchema).min(1) }).strict()
const moveChangeSchema = z.object({ targetProjectId: z.string().min(1), title: z.string().min(1), description: z.string().default(''), operations: z.array(moveOperationSchema).min(1) }).strict()
const deleteChangeSchema = z.object({ targetProjectId: z.string().min(1), title: z.string().min(1), description: z.string().default(''), operations: z.array(deleteOperationSchema).min(1) }).strict()
const restoreChangeSchema = z.object({ targetProjectId: z.string().min(1), title: z.string().min(1), description: z.string().default(''), operations: z.array(restoreOperationSchema).min(1) }).strict()
const variablesChangeSchema = z.object({ targetProjectId: z.string().min(1), title: z.string().min(1), description: z.string().default(''), operations: z.array(variablesOperationSchema).min(1) }).strict()
const headersChangeSchema = z.object({ targetProjectId: z.string().min(1), title: z.string().min(1), description: z.string().default(''), operations: z.array(headersOperationSchema).min(1) }).strict()
const manageMockSchema = z.object({ nodeId: z.string().min(1), kind: z.union([z.literal('http'), z.literal('websocket')]), action: z.union([z.literal('status'), z.literal('start'), z.literal('stop')]) }).strict()
const manageWebSocketSchema = z.object({ nodeId: z.string().min(1), action: z.union([z.literal('status'), z.literal('connect'), z.literal('send'), z.literal('disconnect')]), message: z.string().optional() }).strict().refine(input => input.action !== 'send' || typeof input.message === 'string', { message: 'message is required when action is send' })

export const agentToolInputSchemas = {
  getWorkspaceContext: emptySchema,
  searchProjects: z.object({ query: z.string().default(''), limit: z.number().int().min(1).max(100).default(20) }).strict(),
  searchNodes: z.object({ projectId: z.string().min(1), query: z.string().default(''), nodeType: z.string().optional(), includeDeleted: z.boolean().default(false), limit: z.number().int().min(1).max(100).default(50) }).strict(),
  listNodeTree: projectIdSchema, getNodeDetail: nodeIdSchema, getDeletedNodes: projectIdSchema, openProject: projectIdSchema,
  createDesignChange: createChangeSchema, updateDesignChange: updateChangeSchema, moveNodesChange: moveChangeSchema,
  deleteNodesChange: deleteChangeSchema, restoreNodesChange: restoreChangeSchema, updateVariablesChange: variablesChangeSchema,
  updateCommonHeadersChange: headersChangeSchema, previewChangeSet: changeSetIdSchema, applyChangeSet: changeSetIdSchema,
  discardChangeSet: changeSetIdSchema, sendHttpRequest: nodeIdSchema, manageWebSocketConnection: manageWebSocketSchema, manageMockServer: manageMockSchema,
  setChangeSetApproval: z.object({ changeSetId: z.string().min(1), approvalId: z.string().min(1), approved: z.boolean() }).strict(),
}

