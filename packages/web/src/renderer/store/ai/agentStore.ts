import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useAiChatStore } from './aiChatStore'
import { openaiTools } from './tools/tools.ts'

const agentSystemPrompt = `你是 Apiflow 智能代理，需使用工具完成用户意图。
- 优先调用工具完成修改，避免凭空编造。
- 工具调用前先用一句话确认理解；缺信息则先追问。
- 仅在工具执行后，用中文简要说明修改结果或下一步需求。
- 不生成与当前请求无关的代码或文本。`

const buildAgentContext = () => {
	const projectWorkbench = useProjectWorkbench()
	const variableStore = useVariable()
	const projectNavStore = useProjectNav()
	const projectId = projectWorkbench.projectId
	const projectName = projectWorkbench.projectName
	const activeNav = projectNavStore.currentSelectNav
	const variables = variableStore.variables.map((item) => ({
		id: item._id,
		name: item.name,
		value: item.value,
		type: item.type,
	}))
	return {
		project: projectId ? { id: projectId, name: projectName } : null,
		variables,
		activeTab: activeNav ? { id: activeNav._id, label: activeNav.label, type: activeNav.tabType } : null,
	}
}
export const runAgent = async ({ prompt }: { prompt: string }) => {
	const aiChatStore = useAiChatStore()
	const context = buildAgentContext()
	const contextText = `当前项目: ${context.project ? `${context.project.name}(${context.project.id})` : '未选择'}\n当前标签: ${context.activeTab ? `${context.activeTab.label}(${context.activeTab.type})` : '未选择'}\n项目变量: ${context.variables.length > 0 ? context.variables.map((item) => `${item.name}=${item.value}`).join(' | ') : '无'}`
	const result = await aiChatStore.chat({
		model: 'deepseek-chat',
		messages: [
			{ role: 'system', content: agentSystemPrompt },
			{ role: 'system', content: contextText },
			{ role: 'user', content: prompt }
		],
		tools: openaiTools
	})
  console.log('agent result:', contextText, result)
}
