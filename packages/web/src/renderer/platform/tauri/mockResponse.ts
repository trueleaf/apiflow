import { invoke } from '@tauri-apps/api/core';
import JSON5 from 'json5';
import mime from 'mime';
import { getCompiledTemplate, getObjectVariable } from '@src/shared/template';
import type { ApidocVariable } from '@src/types/httpNode/types';
import type { DesktopMockRequest, DesktopMockResponse } from '@src/types/desktop';
import type { HttpMockNode } from '@src/types/mockNode';
import { MockContent } from './mockContent';
import { globalLLMClient } from './ai/client';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';

const content = new MockContent();
// 递归解析 JSON 模板中的键和值
const compileJson = async (value: unknown, variables: ApidocVariable[]): Promise<unknown> => {
  if (typeof value === 'string') return getCompiledTemplate(value, variables);
  if (Array.isArray(value)) return Promise.all(value.map(item => compileJson(item, variables)));
  if (value && typeof value === 'object') {
    const entries = await Promise.all(Object.entries(value).map(async ([key, item]) => [String(await getCompiledTemplate(key, variables)), await compileJson(item, variables)]));
    return Object.fromEntries(entries);
  }
  return value;
};
// 获取当前 AI 配置并生成 Mock 文本
const aiContent = async (prompt: string, json: boolean): Promise<string> => {
  const provider = llmProviderCache.getLLMProvider();
  if (!provider) throw new Error('AI_CONFIG_MISSING');
  const result = await globalLLMClient.chat({ messages: [{ role: 'user', content: prompt }], ...(json ? { response_format: { type: 'json_object' as const } } : {}), max_tokens: json ? 2000 : 300 }, provider);
  return result.choices[0]?.message.content || '';
};
// 生成所选格式的随机文本
const randomText = (config: HttpMockNode['response'][number]['textConfig']) => {
  const size = config.randomSize || 100;
  if (config.textType === 'html') return content.generateRandomHtml(size);
  if (config.textType === 'xml') return content.generateRandomXml(size);
  if (config.textType === 'yaml') return content.generateRandomYaml(size);
  if (config.textType === 'csv') return content.generateRandomCsv(size);
  return content.generateRandomText(size);
};
// 生成图片并保留指定格式和尺寸
const imageContent = async (config: HttpMockNode['response'][number]['imageConfig']): Promise<{ bytes: number[]; mime: string }> => {
  const width = Math.max(1, Math.min(config.randomWidth || 400, 2000));
  const height = Math.max(1, Math.min(config.randomHeight || 300, 2000));
  const format = config.imageConfig || 'png';
  const color = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'][Math.floor(Math.random() * 4)];
  const type = format === 'svg' ? 'image/svg+xml' : format === 'jpg' ? 'image/jpeg' : `image/${format}`;
  let bytes: Uint8Array;
  if (format === 'svg') {
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-family="Arial" font-size="${Math.min(width, height) / 10}">${width} x ${height}</text></svg>`;
    const filler = Math.max(0, Math.floor((config.randomSize || 0) * 1024) - new TextEncoder().encode(svg).length - 7);
    bytes = new TextEncoder().encode(svg.replace('</svg>', `${filler ? `<!--${'x'.repeat(filler)}-->` : ''}</svg>`));
  } else {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('IMAGE_CONTEXT_UNAVAILABLE');
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#ffffff';
    context.font = `bold ${Math.min(width, height) / 10}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`${width} x ${height}`, width / 2, height / 2);
    const blob = await canvas.convertToBlob({ type, quality: 0.8 });
    if (blob.type !== type) throw new Error('IMAGE_FORMAT_UNSUPPORTED');
    const data = new Uint8Array(await blob.arrayBuffer());
    bytes = new Uint8Array(Math.max(data.length, Math.floor((config.randomSize || 0) * 1024)));
    bytes.set(data);
  }
  return { bytes: Array.from(bytes), mime: type };
};
// 在受限运行时选择符合请求条件的响应
export const resolveMockResponse = async ({ node, variables, request }: DesktopMockRequest): Promise<DesktopMockResponse> => {
  const output: DesktopMockResponse = { status: 500, headers: {}, consoleLogs: [] };
  const scope = await getObjectVariable(variables);
  let selected: HttpMockNode['response'][number] | undefined;
  for (const response of node.response) {
    if (!response.conditions.enabled || !response.conditions.scriptCode.trim()) { selected = response; break; }
    const code = `(() => {
      const logs = [];
      const console = Object.fromEntries(['log','warn','error','info','debug'].map(level => [level, (...args) => {
        if (logs.length < 50) logs.push({level, message: args.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ').slice(0,500), timestamp: Date.now()});
      }]));
      req.get = name => req.headers[String(name).toLowerCase()];
      try { return {matched: Boolean((() => { ${response.conditions.scriptCode} })()), logs}; }
      catch (error) { return {matched: false, error: String(error), logs}; }
    })()`;
    const result = await invoke<{ matched: boolean; error?: string; logs: DesktopMockResponse['consoleLogs'] }>('execute_script', { code, variables: { req: { ...request, datetime: new Date(Number(request.timestamp)).toISOString(), variables: scope } } });
    output.consoleLogs.push(...result.logs);
    if (result.error) { output.body = JSON.stringify({ error: 'Condition script execution failed', details: result.error }); return output; }
    if (result.matched) { selected = response; break; }
  }
  if (!selected) { output.body = JSON.stringify({ error: 'No matching response condition' }); return output; }
  output.status = selected.statusCode;
  for (const header of [...selected.headers.defaultHeaders, ...selected.headers.customHeaders]) {
    if (header.select && header.key && header.value) output.headers[header.key.toLowerCase()] = header.value;
  }
  const setContentType = (type: string) => { output.headers['content-type'] ||= type; };
  switch (selected.dataType) {
    case 'redirect':
      output.status = selected.redirectConfig.statusCode;
      output.headers.location = String(await getCompiledTemplate(selected.redirectConfig.location, variables));
      output.body = '';
      break;
    case 'sse':
      output.status = 200;
      output.headers['content-type'] = 'text/event-stream';
      output.headers['cache-control'] = 'no-cache';
      output.headers['access-control-allow-origin'] = '*';
      output.sse = selected.sseConfig;
      break;
    case 'json': {
      const config = selected.jsonConfig;
      const value: unknown = config.mode === 'random' ? content.generateRandomJson(config.randomSize || 10)
        : config.mode === 'randomAi' ? JSON.parse(await aiContent(config.prompt, true))
          : await compileJson(JSON5.parse(config.fixedData || '{}') as unknown, variables);
      output.body = JSON.stringify(value);
      setContentType('application/json; charset=utf-8');
      break;
    }
    case 'text': {
      const config = selected.textConfig;
      let value: string;
      if (config.mode === 'fixed') value = config.fixedData || '';
      else if (config.mode === 'randomAi') {
        try { value = await aiContent(`${config.textType}: ${config.prompt}`, false); } catch { value = randomText(config); }
      } else value = randomText(config);
      output.body = String(await getCompiledTemplate(value, variables));
      const types: Record<string, string> = { html: 'text/html', xml: 'application/xml', yaml: 'application/x-yaml', csv: 'text/csv' };
      setContentType(`${types[config.textType] || 'text/plain'}; charset=utf-8`);
      break;
    }
    case 'image':
      if (selected.imageConfig.mode === 'fixed') {
        output.filePath = selected.imageConfig.fixedFilePath;
        setContentType(mime.getType(output.filePath) || 'application/octet-stream');
      } else {
        const image = await imageContent(selected.imageConfig);
        output.bytes = image.bytes;
        setContentType(image.mime);
      }
      break;
    case 'binary':
      output.filePath = selected.binaryConfig.filePath;
      setContentType(mime.getType(output.filePath) || 'application/octet-stream');
      break;
    case 'file':
      output.sample = selected.fileConfig.fileType;
      setContentType(mime.getType(`sample.${output.sample}`) || 'application/octet-stream');
      output.headers['content-disposition'] ||= `attachment; filename="sample.${output.sample}"`;
      break;
  }
  return output;
};
// 按发送时刻生成下一条 SSE 消息
export const resolveMockSse = async ({ config, variables, index }: { config: HttpMockNode['response'][number]['sseConfig']; variables: ApidocVariable[]; index: number }): Promise<string> => {
  const event = config.event;
  const lines: string[] = [];
  if (event.id.enable) lines.push(`id: ${event.id.valueMode === 'random' ? crypto.randomUUID() : event.id.valueMode === 'timestamp' ? Date.now() : index + 1}`);
  if (event.event.enable) lines.push(`event: ${String(await getCompiledTemplate(event.event.value, variables)).replace(/[\r\n]/g, '')}`);
  if (event.retry.enable && event.retry.value > 0) lines.push(`retry: ${event.retry.value}`);
  const data = event.data.mode === 'json' ? JSON.stringify(await compileJson(JSON5.parse(event.data.value || '{}') as unknown, variables)) : String(await getCompiledTemplate(event.data.value, variables));
  for (const line of data.split(/\r?\n/)) lines.push(`data: ${line}`);
  return lines.join('\n') + '\n\n';
};
