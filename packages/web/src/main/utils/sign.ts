import stringify from 'json-stable-stringify';
import { createHash } from 'crypto';

// sha256 哈希函数
export const sha256 = (data: string): string => {
  return createHash('sha256').update(data).digest('hex');
};

// url参数解析
export const parseUrl = (url: string) => {
  // 如果是完整的URL（包含协议），先提取路径部分
  let pathWithQuery = url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      pathWithQuery = urlObj.pathname + urlObj.search;
    } catch {
      // 如果解析失败，使用原始URL
      pathWithQuery = url;
    }
  }
  
  const [urlPart, queryPart] = pathWithQuery.split('?', 2);
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
};

// 获取加签后的请求参数
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
};

// 获取加签后header
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
};

// 获取加签后的请求body
export const getStrJsonBody = (data: Record<string, unknown> = {}) => {
  if (Object.prototype.toString.call(data) === '[object Object]') {
    const sortedJson = stringify(data);
    return sha256(sortedJson || '');
  }
  return '';
};
