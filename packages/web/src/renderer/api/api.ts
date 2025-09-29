import Axios, { AxiosResponse, AxiosError } from 'axios';
import { config } from '@/../config/config'
import { router } from '@/router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { nanoid } from 'nanoid';
import { parseUrl, getStrParams, getStrHeader, getStrJsonBody, getHashedContent } from './sign';
import { i18n } from '@/i18n';
import { permissionCache } from '@/cache/permission/permission';

const axiosInstance = Axios.create();
axiosInstance.defaults.withCredentials = config.renderConfig.httpRequest.withCredentials;//允许携带cookie
axiosInstance.defaults.timeout = config.renderConfig.httpRequest.timeout;//超时时间
axiosInstance.defaults.baseURL = config.renderConfig.httpRequest.url;//请求地址
let isExpire = false; //是否登录过期

//===============================axiosInstance请求钩子==========================================//
axiosInstance.interceptors.request.use(async (reqConfig) => {
  try {
    const userInfo = permissionCache.getUserInfo();
    //接口加签
    const timestamp = Date.now();
    const nonce = nanoid(); // 生成16位随机字符串
    reqConfig.headers.Authorization = userInfo?.token;
    const method = reqConfig.method!.toLowerCase();
    const parsedUrlInfo = parseUrl(reqConfig.url!);
    const url = parsedUrlInfo.url;
    const strParams = getStrParams(Object.assign({}, parsedUrlInfo.queryParams,reqConfig.params));
    const strBody = await getStrJsonBody(reqConfig.data);
    const { strHeader, sortedHeaderKeys } = getStrHeader(reqConfig.headers);
    const signContent = `${method}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
    const hashedContent = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(signContent));
    reqConfig.headers['x-sign'] = getHashedContent(hashedContent);
    reqConfig.headers['x-sign-headers'] = sortedHeaderKeys.join(',');
    reqConfig.headers['x-sign-timestamp'] = timestamp;
    reqConfig.headers['x-sign-nonce'] = nonce;
    return reqConfig;

  } catch (error) {
    Promise.reject(error)
  }
  return reqConfig;
}, (err) => Promise.reject(err));
//===============================axiosInstance响应钩子=======================================//
axiosInstance.interceptors.response.use(
  async (res: AxiosResponse) => {
    const result = res.data;
    const headers = res.headers || {};
    const clientKey = headers['x-client-key'];
    if (clientKey) {
      sessionStorage.setItem('apiflow/x-client-key', clientKey)
    }
    const contentType = headers['content-type'];
    const contentDisposition = headers['content-disposition'];
    let fileName = contentDisposition ? contentDisposition.match(/filename=(.*)/) : '';
    if (fileName) {
      fileName = decodeURIComponent(fileName[1]);
    }
    if (contentType.includes('application/json')) { //常规格式数据
      let code = null;
      if (res.data.constructor.name === 'Blob') {
        let jsonData = await res.data.text();
        jsonData = JSON.parse(jsonData);
        code = jsonData.code;
      } else {
        code = res.data.code; //自定义请求状态码
      }
      /*eslint-disable indent*/
      switch (code) {
        case 0: //正确请求
          break;
        case 2006: //输入验证码
          break;
        case 2003: //验证码错误
          break;
        case 4005: //图形验证码错误
          break;
        case 1020: //分享链接不存在
          ElMessage({
            message: i18n.global.t('分享链接不存在'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('分享链接不存在')));
        case 1021: //分享链接已过期
          ElMessage({
            message: i18n.global.t('分享链接已过期'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('分享链接已过期')));
        case 1022: //分享链接无需密码
          ElMessage({
            message: i18n.global.t('分享链接无需密码'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('分享链接无需密码')));
        case 1023: //密码错误
          ElMessage({
            message: i18n.global.t('密码错误'),
            grouping: true,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t('密码错误')));
        case 4101: //登录有错
          permissionCache.clearUserInfo();
          router.replace('/login');
          ElMessage.warning(i18n.global.t('暂无权限'));
          return Promise.reject(new Error(i18n.global.t('暂无权限')));
        case 4100: //登录过期
          if (!isExpire) {
            isExpire = true;
            permissionCache.clearUserInfo();
            ElMessageBox.confirm(i18n.global.t('登录已过期'), i18n.global.t('提示'), {
              confirmButtonText: i18n.global.t('跳转登录'),
              cancelButtonText: i18n.global.t('取消'),
              type: 'warning',
            }).then(() => {
              isExpire = false;
              sessionStorage.clear();
              router.replace('/login');
            }).catch(() => {
              isExpire = false;
            });
          }
          return Promise.reject(new Error(i18n.global.t('登录已过期')));
        case 4200: //代理错误
          return Promise.reject(new Error(res.data.msg));
        case 4002: //暂无权限
          permissionCache.clearUserInfo();
          ElMessage.warning(i18n.global.t(res.data.msg || '暂无权限'));
          return Promise.reject(new Error(i18n.global.t(res.data.msg || '暂无权限')));
        default:
          ElMessageBox.confirm(i18n.global.t(res.data.msg ? res.data.msg : '操作失败'), i18n.global.t('提示'), {
            confirmButtonText: i18n.global.t('确定'),
            showCancelButton: false,
            type: 'warning',
          });
          return Promise.reject(new Error(i18n.global.t(res.data.msg)));
      }
      return result;
    }
    if (contentType.includes('application/force-download')) {
      let blobUrl = '';
      blobUrl = URL.createObjectURL(res.data);
      const downloadElement = document.createElement('a');
      downloadElement.href = blobUrl;
      downloadElement.download = fileName ? decodeURIComponent(fileName) : '未命名'; //下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); //点击下载
      document.body.removeChild(downloadElement); //下载完成移除元素
      window.URL.revokeObjectURL(blobUrl); //释放掉blob对象
    }
    //其余格式直接下载
    return {
      fileName,
      contentType,
      data: result,
    };
  },
  (err: AxiosError) => {
    //=====================================取消错误不进行拦截====================================//
    if (err.constructor && err.constructor.name === 'Cancel') {
      return;
    }
    
    // 处理超时错误
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      ElMessage({
        message: i18n.global.t('接口调用超时，请稍后重试'),
        grouping: true,
        type: 'error',
      })
      return Promise.reject(err);
    }
    ElMessage({
      message: i18n.global.t('系统开小差了!'),
      grouping: true,
      type: 'error',
    })
    Promise.reject(err);
  },
);

export { axiosInstance as request };
