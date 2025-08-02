import {
  FlowNode,
  ParsedSSeData,
  Property,
  RendererFormDataBody,
  ChunkWithTimestampe,
} from "@src/types/types";
import Mock from "../../mock/mock";
import { ApidocVariable, SandboxPostMessage } from "@src/types/global";
import SandboxWorker from "@/worker/sandbox.ts?worker&inline";

export const isElectron = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.process === "object" &&
    window.process.type === "renderer"
  ) {
    return true;
  }
  if (
    typeof process !== "undefined" &&
    typeof process.versions === "object" &&
    !!process.versions.electron
  ) {
    return true;
  }
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return true;
  }
  return false;
};
export const updateObject = <T extends Partial<Record<string, unknown>>>(
  draft: T,
  payload: T
) => {
  (Object.keys(payload) as Array<keyof T>).forEach((field) => {
    const value = payload[field];
    if (value != null) {
      draft[field] = value;
    }
  });
};

export const evalCode = (code: string) => {
  return new Promise((resolve, reject) => {
    const worker = new SandboxWorker();
    worker.onmessage = (event: MessageEvent<SandboxPostMessage>) => {
      if (event.data.type === "error") {
        reject(event.data.msg);
      } else if (event.data.type === "evalSuccess") {
        resolve(event.data.data);
      }
    };
    worker.onerror = (error) => {
      reject(error.message);
    };
    worker.postMessage({
      type: "eval",
      code,
    });
  });
};

export const getObjectVariable = async (variables: ApidocVariable[]) => {
  const objectVariable: Record<string, any> = {};
  for (let i = 0; i < variables.length; i++) {
    const varInfo = variables[i];
    const { name, value, fileValue } = varInfo;
    if (varInfo.type === "string") {
      objectVariable[name] = value;
    } else if (varInfo.type === "number") {
      objectVariable[name] = Number(value);
    } else if (varInfo.type === "boolean") {
      objectVariable[name] = value === "true" ? true : false;
    } else if (varInfo.type === "null") {
      objectVariable[name] = null;
    } else if (varInfo.type === "any") {
      objectVariable[name] = await evalCode(value);
    } else if (varInfo.type === "file") {
      objectVariable[name] = fileValue.path;
    }
  }
  return Promise.resolve(objectVariable);
};
/*
|--------------------------------------------------------------------------
| 将模板转换为字符串
| 变量类型一：{{ variable }}
| 变量类型二：{{ @variable }} mock类型
| 变量类型三：@xxx mock类型
|--------------------------------------------------------------------------
|
*/
export const convertTemplateValueToRealValue = async (
  stringValue: string,
  objectVariable: Record<string, any>
) => {
  const isSingleMustachTemplate = stringValue.match(
    /^\s*\{\{\s*([^}\s]+)\s*\}\}\s*$/
  ); // 这种属于单模板，返回实际值，可能是数字、对象等"{{ variable }}"
  if (isSingleMustachTemplate) {
    const variableName = isSingleMustachTemplate[1];
    if (variableName.startsWith("@")) {
      return Mock.mock(variableName);
    }
    if (objectVariable[variableName] !== undefined) {
      return objectVariable[variableName];
    }
    return isSingleMustachTemplate[0];
  }

  const withoutVaribleString = stringValue.replace(
    /(?<!\\)\{\{\s*(.*?)\s*\}\}/g,
    ($1, variableName: string) => {
      const isVariableExist = variableName in objectVariable;
      if (variableName.startsWith("@")) {
        return Mock.mock(variableName);
      }
      if (!isVariableExist) {
        return $1;
      }
      const value = objectVariable[variableName];
      return value;
    }
  );

  const withoutMockString = withoutVaribleString.replace(
    /(@[^@]+)/g,
    (_, variableName: string) => {
      return Mock.mock(variableName);
    }
  );

  const withoutEscapeString = withoutMockString.replace(
    /((\\)(?=\{\{))|(\\)(?=@)/g,
    ""
  );
  return withoutEscapeString;
};
export const getQueryStringFromQueryParams = async (
  queryParams: Property[],
  objectVariable: Record<string, any>
): Promise<string> => {
  let queryString = "";
  for (let i = 0; i < queryParams.length; i++) {
    const queryParam = queryParams[i];
    if (!queryParam.select) {
      continue; //如果没有选中，则跳过
    }
    if (queryParam.key) {
      const realKey = await convertTemplateValueToRealValue(
        queryParam.key,
        objectVariable
      );
      const realValue = await convertTemplateValueToRealValue(
        queryParam.value,
        objectVariable
      );
      queryString += `${realKey}=${realValue}&`;
    }
  }
  queryString = queryString.replace(/&$/, "");
  if (queryString) {
    queryString = `?${queryString}`;
  }
  return queryString;
};
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
export const getEncodedStringFromEncodedParams = async (
  encodedParams: Property[],
  objectVariable: Record<string, any>
): Promise<string> => {
  let encodedString = "";
  for (let i = 0; i < encodedParams.length; i++) {
    const queryParam = encodedParams[i];
    if (!queryParam.select) {
      continue; //如果没有选中，则跳过
    }
    if (queryParam.key) {
      const realKey = await convertTemplateValueToRealValue(
        queryParam.key,
        objectVariable
      );
      const realValue = await convertTemplateValueToRealValue(
        queryParam.value,
        objectVariable
      );
      encodedString += `${realKey}=${realValue}&`;
    }
  }
  encodedString = encodedString.replace(/&$/, "");
  return encodedString;
};
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
export const getNodeById = (
  nodes: FlowNode[],
  nodeId: string
): FlowNode | null => {
  let result = null;
  const foo = (flowNodes: FlowNode[]) => {
    for (let i = 0; i < flowNodes.length; i += 1) {
      if (flowNodes[i].nodeId === nodeId) {
        result = flowNodes[i];
        return;
      }
    }
  };
  foo(nodes);
  return result;
};

export const randomInt = (start: number, end: number): number => {
  if (start > end) {
    console.warn("第二个参数必须大于第一个");
    return 0;
  }
  const range = end - start - 1;
  return Math.floor(Math.random() * range + 1);
};

export const uint8ArrayToBlob = (
  uint8Array: Uint8Array,
  mimeType: string
): Blob => {
  return new Blob([uint8Array], { type: mimeType });
};

const parseSseBlock = (block: string, timestamp?: number) => {
  const lines = block.split(/\r?\n/);
  const msg: ParsedSSeData = {
    id: "",
    type: "",
    data: '',
    retry: 0,
    timestamp: timestamp || Date.now(),
    dataType: 'normal',
    rawBlock: block,
  };

  for (let line of lines) {
    if (line === '' || line.startsWith(':')) continue; // 空行或注释行忽略
    const [field, ...rest] = line.split(':');
    const value = rest.join(':').replace(/^ /, '');  // 去掉冒号后可能的空格

    switch (field) {
      case 'data':
        // 多行 data 要用 "\n" 拼接
        msg.data += (msg.data ? '\n' : '') + value;
        break;
      case 'event':
        msg.event = value;
        break;
      case 'id':
        msg.id = value;
        break;
      case 'retry':
        const n = parseInt(value, 10);
        if (!isNaN(n)) msg.retry = n;
        break;
    }
  }

  return msg;
}

export const parseChunkList = (chunkList: ChunkWithTimestampe[]): ParsedSSeData[] => {
  const parsedData: ParsedSSeData[] = [];

  // 尝试使用 TextDecoder，如果失败则使用二进制模式
  let decoder: TextDecoder | null = null;
  let useBinaryMode = false;

  try {
    decoder = new TextDecoder('utf-8', { fatal: false });
  } catch (error) {
    useBinaryMode = true;
  }

  if (useBinaryMode) {
    // 二进制模式：将所有 chunk 转换为十六进制字符串
    const hexBlocks: string[] = [];
    let firstTimestamp = Date.now();
    for (let streamChunk of chunkList) {
      const hexString = Array.from(streamChunk.chunk)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      hexBlocks.push(hexString);
      if (firstTimestamp === Date.now()) {
        firstTimestamp = streamChunk.timestamp;
      }
    }

    // 创建一个二进制类型的 ParsedSSeData
    const binaryMsg: ParsedSSeData = {
      id: "",
      type: "",
      data: '',
      retry: 0,
      timestamp: firstTimestamp,
      dataType: 'binary',
      rawBlock: hexBlocks.join(''),
    };

    parsedData.push(binaryMsg);
    return parsedData;
  }

  // 正常的文本解码模式
  let buffer = '';
  for (let streamChunk of chunkList) {
    buffer += decoder!.decode(streamChunk.chunk, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const msg = parseSseBlock(block, streamChunk.timestamp);
      parsedData.push(msg);
    }
  }
  buffer += decoder!.decode();
  if (buffer.includes('\n\n')) {
    // 对于最后的 buffer，使用最后一个 chunk 的时间戳（如果有的话）
    const lastTimestamp = chunkList.length > 0 ? chunkList[chunkList.length - 1].timestamp : Date.now();
    buffer.split(/\r?\n\r?\n/).forEach(block => {
      if (block.trim()) parsedData.push(parseSseBlock(block, lastTimestamp));
    });
  }

  return parsedData;
};

