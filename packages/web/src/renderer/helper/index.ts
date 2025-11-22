import mitt from 'mitt'
import type { ApidocTab } from '@src/types'
import { ElMessage } from 'element-plus'
import type { MessageOptions as ElMessageOptions, MessageHandler } from 'element-plus'
import type { VNode } from 'vue'
import { i18n } from '@/i18n'
import { cloneDeep } from 'lodash-es'
import type { TreeNode } from '@src/types/helper'
import dayjs from 'dayjs'
import type { ParsedSSeData, ChunkWithTimestampe } from '@src/types'
import type { ApidocVariable } from '@src/types'
import Mock from 'mockjs'
import { faker } from '@faker-js/faker'
import SandboxWorker from '@/worker/sandbox.ts?worker&inline'
import type { SandboxPostMessage } from '@src/types'
import type { Property, ApidocProperty, RendererFormDataBody, HttpNodeConfig } from '@src/types'
import { nanoid } from 'nanoid/non-secure'
import type {
  HttpNodeRequestMethod,
  HttpNodePropertyType,
  HttpNode,
  ApidocBanner,
  HttpNodeRequestParamTypes,
  ApiNode,
  HttpMockNode,
  ApidocProjectInfo,
  ResponseInfo,
  WebSocketNode,
  FolderNode,
} from '@src/types'
import type { HttpNodeResponseData, UrlInfo } from '@src/types/helper'
import { useVariable } from '@/store/apidoc/variablesStore'
import { config } from '@src/config/config'

/*
|--------------------------------------------------------------------------
| 全局事件总线
|--------------------------------------------------------------------------
*/

/**
 * 全局事件订阅发布
 */
const emitter = mitt<{
  'apidoc/tabs/addOrDeleteTab': void,
  'apidoc/deleteDocs': void,
  'tabs/saveTabSuccess': void,
  'tabs/cancelSaveTab': void,
  'tabs/deleteTab': ApidocTab,
  'websocket/editor/removePreEditor': void;
  'websocket/editor/removeAfterEditor': void;
}>()

export const eventEmitter = emitter;

/*
|--------------------------------------------------------------------------
| 消息提示工具 (message.ts)
|--------------------------------------------------------------------------
*/

type MessageType = 'success' | 'warning' | 'info' | 'error'

interface MessageOptions extends Partial<ElMessageOptions> {
  message: string | VNode
  grouping?: boolean
}

class Message {
  private readonly defaultOptions = {
    grouping: true,
  }
  /**
   * 调用 ElMessage 显示消息
   */
  private call(type: MessageType, options: string | MessageOptions): MessageHandler {
    const mergedOptions = typeof options === 'string'
      ? { ...this.defaultOptions, message: options, type }
      : { ...this.defaultOptions, ...options, type }
    return ElMessage(mergedOptions as ElMessageOptions)
  }
  /**
   * 显示成功消息
   */
  success(options: string | MessageOptions): MessageHandler {
    return this.call('success', options)
  }
  /**
   * 显示错误消息
   */
  error(options: string | MessageOptions): MessageHandler {
    return this.call('error', options)
  }
  /**
   * 显示警告消息
   */
  warning(options: string | MessageOptions): MessageHandler {
    return this.call('warning', options)
  }
  /**
   * 显示信息消息
   */
  info(options: string | MessageOptions): MessageHandler {
    return this.call('info', options)
  }
  /**
   * 关闭所有消息
   */
  closeAll(): void {
    ElMessage.closeAll()
  }
}

export const message = new Message()

export const generateDefaultHttpNodeConfig = (): HttpNodeConfig => ({
  maxTextBodySize: config.httpNodeConfig.maxTextBodySize,
  maxRawBodySize: config.httpNodeConfig.maxRawBodySize,
  userAgent: config.httpNodeConfig.userAgent,
  followRedirect: config.httpNodeConfig.followRedirect,
  maxRedirects: config.httpNodeConfig.maxRedirects,
  maxHeaderValueDisplayLength: config.httpNodeConfig.maxHeaderValueDisplayLength
})

/*
|--------------------------------------------------------------------------
| 日志工具 (logger.ts)
|--------------------------------------------------------------------------
*/

interface LogParams {
  [key: string]: unknown;
  error?: Error | unknown;
}
class Logger {
  private get t() {
    return i18n.global.t;
  }
  private hasTranslation(key: string): boolean {
    try {
      const translated = this.t(key);
      return translated !== key;
    } catch {
      return false;
    }
  }
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
  private translate(message: string, params?: LogParams): string {
    const logKey = `log.${message}`;
    if (this.hasTranslation(logKey)) {
      return this.t(logKey, params || {});
    }
    return this.formatMessage(message, params);
  }
  private buildLogOutput(translatedMessage: string, params?: LogParams): unknown[] {
    const output: unknown[] = [translatedMessage];

    if (params?.error) {
      output.push('\n', params.error);
    }

    return output;
  }
  log(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.log(...output);
  }
  info(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.info(...output);
  }
  warn(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.warn(...output);
  }
  error(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.error(...output);
  }
  debug(message: string, params?: LogParams): void {
    if (process.env.NODE_ENV === 'development') {
      const translated = this.translate(message, params);
      const output = this.buildLogOutput(translated, params);
      console.log('[DEBUG]', ...output);
    }
  }
}
export const logger = new Logger();

/*
|--------------------------------------------------------------------------
| 通用工具函数 (common.ts)
|--------------------------------------------------------------------------
*/

/**
 * 将数组对象[{id: 1}]根据指定的key值进行去重,key值对应的数组元素不存在则直接过滤掉，若不传入id则默认按照set形式进行去重。
 */
export const uniqueByKey = <T extends Record<string, unknown>, K extends keyof T>(data: T[], key: K): T[] => {
  const result: T[] = [];
  for (let i = 0, len = data.length; i < len; i += 1) {
    const isInResult = result.find((val) => val[key] === data[i][key]);
    if (data[i][key] != null && !isInResult) {
      result.push(data[i]);
    }
  }
  return result;
}

/**
 * 拷贝文本
 */
export const copy = (str: string): void => {
  const dom = document.createElement('textarea');
  dom.value = str;
  dom.style.position = 'fixed';
  dom.style.top = '-9999px';
  dom.style.left = '-9999px';
  document.body.appendChild(dom);
  dom.select();
  document.execCommand('Copy', false);
  document.body.removeChild(dom);
}

/**
 * 生成指定范围的随机整数
 */
export const randomInt = (start: number, end: number): number => {
  if (start > end) {
    console.log('第二个参数必须大于第一个');
    return 0;
  }
  const range = end - start - 1;
  return Math.floor((Math.random() * range + 1))
}

/**
 * 模拟延迟
 */
export const sleep = async (delay: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!delay) {
        resolve();
      }
      setTimeout(() => {
        resolve();
      }, delay)
    } catch (error) {
      reject(error);
    }
  })
}

/**
 * 导出文本为文件
 */
export const downloadStringAsText = (content: string, fileName: string, mimeType = 'text/plain;charset=utf-8'): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;  // 设置下载文件名
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * 计算距离过期时间的倒计时
 */
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
  // 国际化拼接
  let result = '';
  if (days > 0) result += days + i18n.global.t('天');
  if (hours > 0 || days > 0) result += hours + i18n.global.t('小时');
  if (minutes > 0 || hours > 0 || days > 0) result += minutes + i18n.global.t('分钟');
  result += seconds + i18n.global.t('秒');
  return result;
}

/*
|--------------------------------------------------------------------------
| 验证工具 (validator.ts)
|--------------------------------------------------------------------------
*/

/**
 * 检测是否在 Electron 环境中
 */
export const isElectron = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.process === "object" &&
    window.process.type === "renderer"
  ) {
    return true;
  }
  if (
    typeof process !== "undefined" &&
    typeof process.versions === "object" &&
    !!process.versions.electron
  ) {
    return true;
  }
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return true;
  }
  return false;
};

/**
 * 判断字符串是否为有效的JSON格式
 */
export const isJsonString = (str: string): boolean => {
  if (!str || typeof str !== 'string') {
    return false;
  }

  // 去除首尾空白字符
  const trimmedStr = str.trim();

  // 空字符串不是有效的 JSON
  if (!trimmedStr) {
    return false;
  }

  // JSON 必须以 { 或 [ 开头
  if (!trimmedStr.startsWith('{') && !trimmedStr.startsWith('[')) {
    return false;
  }

  try {
    JSON.parse(trimmedStr);
    return true;
  } catch (error) {
    return false;
  }
};

/*
|--------------------------------------------------------------------------
| 存储工具 (storage.ts)
|--------------------------------------------------------------------------
*/

/**
 * 获取IndexedDB中的数据项数量
 */
export const getIndexedDBItemCount = async (excludeDbNames?: string[]): Promise<number> => {
  try {
    // 获取所有数据库
    const databases = await indexedDB.databases();
    let totalItemCount = 0;

    for (const { name: dbName } of databases) {
      if (!dbName) continue;

      // 如果数据库名在排除列表中，跳过
      if (excludeDbNames && excludeDbNames.includes(dbName)) {
        continue;
      }

      try {
        // 使用idb打开数据库
        const { openDB } = await import('idb');
        const db = await openDB(dbName);
        if (!db) continue;

        const storeNames = Array.from(db.objectStoreNames);

        try {
          for (const storeName of storeNames) {
            try {
              // 为每个store创建新的事务，避免事务超时
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.store;
              const count = await store.count();
              totalItemCount += count;

              // 等待事务完成
              await transaction.done;
            } catch (storeError) {
              console.warn(`统计存储 ${storeName} 数量时出错:`, storeError);
              continue;
            }
          }
        } finally {
          db.close();
        }
      } catch (error) {
        console.warn(`无法打开数据库 ${dbName}:`, error);
        continue;
      }
    }

    return totalItemCount;
  } catch (error) {
    console.error('获取IndexedDB数据项数量失败:', error);
    // 如果获取失败，返回默认值
    return 0;
  }
};

/*
|--------------------------------------------------------------------------
| 树形数据处理 (tree.ts)
|--------------------------------------------------------------------------
*/

/**
 * 遍历森林
 */
export const forEachForest = <T extends Record<string, any>>(forest: T[], fn: (arg: T) => void, options?: { childrenKey?: string }): void => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return;
  }
  const childrenKey = options?.childrenKey || 'children';
  const foo = (forestData: T[], hook: (arg: T) => void) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      hook(currentData);
      if (!currentData[childrenKey]) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!Array.isArray(currentData[childrenKey])) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if ((currentData[childrenKey] as T[]).length > 0) {
        foo(currentData[childrenKey] as T[], hook);
      }
    }
  };
  foo(forest, fn);
}

/**
 * 根据id查询父元素
 */
export const findParentById = <T extends Record<string, any>>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let pNode: T | null = null;
  const foo = (forestData: Record<string, any>, p: T | null) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        pNode = p;
        return;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey], currentData);
      }
    }
  };
  foo(forest, null);
  return pNode;
}

/**
 * 根据id查询兄弟节点（通用函数）
 * @param forest 树形数组
 * @param id 节点id
 * @param direction 方向：'next' 为下一个，'previous' 为上一个
 * @param options 配置选项
 */
export const findSiblingById = <T extends Record<string, any>>(
  forest: T[],
  id: string | number,
  direction: 'next' | 'previous',
  options?: { childrenKey?: string, idKey?: string }
): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let sibling: T | null = null;
  const offset = direction === 'next' ? 1 : -1;

  const foo = (forestData: Record<string, any>) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        sibling = forestData[i + offset] || null;
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return sibling;
}

/**
 * 根据id查询元素
 */
export const findNodeById = <T extends Record<string, any>>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型')
    return null;
  }
  let result = null;
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  const foo = (forestData: Record<string, any>) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        result = currentData;
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return result;
}

/**
 * 将树形数据所有节点转换为一维数组,数据会进行深拷贝
 */
export const flatTree = <T extends TreeNode<T>>(root: T): T[] => {
  const result: T[] = [];
  const foo = (nodes: T[]): void => {
    for (let i = 0; i < nodes.length; i += 1) {
      const item = nodes[i];
      const itemCopy = cloneDeep(item);
      itemCopy.children = [];
      result.push(itemCopy);
      if (item.children && item.children.length > 0) {
        foo(item.children);
      }
    }
  }
  foo([root]);
  return result;
}

/**
 * 将数组转换为树形结构
 */
export const arrayToTree = <T extends { _id: string; pid: string }>(list: T[]): (T & { children: T[] })[] => {
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
//获取某个节点的所有祖先节点ID
export const getAllAncestorIds = <T extends Record<string, any>>(forest: T[], nodeId: string | number, options?: { childrenKey?: string, idKey?: string }): string[] => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return [];
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  const ancestors: string[] = [];
  const findAncestors = (nodes: T[], targetId: string | number, path: string[]): boolean => {
    for (let i = 0; i < nodes.length; i += 1) {
      const currentNode = nodes[i];
      const currentPath = [...path, currentNode[idKey]];
      if (currentNode[idKey] === targetId) {
        ancestors.push(...path);
        return true;
      }
      if (currentNode[childrenKey] && Array.isArray(currentNode[childrenKey]) && currentNode[childrenKey].length > 0) {
        if (findAncestors(currentNode[childrenKey], targetId, currentPath)) {
          return true;
        }
      }
    }
    return false;
  };
  findAncestors(forest, nodeId, []);
  return ancestors;
}

/*
|--------------------------------------------------------------------------
| 格式化工具 (format.ts)
|--------------------------------------------------------------------------
*/

/**
 * 获取字符串宽度
 */
export const getTextWidth = (text: string, font: string): number => {
  let canvas: HTMLCanvasElement | null = document.createElement('canvas');
  const context = canvas.getContext('2d');
  (context as CanvasRenderingContext2D).font = font;
  const metrics = (context as CanvasRenderingContext2D).measureText(text);
  canvas = null;
  return metrics.width;
}

/**
 * 格式化时间
 */
export const formatDate = (date: string | number | Date | dayjs.Dayjs | undefined, rule?: string): string => {
  const realRule = rule || 'YYYY-MM-DD HH:mm'
  const dayjsObj = dayjs(date);
  if (!dayjsObj.isValid()) {
    return '/';
  }
  const result = dayjsObj.format(realRule);
  return result;
}

/**
 * 通用单位格式化函数
 * @param value 要格式化的数值
 * @param type 格式化类型：'bytes' 或 'time'
 */
export const formatUnit = (value: number, type: 'bytes' | 'time'): string => {
  if (!value && type === 'time') {
    return '';
  }

  if (type === 'bytes') {
    // 字节转换
    const units = ['B', 'KB', 'MB', 'GB'];
    const threshold = 1024;

    if (value >= 0 && value < threshold) {
      return `${value}B`;
    }

    let index = 0;
    let result = value;
    while (result >= threshold && index < units.length - 1) {
      result /= threshold;
      index++;
    }

    return `${result.toFixed(2)}${units[index]}`;
  } else {
    // 时间转换（毫秒）
    if (value > 0 && value < 1000) {
      return `${value}ms`;
    } else if (value >= 1000 && value < 1000 * 60) {
      return `${(value / 1000).toFixed(2)}s`;
    } else if (value >= 1000 * 60) {
      return `${(value / 1000 / 60).toFixed(2)}m`;
    }
    return '';
  }
}

/**
 * 格式化HTTP请求头名称
 */
export const formatHeader = (header: string) => {
  return header
    .split('-') // 拆分成单词数组
    .map(word =>
      word.charAt(0).toUpperCase() + // 首字母大写
      word.slice(1).toLowerCase()    // 其余字母小写
    )
    .join('-'); // 重新连接成字符串
}

/*
|--------------------------------------------------------------------------
| URL解析工具 (url.ts)
|--------------------------------------------------------------------------
*/

/**
 * 解析URL信息（通用函数）
 * @param url URL字符串
 * @returns 包含多个URL组成部分的对象
 */
export const parseUrlInfo = (url: string): {
  domain: string,
  path: string,
  protocol: string,
  port: string,
  search: string,
  hash: string,
  host: string,
} => {
  try {
    const urlObj = new URL(url);
    return {
      domain: urlObj.hostname,
      path: urlObj.pathname,
      protocol: urlObj.protocol,
      port: urlObj.port,
      search: urlObj.search,
      hash: urlObj.hash,
      host: urlObj.host,
    };
  } catch {
    return {
      domain: '',
      path: '',
      protocol: '',
      port: '',
      search: '',
      hash: '',
      host: '',
    };
  }
}

/**
 * 从Content-Disposition响应头中提取文件名
 */
export const getFileNameFromContentDisposition = (contentDisposition: string) => {
  if (!contentDisposition) {
    return '';
  }

  const match = contentDisposition.match(/filename="?([^";]*)"?/);
  return match ? match[1] : '';
}

/*
|--------------------------------------------------------------------------
| SSE数据流解析 (sse.ts)
|--------------------------------------------------------------------------
*/

/**
 * 解析 SSE 数据块
 */
const parseSseBlock = (block: string, timestamp?: number) => {
  // 如果block为空，返回空消息
  if (!block || !block.trim()) {
    return {
      id: "",
      type: "",
      data: '',
      retry: 0,
      timestamp: timestamp || Date.now(),
      dataType: 'normal' as const,
      rawBlock: block,
    };
  }

  const lines = block.split(/\r?\n/);
  const msg: ParsedSSeData = {
    id: "",
    type: "",
    data: '',
    retry: 0,
    timestamp: timestamp || Date.now(),
    dataType: 'normal',
    rawBlock: block,
  };

  for (let line of lines) {
    // 空行或注释行忽略
    if (line === '' || line.startsWith(':')) continue;
    
    // SSE规范：冒号前的是字段名，冒号后的是值
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      // 如果没有冒号，整行作为字段名，值为空字符串
      const field = line.trim();
      if (field === 'data') {
        msg.data += (msg.data ? '\n' : '');
      }
      continue;
    }

    const field = line.slice(0, colonIndex);
    // 值部分：如果冒号后第一个字符是空格，则去掉这个空格（SSE规范）
    let value = line.slice(colonIndex + 1);
    if (value.startsWith(' ')) {
      value = value.slice(1);
    }

    switch (field) {
      case 'data':
        // 多行 data 要用 "\n" 拼接
        msg.data += (msg.data ? '\n' : '') + value;
        break;
      case 'event':
        msg.event = value;
        break;
      case 'id':
        msg.id = value;
        break;
      case 'retry':
        const n = parseInt(value, 10);
        if (!isNaN(n) && n >= 0) msg.retry = n;
        break;
      default:
        // 忽略未知字段（符合SSE规范）
        break;
    }
  }

  return msg;
}

/**
 * 解析 SSE chunk 列表
 */
export const parseChunkList = (chunkList: ChunkWithTimestampe[]): ParsedSSeData[] => {
  const parsedData: ParsedSSeData[] = [];

  // 尝试使用 TextDecoder，如果失败则使用二进制模式
  let decoder: TextDecoder | null = null;
  let useBinaryMode = false;

  try {
    decoder = new TextDecoder('utf-8', { fatal: false });
  } catch (error) {
    useBinaryMode = true;
  }

  if (useBinaryMode) {
    // 二进制模式：将所有 chunk 转换为十六进制字符串
    const hexBlocks: string[] = [];
    let firstTimestamp = Date.now();
    for (let streamChunk of chunkList) {
      const hexString = Array.from(streamChunk.chunk)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      hexBlocks.push(hexString);
      if (firstTimestamp === Date.now()) {
        firstTimestamp = streamChunk.timestamp;
      }
    }

    // 创建一个二进制类型的 ParsedSSeData
    const binaryMsg: ParsedSSeData = {
      id: "",
      type: "",
      data: '',
      retry: 0,
      timestamp: firstTimestamp,
      dataType: 'binary',
      rawBlock: hexBlocks.join(''),
    };

    parsedData.push(binaryMsg);
    return parsedData;
  }

  // 正常的文本解码模式
  let buffer = '';
  let lastTimestamp = Date.now();
  
  for (let streamChunk of chunkList) {
    lastTimestamp = streamChunk.timestamp;
    buffer += decoder!.decode(streamChunk.chunk, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const msg = parseSseBlock(block, streamChunk.timestamp);
      parsedData.push(msg);
    }
  }
  
  // 刷新解码器，获取可能残留的数据
  buffer += decoder!.decode();

  // 处理最后剩余的buffer数据
  if (buffer.trim()) {
    // 检查是否有完整的消息（以\n\n分隔）
    const blocks = buffer.split(/\r?\n\r?\n/);
    
    blocks.forEach((block) => {
      const trimmedBlock = block.trim();
      if (trimmedBlock) {
        // 对于不完整的最后一块（没有\n\n结尾），也解析它
        // 这样可以确保即使流未完成，也能看到部分数据
        parsedData.push(parseSseBlock(trimmedBlock, lastTimestamp));
      }
    });
  }

  return parsedData;
};

/*
|--------------------------------------------------------------------------
| AI流式响应解析 (aiStreamParser.ts)
|--------------------------------------------------------------------------
*/

/**
 * DeepSeek 流式响应数据结构
 */
export interface DeepSeekStreamDelta {
  choices?: Array<{
    index: number
    delta?: {
      content?: string
      role?: string
    }
    finish_reason?: string | null
  }>
}

/**
 * 解析 AI 流式响应数据（SSE 格式）
 * @param buffer - 当前缓冲区内容
 * @param chunk - 新接收的数据块
 * @param onContent - 解析到内容时的回调
 * @returns 新的缓冲区内容
 */
export function parseAiStream(
  buffer: string,
  chunk: string,
  onContent: (content: string) => void
): string {
  // 将新数据追加到缓冲区
  const newBuffer = buffer + chunk

  // 按行分割数据
  const lines = newBuffer.split('\n')

  // 保留最后一行（可能不完整）
  const remainingBuffer = lines.pop() || ''

  // 处理每一行完整的数据
  for (const line of lines) {
    const trimmedLine = line.trim()

    // 跳过空行和结束标记
    if (!trimmedLine || trimmedLine === 'data: [DONE]') {
      continue
    }

    // 解析 SSE 格式的数据行
    if (trimmedLine.startsWith('data: ')) {
      try {
        // 提取 JSON 字符串（移除 "data: " 前缀）
        const jsonStr = trimmedLine.slice(6)
        const parsedData: DeepSeekStreamDelta = JSON.parse(jsonStr)

        // 提取 content 字段
        const content = parsedData.choices?.[0]?.delta?.content

        if (content) {
          onContent(content)
        }
      } catch (parseError) {
        // 解析失败时记录警告但不中断处理
        console.warn('Failed to parse AI stream data:', trimmedLine, parseError)
      }
    }
  }

  return remainingBuffer
}

/*
|--------------------------------------------------------------------------
| 模板和变量处理 (template.ts)
|--------------------------------------------------------------------------
*/

/**
 * 在沙箱环境中执行代码
 */
export const evalCode = (code: string) => {
  return new Promise((resolve, reject) => {
    const worker = new SandboxWorker();
    worker.onmessage = (event: MessageEvent<SandboxPostMessage>) => {
      if (event.data.type === "error") {
        reject(event.data.msg);
      } else if (event.data.type === "evalSuccess") {
        resolve(event.data.data);
      }
    };
    worker.onerror = (error) => {
      reject(error.message);
    };
    worker.postMessage({
      type: "eval",
      code,
    });
  });
};

/**
 * 将 ApidocVariable[] 转换为 Record<string, any>
 */
export const getObjectVariable = async (variables: ApidocVariable[]) => {
  const objectVariable: Record<string, any> = {};
  for (let i = 0; i < variables.length; i++) {
    const varInfo = variables[i];
    const { name, value, fileValue } = varInfo;
    if (varInfo.type === "string") {
      objectVariable[name] = value;
    } else if (varInfo.type === "number") {
      objectVariable[name] = Number(value);
    } else if (varInfo.type === "boolean") {
      objectVariable[name] = value === "true" ? true : false;
    } else if (varInfo.type === "null") {
      objectVariable[name] = null;
    } else if (varInfo.type === "any") {
      objectVariable[name] = await evalCode(value);
    } else if (varInfo.type === "file") {
      objectVariable[name] = fileValue.path;
    }
  }
  return Promise.resolve(objectVariable);
};

/**
 * 检查字符串是否为表达式
 * 表达式特征：包含运算符且不是纯变量名
 */
const isExpression = (str: string): boolean => {
  // 去除首尾空格
  const trimmed = str.trim();

  // 如果是纯数字，不视为表达式
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return false;
  }

  // 如果是纯变量名（字母、数字、下划线），不视为表达式
  if (/^[a-zA-Z_]\w*$/.test(trimmed)) {
    return false;
  }

  // 包含运算符的视为表达式
  return /[+\-*/()%<>=!&|]/.test(trimmed);
};

/**
 * 安全计算表达式（同步版本，用于 convertTemplateValueToRealValue）
 * 支持基本的数学运算和变量替换
 */
const evaluateExpressionSync = (expression: string, variables: Record<string, any>): any => {
  // 创建安全的计算环境
  const safeGlobals = {
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    ...variables
  };

  try {
    // 替换表达式中的变量
    let processedExpression = expression;

    // 替换变量名为实际值
    Object.keys(variables).forEach(varName => {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      const value = variables[varName];
      // 如果是字符串，需要加引号
      const replacement = typeof value === 'string' ? `"${value}"` : String(value);
      processedExpression = processedExpression.replace(regex, replacement);
    });

    // 使用Function构造函数在受限环境中执行
    const func = new Function(...Object.keys(safeGlobals), `return (${processedExpression})`);
    return func(...Object.values(safeGlobals));
  } catch (error) {
    throw new Error(`表达式计算错误: ${(error as Error).message}`);
  }
};

/**
 * 将模板转换为字符串
 * 变量类型一：{{ variable }}
 * 变量类型二：{{ @variable }}
 * 变量类型三：@xxx
 */
export const convertTemplateValueToRealValue = async (
  stringValue: string,
  objectVariable: Record<string, any>
) => {

  const isSingleMustachTemplate = stringValue.match(
    /^\s*\{\{\s*(.*?)\s*\}\}\s*$/
  ); // 这种属于单模板，返回实际值，可能是数字、对象等"{{ variable }}"或"{{ expression }}"
  if (isSingleMustachTemplate) {
    const variableName = isSingleMustachTemplate[1];
    if (variableName.startsWith("@")) {
      return variableName;
    }
    if (objectVariable[variableName] !== undefined) {
      return objectVariable[variableName];
    }
    // 检查是否为表达式
    if (isExpression(variableName)) {
      try {
        const result = evaluateExpressionSync(variableName, objectVariable);
        // 如果结果是数字，直接返回数字而不是字符串
        return result;
      } catch (error) {
        console.warn('表达式计算失败:', variableName, error);
        return isSingleMustachTemplate[0];
      }
    }
    return isSingleMustachTemplate[0];
  }

  const withoutVaribleString = stringValue.replace(
    /(?<!\\)\{\{\s*(.*?)\s*\}\}/g,
    ($1, variableName: string) => {
      const isVariableExist = variableName in objectVariable;
      if (variableName.startsWith("@")) {
        return variableName;
      }
      if (!isVariableExist) {
        // 检查是否为表达式
        if (isExpression(variableName)) {
          try {
            const result = evaluateExpressionSync(variableName, objectVariable);
            // 在字符串模板中，需要将结果转换为字符串
            return String(result);
          } catch (error) {
            console.warn('表达式计算失败:', variableName, error);
            return $1;
          }
        }
        return $1;
      }
      const value = objectVariable[variableName];
      return value;
    }
  );

  const withoutAtPatternString = withoutVaribleString.replace(
    /(@[^@]+)/g,
    (_, variableName: string) => {
      return variableName;
    }
  );

  const withoutEscapeString = withoutAtPatternString.replace(
    /((\\)(?=\{\{))|(\\)(?=@)/g,
    ""
  );
  return withoutEscapeString;
};

/**
 * 获取嵌套对象属性值，支持点语法访问
 */
const getNestedValue = (path: string, scope: Record<string, any>): any => {
  try {
    const keys = path.split('.');
    let result: any = scope;
    for (const key of keys) {
      if (result === null || result === undefined) {
        return undefined;
      }
      result = result[key];
    }
    return result;
  } catch {
    return undefined;
  }
}

/**
 * Mock数据生成函数
 */
const evaluateMock = (mockExpr: string): any => {
  try {
    const result = Mock.mock(mockExpr);
    return result;
  } catch (mockError) {
    try {
      const fakerPath = mockExpr.slice(1);
      const keys = fakerPath.split('.');
      let fakerMethod: any = faker;
      for (const key of keys) {
        fakerMethod = fakerMethod[key];
        if (!fakerMethod) {
          return mockExpr;
        }
      }
      if (typeof fakerMethod === 'function') {
        return fakerMethod();
      }
      return fakerMethod;
    } catch {
      return mockExpr;
    }
  }
}

/**
 * 表达式求值函数
 */
const evaluateExpression = async (expr: string, scope: Record<string, any>): Promise<any> => {
  const trimmed = expr.trim();
  if (trimmed.startsWith('@')) {
    return evaluateMock(trimmed);
  }
  if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) {
    return getNestedValue(trimmed, scope);
  }
  try {
    const result = await (window as any).electronAPI.execCode(trimmed, scope);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.msg);
  } catch {
    return undefined;
  }
}

/**
 * 将字符串模板转换为编译后的值（用于 helper 内部使用）
 */
export const getCompiledTemplate = async (
  template: string,
  variables: ApidocVariable[],
  Context?: Record<string, any>
): Promise<any> => {
  try {
    // 使用本地的 getObjectVariable 而不是动态导入
    const objectVariable = await getObjectVariable(variables);
    const context = Context || {};
    const scope = { ...objectVariable, _: context };
    const pureMatch = template.match(/^\s*\{\{\s*(.+?)\s*\}\}\s*$/);
    if (pureMatch) {
      const result = await evaluateExpression(pureMatch[1], scope);
      return result;
    }
    const matches = template.matchAll(/\{\{\s*(.+?)\s*\}\}/g);
    const replacements: { match: string; value: string }[] = [];
    for (const match of matches) {
      try {
        const expr = match[1];
        const value = await evaluateExpression(expr, scope);
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
      } catch {
        replacements.push({ match: match[0], value: match[0] });
      }
    }
    let result = template;
    for (const { match, value } of replacements) {
      result = result.replace(match, value);
    }
    return result;
  } catch (error) {
    return template;
  }
}

/*
|--------------------------------------------------------------------------
| 参数处理工具 (params.ts)
|--------------------------------------------------------------------------
*/

/**
 * 通用参数字符串生成函数
 * @param params 参数数组
 * @param objectVariable 变量对象
 * @param options 配置选项
 */
export const getStringFromParams = async (
  params: Property[],
  objectVariable: Record<string, any>,
  options?: {
    checkSelect?: boolean,  // 是否检查 select 属性
    addQuestionMark?: boolean,  // 是否添加问号前缀
  }
): Promise<string> => {
  const { checkSelect = false, addQuestionMark = false } = options || {};
  let resultString = "";

  for (let i = 0; i < params.length; i++) {
    const param = params[i];

    // 如果需要检查 select 且未选中，则跳过
    if (checkSelect && !param.select) {
      continue;
    }

    if (param.key) {
      const realKey = await convertTemplateValueToRealValue(
        param.key,
        objectVariable
      );
      const realValue = await convertTemplateValueToRealValue(
        param.value,
        objectVariable
      );
      resultString += `${realKey}=${realValue}&`;
    }
  }

  // 移除末尾的 &
  resultString = resultString.replace(/&$/, "");

  // 如果需要添加问号前缀
  if (addQuestionMark && resultString) {
    resultString = `?${resultString}`;
  }

  return resultString;
};

/**
 * 从 Path 参数生成对象
 */
export const getObjectPathParams = async (
  pathParams: Property[],
  objectVariable: Record<string, any>
): Promise<Record<string, string>> => {
  const objectPathParams: Record<string, string> = {};
  for (let i = 0; i < pathParams.length; i++) {
    const pathParam = pathParams[i];
    if (pathParam.key) {
      const realValue = await convertTemplateValueToRealValue(
        pathParam.value,
        objectVariable
      );
      objectPathParams[pathParam.key] = realValue;
    }
  }
  return objectPathParams;
};

/**
 * 从 FormData 参数生成 FormData Body
 */
export const getFormDataFromFormDataParams = async (
  formDataParams: Property[],
  objectVariable: Record<string, any>
): Promise<RendererFormDataBody> => {
  const renderedFormDataBody: RendererFormDataBody = [];
  for (let i = 0; i < formDataParams.length; i++) {
    const formData = formDataParams[i];
    if (formData.key) {
      const realKey = await convertTemplateValueToRealValue(
        formData.key,
        objectVariable
      );
      const realValue = await convertTemplateValueToRealValue(
        formData.value,
        objectVariable
      );
      renderedFormDataBody.push({
        id: formData._id,
        key: realKey,
        type: formData.type,
        value: realValue === null ? "null" : realValue?.toString(),
      });
    }
  }
  return renderedFormDataBody;
};

/**
 * ApidocProperty数组转换为对象，key和value都进行模板编译
 */
export const convertApidocPropertyToObject = async (params: ApidocProperty[]): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  const variableStore = useVariable();
  const variables = variableStore.variables;
  await Promise.all(params.map(async (param) => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      const compiledKey = await getCompiledTemplate(key, variables);
      const compiledValue = await getCompiledTemplate(value, variables);
      result[String(compiledKey)] = String(compiledValue);
    }
  }));
  return result;
}

/*
|--------------------------------------------------------------------------
| API文档工具 (apidoc.ts)
|--------------------------------------------------------------------------
*/

/**
 * 获取请求方法
 */
export const getRequestMethodEnum = (): HttpNodeRequestMethod[] => {
  return ['GET', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'PATCH', 'HEAD'];
}

/**
 * 生成一条接口参数
 */
export const generateEmptyProperty = <T extends HttpNodePropertyType = 'string'>(type?: T): ApidocProperty<T> => {
  const result = {
    _id: nanoid(),
    key: '',
    type: type || 'string',
    description: '',
    value: '',
    required: true,
    select: true,
  };
  return result as ApidocProperty<T>;
}

/**
 * 检查每个ApidocProperty是否一致
 */
export const checkIsSameProperty = (p: ApidocProperty, p2: ApidocProperty): boolean => {
  let isSame = true;
  const checkProperty = (prop: ApidocProperty, prop2: ApidocProperty) => {
    if (prop.key !== prop2.key) {
      isSame = false;
      return;
    }
    if (prop.value !== prop2.value) {
      isSame = false;
      return;
    }
    if (prop.type !== prop2.type) {
      isSame = false;
      return;
    }
    if (prop.required !== prop2.required) {
      isSame = false;
      return;
    }
    if (prop.description !== prop2.description) {
      isSame = false;
      return;
    }
    if (prop.select !== prop2.select) {
      isSame = false;
    }
  }
  checkProperty(p, p2);
  return isSame;
}

/**
 * 检查ApidocProperty[]类型数据是否相同
 */
export const checkPropertyIsEqual = (value: ApidocProperty[], originValue: ApidocProperty[]): boolean => {
  if (value.length !== originValue.length) return false;
  for (let i = 0; i < value.length; i += 1) {
    const item = value[i];
    const { _id } = item;
    const matchedOriginItem = originValue.find(v => v._id === _id);
    if (!matchedOriginItem) {
      return false;
    }
    if (!checkIsSameProperty(item, matchedOriginItem)) {
      return false;
    }
  }
  return true;
}

/**
 * 从URL路径中提取路径参数
 */
export const extractPathParams = (urlPath: string): ApidocProperty<'string'>[] => {
  const pathParams: ApidocProperty<'string'>[] = [];
  const regex = /\{([^}]+)\}/g;
  let match;
  
  while ((match = regex.exec(urlPath)) !== null) {
    const paramName = match[1];
    pathParams.push({
      ...generateEmptyProperty('string'),
      key: paramName,
      description: `路径参数: ${paramName}`
    });
  }
  
  return pathParams;
}

/**
 * 生成一份空的项目默认值
 */
export const generateEmptyProject = (_id: string): ApidocProjectInfo => {
  return {
    _id,
    docNum: 0,
    owner: {
      id: '',
      name: 'me'
    },
    members: [],
    projectName: '',
    remark: '',
    updatedAt: new Date().toISOString(),
    isStared: false,
    isDeleted: false,
  }
}

/**
 * 生成一份空的HTTP节点默认值
 */
export const generateEmptyHttpNode = (_id: string): HttpNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'http',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    item: {
      method: 'GET',
      url: {
        prefix: '',
        path: ''
      },
      paths: [],
      queryParams: [],
      requestBody: {
        mode: 'json',
        rawJson: '',
        formdata: [],
        urlencoded: [],
        raw: {
          data: '',
          dataType: 'text/plain'
        },
        binary: {
          mode: 'var',
          varValue: '',
          binaryValue: {
            path: '',
            raw: '',
            id: ''
          }
        }
      },
      responseParams: [],
      headers: [],
      contentType: ''
    },
    preRequest: {
      raw: ''
    },
    afterRequest: {
      raw: ''
    },
    isDeleted: false,
    createdAt: '',
    updatedAt: '',
  }
}

/**
 * 生成一份空的WebSocket节点默认值
 */
export const generateEmptyWebsocketNode = (_id: string): WebSocketNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'websocket',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    item: {
      protocol: 'ws',
      url: {
        path: "",
        prefix: "",
      },
      queryParams: [],
      headers: [],
      sendMessage: '',
    },
    config: {
      messageType: 'json',
      autoSend: false,
      autoSendInterval: 30000,
      defaultAutoSendContent: 'ping',
      autoReconnect: false,
    },
    preRequest: {
      raw: ''
    },
    afterRequest: {
      raw: ''
    },
    createdAt: '',
    updatedAt: '',
    isDeleted: false,
  }
}

/**
 * 生成一份空的HTTP mock节点
 */
export const generateEmptyHttpMockNode = (_id: string): HttpMockNode => {
  return {
    _id,
    pid: '',
    projectId: '',
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '1.0.0',
      type: 'httpMock',
      creator: '',
      maintainer: '',
      deletePerson: '',
    },
    requestCondition: {
      method: ['ALL'],
      url: '/mock/v1',
      port: 4000,
    },
    config: {
      delay: 0,
    },
    response: [
      {
        name: '默认返回',
        isDefault: true,
        conditions: {
          name: '',
          scriptCode: '',
          enabled: false,
        },
        statusCode: 200,
        headers: {
          enabled: false,
          defaultHeaders: [
            { ...generateEmptyProperty(), key: 'Content-Type', value: 'application/json; charset=utf-8', select: true, description: '响应内容类型' },
            { ...generateEmptyProperty(), key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate', select: false, description: '禁用缓存' },
            { ...generateEmptyProperty(), key: 'Access-Control-Allow-Origin', value: '*', select: false, description: '允许所有域名跨域访问' },
            { ...generateEmptyProperty(), key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS', select: false, description: '允许的HTTP方法' },
            { ...generateEmptyProperty(), key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With', select: false, description: '允许的请求头字段' },
            { ...generateEmptyProperty(), key: 'X-Content-Type-Options', value: 'nosniff', select: false, description: '防止浏览器MIME类型嗅探' },
            { ...generateEmptyProperty(), key: 'X-Frame-Options', value: 'DENY', select: false, description: '禁止在iframe中加载' },
          ],
          customHeaders: [generateEmptyProperty()],
        },
        dataType: 'json',
        sseConfig: {
          event: {
            id: {
              enable: false,
              valueMode: 'increment',
            },
            event: {
              enable: true,
              value: 'message',
            },
            data: {
              mode: 'json',
              value: '',
            },
            retry: {
              enable: false,
              value: 3000,
            },
          },
          interval: 100,
          maxNum: 10,
        },
        jsonConfig: {
          mode: 'fixed',
          fixedData: '',
          randomSize: 0,
          prompt: '',
        },
        textConfig: {
          mode: 'fixed',
          textType: 'text/plain',
          fixedData: '',
          randomSize: 0,
          prompt: '',
        },
        imageConfig: {
          mode: 'fixed',
          imageConfig: 'png',
          randomSize: 10,
          randomWidth: 100,
          randomHeight: 100,
          fixedFilePath: '',
        },
        fileConfig: {
          fileType: 'doc',
        },
        binaryConfig: {
          filePath: '',
        },
        redirectConfig: {
          statusCode: 302,
          location: '',
        },
      },
    ],
    createdAt: '',
    updatedAt: '',
    isDeleted: false,
  }
}

/**
 * 生成一份apidoc默认值(保持向后兼容)
 */
export const generateHttpNode = (id?: string): HttpNode => {
  const result = generateEmptyHttpNode(id || nanoid());
  // 添加默认的response参数以保持向后兼容
  result.item.responseParams = [{
    _id: nanoid(),
    title: '成功返回',
    statusCode: 200,
    value: {
      file: {
        url: '',
        raw: ''
      },
      strJson: '',
      dataType: 'application/json',
      text: ''
    },
  }];
  // 调整一些默认值以保持向后兼容
  result.item.requestBody.raw.dataType = 'text/plain';
  result.item.requestBody.binary.mode = 'file';
  return result;
}
// 为 AI 生成节点数据构建 System Prompt
export const buildAiSystemPromptForNode = (nodeType: 'http' | 'websocket' | 'httpMock'): string => {
  if (nodeType === 'http') {
    return `你是一个专业的 HTTP API 接口生成助手。请根据用户提供的描述生成一个完整、规范的 HTTP 接口配置。

## 支持的场景
- RESTful API (增删改查操作)
- 认证接口 (登录、注册、token刷新、密码重置)
- 数据查询 (列表查询、详情查询、搜索、分页、排序、筛选)
- 数据操作 (创建、更新、删除、批量操作)
- 文件操作 (上传、下载、预览)
- 第三方集成 (支付、短信、邮件等)

## 变量系统

系统支持动态变量,可以在 URL、Headers、Body、QueryParams 等位置引用项目中定义的变量,实现参数动态化和配置复用。

### 变量语法

1. **标准变量引用**: {{ variableName }}
   - 引用项目中定义的变量
   - 支持点语法访问嵌套对象: {{ userInfo.id }}
   - 支持表达式计算: {{ price * 0.8 }}, {{ count > 10 ? 'many' : 'few' }}

2. **Mock 数据生成**: {{ @mockExpression }}
   - 使用 Mock.js 语法生成模拟数据,以 @ 开头
   - 常用示例:
     - {{ @integer(1, 100) }} - 生成 1-100 的随机整数
     - {{ @guid }} - 生成 GUID
     - {{ @email }} - 生成随机邮箱
     - {{ @name }} - 生成随机姓名
     - {{ @date }} - 生成随机日期
     - {{ @url }} - 生成随机 URL

### 变量作用域 (优先级从高到低)

1. **SessionStorage** - Pre-request 脚本中临时设置的变量 (最高优先级)
2. **Local** - 项目级别的变量
3. **Environment** - 环境变量
4. **Global** - 全局变量 (最低优先级)

### 变量应用位置

- **URL 路径**: /api/users/{{ userId }}/posts
- **查询参数**: key: "userId", value: "{{ currentUserId }}"
- **请求头**: key: "Authorization", value: "Bearer {{ authToken }}"
- **请求体**:
  - JSON: "{\\"userId\\": {{ userId }}, \\"name\\": \\"{{ userName }}\\"}"
  - FormData/Urlencoded: value: "{{ fieldValue }}"

### 常见使用场景

生成接口配置时,建议在以下场景中使用变量:

1. **认证令牌**:
   - Authorization: Bearer {{ authToken }}
   - X-API-Key: {{ apiKey }}

2. **动态用户标识**:
   - /api/users/{{ userId }}
   - userId 参数: {{ currentUserId }}

3. **环境配置**:
   - URL: {{ apiBaseUrl }}/api/users
   - 端口: {{ serverPort }}

4. **时间戳和随机数**:
   - timestamp: {{ Date.now() }}
   - requestId: {{ @guid }}

5. **测试数据**:
   - email: {{ @email }}
   - phone: {{ @integer(13000000000, 13999999999) }}

### 生成建议

- 需要认证的接口应使用 {{ authToken }} 作为 Authorization 请求头值
- 涉及用户相关操作时使用 {{ userId }} 等用户标识变量
- 需要生成测试数据时使用 Mock.js 语法 {{ @xxx }}
- 环境相关配置(如 baseURL)建议使用 {{ apiBaseUrl }} 等环境变量
- 变量名应语义清晰,使用驼峰命名法

## 返回格式
严格返回以下 JSON 格式,不要包含任何其他文本、代码块标记或注释:

{
  "name": "接口名称(必填,简洁明了)",
  "description": "接口的详细描述,说明功能、用途、注意事项",
  "method": "HTTP方法(GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS/TRACE之一)",
  "urlPrefix": "URL前缀(通常留空字符串)",
  "urlPath": "请求路径或完整URL(如: /api/users, /api/users/{id}, https://api.example.com/data)",
  "queryParams": [
    {
      "key": "参数名",
      "value": "示例值",
      "type": "string",
      "description": "参数说明",
      "required": true,
      "select": true
    }
  ],
  "headers": [
    {
      "key": "请求头名称(如: Authorization, Content-Type, X-Custom-Header)",
      "value": "请求头值(如: Bearer token123, application/json)",
      "type": "string",
      "description": "请求头说明",
      "required": true,
      "select": true
    }
  ],
  "requestBodyMode": "请求体模式(json/formdata/urlencoded/raw/binary/none之一)",
  "contentType": "Content-Type值(根据requestBodyMode自动设置: json对应application/json, formdata对应multipart/form-data, urlencoded对应application/x-www-form-urlencoded, raw根据内容类型设置, binary对应application/octet-stream, none为空字符串)",
  "requestBodyJson": "当 requestBodyMode 为 json 时的 JSON 字符串示例(需要转义双引号)",
  "requestBodyFormdata": "当 requestBodyMode 为 formdata 时的参数数组",
  "requestBodyUrlencoded": "当 requestBodyMode 为 urlencoded 时的参数数组",
  "requestBodyRaw": "当 requestBodyMode 为 raw 时的原始数据对象",
  "requestBodyBinary": "当 requestBodyMode 为 binary 时的二进制数据配置",
  "responseParams": [
    {
      "title": "响应描述(如: 成功返回, 参数错误, 未授权)",
      "statusCode": 200,
      "dataType": "json",
      "strJson": "{\\"code\\": 200, \\"message\\": \\"success\\", \\"data\\": {...}}"
    }
  ] // 可选字段,如果用户没有明确要求定义返回数据结构,可以省略此字段
}

## 字段详细说明

### 1. URL 字段
- **urlPrefix**: 通常为空字符串 ""
- **urlPath**:
  - 可以是相对路径: /api/users
  - 可以是完整URL: https://api.example.com/users
  - 支持RESTful路径参数: /api/users/{id}, /api/posts/{postId}/comments/{commentId}
  - 路径参数保持 {param} 格式,不需要额外提取

### 2. queryParams 结构
每个查询参数包含以下必需字段:
- **key**: 参数名称
- **value**: 示例值或默认值
- **type**: 固定为 "string" (HTTP协议中查询参数都是字符串类型)
- **description**: 参数说明(用途、格式、取值范围等)
- **required**: 是否必填 (true/false)
- **select**: 是否选中 (true/false,一般为true)

常见查询参数示例:
- 分页: page, pageSize, limit, offset
- 排序: sort, order, orderBy
- 筛选: status, type, category, startDate, endDate
- 搜索: keyword, q, search

### 3. headers 结构
每个请求头包含以下必需字段:
- **key**: 请求头名称
- **value**: 请求头值
- **type**: 固定为 "string" (HTTP协议中请求头都是字符串类型)
- **description**: 说明
- **required**: 是否必填
- **select**: 是否选中

常见请求头:
- Authorization: Bearer {token} (认证令牌)
- Content-Type: application/json (内容类型)
- Accept: application/json (接受类型)
- X-Request-ID: uuid (请求追踪ID)
- User-Agent: custom-client/1.0 (客户端标识)

### 4. requestBodyMode 与 contentType 映射关系

requestBodyMode 和 contentType 必须配套设置,严格遵循以下映射规则:

- **json**: 
  - requestBodyMode: "json"
  - contentType: "application/json"
  - 用途: 最常用,适合复杂数据结构

- **formdata**: 
  - requestBodyMode: "formdata"
  - contentType: "multipart/form-data"
  - 用途: 表单数据,支持文件上传

- **urlencoded**: 
  - requestBodyMode: "urlencoded"
  - contentType: "application/x-www-form-urlencoded"
  - 用途: URL编码表单,如: key1=value1&key2=value2

- **raw**: 
  - requestBodyMode: "raw"
  - contentType: 根据实际内容设置
    - XML: "application/xml" 或 "text/xml"
    - HTML: "text/html"
    - 纯文本: "text/plain"
    - JavaScript: "text/javascript"
  - 用途: 原始文本数据

- **binary**: 
  - requestBodyMode: "binary"
  - contentType: "application/octet-stream"
  - 用途: 二进制文件上传

- **none**: 
  - requestBodyMode: "none"
  - contentType: "" (空字符串)
  - 用途: 无请求体 (通常用于GET/DELETE请求)

**重要**: contentType 字段是必需的,必须根据 requestBodyMode 正确设置对应的值

### 5. requestBodyJson 格式
仅当 requestBodyMode 为 "json" 时需要提供,要求:
- 必须是合法的 JSON 字符串
- 所有双引号必须转义: \\"
- 提供有意义的示例数据
- 根据接口类型设计合理的数据结构

示例:
- 登录: "{\\"username\\": \\"admin\\", \\"password\\": \\"123456\\"}"
- 创建用户: "{\\"name\\": \\"张三\\", \\"email\\": \\"zhangsan@example.com\\", \\"age\\": 25}"
- 更新信息: "{\\"id\\": 1, \\"status\\": \\"active\\", \\"remark\\": \\"备注\\"}"

### 6. requestBodyFormdata 格式
仅当 requestBodyMode 为 "formdata" 时需要提供,用于表单数据和文件上传。

参数数组结构,每个参数包含以下必需字段:
- **key**: 参数名称
- **value**: 参数值(字符串类型参数的值,文件类型为空字符串)
- **type**: 参数类型,固定为 "string" 或 "file"
- **description**: 参数说明
- **required**: 是否必填 (true/false)
- **select**: 是否选中 (true/false)

示例:
[
  {
    "key": "username",
    "value": "zhangsan",
    "type": "string",
    "description": "用户名",
    "required": true,
    "select": true
  },
  {
    "key": "avatar",
    "value": "",
    "type": "file",
    "description": "用户头像文件",
    "required": false,
    "select": true
  },
  {
    "key": "age",
    "value": "25",
    "type": "string",
    "description": "年龄",
    "required": false,
    "select": true
  }
]

使用场景:
- 文件上传: 头像上传、文档上传、图片上传
- 混合数据: 同时包含文本字段和文件字段的表单提交

### 7. requestBodyUrlencoded 格式
仅当 requestBodyMode 为 "urlencoded" 时需要提供,用于 URL 编码的表单数据。

参数数组结构,每个参数包含以下必需字段:
- **key**: 参数名称
- **value**: 参数值(字符串形式)
- **type**: 固定为 "string"
- **description**: 参数说明
- **required**: 是否必填 (true/false)
- **select**: 是否选中 (true/false)

示例:
[
  {
    "key": "username",
    "value": "admin",
    "type": "string",
    "description": "用户名",
    "required": true,
    "select": true
  },
  {
    "key": "password",
    "value": "123456",
    "type": "string",
    "description": "密码",
    "required": true,
    "select": true
  },
  {
    "key": "remember",
    "value": "true",
    "type": "string",
    "description": "记住登录状态",
    "required": false,
    "select": true
  }
]

使用场景:
- 传统表单提交 (Content-Type: application/x-www-form-urlencoded)
- 简单的键值对数据传输
- 不涉及文件上传的表单

### 8. requestBodyRaw 格式
仅当 requestBodyMode 为 "raw" 时需要提供,用于发送原始文本数据。

对象结构,包含以下必需字段:
- **data**: 原始文本内容(字符串)
- **dataType**: 数据类型,必须是以下值之一:
  - "text/plain": 纯文本
  - "text/html": HTML 文档
  - "application/xml": XML 数据
  - "text/javascript": JavaScript 代码

示例 - XML 数据:
{
  "data": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<user>\\n  <name>张三</name>\\n  <age>25</age>\\n</user>",
  "dataType": "application/xml"
}

示例 - HTML 内容:
{
  "data": "<!DOCTYPE html>\\n<html>\\n<body>\\n  <h1>Hello World</h1>\\n</body>\\n</html>",
  "dataType": "text/html"
}

示例 - 纯文本:
{
  "data": "这是一段纯文本内容",
  "dataType": "text/plain"
}

使用场景:
- 发送 XML 数据到 SOAP 接口
- 发送 HTML 内容
- 发送纯文本或脚本内容

### 9. requestBodyBinary 格式
仅当 requestBodyMode 为 "binary" 时需要提供,用于二进制文件上传。

对象结构,包含以下必需字段:
- **mode**: 二进制数据来源,固定为 "var" 或 "file"
  - "var": 从变量中读取二进制数据
  - "file": 直接选择本地文件
- **varValue**: 当 mode 为 "var" 时的变量名称,当 mode 为 "file" 时为空字符串

示例 - 使用变量:
{
  "mode": "var",
  "varValue": "imageFileData"
}

示例 - 直接选择文件:
{
  "mode": "file",
  "varValue": ""
}

使用场景:
- 上传单个二进制文件 (图片、视频、压缩包等)
- 文件流传输
- Content-Type: application/octet-stream

### 10. responseParams 结构 (可选字段)
**注意: responseParams 是可选字段**。如果用户没有明确要求定义返回数据结构,可以完全省略此字段。

如果需要生成,为每个接口生成多个状态码的响应示例,每个响应包含:
- **title**: 响应场景描述 (如: "请求成功", "参数错误", "未授权", "资源不存在")
- **statusCode**: HTTP状态码 (200, 201, 400, 401, 403, 404, 500等)
- **dataType**: 固定为 "json"
- **strJson**: JSON格式的响应数据字符串(需要转义双引号)

建议生成的状态码 (根据实际需要选择):
- **200**: 请求成功 (GET/PUT/PATCH成功) - 推荐
- **201**: 创建成功 (POST创建资源成功) - 可选
- **400**: 请求参数错误 - 推荐
- **401**: 未授权/认证失败 - 可选
- **403**: 无权限访问 - 可选
- **404**: 资源不存在 (适用于查询详情的接口) - 可选
- **500**: 服务器内部错误 - 可选

响应数据结构建议:
- 统一包含: code, message, data 字段
- code: 业务状态码
- message: 提示信息
- data: 实际数据 (对象或数组)

示例:
成功响应: "{\\"code\\": 200, \\"message\\": \\"success\\", \\"data\\": {\\"id\\": 1, \\"name\\": \\"示例\\"}}"
错误响应: "{\\"code\\": 400, \\"message\\": \\"参数错误: 用户名不能为空\\", \\"data\\": null}"

## 根据 HTTP 方法的典型配置

### GET 请求
- requestBodyMode: "none"
- contentType: ""
- 使用 queryParams 传递参数
- 响应: 200成功, 404未找到, 401未授权

### POST 请求
- requestBodyMode: 根据场景选择 "json" / "formdata" / "urlencoded" / "raw" / "binary"
- contentType: 根据 requestBodyMode 对应设置
- **json模式**: 提供 requestBodyJson (常用于创建资源、提交复杂数据)
- **formdata模式**: 提供 requestBodyFormdata (用于文件上传或混合表单数据)
- **urlencoded模式**: 提供 requestBodyUrlencoded (用于传统表单提交)
- **raw模式**: 提供 requestBodyRaw (用于发送 XML、HTML 等原始文本)
- **binary模式**: 提供 requestBodyBinary (用于单个二进制文件上传)
- 响应: 200/201成功, 400参数错误, 401未授权

### PUT/PATCH 请求
- requestBodyMode: "json"
- contentType: "application/json"
- 提供更新字段的 requestBodyJson
- 响应: 200成功, 400参数错误, 404资源不存在

### DELETE 请求
- requestBodyMode: "none"
- contentType: ""
- 使用路径参数或查询参数
- 响应: 200/204成功, 404资源不存在

## 智能推断规则

1. **自动识别接口类型**:
   - 包含 "登录/login": method=POST, 添加 username/password 字段
   - 包含 "注册/register": method=POST, 添加用户信息字段
   - 包含 "列表/list": method=GET, 添加分页参数
   - 包含 "详情/detail": method=GET, 添加id参数
   - 包含 "创建/create/add": method=POST
   - 包含 "更新/update/edit": method=PUT
   - 包含 "删除/delete": method=DELETE

2. **自动添加通用字段**:
   - 列表查询: page, pageSize 查询参数
   - 需要认证的接口: Authorization 请求头
   - POST/PUT请求: Content-Type: application/json 请求头

3. **默认值策略**:
   - 如果未指定 method,根据关键词推断,默认 GET
   - 如果未指定 requestBodyMode,GET/DELETE 默认 none,POST/PUT 默认 json
   - 如果未提供具体数据,生成合理的示例值

## 重要约束

1. 必须返回有效的 JSON 格式,不要使用 markdown 代码块包裹
2. 所有字符串值使用双引号
3. requestBodyJson 和 responseParams.strJson 中的双引号必须转义为 \\"
4. 所有数组字段 (queryParams, headers) 即使为空也要返回 []
5. responseParams 是可选字段,如果用户没有明确要求定义返回结构,可以省略
6. description 字段要详细说明接口用途、参数要求、注意事项
7. 生成的数据要符合实际业务逻辑,不要使用无意义的占位符
8. queryParams 和 headers 中的 type 字段必须固定为 "string"
9. queryParams 和 headers 中使用 "select" 字段而不是 "enabled" 字段
10. **contentType 字段是必需的**,必须根据 requestBodyMode 正确设置:
    - json → "application/json"
    - formdata → "multipart/form-data"
    - urlencoded → "application/x-www-form-urlencoded"
    - raw → 根据实际内容类型设置 (如 "text/plain", "application/xml")
    - binary → "application/octet-stream"
    - none → "" (空字符串)`;
  }

  if (nodeType === 'websocket') {
    return `你是一个专业的 WebSocket 接口生成助手。请根据用户提供的描述生成一个完整、规范的 WebSocket 接口配置。

## 支持的场景
- 实时聊天 (单聊、群聊、客服系统)
- 实时通知推送 (消息通知、系统提醒)
- 实时数据监控 (股票行情、日志监控、性能监控)
- 实时协作 (协同编辑、在线会议、白板共享)
- 游戏通信 (实时对战、游戏状态同步)
- IoT设备通信 (设备控制、状态上报)

## 变量系统

系统支持动态变量,可以在 URL、Headers、QueryParams、消息体等位置引用项目中定义的变量,实现 WebSocket 连接和消息的参数动态化。

### 变量语法

1. **标准变量引用**: {{ variableName }}
   - 引用项目中定义的变量
   - 支持点语法访问嵌套对象: {{ userInfo.id }}
   - 支持表达式计算: {{ roomId + '_' + userId }}

2. **Mock 数据生成**: {{ @mockExpression }}
   - 使用 Mock.js 语法生成模拟数据,以 @ 开头
   - 常用示例:
     - {{ @guid }} - 生成唯一消息 ID
     - {{ @integer(1, 1000) }} - 生成随机整数
     - {{ @now }} - 当前时间戳

### 变量作用域 (优先级从高到低)

1. **SessionStorage** - Pre-request 脚本中临时设置的变量 (最高优先级)
2. **Local** - 项目级别的变量
3. **Environment** - 环境变量
4. **Global** - 全局变量 (最低优先级)

### 变量应用位置

- **连接 URL**: wss://{{ wsHost }}/ws/chat/{{ roomId }}
- **查询参数**: key: "token", value: "{{ authToken }}"
- **连接请求头**: key: "Authorization", value: "Bearer {{ authToken }}"
- **发送消息**: 消息内容中可以使用变量,如: "{\\"userId\\": \\"{{ userId }}\\", \\"content\\": \\"{{ messageText }}\\"}"

### WebSocket 常见使用场景

生成 WebSocket 接口配置时,建议在以下场景中使用变量:

1. **认证连接**:
   - 查询参数: token={{ wsToken }}
   - 请求头: Authorization: Bearer {{ authToken }}

2. **动态房间/频道**:
   - URL: /ws/chat/{{ roomId }}
   - URL: /ws/game/{{ gameSessionId }}

3. **用户标识**:
   - 查询参数: userId={{ currentUserId }}
   - 消息体: userId: {{ userId }}

4. **动态主机**:
   - URL 前缀: {{ wsBaseUrl }}
   - 端口配置: {{ wsPort }}

5. **消息唯一标识**:
   - messageId: {{ @guid }}
   - timestamp: {{ Date.now() }}

### 生成建议

- WebSocket 连接通常需要认证,建议使用 {{ wsToken }} 或 {{ authToken }}
- 聊天、游戏等场景需要房间标识,使用 {{ roomId }} 等变量
- 消息发送时建议包含 {{ userId }} 等用户标识
- 动态环境切换时使用 {{ wsBaseUrl }} 等环境变量
- 消息追踪时使用 {{ @guid }} 生成唯一 ID

## 返回格式
严格返回以下 JSON 格式,不要包含任何其他文本、代码块标记或注释:

{
  "name": "接口名称(必填,简洁明了)",
  "description": "接口的详细描述,说明功能、用途、连接流程、消息格式等",
  "protocol": "协议类型(ws 或 wss,wss为加密连接)",
  "urlPrefix": "域名前缀(如: wss://api.example.com 或 ws://localhost:8080)",
  "urlPath": "URL路径(如: /ws/chat, /ws/notification)",
  "queryParams": [
    {
      "key": "参数名",
      "value": "示例值",
      "type": "string",
      "description": "参数说明",
      "required": true,
      "select": true
    }
  ],
  "headers": [
    {
      "key": "请求头名称",
      "value": "请求头值",
      "type": "string",
      "description": "说明",
      "required": false,
      "select": true
    }
  ],
  "sendMessage": "发送消息示例(JSON字符串或文本)"
}

## 字段详细说明

### 1. protocol 字段
- **ws**: 非加密的 WebSocket 连接 (用于本地开发或内网环境)
- **wss**: 加密的 WebSocket 连接 (用于生产环境,建议使用)

### 2. URL 字段
- **urlPrefix**: 包含协议、域名和端口的完整前缀
  - 示例: wss://api.example.com, ws://localhost:8080, wss://chat.example.com:9001
- **urlPath**: WebSocket 连接的路径
  - 示例: /ws/chat, /ws/notification, /websocket, /ws/room/{roomId}
  - 支持路径参数格式: {param}

### 3. queryParams 结构
每个查询参数包含以下必需字段:
- **key**: 参数名称
- **value**: 示例值或默认值
- **type**: 固定为 "string" (WebSocket 协议中查询参数都是字符串类型)
- **description**: 参数说明(用途、格式、取值范围等)
- **required**: 是否必填 (true/false)
- **select**: 是否启用 (true/false,一般为true)

常见查询参数示例:
- 认证: token, access_token, auth, apiKey
- 用户标识: userId, uid, username, clientId
- 房间/频道: roomId, channelId, groupId
- 其他: version, platform, deviceId

### 4. headers 结构
每个请求头包含以下必需字段:
- **key**: 请求头名称
- **value**: 请求头值
- **type**: 固定为 "string" (WebSocket 协议中请求头都是字符串类型)
- **description**: 说明
- **required**: 是否必填
- **select**: 是否启用

常见请求头:
- Authorization: Bearer {token} (认证令牌)
- Sec-WebSocket-Protocol: 子协议名称
- Origin: 请求来源
- User-Agent: 客户端标识
- X-Client-Version: 客户端版本

### 5. sendMessage 字段
发送消息的示例内容,可以是:
- **JSON 格式**: 需要转义双引号,如: "{\\"type\\": \\"chat\\", \\"content\\": \\"Hello\\"}"
- **纯文本**: 简单的文本消息,如: "Hello, WebSocket!"
- **事件格式**: "{\\"event\\": \\"join\\", \\"data\\": {\\"roomId\\": \\"123\\"}}"

根据场景选择合适的消息格式:
- 聊天消息: {"type": "message", "to": "userId", "content": "消息内容"}
- 心跳包: {"type": "ping"} 或 "ping"
- 订阅事件: {"action": "subscribe", "channel": "stock.price"}
- 命令消息: {"cmd": "start", "params": {...}}

## 根据场景的典型配置

### 实时聊天
- protocol: wss
- queryParams: token, userId, roomId
- headers: Authorization
- sendMessage: {"type": "message", "to": "userId", "content": "Hello"}

### 实时通知推送
- protocol: wss
- queryParams: userId, token
- headers: Authorization
- sendMessage: {"action": "subscribe", "topics": ["notification"]}

### 实时数据监控
- protocol: wss
- queryParams: apiKey, dataType
- sendMessage: {"subscribe": ["metric1", "metric2"]}

## 智能推断规则

1. **自动识别场景**:
   - 包含 "聊天/chat": protocol=wss, 添加 userId/roomId 参数
   - 包含 "通知/notification": protocol=wss, 添加 userId/token 参数
   - 包含 "监控/monitor": protocol=wss, 添加订阅相关参数
   - 包含 "实时/real-time/live": protocol=wss

2. **自动添加通用字段**:
   - 需要认证的连接: token 或 Authorization 头
   - 生产环境: 使用 wss 协议
   - 开发环境: 可使用 ws 协议

3. **默认值策略**:
   - 如果未指定 protocol,默认 wss
   - 如果未指定 urlPrefix,生成示例域名
   - 如果未提供 sendMessage,根据场景生成合理的示例

## 重要约束

1. 必须返回有效的 JSON 格式,不要使用 markdown 代码块包裹
2. 所有字符串值使用双引号
3. sendMessage 中的双引号必须转义为 \\"
4. 所有数组字段 (queryParams, headers) 即使为空也要返回 []
5. description 字段要详细说明连接用途、消息格式、注意事项
6. 生成的数据要符合实际业务逻辑,不要使用无意义的占位符
7. queryParams 和 headers 中的 type 字段必须固定为 "string"
8. queryParams 和 headers 中使用 "select" 字段而不是 "enabled" 字段
9. 如果是生产环境或涉及敏感数据,必须使用 wss 协议`;
  }

  if (nodeType === 'httpMock') {
    return `你是一个专业的 HTTP Mock 接口生成助手。请根据用户提供的描述生成一个完整、规范的 Mock 接口配置。

## 使用场景
- 前后端并行开发 (后端未完成时前端调试)
- 接口测试 (模拟各种响应状态和数据)
- 演示和原型 (快速搭建演示环境)
- 第三方服务模拟 (模拟支付、短信等外部接口)
- 故障模拟 (测试错误处理逻辑)

## 变量系统

Mock 接口支持动态变量,可以在 URL、响应数据中引用变量,实现灵活的 Mock 配置和动态响应生成。

### 变量语法

1. **标准变量引用**: {{ variableName }}
   - 引用项目中定义的变量
   - 主要用于 URL 路径和响应数据中

2. **Mock 数据生成**: {{ @mockExpression }}
   - 使用 Mock.js 语法生成模拟数据,以 @ 开头
   - **重点**: Mock 接口的响应数据中建议大量使用 Mock.js 语法生成随机测试数据
   - 常用示例:
     - {{ @integer(1, 100) }} - 随机整数
     - {{ @guid }} - 唯一标识符
     - {{ @email }} - 随机邮箱
     - {{ @name }} - 随机姓名
     - {{ @date }} - 随机日期
     - {{ @url }} - 随机 URL
     - {{ @paragraph }} - 随机段落文本
     - {{ @image('200x200') }} - 随机图片 URL

### 变量作用域 (优先级从高到低)

1. **SessionStorage** - Pre-request 脚本中临时设置的变量 (最高优先级)
2. **Local** - 项目级别的变量
3. **Environment** - 环境变量
4. **Global** - 全局变量 (最低优先级)

### 变量应用位置

- **URL 路径**: /mock/api/{{ resource }}/{{ id }}
- **端口**: 可使用变量 {{ mockServerPort }}
- **响应数据**: responseData 字符串中可以使用变量和 Mock.js 语法

### Mock 接口常见使用场景

生成 Mock 接口配置时,建议在以下场景中使用变量:

1. **动态端口配置**:
   - port: {{ mockServerPort }} 或固定值如 4000

2. **动态响应数据**:
   - 用户列表: "{\\"data\\": [{{ @name }}, {{ @name }}]}"
   - 随机 ID: "{\\"id\\": {{ @integer(1, 1000) }}}"
   - 时间戳: "{\\"timestamp\\": {{ Date.now() }}}"

3. **路径参数模拟**:
   - URL: /mock/api/users/:id (Mock 服务器自动解析路径参数)

4. **丰富的测试数据**:
   - 列表数据: 使用 {{ @name }}、{{ @email }}、{{ @date }} 等生成多样化测试数据
   - 分页数据: 使用 {{ @integer(1, 100) }} 生成随机页码和总数
   - 状态字段: 使用 {{ @boolean }} 生成随机布尔值

### 生成建议

- **responseData 中大量使用 Mock.js 语法**,生成真实感的测试数据
- 列表接口建议生成 5-10 条随机数据
- 每条数据使用不同的 Mock.js 表达式确保多样性
- 常见字段建议:
  - ID: {{ @guid }} 或 {{ @integer(1, 10000) }}
  - 姓名: {{ @name }} 或 {{ @cname }} (中文姓名)
  - 邮箱: {{ @email }}
  - 手机: {{ @integer(13000000000, 13999999999) }}
  - 日期: {{ @date }} 或 {{ @datetime }}
  - 状态: {{ @boolean }} 或 {{ @integer(0, 2) }}
  - 图片: {{ @image('200x200', '#4A90E2', '#FFF', 'Mock Image') }}
- 响应数据结构应包含 code、message、data 等标准字段
- 使用合理的状态码: 200 成功、400 参数错误、404 未找到、500 服务器错误

## 返回格式
严格返回以下 JSON 格式,不要包含任何其他文本、代码块标记或注释:

{
  "name": "接口名称(必填,简洁明了)",
  "description": "接口的详细描述,说明Mock用途、业务场景、返回数据说明等",
  "methods": ["HTTP方法数组,如: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, ALL"],
  "url": "URL路径(如: /mock/api/users, /mock/api/users/:id)",
  "port": 端口号(数字类型,如: 4000),
  "statusCode": 响应状态码(数字类型,如: 200),
  "responseData": "模拟响应数据的 JSON 字符串(需要转义双引号)"
}

## 字段详细说明

### 1. methods 字段
HTTP 方法数组,支持以下值:
- **ALL**: 匹配所有 HTTP 方法 (通用 Mock 接口)
- **GET**: 查询数据 (列表、详情)
- **POST**: 创建资源、提交表单
- **PUT**: 完整更新资源
- **PATCH**: 部分更新资源
- **DELETE**: 删除资源
- **HEAD**: 获取响应头信息
- **OPTIONS**: 预检请求 (CORS)

说明:
- methods 必须是数组,即使只有一个方法也要使用数组格式: ["GET"]
- 可以同时支持多个方法: ["GET", "POST"]
- 使用 ["ALL"] 可以匹配所有 HTTP 方法

### 2. url 字段
Mock 接口的 URL 路径,支持以下格式:
- **静态路径**: /mock/api/users (精确匹配)
- **路径参数**: /mock/api/users/:id (冒号表示动态参数)
- **多级参数**: /mock/api/posts/:postId/comments/:commentId
- **通配符**: /mock/api/* (匹配所有子路径)

路径设计建议:
- 使用 RESTful 风格: /mock/api/资源名
- 详情接口: /mock/api/users/:id
- 嵌套资源: /mock/api/users/:userId/posts
- 避免过长的路径层级

### 3. port 字段
Mock 服务器监听的端口号 (数字类型):
- **常用端口**: 4000, 3000, 8080, 9000
- **避免冲突**: 不要使用系统常用端口 (80, 443, 22等)
- **端口范围**: 建议使用 3000-9999
- **必须为数字**: 不能是字符串

### 4. statusCode 字段
HTTP 响应状态码 (数字类型):
- **200**: 请求成功 (最常用)
- **201**: 创建成功 (POST 创建资源)
- **204**: 成功但无内容 (DELETE 成功)
- **400**: 请求参数错误
- **401**: 未授权
- **403**: 无权限
- **404**: 资源不存在
- **500**: 服务器错误
- **必须为数字**: 不能是字符串

### 5. responseData 字段
Mock 接口返回的响应数据 (JSON 字符串):
- **必须是字符串**: 不是 JSON 对象,而是转义后的 JSON 字符串
- **双引号转义**: 所有双引号必须转义为 \\"
- **数据结构建议**: 统一使用 {code, message, data} 格式

响应数据示例:
- 成功返回: "{\\"code\\": 200, \\"message\\": \\"success\\", \\"data\\": {\\"id\\": 1, \\"name\\": \\"张三\\"}}"
- 列表返回: "{\\"code\\": 200, \\"data\\": [{\\"id\\": 1, \\"name\\": \\"张三\\"}, {\\"id\\": 2, \\"name\\": \\"李四\\"}], \\"total\\": 2}"
- 错误返回: "{\\"code\\": 400, \\"message\\": \\"参数错误\\", \\"data\\": null}"
- 空数据: "{\\"code\\": 200, \\"message\\": \\"success\\", \\"data\\": null}"

## 根据 HTTP 方法的典型配置

### GET 请求 (查询数据)
- methods: ["GET"]
- statusCode: 200
- responseData: 列表或详情数据
- 示例: 用户列表、订单详情

### POST 请求 (创建资源)
- methods: ["POST"]
- statusCode: 200 或 201
- responseData: 创建成功的资源数据
- 示例: 创建用户、提交订单

### PUT/PATCH 请求 (更新资源)
- methods: ["PUT"] 或 ["PATCH"]
- statusCode: 200
- responseData: 更新后的资源数据
- 示例: 更新用户信息、修改订单状态

### DELETE 请求 (删除资源)
- methods: ["DELETE"]
- statusCode: 200 或 204
- responseData: 删除成功消息或空数据
- 示例: 删除用户、取消订单

### 通用接口 (支持多种方法)
- methods: ["ALL"] 或 ["GET", "POST", "PUT", "DELETE"]
- statusCode: 根据场景选择
- responseData: 根据场景返回不同数据

## 智能推断规则

1. **自动识别场景**:
   - 包含 "列表/list": methods=["GET"], 返回数组数据
   - 包含 "详情/detail": methods=["GET"], url 包含 :id 参数
   - 包含 "创建/create/add": methods=["POST"], statusCode=201
   - 包含 "更新/update/edit": methods=["PUT"], statusCode=200
   - 包含 "删除/delete": methods=["DELETE"], statusCode=200
   - 包含 "登录/login": methods=["POST"], 返回 token
   - 包含 "注册/register": methods=["POST"], statusCode=201

2. **自动添加通用字段**:
   - 列表接口: 添加 total 字段表示总数
   - 分页接口: 添加 page, pageSize 等分页信息
   - 成功响应: 统一使用 {code: 200, message: "success", data: ...}

3. **默认值策略**:
   - 如果未指定 methods,根据关键词推断,默认 ["GET"]
   - 如果未指定 port,默认 4000
   - 如果未指定 statusCode,默认 200
   - 如果未提供具体数据,生成合理的示例值

## 重要约束

1. 必须返回有效的 JSON 格式,不要使用 markdown 代码块包裹
2. 所有字符串值使用双引号
3. methods 必须是数组类型,不能是字符串
4. port 和 statusCode 必须是数字类型,不能是字符串
5. responseData 必须是转义后的 JSON 字符串,所有双引号转义为 \\"
6. description 字段要详细说明 Mock 用途、业务场景、返回数据说明
7. 生成的数据要符合实际业务逻辑,不要使用无意义的占位符
8. responseData 建议使用统一的数据格式: {code, message, data}`;
  }

  return '';
}

/**
 * 生成一份参数类型数组
 */
export const apidocGenerateRequestParamTypes = (): HttpNodeRequestParamTypes => {
  return ['path', 'params', 'json', 'x-www-form-urlencoded', 'formData', 'text/javascript', 'text/plain', 'text/html', 'application/xml'];
}

/**
 * 将API节点转换为Banner节点
 */
export const convertNodesToBannerNodes = (docs: ApiNode[] = []): ApidocBanner[] => {
  const treeData = arrayToTree(docs);
  const copyTreeData = cloneDeep(treeData)
  const banner: ApidocBanner[] = []
  const foo = (nodes: (ApiNode & { children: ApiNode[] })[], banner: ApidocBanner[]): void => {
    // 对节点进行排序：目录在前，文档在后
    const sortedNodes = [...nodes].sort((a, b) => {
      // 如果一个是目录一个是文档，目录排在前面
      if (a.info.type === 'folder' && b.info.type !== 'folder') return -1;
      if (a.info.type !== 'folder' && b.info.type === 'folder') return 1;
      // 如果都是目录或都是文档，按sort字段排序
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
      } else if (node.info.type === 'markdown') {
        bannerNode = {
          _id: node._id,
          updatedAt: node.updatedAt || '',
          type: 'markdown',
          sort: node.sort,
          pid: node.pid,
          name: node.info.name,
          maintainer: node.info.maintainer,
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

/**
 * 生成空响应信息
 */
export const generateEmptyResponse = (): ResponseInfo => {
  return {
    id: '',
    apiId: '',
    requestId: '',
    headers: {},
    contentLength: 0,
    finalRequestUrl: '',
    redirectList: [],
    ip: '',
    isFromCache: false,
    statusCode: 0,
    timings: {
      start: 0,
      socket: 0,
      lookup: 0,
      connect: 0,
      secureConnect: 0,
      upload: 0,
      response: 0,
      end: 0,
      error: 0,
      abort: 0,
      phases: {
          wait: 0,
          dns: 0,
          tcp: 0,
          tls: 0,
          request: 0,
          firstByte: 0,
          download: 0,
          total: 0,
      }
    },
    contentType: '',
    retryCount: 0,
    body: null,
    bodyByteLength: 0,
    rt: 0,
    requestData: {
      url: "",
      method: "get",
      body: "",
      headers: {},
      host: "",
    },
    responseData: {
      canApiflowParseType: 'none',
      jsonData: '',
      textData: '',
      errorData: '',
      streamData: [],
      fileData: {
        url: '',
        name: '',
        ext: '',
      }
    },
  }
}

/**
 * 转换URL信息
 */
export const getUrlInfo = async (apidoc: HttpNode): Promise<UrlInfo> => {
  const { queryParams } = apidoc.item;
  const { path, prefix } = apidoc.item.url;
  const variableStore = useVariable();
  const variables = variableStore.variables;
  // query参数解析
  const queryPairs = await Promise.all(
    queryParams
      .filter(param => param.key.trim() !== '')
      .map(async (param) => {
        const key = param.key.trim();
        const value = param.value.trim();
        const compiledValue = await getCompiledTemplate(value, variables);
        return `${key}=${String(compiledValue)}`;
      })
  );
  const queryString = queryPairs.length > 0 ? `?${queryPairs.join('&')}` : '';
  return {
    host: prefix,
    path,
    url: `${prefix}${path}${queryString}`,
  };
};

/**
 * Response转换
 */
export const getResponseParamsByHttpNode = (apidoc: HttpNode): HttpNodeResponseData[] => {
  const { responseParams } = apidoc.item;
  const result: HttpNodeResponseData[] = [];
  responseParams.forEach(res => {
    const data: HttpNodeResponseData = {
      title: res.title,
      statusCode: res.statusCode,
      dataType: res.value.dataType,
    };
    switch (res.value.dataType) {
    case 'application/json':
      data.json = res.value.strJson
      break;
    default:
      break;
    }
    result.push(data)
  })
  return result;
}
/*
|--------------------------------------------------------------------------
| URL校验工具 (urlValidation.ts)
|--------------------------------------------------------------------------
*/

export interface UrlValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export const validateUrl = (url: string): UrlValidationResult => {
  if (!url || url.trim() === '') {
    return {
      isValid: true,
      errorMessage: '',
    };
  }
  const trimmedUrl = url.trim();
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      isValid: false,
      errorMessage: 'URL必须以http://或https://开头',
    };
  }
  const unresolvedVarRegex = /\{\{([^}]+)\}\}/g;
  const matches = trimmedUrl.match(unresolvedVarRegex);
  if (matches && matches.length > 0) {
    const variables = matches.map((m) => m).join(', ');
    return {
      isValid: false,
      errorMessage: `URL中包含未解析的变量：${variables}`,
    };
  }
  if (trimmedUrl.includes(' ')) {
    return {
      isValid: false,
      errorMessage: 'URL中包含非法字符（空格），请使用%20代替空格',
    };
  }
  try {
    const urlObj = new URL(trimmedUrl);
    if (!urlObj.hostname || urlObj.hostname.trim() === '') {
      return {
        isValid: false,
        errorMessage: '主机名不能为空',
      };
    }
    if (urlObj.port) {
      const port = parseInt(urlObj.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return {
          isValid: false,
          errorMessage: '端口号必须在1-65535之间',
        };
      }
    }
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return {
        isValid: false,
        errorMessage: '仅支持http和https协议',
      };
    }
    if (urlObj.pathname.includes('//')) {
      return {
        isValid: false,
        errorMessage: 'URL路径中包含连续的斜杠(//)，请检查路径格式',
      };
    }
    return {
      isValid: true,
      errorMessage: '',
    };
  } catch (error) {
    return {
      isValid: false,
      errorMessage: 'URL格式不正确',
    };
  }
}
