import type { Property, ApidocProperty, RendererFormDataBody } from '@src/types';
import { convertTemplateValueToRealValue } from './template';
import { getCompiledTemplate } from './template';
import { useVariable } from '@/store/share/variablesStore';

/**
 * 通用参数字符串生成函数
 * @param params 参数数组
 * @param objectVariable 变量对象
 * @param options 配置选项
 */
export const getStringFromParams = async (
  params: Property[],
  objectVariable: Record<string, any>,
  options?: {
    checkSelect?: boolean,  // 是否检查 select 属性
    addQuestionMark?: boolean,  // 是否添加问号前缀
  }
): Promise<string> => {
  const { checkSelect = false, addQuestionMark = false } = options || {};
  let resultString = "";

  for (let i = 0; i < params.length; i++) {
    const param = params[i];

    // 如果需要检查 select 且未选中，则跳过
    if (checkSelect && !param.select) {
      continue;
    }

    if (param.key) {
      const realKey = await convertTemplateValueToRealValue(
        param.key,
        objectVariable
      );
      const realValue = await convertTemplateValueToRealValue(
        param.value,
        objectVariable
      );
      resultString += `${realKey}=${realValue}&`;
    }
  }

  // 移除末尾的 &
  resultString = resultString.replace(/&$/, "");

  // 如果需要添加问号前缀
  if (addQuestionMark && resultString) {
    resultString = `?${resultString}`;
  }

  return resultString;
};

/**
 * 从 Path 参数生成对象
 */
export const getObjectPathParams = async (
  pathParams: Property[],
  objectVariable: Record<string, any>
): Promise<Record<string, string>> => {
  const objectPathParams: Record<string, string> = {};
  for (let i = 0; i < pathParams.length; i++) {
    const pathParam = pathParams[i];
    if (pathParam.key) {
      const realValue = await convertTemplateValueToRealValue(
        pathParam.value,
        objectVariable
      );
      objectPathParams[pathParam.key] = realValue;
    }
  }
  return objectPathParams;
};

/**
 * 从 FormData 参数生成 FormData Body
 */
export const getFormDataFromFormDataParams = async (
  formDataParams: Property[],
  objectVariable: Record<string, any>
): Promise<RendererFormDataBody> => {
  const renderedFormDataBody: RendererFormDataBody = [];
  for (let i = 0; i < formDataParams.length; i++) {
    const formData = formDataParams[i];
    if (formData.key) {
      const realKey = await convertTemplateValueToRealValue(
        formData.key,
        objectVariable
      );
      const realValue = await convertTemplateValueToRealValue(
        formData.value,
        objectVariable
      );
      renderedFormDataBody.push({
        id: formData._id,
        key: realKey,
        type: formData.type,
        value: realValue === null ? "null" : realValue?.toString(),
      });
    }
  }
  return renderedFormDataBody;
};

/**
 * ApidocProperty数组转换为对象，key和value都进行模板编译
 */
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
