import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { commonHeaderCache } from '@/cache/project/commonHeadersCache'
import { projectCache } from '@/cache/project/projectCache'
import { environmentCache } from '@/cache/environment/environmentCache'
import { environmentVariableCache } from '@/cache/environment/environmentVariableCache'
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache'
import type { McpResourceReadResult } from '@src/types/mcp'

type ParsedMcpUri = {
  host: string
  parts: string[]
}
const invalidResource = (message: string): McpResourceReadResult => {
  return {
    code: 1,
    error: {
      code: 'INVALID_RESOURCE_URI',
      message,
    },
  }
}
const notFound = (message: string): McpResourceReadResult => {
  return {
    code: 1,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message,
    },
  }
}
const hasInvalidPart = (part: string): boolean => {
  return part === '..' || part.includes('\\') || part.includes('/')
}
const parseMcpUri = (uri: string): ParsedMcpUri | null => {
  if (!uri.startsWith('apiflow://')) {
    return null
  }
  try {
    const rawParts = uri.slice('apiflow://'.length).split('/').filter(Boolean)
    const host = decodeURIComponent(rawParts[0] ?? '')
    const parts = rawParts.slice(1).map(part => decodeURIComponent(part))
    if (!host || [host, ...parts].some(hasInvalidPart)) {
      return null
    }
    return { host, parts }
  } catch {
    return null
  }
}
const readProjectsResource = async (parts: string[]): Promise<McpResourceReadResult> => {
  if (parts.length === 0) {
    const projects = await projectCache.getProjectList()
    return { code: 0, data: projects }
  }
  const projectId = parts[0]
  if (!projectId) {
    return invalidResource('Project id is required')
  }
  if (parts.length === 1) {
    const project = await projectCache.getProjectInfo(projectId)
    return project ? { code: 0, data: project } : notFound('Project not found')
  }
  if (parts.length === 2 && parts[1] === 'tree') {
    const nodes = await apiNodesCache.getApiNodesAsTree(projectId)
    return { code: 0, data: nodes }
  }
  if (parts.length === 2 && parts[1] === 'variables') {
    const projectVariables = await nodeVariableCache.getVariableByProjectId(projectId)
    const environments = await environmentCache.getEnvironmentByProjectId(projectId)
    const environmentVariables = await environmentVariableCache.getVariablesByProjectId(projectId)
    return {
      code: 0,
      data: {
        projectVariables: projectVariables.data,
        environments: environments.data,
        environmentVariables: environmentVariables.data,
      },
    }
  }
  if (parts.length === 2 && parts[1] === 'common-headers') {
    const global = await commonHeaderCache.getCommonHeaders()
    const nodes = await apiNodesCache.getNodesByProjectId(projectId)
    const folders = nodes.filter(node => node.info.type === 'folder').map(node => ({
      _id: node._id,
      name: node.info.name,
      pid: node.pid,
      commonHeaders: 'commonHeaders' in node ? node.commonHeaders ?? [] : [],
    }))
    return {
      code: 0,
      data: {
        global,
        folders,
      },
    }
  }
  return invalidResource('Unsupported project resource')
}
const readNodesResource = async (parts: string[]): Promise<McpResourceReadResult> => {
  if (parts.length !== 1 || !parts[0]) {
    return invalidResource('Node id is required')
  }
  const node = await apiNodesCache.getNodeById(parts[0], true)
  return node ? { code: 0, data: node } : notFound('Node not found')
}
export const readMcpResource = async (uri: string): Promise<McpResourceReadResult> => {
  if (!uri.startsWith('apiflow://')) {
    return invalidResource('Unsupported resource scheme')
  }
  const parsed = parseMcpUri(uri)
  if (!parsed) {
    return invalidResource('Invalid URI path')
  }
  if (parsed.host === 'projects') {
    return readProjectsResource(parsed.parts)
  }
  if (parsed.host === 'nodes') {
    return readNodesResource(parsed.parts)
  }
  return invalidResource('Unsupported resource host')
}
