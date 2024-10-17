import type { ApidocContentType, ApidocDetail, ApidocHttpRequestMethod, ApidocProperty } from '@src/types/global'
import type IFromData from 'form-data'
import json5 from 'json5'
import html2canvas from 'html2canvas';
import { apidocGenerateApidoc, apidocGenerateProperty, formatBytes } from '@/helper/index'
import Mock from '@/server/mock/mock'
import { router } from '@/router'
import { request } from '@/api/api'
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FormData: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let path: any = null;
// eslint-disable-next-line prefer-destructuring
FormData = window.FormData;
if (window.require) {
  // eslint-disable-next-line prefer-destructuring
  FormData = window.require('form-data');
  path = window.require('path')
}
/**
 * 获取url信息
 */
type UrlInfo = {
  host: string,
  path: string,
  url: string,
  fullUrl: string
}

class ApidocConverter {
  private apidoc: ApidocDetail = apidocGenerateApidoc(); //apidoc文档详情

  private tempVariables: Record<string, unknown> = {}; //临时变量

  private collectionVariables: Record<string, unknown> = {}; //集合内变量

  private replacedUrl = ''; //替换后url

  private multipartHeaders = ''; //multipart格式请求头

  /*
    |--------------------------------------------------------------------------
    | 变量相关
    |--------------------------------------------------------------------------
    */
  /**
    * 改变临时变量值
    */
  changeTempVariables(variables: Record<string, unknown>) {
    this.tempVariables = variables;
  }

  /**
    * 获取所有临时变量值
    */
  getTempVariables() {
    return this.tempVariables;
  }

  /**
     * 删除所有临时变量
     */
  clearTempVariables() {
    Object.keys(this.tempVariables).forEach(key => {
      delete this.tempVariables[key];
    })
  }

  /**
     * 改变全局变量值
     */
  changeCollectionVariables(variables: Record<string, unknown>) {
    this.collectionVariables = variables;
  }

  /**
     * 获取所有全局变量
     */
  getCollectionVariables() {
    return this.collectionVariables;
  }

  private convertPlaceholder(value: string) {
    const matchdVariable = value.toString().match(/\{\{\s*([^} ]+)\s*\}\}/);
    const allVariables = {
      ...JSON.parse(JSON.stringify(this.collectionVariables)),
      ...JSON.parse(JSON.stringify(this.tempVariables)),
    };
    let convertValue = value;
    if (matchdVariable) {
      const realValue = allVariables[matchdVariable[1]];
      if (realValue != null) {
        convertValue = realValue
      }
    } else if (convertValue.startsWith('@')) {
      convertValue = Mock.mock(value);
    } else if (convertValue.startsWith('$')) {
      convertValue = Mock.mock(value.replace(/^\$/, '@'));
    }
    return convertValue;
  }

  /*
    |--------------------------------------------------------------------------
    | 内部转换方法
    |--------------------------------------------------------------------------
    */
  /**
     * 将queryParams转换成字符串查询字符串
     */
  private convertQueryParamsToQueryString(queryParams: ApidocProperty<'string'>[]): string {
    let queryString = '';
    queryParams.forEach((v) => {
      if (v.key && v.select) {
        queryString += `${v.key}=${this.convertPlaceholder(v.value)}&`
      }
    })
    queryString = queryString.replace(/&$/, '');
    if (queryString) {
      queryString = `?${queryString}`;
    }
    return queryString;
  }

  /**
     * 将formData转换为formData字符串
     */
  private convertFormDataToFormDataString(bodyFormData: ApidocProperty<'string' | 'file'>[]): { data: FormData, headers: IFromData.Headers } {
    const formData = new FormData();
    let fs = null;
    if (window.require) {
      // eslint-disable-next-line prefer-destructuring
      fs = window.require('fs-extra');
    } else {
      console.error('web端无法发送文件');
    }
    for (let i = 0; i < bodyFormData.length; i += 1) {
      const item = bodyFormData[i];
      if (!item.select || !item.key) {
        continue;
      }
      if (item.type === 'string') { //字符串类型
        formData.append(item.key, this.convertPlaceholder(item.value));
      } else if (item.type === 'file') { //文件处理
        try {
          fs.accessSync(item.value);
          const file = fs.readFileSync(item.value);
          const fileName = path.basename(item.value);
          formData.append(item.key, file, fileName);
        } catch (error) {
          console.error(error);
          console.log('文件不存在');
        }
      }
    }
    return {
      data: formData,
      headers: formData.getHeaders(),
    }
  }

  /**
     * 将urlencoded参数转换为字符串
     */
  private convertUrlencodedToBodyString(urlencoded: ApidocProperty<'string'>[]): string {
    let result = '';
    urlencoded.forEach((v) => {
      if (v.key && v.select) {
        result += `${v.key}=${this.convertPlaceholder(v.value)}&`
      }
    })
    result = result.replace(/&$/, '');
    return result;
  }

  /**
     * 将pathParams转换为字符串
     */
  private getPathParamsMap(pathParams: ApidocProperty<'string'>[]): Record<string, string> {
    const pathMap: Record<string, string> = {};
    pathParams.forEach((v) => {
      if (v.key) {
        pathMap[v.key] = this.convertPlaceholder(v.value);
      }
    })
    return pathMap;
  }

  /**
     * 挂载数据
     */
  setData(apidoc: ApidocDetail) {
    this.apidoc = apidoc;
  }

  /**
     * 获取URL信息
     */
  getUrlInfo(): UrlInfo {
    const { url, queryParams, paths, } = this.apidoc.item;
    const queryString = this.convertQueryParamsToQueryString(queryParams);
    const pathMap = this.getPathParamsMap(paths)
    const validPath = url.path.replace(/\{([^\\}]+)\}/g, (_, $2) => pathMap[$2] || $2);
    let fullUrl = url.host + validPath + queryString;
    if (!fullUrl.startsWith('http') && !fullUrl.startsWith('https')) {
      fullUrl = `http://${fullUrl}`
    }
    if (fullUrl.includes('localhost')) {
      fullUrl = fullUrl.replace('localhost', '127.0.0.1')
    }
    return {
      host: url.host,
      path: url.path,
      url: url.host + validPath,
      fullUrl: this.replacedUrl ? this.replacedUrl : fullUrl,
    }
  }

  /**
     * 替换url
     */
  replaceUrl(url: string) {
    this.replacedUrl = url;
  }

  /**
     * 获取请求method
     */
  getMethod() {
    return this.apidoc.item.method;
  }

  /**
     * 设置请求方法
     */
  setMethod(method: ApidocHttpRequestMethod) {
    this.apidoc.item.method = method;
  }

  /**
     * 获取请求头
     */
  getHeaders() {
    const apidocTabsStore = useApidocTas();
    const apidocBaseInfoStore = useApidocBaseInfo();
    const projectId = router.currentRoute.value.query.id as string;
    const currentSelectTab = apidocTabsStore.tabs[projectId]?.find((tab) => tab.selected) || null;
    const commonHeaders = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab?._id || '');
    // const commonHeaders = store.getters['apidoc/baseInfo/headers'](currentSelectTab?._id) as Pick<ApidocProperty, 'key' | 'value' | 'description' | 'select'>[];
    const realHeaders: Record<string, string | undefined> = {};
    const { headers, requestBody, contentType } = this.apidoc.item;
    const { mode } = requestBody;
    commonHeaders.forEach((item) => {
      const itemKey = item.key.toLocaleLowerCase();
      if (itemKey) {
        realHeaders[itemKey] = this.convertPlaceholder(item.value);
      }
    })
    headers.forEach((item) => {
      const itemKey = item.key.toLocaleLowerCase();
      if (item.select && itemKey) {
        realHeaders[itemKey] = this.convertPlaceholder(item.value);
      }
    })
    const userSetContentType = realHeaders['content-type'] || realHeaders['Content-Type'] || realHeaders['Content-type'] || realHeaders['content-Type']
    if (mode === 'formdata') {
      realHeaders['content-type'] = this.multipartHeaders;
    } else {
      realHeaders['content-type'] = contentType
    }
    if (userSetContentType) {
      realHeaders['content-type'] = userSetContentType;
    }
    if (!contentType && !userSetContentType) {
      delete realHeaders['content-type']
    }
    return realHeaders;
  }

  /**
     * 改变请求头
     */
  changeHeaders(headers: Record<string, string>) {
    const result: ApidocProperty<'string'>[] = [];
    Object.keys(headers).forEach(key => {
      if (key.toLocaleLowerCase() === 'content-type' || key.toLocaleLowerCase() === 'contenttype') {
        this.apidoc.item.contentType = headers[key] as ApidocContentType
      }
      const property = apidocGenerateProperty();
      property.key = key;
      property.value = headers[key];
      result.push(property);
    })
    this.apidoc.item.headers = result;
  }

  /**
     * 改变queryparams
     */
  changeQueryParams(objQueryParams: Record<string, string>) {
    const result: ApidocProperty<'string'>[] = [];
    Object.keys(objQueryParams).forEach((key) => {
      const property = apidocGenerateProperty();
      property.key = key;
      property.value = objQueryParams[key];
      result.push(property);
    })
    this.apidoc.item.queryParams = result
  }

  /**
     * 改变pathparams
     */
  changePathParams(objPathParams: Record<string, string>) {
    const result: ApidocProperty<'string'>[] = [];
    Object.keys(objPathParams).forEach((key) => {
      const property = apidocGenerateProperty();
      property.key = key;
      property.value = objPathParams[key];
      result.push(property);
    })
    this.apidoc.item.paths = result
  }

  /**
     * 改变json body信息
     */
  changeJsonBody(jsonStr: string) {
    const { requestBody } = this.apidoc.item
    const { mode } = requestBody;
    const matchedContentTypeHeader = this.apidoc.item.headers.find(v => v.key.toLocaleLowerCase() === 'content-type' || v.key.toLocaleLowerCase() === 'contenttype')
    if (mode === 'json') {
      this.apidoc.item.contentType = 'application/json';
      if (!matchedContentTypeHeader) {
        const property = apidocGenerateProperty();
        property.key = 'content-type';
        property.value = 'application/json';
        this.apidoc.item.headers.push(property)
      }
    }
    this.apidoc.item.requestBody.rawJson = jsonStr;
  }

  /**
     * 改变formdata body信息
     */
  changeFormdataBody(objFormdata: Record<string, string>) {
    const fileData = this.apidoc.item.requestBody.formdata.filter(v => v.type === 'file');
    const stringData: ApidocProperty<'string'>[] = [];
    Object.keys(objFormdata).forEach((key) => {
      if (!fileData.find(v => v.key === key)) {
        const property = apidocGenerateProperty();
        property.key = key;
        property.value = objFormdata[key];
        stringData.push(property);
      }
    })
    this.apidoc.item.requestBody.formdata = fileData.concat(stringData)
  }

  /**
     * 改变urlencoded
     */
  changeUrlencodedBody(objUrlencoded: Record<string, string>) {
    const result: ApidocProperty<'string'>[] = [];
    Object.keys(objUrlencoded).forEach((key) => {
      const property = apidocGenerateProperty();
      property.key = key;
      property.value = objUrlencoded[key];
      result.push(property);
    })
    this.apidoc.item.requestBody.urlencoded = result
  }

  /**
     * 改变raw body信息
     */
  changeRawBody(value: string) {
    this.apidoc.item.requestBody.raw.data = value
  }

  /**
     * 获取body信息
     */
  getRequestBody() {
    const { contentType, requestBody } = this.apidoc.item
    let body: string | FormData = '';
    switch (contentType) {
    case 'application/json':
      // eslint-disable-next-line no-useless-escape, no-case-declarations
      const numberMap: Record<string, string> = {};
      // eslint-disable-next-line no-useless-escape, no-case-declarations
      const convertBody = requestBody.rawJson.replace(/("\s*:\s*)(\d{14,})/g, (_, $1, $2) => {
        numberMap[$2] = $2;
        return `${$1}"${$2}"`;
      });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body = this.convertMockJsonToRealJson(convertBody);
      Object.keys(numberMap).forEach(key => {
        body = (body as string).replace(new RegExp(`:"(${key})"`, 'g'), (_, $1) => `:${$1}`);
      })
      break;
    case 'application/x-www-form-urlencoded':
      body = this.convertUrlencodedToBodyString(requestBody.urlencoded);
      break;
    case 'multipart/form-data':
      // eslint-disable-next-line no-case-declarations
      const { data, headers } = this.convertFormDataToFormDataString(requestBody.formdata);
      this.multipartHeaders = headers['content-type'];
      body = data
      break;
    case 'text/plain':
      body = requestBody.raw.data;
      break;
    case 'text/html':
      body = requestBody.raw.data;
      break;
    case 'application/xml':
      body = requestBody.raw.data;
      break;
    case 'text/javascript':
      body = requestBody.raw.data;
      break;
    case '':
      body = requestBody.raw.data;
      break;
    default:
      console.warn(`未知的mime类型${contentType}`)
      body = requestBody.raw.data;
      break;
    }
    return body;
  }

  /**
     * 根据id获取接口信息
     */
  async getDocRequestInfo(projectId: string, _id: string) {
    const params = {
      projectId,
      _id,
    }
    const res = await request.get('/api/project/doc_detail', { params })
    console.log(res)
  }

  /**
     * 将mock类型json转换为真实json
     */
  convertMockJsonToRealJson(mockJson: string) {
    const apidocBaseInfoStore = useApidocBaseInfo();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.stringify(json5.parse(mockJson || 'null', (_: string, value: any) => {
        if (!value) {
          return value;
        }
        if (typeof value === 'string') {
          const stringValue = value.toString();
          if (stringValue.startsWith('@')) {
            return Mock.mock(value);
          }
          if (stringValue.startsWith('$')) {
            return Mock.mock(value.replace(/^\$/, '@'));
          }
          const replacedStr = stringValue.replace(/\{\{\s*([^} ]+)\s*\}\}/g, ($1: string, varStr: string) => {
            // let realValue = "";
            if (varStr.startsWith('@')) {
              return Mock.mock(varStr);
            }
            if (varStr.startsWith('$')) {
              return Mock.mock(varStr.replace(/^\$/, '@'));
            }
            const matchedValue = apidocBaseInfoStore.variables.find(v => v.name === varStr)
            if (matchedValue) {
              return matchedValue.value
            }
            return $1;
          });
          return replacedStr;
        }
        return value;
      }));
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  /**
     * 创建一张图片
     */
  async createMockImage(imageInfo: ApidocDetail['mockInfo']['image']) {
    const wrapDom = document.createElement('div');
    const widthAndHeightDom = document.createElement('div');
    const sizeDom = document.createElement('div');
    wrapDom.style.backgroundColor = imageInfo.backgroundColor;
    wrapDom.style.width = `${imageInfo.width}px`;
    wrapDom.style.height = `${imageInfo.height}px`;
    wrapDom.style.position = 'fixed';
    wrapDom.style.left = '-99999px';
    wrapDom.style.top = '-99999px';
    wrapDom.style.display = 'flex';
    wrapDom.style.alignItems = 'center';
    wrapDom.style.justifyContent = 'center';
    wrapDom.style.flexDirection = 'column';
    widthAndHeightDom.style.color = imageInfo.color;
    widthAndHeightDom.style.fontSize = `${imageInfo.fontSize}px`;
    widthAndHeightDom.innerText = `${imageInfo.width}x${imageInfo.height}`;
    sizeDom.style.color = imageInfo.color;
    sizeDom.style.fontSize = `${imageInfo.fontSize / 1.2}px`;
    sizeDom.innerText = `${formatBytes(imageInfo.size)}`;
    wrapDom.appendChild(widthAndHeightDom)
    wrapDom.appendChild(sizeDom)
    document.body.append(wrapDom)
    const data = await html2canvas(wrapDom);
    const base64 = data.toDataURL(`image/${imageInfo.type}`, 1);
    document.body.removeChild(wrapDom)
    return base64;
  }
}

const apidocConverter = new ApidocConverter()
export default apidocConverter
