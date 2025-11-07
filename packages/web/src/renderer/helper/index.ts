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
import type { Property, ApidocProperty, RendererFormDataBody } from '@src/types'
import { nanoid } from 'nanoid/non-secure'
import type {
  HttpNodeRequestMethod,
  HttpNodePropertyType,
  HttpNode,
  ApidocBanner,
  HttpNodeRequestParamTypes,
  ApiNode,
  MockHttpNode,
  ApidocProjectInfo,
  ResponseInfo,
  WebSocketNode,
  FolderNode,
} from '@src/types'
import type { HttpNodeResponseData, UrlInfo } from '@src/types/helper'
import { useVariable } from '@/store/share/variablesStore'

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
  'apidoc/hook/jumpToEdit': unknown,
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
  const result = dayjs(date).format(realRule);
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
    if (line === '' || line.startsWith(':')) continue; // 空行或注释行忽略
    const [field, ...rest] = line.split(':');
    const value = rest.join(':').replace(/^ /, '');  // 去掉冒号后可能的空格

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
        if (!isNaN(n)) msg.retry = n;
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
  for (let streamChunk of chunkList) {
    buffer += decoder!.decode(streamChunk.chunk, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const msg = parseSseBlock(block, streamChunk.timestamp);
      parsedData.push(msg);
    }
  }
  buffer += decoder!.decode();
  if (buffer.includes('\n\n')) {
    // 对于最后的 buffer，使用最后一个 chunk 的时间戳（如果有的话）
    const lastTimestamp = chunkList.length > 0 ? chunkList[chunkList.length - 1].timestamp : Date.now();
    buffer.split(/\r?\n\r?\n/).forEach(block => {
      if (block.trim()) parsedData.push(parseSseBlock(block, lastTimestamp));
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
export const apidocGenerateProperty = <T extends HttpNodePropertyType = 'string'>(type?: T): ApidocProperty<T> => {
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
export const generateEmptyHttpMockNode = (_id: string): MockHttpNode => {
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
            { ...apidocGenerateProperty(), key: 'Content-Type', value: 'application/json; charset=utf-8', select: true, description: '响应内容类型' },
            { ...apidocGenerateProperty(), key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate', select: false, description: '禁用缓存' },
            { ...apidocGenerateProperty(), key: 'Access-Control-Allow-Origin', value: '*', select: false, description: '允许所有域名跨域访问' },
            { ...apidocGenerateProperty(), key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS', select: false, description: '允许的HTTP方法' },
            { ...apidocGenerateProperty(), key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With', select: false, description: '允许的请求头字段' },
            { ...apidocGenerateProperty(), key: 'X-Content-Type-Options', value: 'nosniff', select: false, description: '防止浏览器MIME类型嗅探' },
            { ...apidocGenerateProperty(), key: 'X-Frame-Options', value: 'DENY', select: false, description: '禁止在iframe中加载' },
          ],
          customHeaders: [apidocGenerateProperty()],
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
        const mockNode = node as MockHttpNode;
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
