import { useVariable } from '@/store/apidoc/variables';
import { HttpNodeResponseContentType, HttpNode, ApidocProperty } from '@src/types';
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
// ApidocProperty数组转换为对象，key和value都进行模板编译
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
// 转换URL信息
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
