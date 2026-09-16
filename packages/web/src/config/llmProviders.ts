import { nanoid } from 'nanoid/non-secure';
import type { ChatRequestBody, LLMProviderSetting, LLMReasoningEffort, LLMThinkingMode, LLMVendor } from '../types/ai/agent.type';

export const llmPresetsCheckedAt = '2026-08-31';
export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-pro';
export const llmPresets = {
  deepseek: {
    label: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
    defaultModel: DEFAULT_DEEPSEEK_MODEL,
    keyURL: 'https://platform.deepseek.com/api_keys',
    docsURL: 'https://api-docs.deepseek.com/quick_start/pricing/',
    capabilities: {
      thinking: true,
      reasoningEfforts: ['low', 'high', 'max'],
      thinkingBudget: false,
      maxTokens: true,
    },
  },
  qwen: {
    label: '通义千问（阿里云百炼）',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen3.7-plus', 'qwen3.7-flash', 'qwen3.8-max'],
    defaultModel: 'qwen3.7-plus',
    keyURL: 'https://bailian.console.aliyun.com/?tab=model#/api-key',
    docsURL: 'https://help.aliyun.com/zh/model-studio/text-generation-model',
    capabilities: {
      thinking: true,
      reasoningEfforts: [],
      thinkingBudget: true,
      maxTokens: true,
    },
  },
} as const;
// 统一模型服务 API 前缀
export const normalizeLLMBaseURL = (baseURL: string): string => baseURL.trim().replace(/\/+$/, '').replace(/\/chat\/completions$/i, '');
// 判断配置厂商
export const isLLMVendor = (value: unknown): value is LLMVendor => value === 'deepseek' || value === 'qwen' || value === 'custom';
// 判断思考模式
export const isLLMThinkingMode = (value: unknown): value is LLMThinkingMode => value === 'default' || value === 'enabled' || value === 'disabled';
// 判断思考强度
export const isLLMReasoningEffort = (value: unknown): value is LLMReasoningEffort => value === 'default' || value === 'low' || value === 'high' || value === 'max';
// 生成独立的厂商默认配置
export const createLLMProvider = (vendor: LLMVendor = 'deepseek'): LLMProviderSetting => {
  const preset = vendor === 'custom' ? null : llmPresets[vendor];
  return {
    id: nanoid(), name: preset?.label ?? 'Custom Provider', provider: 'OpenAICompatible', vendor,
    apiKey: '', baseURL: preset?.baseURL ?? '', model: preset?.defaultModel ?? '', customHeaders: [], extraBody: '',
    thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: null,
  };
};
// 生成实际请求配置并隔离官方模式的地址与扩展参数
export const resolveLLMProvider = (config: LLMProviderSetting): LLMProviderSetting => {
  const vendor = config.vendor ?? 'custom';
  const normalized = {
    ...config,
    vendor,
    thinkingMode: isLLMThinkingMode(config.thinkingMode) ? config.thinkingMode : 'default',
    reasoningEffort: isLLMReasoningEffort(config.reasoningEffort) ? config.reasoningEffort : 'default',
    thinkingBudget: typeof config.thinkingBudget === 'number' ? config.thinkingBudget : null,
    maxTokens: typeof config.maxTokens === 'number' ? config.maxTokens : null,
  };
  if (vendor === 'custom') {
    return { ...normalized, baseURL: normalizeLLMBaseURL(config.baseURL), customHeaders: config.customHeaders.map(header => ({ ...header })) };
  }
  return { ...normalized, provider: 'OpenAICompatible', baseURL: llmPresets[vendor].baseURL, apiKey: config.apiKey.trim(), customHeaders: [], extraBody: '' };
};
// 解析额外请求体
const parseExtraBody = (extraBody: string): Record<string, unknown> => {
  if (!extraBody.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(extraBody);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
};
// 构建实际发送给模型的请求体
export const buildLLMRequestBody = (body: ChatRequestBody, config: LLMProviderSetting, stream: boolean): Record<string, unknown> => {
  const resolved = resolveLLMProvider(config);
  const advancedBody: Record<string, unknown> = {};
  if (resolved.vendor === 'deepseek') {
    if (resolved.thinkingMode !== 'default') advancedBody.thinking = { type: resolved.thinkingMode };
    if (resolved.thinkingMode === 'enabled' && resolved.reasoningEffort !== 'default') advancedBody.reasoning_effort = resolved.reasoningEffort;
  }
  if (resolved.vendor === 'qwen') {
    if (resolved.thinkingMode !== 'default') advancedBody.enable_thinking = resolved.thinkingMode === 'enabled';
    if (resolved.thinkingMode === 'enabled' && resolved.thinkingBudget !== null) advancedBody.thinking_budget = resolved.thinkingBudget;
  }
  if (resolved.vendor !== 'custom' && resolved.maxTokens !== null && body.max_tokens === undefined) advancedBody.max_tokens = resolved.maxTokens;
  return {
    ...parseExtraBody(resolved.extraBody),
    ...advancedBody,
    ...body,
    model: resolved.model,
    stream,
  };
};
// 校验配置并返回可翻译的提示
export const getLLMConfigError = (config: LLMProviderSetting): string => {
  if (!config.baseURL.trim() || !config.model.trim()) return '请先完成 API 配置';
  try {
    const url = new URL(config.baseURL);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '请输入有效的 HTTP 或 HTTPS 请求地址';
  } catch {
    return '请输入有效的 HTTP 或 HTTPS 请求地址';
  }
  if (config.vendor && config.vendor !== 'custom' && !config.apiKey.trim()) return '官方模型需要填写 API Key';
  if (config.extraBody.trim()) {
    try {
      const parsed: unknown = JSON.parse(config.extraBody);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return '额外请求体必须是有效的 JSON 对象';
    } catch {
      return '额外请求体必须是有效的 JSON 对象';
    }
  }
  if (config.thinkingBudget !== null && (!Number.isInteger(config.thinkingBudget) || config.thinkingBudget < 1)) return '思考预算必须是大于 0 的整数';
  if (config.maxTokens !== null && (!Number.isInteger(config.maxTokens) || config.maxTokens < 1)) return '最大输出 Token 必须是大于 0 的整数';
  return '';
};
// 归类请求错误并隐藏密钥和自定义请求头值
export const getLLMRequestError = (error: unknown, config: LLMProviderSetting): string => {
  const raw = typeof error === 'string' ? error : error instanceof Error ? error.message : '请求失败';
  const status = typeof error === 'object' && error !== null
    ? (error as { statusCode?: number; response?: { status?: number; statusCode?: number } }).statusCode
      ?? (error as { response?: { status?: number; statusCode?: number } }).response?.statusCode
      ?? (error as { response?: { status?: number } }).response?.status
      ?? Number(raw.match(/(?:HTTP\s*|status code\s*[:=]?\s*)(\d{3})/i)?.[1])
    : Number(raw.match(/(?:HTTP\s*|status code\s*[:=]?\s*)(\d{3})/i)?.[1]);
  if (status === 401 || /invalid.?api.?key|authentication_error|incorrect api key/i.test(raw)) return 'API Key 无效或已失效，请检查密钥及所属地域';
  if (status === 403) return '没有模型访问权限，请检查账号授权及所属地域';
  if (status === 404) return '模型或接口不可用，请检查模型、地址及所属地域';
  if (status === 402) return '模型服务余额不足，请检查官方账户';
  if (status === 429) return '请求过于频繁或额度不足，请稍后重试';
  if (/timeout|timed out/i.test(raw)) return '请求超时，请稍后重试';
  if (status && status >= 500) return '模型服务暂时不可用，请稍后重试';
  let safe = raw;
  for (const secret of [config.apiKey, ...config.customHeaders.map(header => header.value)]) {
    if (secret) safe = safe.split(secret).join('[REDACTED]').split(encodeURIComponent(secret)).join('[REDACTED]');
  }
  return safe;
};
