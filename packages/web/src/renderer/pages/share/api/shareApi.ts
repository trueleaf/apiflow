import Axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import { ElMessage } from 'element-plus';
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';
import { parseUrl, getStrParams, getStrHeader, getStrJsonBody } from '@/api/sign';
import { i18n } from '@/i18n';
import { config } from '@src/config/config';

// 获取服务器地址
const getServerUrl = (): string => {
  try {
    const serverUrl = localStorage.getItem('apiflow/appSettings/serverUrl');
    return serverUrl || config.renderConfig.httpRequest.url;
  } catch {
    return config.renderConfig.httpRequest.url;
  }
}

const axiosInstance = Axios.create();
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.timeout = 30000;
axiosInstance.defaults.baseURL = getServerUrl();

// 生成请求签名
const generateRequestSignature = (params: {
  method: string;
  url: string;
  queryParams?: Record<string, unknown>;
  body?: unknown;
  headers: Record<string, unknown>;
}) => {
  const timestamp = Date.now();
  const nonce = nanoid();
  let urlForSign = params.url;
  if (urlForSign.startsWith('http://') || urlForSign.startsWith('https://')) {
    try {
      const urlObj = new URL(urlForSign);
      urlForSign = urlObj.pathname + urlObj.search;
    } catch {
      // URL 解析失败，使用原值
    }
  }
  const parsedUrlInfo = parseUrl(urlForSign);
  const url = parsedUrlInfo.url;
  const strParams = getStrParams(Object.assign({}, parsedUrlInfo.queryParams, params.queryParams));
  const strBody = getStrJsonBody(params.body as Record<string, string>);
  const headersAsString = Object.fromEntries(
    Object.entries(params.headers)
      .filter(([, v]) => v != null)
      .map(([k, v]) => [k, String(v)])
  );
  const { strHeader, sortedHeaderKeys } = getStrHeader(headersAsString);
  const signContent = `${params.method.toLowerCase()}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
  return {
    authorization: undefined,
    sign: sha256(signContent),
    signHeaders: sortedHeaderKeys.join(','),
    timestamp,
    nonce,
  };
}

// 请求钩子
axiosInstance.interceptors.request.use(async (reqConfig) => {
  if (reqConfig.raw) {
    return reqConfig;
  }
  try {
    const signature = generateRequestSignature({
      method: reqConfig.method!,
      url: reqConfig.url!,
      queryParams: reqConfig.params,
      body: reqConfig.data,
      headers: reqConfig.headers,
    });
    reqConfig.headers['x-sign'] = signature.sign;
    reqConfig.headers['x-sign-headers'] = signature.signHeaders;
    reqConfig.headers['x-sign-timestamp'] = signature.timestamp;
    reqConfig.headers['x-sign-nonce'] = signature.nonce;
    return reqConfig;
  } catch (error) {
    Promise.reject(error)
  }
  return reqConfig;
}, (err) => Promise.reject(err));

// 响应钩子
axiosInstance.interceptors.response.use(
  async (res: AxiosResponse) => {
    if (res.config.raw) {
      if (res.config.responseType === 'stream' && res.data?.body) {
        return res.data.body;
      }
      return res.data;
    }
    const result = res.data;
    const headers = res.headers || {};
    const contentType = headers['content-type'];
    if (contentType.includes('application/json')) {
      let code = null;
      if (res.data.constructor.name === 'Blob') {
        let jsonData = await res.data.text();
        jsonData = JSON.parse(jsonData);
        code = jsonData.code;
      } else {
        code = res.data.code;
      }
      if (code === undefined || code === null) {
        return result;
      }
      switch (code) {
        case 0:
          break;
        case 1020:
          ElMessage({
            message: i18n.global.t('分享链接不存在'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('分享链接不存在')));
        case 1021:
          ElMessage({
            message: i18n.global.t('分享链接已过期'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('分享链接已过期')));
        case 1022:
          ElMessage({
            message: i18n.global.t('分享链接无需密码'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('分享链接无需密码')));
        case 1023:
          ElMessage({
            message: i18n.global.t('密码错误'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('密码错误')));
        default:
          ElMessage({
            message: i18n.global.t(res.data.msg ? res.data.msg : '操作失败'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t(res.data.msg)));
      }
      return result;
    }
    return result;
  },
  (err: AxiosError) => {
    if (err.constructor && err.constructor.name === 'Cancel') {
      return;
    }
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      ElMessage({
        message: i18n.global.t('接口调用超时，请稍后重试'),
        grouping: true,
        type: 'warning',
      });
      return Promise.reject(err);
    }
    if (!err.response) {
      ElMessage({
        message: i18n.global.t('网络错误'),
        grouping: true,
        type: 'warning',
      });
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

export const request = axiosInstance;
