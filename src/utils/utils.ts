import { FlowNode, Property, ResponseInfo } from "@src/types/types";
import Mock from "../mock/mock";
import JSON5 from 'json5'



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
export const convertStringValueToRealValue = (stringValue: string, context: Record<string, any>) => {
  const cpContext = JSON.parse(JSON.stringify(context)) as Record<string, any>
  let variableString = "";
  const convertArray = (arr: any[]) => {
    let tempStrValue = ""
    arr.forEach(val => {
      if (typeof val === 'string') {
        tempStrValue += `"${val}",`
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        tempStrValue += `${val},`
      } else if (typeof val === 'object' && !Array.isArray(val)) {
        tempStrValue += `{\n${convertObject(val)}\n},`
      } else if (Array.isArray(val)) {
        tempStrValue += `[\n${convertArray(val)}\n],`
      }
    })
    return tempStrValue;
  }
  const convertObject = (obj: Record<string, any>, preStr = '') => {
    Object.keys(obj).forEach(field => {
      let value = obj[field];
      if (typeof value === 'string') {
        preStr += `${field}: "${value}",`
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        preStr += `${field}: ${value},`
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        preStr += `${field}: {\n${convertObject(value)}\n},`;
      }
      else if (Array.isArray(value)) {
        let tempStrValue = ""
        value.forEach(val => {
          if (typeof val === 'string') {
            tempStrValue += `"${val}",`
          } else if (typeof val === 'number' || typeof val === 'boolean') {
            tempStrValue += `${val},`
          } else if (typeof val === 'object' && !Array.isArray(val)) {
            tempStrValue += `{\n${convertObject(val)}\n}`
          } else if (Array.isArray(val)) {
            tempStrValue += `[\n${convertArray(val)}\n]`
          }
        })
        preStr += `${field}: [\n${tempStrValue}\n]`;
      }
    })
    return preStr
  } 
  if (Array.isArray(cpContext)) {
    console.warn('context不能为数组')
  } else {
    Object.keys(cpContext).forEach(field => {
      let value = cpContext[field];
      if (typeof value === 'string') {
        value = `"${value}"`
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        value = `${value}`
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        value = `{\n${convertObject(value)}\n}`;
      } else if (Array.isArray(value)) {
        let tempStrValue = ""
        value.forEach(val => {
          if (typeof val === 'string') {
            tempStrValue += `"${val}",`
          } else if (typeof val === 'number' || typeof val === 'boolean') {
            tempStrValue += `${val},`
          } else if (typeof val === 'object' && !Array.isArray(val)) {
            tempStrValue += `{\n${convertObject(val)}\n},`
          } else if (Array.isArray(val)) {
            tempStrValue += `[\n${convertArray(val)}\n],`
          }
        })
        value = `[\n${tempStrValue}\n]`;
      }
      variableString += `const ${field} = ${value};\n`
    })
  }
  let isSingleExpression = false;
  let isNumber = false;
  let isBoolean = false;
  let isArray = false;
  let isObject = false;
  if (stringValue.match(/\{\{[^}]*(\}\})$/)) {
    isSingleExpression = true;
  }
  const replacedVariableString = stringValue.replace(/\{\{\s*(.*?)\s*\}\}/g, ($1, expression: string) => {
    const withoutMockExpression = expression.replace(/([$@][^)]+\))|([$@][^\s+\-\*\/\?>=<]+)/g, (mockExpression) => {
      if (mockExpression.startsWith("@")) {
        return Mock.mock(mockExpression);
      }
      if (mockExpression.startsWith("$")) {
        return Mock.mock(mockExpression.replace(/^\$/, "@"));
      }
      return ''
    })
    try {
      const evalData = eval(`
        (function () {
          try {
            ${variableString}
            const result = ${withoutMockExpression}
            return result;
          } catch {
            return "${$1}"
          }
        }())
      `)
      if (typeof evalData === 'number') {
        isNumber = true;
      }
      if (typeof evalData === 'boolean') {
        isNumber = true;
      }
      if (Array.isArray(evalData)) {
        isArray = true;
        return `[${convertArray(evalData)}]`
      }
      if (!Array.isArray(evalData) && typeof evalData === 'object') {
        isObject = true;
        return `{${convertObject(evalData)}}`
      }
      return evalData
    } catch(error) {
      console.error(error)
      return $1;
    }
  })
  if (isSingleExpression && isNumber) {
    return Number(replacedVariableString)
  }
  if (isSingleExpression && isBoolean && replacedVariableString === 'true') {
    return true
  }
  if (isSingleExpression && isBoolean && replacedVariableString === 'false') {
    return false
  }
  if (isSingleExpression && isObject) {
    return JSON5.parse(replacedVariableString)
  }
  if (isSingleExpression && isArray) {
    return JSON5.parse(replacedVariableString)
  }
  return replacedVariableString
}
export const convertQueryParamsToQueryString = (queryParams: Property[], globalVariables: Record<string, any>): string => {
  let queryString = "";
  queryParams.forEach((v) => {
    if (v.key) {
      queryString += `${v.key}=${convertStringValueToRealValue(v.value, globalVariables)}&`;
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
      pathString += `${convertStringValueToRealValue(v.value, globalVariables)}/`;
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
      result[prop.key] = convertStringValueToRealValue(
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