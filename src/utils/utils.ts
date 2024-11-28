import { FlowNode, Property, ResponseInfo } from "@src/types/types";
import Mock from "../mock/mock";
import JSON5 from 'json5'
import { ApidocVariable, SandboxPostMessage } from "@src/types/global";
import { reject } from "lodash";



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
  const worker = new Worker(new URL('@/worker/sandbox.ts', import.meta.url));
  return new Promise((resolve, reject) => {
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
      // objectVariable[name] = JSON5.parse(fileValue);
    }
  }
  return Promise.resolve(objectVariable);
}
export const convertTemplateValueToRealValue = (stringValue: string, variables: ApidocVariable[]) => {
  getObjectVariable(variables).then((objectVariable) => {
    console.log('obj', variables, objectVariable)
  })
  // const withoutMockExpression = expression.replace(/([$@][^)]+\))|([$@][^\s+\-\*\/\?>=<]+)/g, (mockExpression) => {
  //   if (mockExpression.startsWith("@")) {
  //     return Mock.mock(mockExpression);
  //   }
  //   if (mockExpression.startsWith("$")) {
  //     return Mock.mock(mockExpression.replace(/^\$/, "@"));
  //   }
  //   return ''
  // })
  const replaceVariableString = stringValue.replace(/(?<!\\)\{\{\s*(.*?)\s*\}\}/g, ($1, variableName: string) => {
    
    // try {
    //   const evalData = eval(`
    //     (function () {
    //       try {
    //         ${variableString}
    //         const result = ${withoutMockExpression}
    //         return result;
    //       } catch {
    //         return "${$1}"
    //       }
    //     }())
    //   `)
    //   if (typeof evalData === 'number') {
    //     isNumber = true;
    //   }
    //   if (typeof evalData === 'boolean') {
    //     isNumber = true;
    //   }
    //   if (Array.isArray(evalData)) {
    //     isArray = true;
    //     return `[${convertArray(evalData)}]`
    //   }
    //   if (!Array.isArray(evalData) && typeof evalData === 'object') {
    //     isObject = true;
    //     return `{${convertObject(evalData)}}`
    //   }
    //   return evalData
    // } catch(error) {
    //   console.error(error)
    //   return $1;
    // }
  })
  
  return replaceVariableString
}
export const getQueryStringFromQueryParams = (queryParams: Property[], variables: ApidocVariable[]): string => {
  let queryString = "";
  queryParams.forEach((v) => {
    if (v.key) {
      queryString += `${convertTemplateValueToRealValue(v.key, variables)}=${convertTemplateValueToRealValue(v.value, variables)}&`;
    }
  });
  queryString = queryString.replace(/&$/, "");
  if (queryString) {
    queryString = `?${queryString}`;
  }
  return queryString;
}
export const convertPathParamsToPathString = (pathParams: Property[], globalVariables: Record<string, any>): string => {
  let pathString = "";
  pathParams.forEach((v) => {
    if (v.key) {
      pathString += `${convertTemplateValueToRealValue(v.value, globalVariables)}/`;
    }
  });
  pathString = pathString.replace(/\/$/, "");
  return pathString;
}
export const convertPropertyToObject = (props: Property[], globalVariables: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (let i = 0; i < props.length; i += 1) {
    const prop = props[i];
    if (prop.key) {
      result[prop.key] = convertTemplateValueToRealValue(
        prop.value,
        globalVariables
      );
    }
  }
  return result;
};
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
export const generateEmptyResponse = (): ResponseInfo => {
  return {
    id: '',
    apiId: '',
    requestId: '',
    headers: {},
    contentType: '',
    originRequestUrl: '',
    finalRequestUrl: '',
    redirectUrls: [],
    ip: '',
    isFromCache: false,
    statusCode: 0,
    timings: {
      start: 0,
      socket: 0,
      lookup: 0,
      connect: 0,
      secureConnect: 0,
      upload: 0,
      response: 0,
      end: 0,
      error: 0,
      abort: 0,
      phases: {
          wait: 0,
          dns: 0,
          tcp: 0,
          tls: 0,
          request: 0,
          firstByte: 0,
          download: 0,
          total: 0,
      }
    },
    mimeType: '',
    dataType: 'unknown',
    retryCount: 0,
    body: null,
    finishTime: '',
    bodySize: 0
  }
}
export const randomInt = (start: number, end: number): number => {
  if (start > end) {
    console.warn('第二个参数必须大于第一个');
    return 0;
  }
  const range = end - start - 1;
  return Math.floor((Math.random() * range + 1))
}