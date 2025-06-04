import { FlowNode, Property, RendererFormDataBody } from "@src/types/types";
import Mock from "../../mock/mock";
import { ApidocVariable, SandboxPostMessage } from "@src/types/global";
import { useVariable } from "@/store/apidoc/variables";

export const isElectron = () => {
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }
  return false;
}
export const updateObject = <T extends Partial<Record<string, unknown>>>(draft: T, payload: T) => {
  (Object.keys(payload) as Array<keyof T>).forEach(field => {
   const value = payload[field]
   if (value != null) {
      draft[field] = value
   }
  })
}

export const evalCode = (code: string) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('@/worker/sandbox.ts', import.meta.url));
    worker.onmessage = (event: MessageEvent<SandboxPostMessage>) => {
      if (event.data.type === 'error') {
        reject(event.data.msg)
      } else if (event.data.type === 'evalSuccess') {
        resolve(event.data.data)
      }
    }
    worker.onerror = (error) => {
      reject(error.message)
    }
    worker.postMessage({
      type: "eval",
      code
    })
  })
}

export const getObjectVariable = async (variables: ApidocVariable[]) => {
  const objectVariable: Record<string, any> = {};
  for (let i = 0; i < variables.length; i++) {
    const varInfo = variables[i];
    const { name, value, fileValue } = varInfo;
    if (varInfo.type === 'string') {
      objectVariable[name] = value;
    } else if (varInfo.type === 'number') {
      objectVariable[name] = Number(value);
    } else if (varInfo.type === 'boolean') {
      objectVariable[name] = value === 'true' ? true : false;
    } else if (varInfo.type === 'null') {
      objectVariable[name] = null;
    } else if (varInfo.type === 'any') {
      objectVariable[name] = await evalCode(value);
    } else if (varInfo.type === 'file') {
      objectVariable[name] = fileValue.path;
    }
  }
  return Promise.resolve(objectVariable);
}
/*
|--------------------------------------------------------------------------
| 将模板转换为字符串
| 变量类型一：{{ variable }}
| 变量类型二：{{ @variable }} mock类型
| 变量类型三：@xxx mock类型
|--------------------------------------------------------------------------
|
*/
export const convertTemplateValueToRealValue = async (stringValue: string, objectVariable: Record<string, any>) => {
  const isSingleMustachTemplate = stringValue.match(/^\s*\{\{\s*([^}\s]+)\s*\}\}\s*$/); // 这种属于单模板，返回实际值，可能是数字、对象等"{{ variable }}"
  if (isSingleMustachTemplate) {
    const variableName = isSingleMustachTemplate[1];
    if (variableName.startsWith("@")) {
      return Mock.mock(variableName);
    }
    if (objectVariable[variableName]  !== undefined) {
      return objectVariable[variableName]
    }
    return isSingleMustachTemplate[0] 
  }
 
  const withoutVaribleString = stringValue.replace(/(?<!\\)\{\{\s*(.*?)\s*\}\}/g, ($1, variableName: string) => {
    const isVariableExist = (variableName in objectVariable);
    if (variableName.startsWith("@")) {
      return Mock.mock(variableName);
    }
    if (!isVariableExist) {
      return $1
    }
    const value = objectVariable[variableName];
    return value;
  })

  const withoutMockString = withoutVaribleString.replace(/(@[^@]+)/g, (_, variableName: string) => {
    return Mock.mock(variableName);
  })

  const withoutEscapeString = withoutMockString.replace(/((\\)(?=\{\{))|(\\)(?=@)/g, '')
  return withoutEscapeString
}
export const getQueryStringFromQueryParams = async (queryParams: Property[], objectVariable: Record<string, any>): Promise<string> => {
  let queryString = "";
  for (let i = 0; i < queryParams.length; i++) {
    const queryParam = queryParams[i];
    if (!queryParam.select) {
      continue; //如果没有选中，则跳过
    }
    if (queryParam.key) {
      const realKey = await convertTemplateValueToRealValue(queryParam.key, objectVariable); 
      const realValue = await convertTemplateValueToRealValue(queryParam.value, objectVariable);
      queryString += `${realKey}=${realValue}&`;
    }
    
  }
  queryString = queryString.replace(/&$/, "");
  if (queryString) {
    queryString = `?${queryString}`;
  }
  return queryString;
}
export const getObjectPathParams = async (pathParams: Property[], objectVariable: Record<string, any>): Promise<Record<string, string>> => {
  const objectPathParams: Record<string, string> = {};
  for (let i = 0; i < pathParams.length; i++) {
    const pathParam = pathParams[i];
    if (pathParam.key) {
      const realValue = await convertTemplateValueToRealValue(pathParam.value, objectVariable);
      objectPathParams[pathParam.key] = realValue;
    }
  }
  return objectPathParams;
}
export const getEncodedStringFromEncodedParams = async (encodedParams: Property[], objectVariable: Record<string, any>): Promise<string> => {
  let encodedString = "";
  for (let i = 0; i < encodedParams.length; i++) {
    const queryParam = encodedParams[i];
    if (!queryParam.select) {
      continue; //如果没有选中，则跳过
    }
    if (queryParam.key) {
      const realKey = await convertTemplateValueToRealValue(queryParam.key, objectVariable); 
      const realValue = await convertTemplateValueToRealValue(queryParam.value, objectVariable);
      encodedString += `${realKey}=${realValue}&`;
    }
    
  }
  encodedString = encodedString.replace(/&$/, "");
  return encodedString;
}
export const getFormDataFromFormDataParams = async (formDataParams: Property[], objectVariable: Record<string, any>): Promise<RendererFormDataBody> => {
  const renderedFormDataBody: RendererFormDataBody = [];
  const { variables } = useVariable()
  for (let i = 0; i < formDataParams.length; i++) {
    const formData = formDataParams[i];
    if (formData.key) {
      const realKey = await convertTemplateValueToRealValue(formData.key, objectVariable); 
      const realValue = await convertTemplateValueToRealValue(formData.value, objectVariable);
      if (formData.type === 'file') {
        console.log(variables, formData.value)
      }
      renderedFormDataBody.push({
        id: formData._id,
        key: realKey,
        type: formData.type,
        value: realValue === null ? 'null' : realValue?.toString(),
      })
    }
  }
  return renderedFormDataBody;
}
// export const getFormDataFromFormDataParams = async (formDataParams: Property[], objectVariable: Record<string, any>): Promise<RendererFormDataBody> => {
//   const { changeFormDataErrorInfoById } = useApidoc()
//   const rendererFormDataBody: RendererFormDataBody = [];
//   for (let i = 0; i < formDataParams.length; i++) {
//     const formDataParam = formDataParams[i];
//     if (formDataParam.key) {
//       const realKey = await convertTemplateValueToRealValue(formDataParam.key, objectVariable); 
//       if (formDataParam.type === 'string') {
//         const realValue = await convertTemplateValueToRealValue(formDataParam.value, objectVariable);
//         formData.append(realKey, realValue);
//         rendererFormDataBody.push
//       } else if (formDataParam.type === 'file') {
//         const result = await window.electronAPI?.readFileAsUint8Array(formDataParam.value);
//         if (result && result instanceof Uint8Array) {
//           const fileType = await fileTypeFromBuffer(result);
//           let mimeType = fileType?.mime || ""
//           if (!mimeType && formDataParam.value.match(/\.ts$/)) { //.ts以纯文本处理，不然会被当做视频处理
//             mimeType = 'text/plain';
//           } else if (!mimeType) {
//             mimeType = mime.getType(formDataParam.value) || 'text/plain';
//           }
//           const blob = new Blob([result], { type: mimeType});
//           formData.append(realKey, blob);
//           changeFormDataErrorInfoById(formDataParam._id, '')
//         } else if (result) { //读取错误
//           changeFormDataErrorInfoById(formDataParam._id, result)
//         }
//       }
//     }
//   }
//   return Promise.resolve(formData);
// }
export const getNodeById = (nodes: FlowNode[], nodeId: string): FlowNode | null => {
  let result = null
  const foo = (flowNodes: FlowNode[]) => {
    for (let i = 0; i < flowNodes.length; i += 1) {
      if (flowNodes[i].nodeId === nodeId) {
        result = flowNodes[i];
        return
      }
    }
  }
  foo(nodes);
  return result;
};

export const randomInt = (start: number, end: number): number => {
  if (start > end) {
    console.warn('第二个参数必须大于第一个');
    return 0;
  }
  const range = end - start - 1;
  return Math.floor((Math.random() * range + 1))
}

export const uint8ArrayToBlob = (uint8Array: Uint8Array, mimeType: string): Blob => {
  return new Blob([uint8Array], { type: mimeType });
};

