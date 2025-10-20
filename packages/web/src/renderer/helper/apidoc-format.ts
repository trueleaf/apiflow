import { useVariable } from '@/store/apidoc/variables';
import { HttpNodeResponseContentType, HttpNode } from '@src/types';
import type { JsonData } from '@src/types/common';
import { getCompiledTemplate } from './index';

type UrlInfo = {
  host: string,
  path: string,
  url: string,
}
// 返回参数
type ResponseData = {
  // 标题描述
  title: string,
  // 状态码
  statusCode: number,
  // contentType
  dataType: HttpNodeResponseContentType,
  // json值
  json?: JsonData,
}

// query参数转换
export const apidocFormatQueryParams = async (apidoc: HttpNode): Promise<Record<string, string>> => {
  const { queryParams } = apidoc.item;
  const result: Record<string, string> = {};
  const variableStore = useVariable();
  const variables = variableStore.variables;
  await Promise.all(queryParams.map(async (param) => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      const compiledValue = await getCompiledTemplate(value, variables);
      result[key] = String(compiledValue);
    }
  }));
  return result;
}
// path参数转换
export const apidocFormatPathParams = (apidoc: HttpNode): Record<string, string> => {
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
// body json参数转换
export const apidocFormatJsonBodyParams = (apidoc: HttpNode): JsonData => {
  return apidoc.item.requestBody.rawJson
}
// body form-data参数转换
export const apidocFormatFormdataParams = async (apidoc: HttpNode): Promise<Record<string, string>> => {
  const { formdata } = apidoc.item.requestBody;
  const result: Record<string, string> = {};
  const variableStore = useVariable();
  const variables = variableStore.variables;
  await Promise.all(formdata.map(async (param) => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      const compiledValue = await getCompiledTemplate(value, variables);
      result[key] = String(compiledValue);
    }
  }));
  return result;
}
// body urlencoded参数转换
export const apidocFormatUrlencodedParams = async (apidoc: HttpNode): Promise<Record<string, string>> => {
  const { urlencoded } = apidoc.item.requestBody;
  const result: Record<string, string> = {};
  const variableStore = useVariable();
  const variables = variableStore.variables;
  await Promise.all(urlencoded.map(async (param) => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      const compiledValue = await getCompiledTemplate(value, variables);
      result[key] = String(compiledValue);
    }
  }));
  return result;
}
// header参数转换
export const apidocFormatHeaderParams = async (apidoc: HttpNode): Promise<Record<string, string>> => {
  const { headers } = apidoc.item;
  const result: Record<string, string> = {};
  const variableStore = useVariable();
  const variables = variableStore.variables;
  await Promise.all(headers.map(async (param) => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      const compiledValue = await getCompiledTemplate(value, variables);
      result[key] = String(compiledValue);
    }
  }));
  return result;
}
// 转换URL信息
export const apidocFormatUrl = async (apidoc: HttpNode): Promise<UrlInfo> => {
  let queryString = '';
  const { queryParams } = apidoc.item;
  const { path, prefix } = apidoc.item.url;
  const variableStore = useVariable();
  const variables = variableStore.variables;
  // query参数解析
  const queryPairs: string[] = [];
  await Promise.all(queryParams.map(async (param) => {
    const key = param.key.trim();
    const value = param.value.trim();
    if (key !== '') {
      const compiledValue = await getCompiledTemplate(value, variables);
      queryPairs.push(`${key}=${String(compiledValue)}`);
    }
  }));
  queryString = queryPairs.join('&');
  if (queryString) {
    queryString = `?${queryString}`;
  }
  return {
    host: prefix,
    path,
    url: `${prefix}${path}${queryString}`,
  };
};
// Response转换
export const apidocFormatResponseParams = (apidoc: HttpNode): ResponseData[] => {
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
