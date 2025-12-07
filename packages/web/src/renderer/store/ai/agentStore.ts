import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useAiChatStore } from './aiChatStore'
import { openaiTools, rawTools } from './tools/tools.ts'
import { LLMessage } from '@src/types/ai/agent.type.ts'

const agentSystemPrompt = `你是 Apiflow 智能代理，需使用工具完成用户意图。
- 优先调用工具完成修改，避免凭空编造。
- 工具调用前先用一句话确认理解；缺信息则先追问。
- 仅在工具执行后，用中文简要说明修改结果或下一步需求。
- 不生成与当前请求无关的代码或文本。
- 创建接口时，如果用户只提供了简单描述而没有给出完整参数，优先使用simpleCreateHttpNode工具。
`

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
	const contextText = `当前上下文信息，若字段为null表示未选中：${JSON.stringify({
		project: context.project,
		activeTab: context.activeTab,
		variables: context.variables
	})}`;
  const messages: LLMessage[] = [
    { role: 'system', content: agentSystemPrompt },
    { role: 'system', content: contextText },
    { role: 'user', content: prompt }
  ];
	const MAX_ITERATIONS = 10;
	let currentResponse = await aiChatStore.chat({
		model: 'deepseek-chat',
		messages,
		tools: openaiTools
	});
	for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    // console.log('Current response:  ', currentResponse)
		const { message, finish_reason } = currentResponse.choices[0];
    console.log('finish_reason:', finish_reason, message.content)
    if (finish_reason === 'tool_calls' && message.tool_calls?.length) {
        console.log('调用的函数:', message.tool_calls.map(t => t.function.name).join(', '))
    }
		if (finish_reason !== 'tool_calls' || !message.tool_calls?.length) {
			return message.content;
		}
		messages.push({
			role: 'assistant',
			content: message.content || '',
			tool_calls: message.tool_calls
		});
		for (const toolCall of message.tool_calls) {
			const tool = rawTools.find(t => t.name === toolCall.function.name);
			if (!tool) {
				messages.push({
					role: 'tool',
					content: `工具 ${toolCall.function.name} 不存在`,
					tool_call_id: toolCall.id
				});
				continue;
			}
			try {
				const args = JSON.parse(toolCall.function.arguments);
				const result = await tool.execute(args);
				messages.push({
					role: 'tool',
					content: result.code === 0
						? `执行成功：${JSON.stringify(result.data)}`
						: `执行失败：${JSON.stringify(result.data)}`,
					tool_call_id: toolCall.id
				});
			} catch (err) {
				messages.push({
					role: 'tool',
					content: `工具执行异常：${err instanceof Error ? err.message : String(err)}`,
					tool_call_id: toolCall.id
				});
			}
		}
		currentResponse = await aiChatStore.chat({
			model: 'deepseek-chat',
			messages,
			tools: openaiTools
		});
	}
	return currentResponse.choices[0]?.message?.content || '';
}
