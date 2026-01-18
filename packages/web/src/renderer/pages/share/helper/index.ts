import mitt from 'mitt'
import dayjs from 'dayjs'
import type { ApidocTab, ApidocVariable } from '@src/types'
import type {
  HttpNode,
  ApidocBanner,
  ApiNode,
  HttpMockNode,
  WebSocketMockNode,
  WebSocketNode,
  FolderNode,
} from '@src/types'
import { i18n } from '@/i18n'
import { cloneDeep } from 'lodash-es'

// 轻量级变量转换函数（不支持 mock 和 any 类型的代码执行）
export const getObjectVariable = async (variables: ApidocVariable[]) => {
  const objectVariable: Record<string, unknown> = {};
  for (let i = 0; i < variables.length; i++) {
    const varInfo = variables[i];
    const { name, value, fileValue } = varInfo;
    if (varInfo.type === 'string') {
      objectVariable[name] = value;
    } else if (varInfo.type === 'number') {
      objectVariable[name] = Number(value);
    } else if (varInfo.type === 'boolean') {
      objectVariable[name] = value === 'true';
    } else if (varInfo.type === 'null') {
      objectVariable[name] = null;
    } else if (varInfo.type === 'any') {
      objectVariable[name] = value;
    } else if (varInfo.type === 'file') {
      objectVariable[name] = fileValue?.path || '';
    }
  }
  return Promise.resolve(objectVariable);
};
// 获取嵌套对象属性值
const getNestedValue = (path: string, scope: Record<string, unknown>): unknown => {
  try {
    const keys = path.split('.');
    let result: unknown = scope;
    for (const key of keys) {
      if (result === null || result === undefined) {
        return undefined;
      }
      result = (result as Record<string, unknown>)[key];
    }
    return result;
  } catch {
    return undefined;
  }
}
// 轻量级模板编译函数（不支持 mock 表达式和代码执行）
export const getCompiledTemplate = async (
  template: string,
  variables: ApidocVariable[],
  Context?: Record<string, unknown>
): Promise<unknown> => {
  try {
    const objectVariable = await getObjectVariable(variables);
    const context = Context || {};
    const scope = { ...objectVariable, _: context };
    const pureMatch = template.match(/^\s*\{\{\s*(.+?)\s*\}\}\s*$/);
    if (pureMatch) {
      const trimmed = pureMatch[1].trim();
      if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) {
        const result = getNestedValue(trimmed, scope as Record<string, unknown>);
        if (result === undefined) return template;
        return result;
      }
      return template;
    }
    const matches = template.matchAll(/\{\{\s*(.+?)\s*\}\}/g);
    const replacements: { match: string; value: string }[] = [];
    for (const match of matches) {
      const expr = match[1].trim();
      if (/^[a-zA-Z_$][\w.$]*$/.test(expr)) {
        const value = getNestedValue(expr, scope as Record<string, unknown>);
        let replacement: string;
        if (value === undefined) {
          replacement = match[0];
        } else if (value === null) {
          replacement = 'null';
        } else if (typeof value === 'object') {
          replacement = JSON.stringify(value);
        } else {
          replacement = String(value);
        }
        replacements.push({ match: match[0], value: replacement });
      } else {
        replacements.push({ match: match[0], value: match[0] });
      }
    }
    let result = template;
    for (const { match, value } of replacements) {
      result = result.replaceAll(match, value);
    }
    return result;
  } catch {
    return template;
  }
};

// 全局事件订阅发布
const emitter = mitt<{
  'apidoc/tabs/addOrDeleteTab': void,
  'apidoc/deleteDocs': void,
  'tabs/saveTabSuccess': void,
  'tabs/cancelSaveTab': void,
  'tabs/deleteTab': ApidocTab,
}>()
export const eventEmitter = emitter;

// 日志工具类
type LogParams = {
  [key: string]: unknown;
  error?: Error | unknown;
}
class Logger {
  private formatMessage(message: string, params?: LogParams): string {
    if (!params) return message;
    let formatted = message;
    Object.keys(params).forEach(key => {
      if (key !== 'error') {
        const placeholder = `{${key}}`;
        if (formatted.includes(placeholder)) {
          formatted = formatted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(params[key]));
        }
      }
    });
    return formatted;
  }
  private buildLogOutput(translatedMessage: string, params?: LogParams): unknown[] {
    const output: unknown[] = [translatedMessage];
    if (params?.error) {
      output.push('\n', params.error);
    }
    return output;
  }
  log(message: string, params?: LogParams): void {
    const output = this.buildLogOutput(this.formatMessage(message, params), params);
    console.log(...output);
  }
  info(message: string, params?: LogParams): void {
    const output = this.buildLogOutput(this.formatMessage(message, params), params);
    console.info(...output);
  }
  warn(message: string, params?: LogParams): void {
    const output = this.buildLogOutput(this.formatMessage(message, params), params);
    console.warn(...output);
  }
  error(message: string, params?: LogParams): void {
    const output = this.buildLogOutput(this.formatMessage(message, params), params);
    console.error(...output);
  }
}
export const logger = new Logger();

// 计算距离过期时间的倒计时
export const getCountdown = (expire: number) => {
  if (!expire) return '';
  const expireDate = new Date(expire).getTime();
  const now = Date.now();
  let diff = expireDate - now;
  if (diff <= 0) {
    return i18n.global.t('已过期');
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);
  let result = '';
  if (days > 0) result += days + i18n.global.t('天');
  if (hours > 0 || days > 0) result += hours + i18n.global.t('小时');
  if (minutes > 0 || hours > 0 || days > 0) result += minutes + i18n.global.t('分钟');
  result += seconds + i18n.global.t('秒');
  return result;
}

// 格式化时间
export const formatDate = (date: string | number | Date | dayjs.Dayjs | undefined, rule?: string): string => {
  const realRule = rule || 'YYYY-MM-DD HH:mm'
  const dayjsObj = dayjs(date);
  if (!dayjsObj.isValid()) {
    return '/';
  }
  const result = dayjsObj.format(realRule);
  return result;
}

// 将数组转换为树形结构
const arrayToTree = <T extends { _id: string; pid: string }>(list: T[]): (T & { children: T[] })[] => {
  const map = new Map<string, T & { children: T[] }>();
  const roots: (T & { children: T[] })[] = [];
  list.forEach(item => {
    map.set(item._id, { ...item, children: [] });
  });
  map.forEach(node => {
    if (node.pid && map.has(node.pid)) {
      map.get(node.pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// 将API节点转换为Banner节点
export const convertNodesToBannerNodes = (docs: ApiNode[] = []): ApidocBanner[] => {
  const treeData = arrayToTree(docs);
  const copyTreeData = cloneDeep(treeData)
  const banner: ApidocBanner[] = []
  const foo = (nodes: (ApiNode & { children: ApiNode[] })[], banner: ApidocBanner[]): void => {
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.info.type === 'folder' && b.info.type !== 'folder') return -1;
      if (a.info.type !== 'folder' && b.info.type === 'folder') return 1;
      return (a.sort || 0) - (b.sort || 0);
    });
    for (let i = 0; i < sortedNodes.length; i += 1) {
      const node = sortedNodes[i];
      let bannerNode: ApidocBanner;
      if (node.info.type === 'http') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'http',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
          method: (node as HttpNode).item.method,
          url: (node as HttpNode).item.url.path,
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'httpMock') {
        const mockNode = node as HttpMockNode;
        bannerNode = {
          _id: mockNode._id,
          updatedAt: mockNode.updatedAt || '',
          type: 'httpMock',
          sort: mockNode.sort,
          pid: mockNode.pid,
          name: mockNode.info.name,
          maintainer: mockNode.info.maintainer,
          method: mockNode.requestCondition.method[0] || 'ALL',
          url: mockNode.requestCondition.url,
          port: mockNode.requestCondition.port,
          state: 'stopped',
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'websocketMock') {
        const wsMockNode = node as WebSocketMockNode;
        bannerNode = {
          _id: wsMockNode._id,
          updatedAt: wsMockNode.updatedAt || '',
          type: 'websocketMock',
          sort: wsMockNode.sort,
          pid: wsMockNode.pid,
          name: wsMockNode.info.name,
          maintainer: wsMockNode.info.maintainer,
          path: wsMockNode.requestCondition.path,
          port: wsMockNode.requestCondition.port,
          state: 'stopped',
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'websocket') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'websocket',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
          protocol: (node as WebSocketNode).item.protocol,
          url: (node as WebSocketNode).item.url,
          readonly: false,
          children: [],
        };
      } else if (node.info.type === 'folder') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'folder',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
          commonHeaders: (node as FolderNode).commonHeaders || [],
          readonly: false,
          children: [],
        };
      } else {
        continue;
      }
      banner.push(bannerNode);
      if (node.children.length > 0) {
        foo(node.children as (ApiNode & { children: ApiNode[] })[], bannerNode.children)
      }
    }
  }
  foo(copyTreeData, banner)
  return banner
}
