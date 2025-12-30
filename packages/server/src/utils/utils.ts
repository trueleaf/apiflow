import { ResponseWrapper } from '../types/response/common/common.js';
import stringify from 'json-stable-stringify';

/**
 * 返回随机参数
 * @param {number}     min - 最小值
 * @param {number}     max - 最大值
 */
export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export type CustomError = {
  isCustomError: boolean;
  msg: string;
}
/**
 * 自定义错误返回
 */
export const throwError = (code: ResponseWrapper['code'], msg: string) => {
  const errorData = {
    code,
    msg,
  };
  Object.setPrototypeOf(errorData, {
    isCustomError: true,
  });
  throw errorData;
};
/**
 * 将数组转换为树结构
 */
export const convertPlainArrayDataToTreeData = (plainArray: any[], options?: { id: string, pid: string }) => {
  const id = options?.id || '_id';
  const pid = options?.pid || 'pid';
  const temp = new Map();
  const result: { children: [] }[] = [];
  plainArray.forEach(item => {
    if (!item.children) {
      item.children = [];
    }
    temp.set(item[id].toString(), item)
  })
  plainArray.forEach(item => {
    if (!item[pid]) { //根元素
      result.push(item);
    } else {
      const parent = temp.get(item.pid);
      parent.children.push(item)
    }
  })
  return result;
};
/**
 * 遍历树形数据
 */

export const dfsForest = <T extends { children: T[], [propsName: string]: unknown }>(forestData: T[], fn: (item: T, level: number) => void) => {
  if (!Array.isArray(forestData)) {
    throw new Error('第一个参数必须为数组类型');
  }
  const foo = (forestData: T[], hook: (item: T, level: number) => void, level: number) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      hook(currentData, level);
      if (!currentData['children']) {
        continue;
      }
      if (!Array.isArray(currentData['children'])) {
        continue;
      }
      if ((currentData['children']).length > 0) {
        foo(currentData['children'], hook, level + 1);
      }
    }
  };
  foo(forestData, fn, 1);
}

export function uniqueByKey<T, K extends keyof T>(data: T[], key: K): T[] {
  const result: T[] = [];
  for (let i = 0, len = data.length; i < len; i += 1) {
    const isInResult = result.find((val) => val[key] === data[i][key]);
    if (data[i][key] != null && !isInResult) {
      result.push(data[i]);
    }
  }
  return result;
}

//模拟延迟
export async function sleep(delay: number): Promise<void> {
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
export function formatBytes(byteNum: number): string {
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
//获取加签后的请求参数
export const getStrParams = (params: Record<string, string> = {}) => {
  let strParams = '';
  const sortedKeys = Object.keys(params).filter(key => params[key] != null).sort();
  sortedKeys.forEach((key, index) => {
    if (index === sortedKeys.length - 1) {
      strParams += `${key}=${params[key]}`;
      return;
    }
    strParams += `${key}=${params[key]}&`;
  })
  return strParams;
}

//解析url,获取url和query参数
export const parseUrl = (url: string) => {
  const [urlPart, queryPart] = url.split('?', 2);
  const queryParams: Record<string, string> = {};
  if (queryPart) {
    const pairs = queryPart.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=', 2);
      const decodedKey = decodeURIComponent(key || '');
      const decodedValue = decodeURIComponent((value === undefined ? '' : value).replace(/\+/g, ' '));
      queryParams[decodedKey] = decodedValue;
    }
  }
  return {
    url: urlPart,
    queryParams: queryParams
  };
}
//获取加签后header
export const getStrHeader = (headers: Record<string, string> = {}) => {
  let strHeader = '';
  const sortedHeaderKeys = Object.keys(headers).filter(key => headers[key] != null).sort();
  sortedHeaderKeys.forEach((key, index) => {
    if (index === sortedHeaderKeys.length - 1) {
      strHeader += `${key.toLowerCase()}:${headers[key]}`;
      return;
    }
    strHeader += `${key.toLowerCase()}:${headers[key]}\n`;
  })
  return {
    strHeader,
    sortedHeaderKeys
  };
}
//获取加签后的请求body
export const getStrJsonBody = async (data: Record<string, string>) => {
  if (Object.prototype.toString.call(data) === '[object Object]') {
    const sortedJson = stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(sortedJson);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    return getHashedContent(hashBuffer);
  }
}
export const getHashedContent = (hashBuffer: ArrayBuffer) => {
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}