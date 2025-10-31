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
