/*
|--------------------------------------------------------------------------
| apidoc转换为更易读数据
|--------------------------------------------------------------------------
*/
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { ApidocProjectVariable } from '@src/types/apidoc/base-info';
import { ApidocResponseContentType, ApidocDetail } from '@src/types/global';
import { storeToRefs } from 'pinia';

type UrlInfo = {
  host: string,
  path: string,
  url: string,
}

// eslint-disable-next-line no-use-before-define
type JSON = string | number | boolean | null | JsonObj | JsonArr
type JsonArr = JSON[]
type JsonObj = {
  [x: string]: JSON
}

/**
 * 返回参数
 */
type ResponseData = {
  /**
     * 标题描述
     */
  title: string,
  /**
     * 状态码
     */
  statusCode: number,
  /**
     * contentType
     */
  dataType: ApidocResponseContentType,
  /**
     * json值
     */
  json?: JSON,
}

/**
 * 转换{{}}的值
 */
function convertPlaceholder(value: string) {
  const { variables } = storeToRefs(useApidocBaseInfo())
  const matchdVariable = value.toString().match(/\{\{\s*([^} ]+)\s*\}\}/);
  const allVariables: ApidocProjectVariable[] = JSON.parse(JSON.stringify(variables.value));
  let convertValue = value;
  if (matchdVariable) {
    const realValue = allVariables.find(v => v.name === matchdVariable[1]);
    if (realValue != null) {
      convertValue = realValue.value
    }
  }
  return convertValue;
}

/**
 * query参数转换
 */
export const apidocFormatQueryParams = (apidoc: ApidocDetail): Record<string, string> => {
  const { queryParams } = apidoc.item;
  const result: Record<string, string> = {};
  queryParams.forEach(param => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      result[key] = convertPlaceholder(value);
    }
  })
  return result;
}
/**
 * path参数转换
 */
export const apidocFormatPathParams = (apidoc: ApidocDetail): Record<string, string> => {
  const { paths } = apidoc.item;
  const result: Record<string, string> = {};
  paths.forEach(param => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      result[key] = value;
    }
  })
  return result;
}
/**
 * body json参数转换
 */
export const apidocFormatJsonBodyParams = (apidoc: ApidocDetail): JSON => {
  return apidoc.item.requestBody.rawJson
}
/**
 * body form-data参数转换
 */
export const apidocFormatFormdataParams = (apidoc: ApidocDetail): Record<string, string> => {
  const { formdata } = apidoc.item.requestBody;
  const result: Record<string, string> = {};
  formdata.forEach(param => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      result[key] = convertPlaceholder(value);
    }
  })
  return result;
}
/**
 * body urlencoded参数转换
 */
export const apidocFormatUrlencodedParams = (apidoc: ApidocDetail): Record<string, string> => {
  const { urlencoded } = apidoc.item.requestBody;
  const result: Record<string, string> = {};
  urlencoded.forEach(param => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      result[key] = convertPlaceholder(value);
    }
  })
  return result;
}
/**
 * header参数转换
 */
export const apidocFormatHeaderParams = (apidoc: ApidocDetail): Record<string, string> => {
  const { headers } = apidoc.item;
  const result: Record<string, string> = {};
  headers.forEach(param => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      result[key] = convertPlaceholder(value);
    }
  })
  return result;
}
/**
 * 转换URL信息
 */
export const apidocFormatUrl = (apidoc: ApidocDetail): UrlInfo => {
  let queryString = '';
  const { queryParams } = apidoc.item;
  const { path, host } = apidoc.item.url
  //query参数解析
  queryParams.forEach((param) => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      queryString += `${key}=${convertPlaceholder(value)}&`
    }
  })
  queryString = queryString.replace(/&$/, '');
  if (queryString) {
    queryString = `?${queryString}`;
  }
  return {
    host,
    path,
    url: `${host}${path}${queryString}`,
  };
};
/**
 * Response转换
 */
export const apidocFormatResponseParams = (apidoc: ApidocDetail): ResponseData[] => {
  const { responseParams } = apidoc.item;
  const result: ResponseData[] = [];
  responseParams.forEach(res => {
    const data: ResponseData = {
      title: res.title,
      statusCode: res.statusCode,
      dataType: res.value.dataType,
    };
    switch (res.value.dataType) {
    case 'application/json':
      data.json = res.value.strJson
      break;
    default:
      console.warn(`仅解析json类型返回参数,当前返回参数类型为${res.value.dataType}`)
      break;
    }
    result.push(data)
  })
  return result;
}
