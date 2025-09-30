/* eslint-disable no-lonely-if */
/* eslint-disable no-continue */
/**
 * @description        全局工具函数
 * @author             shuxiaokai
 * @create             2021-06-15 22:55
 */
import { nanoid } from 'nanoid/non-secure'
import type { HttpNodeRequestMethod, ApidocProperty, HttpNodePropertyType, HttpNode, ApidocBanner, HttpNodeRequestParamTypes, ApidocCodeInfo, FolderNode, ApiNode, MockHttpNode, ApidocProjectInfo, ResponseInfo } from '@src/types'
import isEqual from 'lodash/isEqual';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashDebounce from 'lodash/debounce';
import lodashThrottle from 'lodash/throttle';
import dayjs from 'dayjs';
import mitt from 'mitt'
import tips from './tips'
import { ApidocProjectBaseInfoState } from '@src/types/apidoc/base-info';
import { ApidocTab } from '@src/types/apidoc/tabs.ts';
import { i18n } from '@/i18n';
import { WebSocketNode } from '@src/types/websocket/websocket.ts';

type Data = Record<string, unknown>

/**
 * 对象对比
 */
export const lodashIsEqual = isEqual;
/**
 * 深拷贝
 */
export const cloneDeep = lodashCloneDeep;
/**
 * 防抖函数
 */
export const debounce = lodashDebounce;
/**
 * 节流函数
 */
export const throttle = lodashThrottle;
/**
 * 全局事件订阅发布
 */
const emitter = mitt<{
  'apidoc/editor/removePreEditor': void;
  'apidoc/editor/removeAfterEditor': void;
  'apidoc/hook/jumpToEdit': ApidocCodeInfo;
  'apidoc/tabs/addOrDeleteTab': void,
  'apidoc/deleteDocs': void,
  'apidoc/getBaseInfo': ApidocProjectBaseInfoState,
  'searchItem/change': string,
  'tabs/saveTabSuccess': void,
  'tabs/saveTabError': void,
  'tabs/cancelSaveTab': void,
  'tabs/deleteTab': ApidocTab,
}>()

export const event = emitter;
/**
 * @description        返回uuid
 * @author             shuxiaokai
 * @create             2021-01-20 22:52
 * @return {string}    返回uuid
 */
export const uuid = (): string => {
  return nanoid();
}

/**
    @description   返回变量类型
    @author        shuxiaokai
    @create        2019-10-29 16:32"
    @param {any}   variable
    @return       小写对象类型(null,number,string,boolean,symbol,function,object,array,regexp)
*/
export const getType = (variable: unknown): string => {
  return Object.prototype.toString.call(variable).slice(8, -1).toLocaleLowerCase();
}

type ForestData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any,
}

/**
 * @description        遍历森林
 * @author             shuxiaokai
 * @create             2020-03-02 10:17
 * @param {array}      arrData 数组数据
 * @param {function}   fn 每次遍历执行得函数
 * @param {string}     childrenKey children对应字段
 */
export const forEachForest = <T extends ForestData>(forest: T[], fn: (arg: T) => void, options?: { childrenKey?: string }): void => {
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
export const findParentById = <T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let pNode: T | null = null;
  const foo = (forestData: ForestData, p: T | null) => {
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
 * 根据id查询下一个兄弟节点
 */
export const findNextSiblingById = <T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let nextSibling: T | null = null;
  const foo = (forestData: ForestData) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        nextSibling = forestData[i + 1]
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return nextSibling;
}
/**
 * 根据id查询上一个兄弟节点
 */
export const findPreviousSiblingById = <T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let previousSibling: T | null = null;
  const foo = (forestData: ForestData) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        previousSibling = forestData[i - 1]
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return previousSibling;
}

/**
 * 根据id查询元素
 */
export const findNodeById = <T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型')
    return null;
  }
  let result = null;
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  const foo = (forestData: ForestData) => {
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

type TreeNode<T> = {
  children: T[],
};
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
 * 获取提示信息
 */
export const randomTip = (): string => {
  const len = tips.length;
  const randomIndex = Math.ceil(Math.random() * len) - 1;
  return tips[randomIndex];
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
    @description  将数组对象[{id: 1}]根据指定的key值进行去重,key值对应的数组元素不存在则直接过滤掉，若不传入id则默认按照set形式进行去重。
    @create       2019-11-20 22:40
    @update       2019-11-20 22:42
    @param  {array}  array 需要处理的数组
    @param  {string?} key 指定对象数组的去重依据
    @return {Array}  返回一个去重后的新数组，不会改变原数组
    @example
        unique([{id: 1}, {id: 2}, {id: 1}], "id") => [{id: 1}, {id: 2}]
        unique([{id: 1}, {id: 2}, {id: 1}]) => [{id: 1}, {id: 2}, {id: 1}]
        unique([{id: 1}, {}, {id: 1}]) => [{id: 1}, {id: 2}, {id: 1}]
        unique([1, 2, 3, 4, 3, 3]) => [1, 2, 3, 4]
*/

export const uniqueByKey = <T extends Data, K extends keyof T>(data: T[], key: K): T[] => {
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
    _id: uuid(),
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
}/*
|--------------------------------------------------------------------------
|--------------------------------------------------------------------------
|
*/
type Properties = ApidocProperty<HttpNodePropertyType>[]
// eslint-disable-next-line no-use-before-define
type JSON = string | number | boolean | null | JsonObj | JsonArr
type JsonArr = JSON[]
type JsonObj = {
  [x: string]: JSON
}


/**
 * 将录入参数转换为json参数
 */
export const apidocConvertParamsToJsonData = (properties: Properties): JSON => {
  if (properties.length === 0) {
    console.warn('无任何参数值')
    return null;
  }
  const rootType = properties[0].type;
  const rootValue = properties[0].value;

  if (rootType === 'boolean') {
    return rootValue === 'true';
  }
  if (rootType === 'string') {
    return rootValue;
  }
  if (rootType === 'number') {
    const isNumber = !Number.isNaN(Number(rootValue));
    if (isNumber) {
      return Number(rootValue);
    }
    console.warn('参数无法被转换为数字类型，默认为0');
    return 0;
  }
  if (rootType === 'file') {
    console.warn('根元素不允许为file');
    return null;
  }
  return {};
}

/**
 * @description        生成一份空的项目默认值
 * @author             shuxiaokai
 * @create             2021-09-07 22:35
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
 * @description        生成一份空的HTTP节点默认值
 * @author             shuxiaokai
 * @create             2021-09-07 22:35
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
 * @description        生成一份空的WebSocket节点默认值
 * @author             shuxiaokai
 * @create             2021-09-07 22:35
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

//生成一份空的HTTP mock节点
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
        isDefault: true,
        conditions: {
          name: '',
          scriptCode: '',
        },
        statusCode: 200,
        headers: {},
        dataType: 'json',
        sseConfig: {},
        jsonConfig: {
          mode: 'fixed',
          fixedData: '',
          randomSize: 0,
        },
        textConfig: {
          mode: 'fixed',
          fixedData: '',
          randomSize: 0,
        },
        imageConfig: {
          mode: 'fixed',
          randomSize: 0,
          randomWidth: 0,
          randomHeight: 0,
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
 * @description        生成一份apidoc默认值(保持向后兼容)
 * @author             shuxiaokai
 * @create             2021-09-07 22:35
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
 * @description        生成一份websocket默认值(保持向后兼容)
 * @author             shuxiaokai
 * @create             2021-09-07 22:35
 */
export const generateWebsocketNode = (id?: string): WebSocketNode => {
  const result = generateEmptyWebsocketNode(id || nanoid());
  // 添加一些字段以保持向后兼容
  result.createdAt = '';
  result.updatedAt = '';
  result.isDeleted = false;
  return result;
};


/**
 * @description        生成一份参数类型数组
 * @author             shuxiaokai
 * @create             2022-01-20 22:35
 */
export const apidocGenerateRequestParamTypes = (): HttpNodeRequestParamTypes => {
  return ['path', 'params', 'json', 'x-www-form-urlencoded', 'formData', 'text/javascript', 'text/plain', 'text/html', 'application/xml'];
}
/**
 * @description        将byte转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {number}      byteNum - 字节数量
 * @return {String}    返回字符串
 */
export const formatBytes = (byteNum: number): string => {
  let result = '';
  if (byteNum >= 0 && byteNum < 1024) {
    //b
    result = `${byteNum}B`;
  } else if (byteNum >= 1024 && byteNum < 1024 * 1024) {
    //KB
    result = `${(byteNum / 1024).toFixed(2)}KB`;
  } else if (byteNum >= 1024 * 1024 && byteNum < 1024 * 1024 * 1024) {
    //MB
    result = `${(byteNum / 1024 / 1024).toFixed(2)}MB`;
  } else if (byteNum >= 1024 * 1024 * 1024 && byteNum < 1024 * 1024 * 1024 * 1024) {
    //GB
    result = `${(byteNum / 1024 / 1024 / 1024).toFixed(2)}GB`;
  }
  return result;
}

/**
 * @description        将毫秒转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {number}      ms - 毫秒
 * @return {String}    返回字符串
 */
export const formatMs = (ms: number): string => {
  let result = '';
  if (!ms) {
    return '';
  }
  if (ms > 0 && ms < 1000) { //毫秒
    result = `${ms}ms`;
  } else if (ms >= 1000 && ms < 1000 * 60) { //秒
    result = `${(ms / 1000).toFixed(2)}s`;
  } else if (ms >= 1000 * 60) { //分钟
    result = `${(ms / 1000 / 60).toFixed(2)}m`;
  }
  return result;
}

/**
 * @description        拷贝文本
 * @author             shuxiaokai
 * @create             2020-10-26 21:56
 * @param {string}     str - 需要拷贝的文本
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
export const randomInt = (start: number, end: number): number => {
  if (start > end) {
    console.log('第二个参数必须大于第一个');
    return 0;
  }
  const range = end - start - 1;
  return Math.floor((Math.random() * range + 1))
}
//模拟延迟
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


export const getFileNameFromContentDisposition = (contentDisposition: string) => {
  if (!contentDisposition) {
    return '';
  }

  const match = contentDisposition.match(/filename="?([^";]*)"?/);
  return match ? match[1] : '';
}

export * from './apidoc-format'

// 导出文本为文件
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
export const formatHeader = (header: string) => {
  return header
    .split('-') // 拆分成单词数组
    .map(word =>
      word.charAt(0).toUpperCase() + // 首字母大写
      word.slice(1).toLowerCase()    // 其余字母小写
    )
    .join('-'); // 重新连接成字符串
}
/**
 * 从url中获取domain信息（与cookie中的domain一致，仅主机名，不含端口和协议）
 * @param url 输入的完整url字符串
 * @returns domain主机名
 */
export const getDomainFromUrl = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch {
    return '';
  }
}
/**
 * 从url中获取路径信息（不包含协议、主机名、端口和查询参数）
 * @param url 输入的完整url字符串
 * @returns 路径字符串（以/开头）
 */
export const getPathFromUrl = (url: string): string => {
  try {
    const { pathname } = new URL(url);
    return pathname;
  } catch {
    return '';
  }
}
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
| docs转banner方法
|--------------------------------------------------------------------------
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
 * 判断字符串是否为有效的 JSON 格式
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
| 对象大小计算方法
|--------------------------------------------------------------------------
*/
/**
 * 计算JavaScript对象的字节大小
 * @param obj 需要计算大小的对象
 * @returns 对象的字节大小
 */
export const getObjectSize = (obj: unknown): number => {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  return blob.size;
}

// 获取IndexedDB中的数据项数量
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

// 生成空响应信息
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

