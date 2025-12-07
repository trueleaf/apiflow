import { AgentTool, OpenAiToolDefinition } from '@src/types/ai'
import { httpNodeTools } from './httpNodeTools'
import { projectTools } from './projectTools'
import { nodeOperationTools } from './nodeOperationTools'

export const rawTools: AgentTool[] = [...httpNodeTools, ...projectTools, ...nodeOperationTools]
export const openaiTools: OpenAiToolDefinition[] = rawTools.map(tool => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }
}))
