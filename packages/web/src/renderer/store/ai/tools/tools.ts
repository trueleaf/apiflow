import { AgentTool, OpenAiToolDefinition } from '@src/types/ai'
import { httpNodeTools } from './httpNodeTools'
import { projectTools } from './projectTools'
import { nodeOperationTools } from './nodeOperationTools'
import { variableTools } from './variableTools'
import { commonTools } from './commonTools'
import { commonHeaderTools } from './commonHeaderTools'

export const rawTools: AgentTool[] = [...httpNodeTools, ...projectTools, ...nodeOperationTools, ...variableTools, ...commonTools, ...commonHeaderTools]
export const openaiTools: OpenAiToolDefinition[] = rawTools.map(tool => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }
}))
// 获取工具摘要列表，仅包含名称和简短描述，用于 LLM 筛选阶段
export const getToolSummaries = (): { name: string; description: string }[] => rawTools.map(tool => ({
  name: tool.name,
  description: tool.description
}))
// 根据工具名称列表筛选出对应的 OpenAI 工具定义
export const getToolsByNames = (names: string[]): OpenAiToolDefinition[] => {
  const nameSet = new Set(names)
  return openaiTools.filter(tool => nameSet.has(tool.function.name))
}
// 根据工具名称查找原始工具定义
export const getRawToolByName = (name: string): AgentTool | undefined => {
  return rawTools.find(tool => tool.name === name)
}
