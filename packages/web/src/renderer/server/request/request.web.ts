import { GotRequestOptions, ResponseInfo, ChunkWithTimestampe } from '@src/types';
import { appSettingsCache } from '@/cache/settings/appSettingsCache';

type ResponseWrapperResult = { code: number; msg: string; data: unknown };
type ProxyControllerResult = { success: boolean; data?: unknown; message?: string };
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
//兼容服务端响应包装：{ code, msg, data }
const unwrapResponseWrapper = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  if (!('code' in value) || !('data' in value)) return value;
  const code = (value as Partial<ResponseWrapperResult>).code;
  if (typeof code !== 'number') return value;
  if (code !== 0) {
    const msg = (value as Partial<ResponseWrapperResult>).msg;
    throw new Error(typeof msg === 'string' ? msg : '请求失败');
  }
  return (value as ResponseWrapperResult).data;
};
const resolveProxyControllerResult = (value: unknown): ProxyControllerResult => {
  const unwrapped = unwrapResponseWrapper(value);
  if (!isRecord(unwrapped)) throw new Error('请求失败');
  const success = unwrapped.success;
  if (typeof success !== 'boolean') throw new Error('请求失败');
  const message = typeof unwrapped.message === 'string' ? unwrapped.message : '请求失败';
  if (success !== true) throw new Error(message);
  return { success: true, data: unwrapped.data };
};

//将GotRequestOptions转换为代理请求参数
const convertToProxyParams = (options: GotRequestOptions) => {
  const proxyParams: Record<string, unknown> = {
    url: options.url,
    method: options.method,
    headers: options.headers,
    timeout: options.timeout,
    followRedirect: options.followRedirect,
    maxRedirects: options.maxRedirects,
    bodyType: 'none',
    enableStream: false,
    projectId: options.projectId,
    environmentId: options.environmentId,
  };

  //处理body类型
  if (options.body) {
    if (options.body.type === 'json') {
      proxyParams.bodyType = 'json';
      proxyParams.body = options.body.value;
    } else if (options.body.type === 'urlencoded') {
      proxyParams.bodyType = 'urlencoded';
      proxyParams.body = options.body.value;
    } else if (options.body.type === 'raw') {
      proxyParams.bodyType = 'raw';
      proxyParams.body = options.body.value;
    } else if (options.body.type === 'formdata') {
      proxyParams.bodyType = 'formdata';
      proxyParams.formDataFields = options.body.value;
    } else if (options.body.type === 'binary') {
      proxyParams.bodyType = 'binary';
      proxyParams.binaryData = options.body.value;
    }
  }

  return proxyParams;
};

//使用Fetch API处理SSE流式响应
const handleSSEStream = async (
  url: string,
  params: Record<string, unknown>,
  options: GotRequestOptions
) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...params, enableStream: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    //触发onResponse回调
    const responseInfo: Partial<ResponseInfo> = {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      contentType: response.headers.get('content-type') || '',
      contentLength: parseInt(response.headers.get('content-length') || '0'),
      finalRequestUrl: response.url,
      ip: '',
      redirectList: [],
      timings: {} as ResponseInfo['timings'],
      rt: 0,
      bodyByteLength: 0,
      requestData: {
        url: params.url as string,
        method: params.method as string,
        headers: params.headers as Record<string, string>,
        host: new URL(params.url as string).host,
        body: '',
      },
      responseData: {
        canApiflowParseType: 'textEventStream',
        jsonData: '',
        textData: '',
        errorData: '',
        fileData: {
          url: '',
          name: '',
          ext: '',
        },
        streamData: []
      }
    };

    options.onResponse?.(responseInfo as ResponseInfo);

    //读取流数据
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    let loadedLength = 0;
    const startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new Uint8Array(value);
      loadedLength += chunk.byteLength;

      const chunkWithTimestamp: ChunkWithTimestampe = {
        chunk,
        timestamp: Date.now()
      };

      options.onResponseData?.(chunkWithTimestamp, loadedLength, 0);
    }

    //触发onResponseEnd回调
    const endTime = Date.now();
    responseInfo.rt = endTime - startTime;
    responseInfo.bodyByteLength = loadedLength;
    responseInfo.body = new Uint8Array(0); //SSE不缓存完整body

    options.onResponseEnd?.(responseInfo as ResponseInfo);
  } catch (error) {
    options.onError(error as Error);
  }
};

//使用Fetch API处理普通HTTP请求
const handleNormalRequest = async (
  url: string,
  params: Record<string, unknown>,
  options: GotRequestOptions
) => {
  try {
    const startTime = Date.now();

    //准备请求体
    let requestBody: BodyInit | undefined;
    let requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    //处理FormData类型
    if (params.bodyType === 'formdata' && params.formDataFields) {
      const formData = new FormData();
      const fields = params.formDataFields as Array<{
        id: string;
        key: string;
        type: 'string' | 'file';
        value: string;
      }>;

      for (const field of fields) {
        if (field.type === 'string') {
          formData.append(field.key, field.value);
        } else if (field.type === 'file') {
          //在Web模式下，文件需要通过File对象上传
          //这里需要用户选择文件，暂时无法支持路径方式
          console.warn('Web模式下暂不支持文件上传');
        }
      }

      requestBody = formData;
      //FormData会自动设置Content-Type，不需要手动设置
      requestHeaders = {};
    } else if (params.bodyType === 'binary') {
      console.warn('Web模式下暂不支持Binary请求');
      throw new Error('Web模式下暂不支持Binary请求');
    } else {
      requestBody = JSON.stringify(params);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    const proxyResult = resolveProxyControllerResult(result);
    if (!isRecord(proxyResult.data)) throw new Error('请求失败');
    const proxyResponse = proxyResult.data;

    //构建ResponseInfo
    const responseInfo: ResponseInfo = {
      id: '',
      apiId: '',
      requestId: '',
      headers: proxyResponse.headers as ResponseInfo['headers'],
      contentLength: proxyResponse.contentLength as number,
      finalRequestUrl: proxyResponse.finalRequestUrl as string,
      statusCode: proxyResponse.statusCode as number,
      isFromCache: false,
      contentType: proxyResponse.contentType as string,
      ip: proxyResponse.ip as string,
      redirectList: (proxyResponse.redirectList as ResponseInfo['redirectList']) || [],
      timings: (proxyResponse.timings as ResponseInfo['timings']) || {},
      rt: (proxyResponse.rt as number) || (Date.now() - startTime),
      retryCount: 0,
      bodyByteLength: proxyResponse.bodyByteLength as number,
      body: new Uint8Array(0),
      requestData: proxyResponse.requestData as ResponseInfo['requestData'],
      responseData: {
        canApiflowParseType: 'none',
        jsonData: '',
        textData: '',
        errorData: '',
        fileData: {
          url: '',
          name: '',
          ext: '',
        },
        streamData: []
      }
    };

    //解析响应体
    if (typeof proxyResponse.body === 'string' && proxyResponse.body) {
      let bodyBuffer: Uint8Array;

      //body 统一为 base64 编码的字符串，需要解码为二进制数据
      //尝试从 base64 解码
      try {
        const binaryString = atob(proxyResponse.body);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        bodyBuffer = bytes;

        //尝试解码为文本并判断类型
        const textContent = new TextDecoder().decode(bodyBuffer);

        //根据Content-Type判断类型
        if (responseInfo.contentType.includes('application/json')) {
          responseInfo.responseData.canApiflowParseType = 'json';
          responseInfo.responseData.jsonData = textContent;
        } else if (responseInfo.contentType.includes('text/html')) {
          responseInfo.responseData.canApiflowParseType = 'html';
          responseInfo.responseData.textData = textContent;
        } else if (responseInfo.contentType.includes('text/')) {
          responseInfo.responseData.canApiflowParseType = 'text';
          responseInfo.responseData.textData = textContent;
        } else if (responseInfo.contentType.includes('image/')) {
          responseInfo.responseData.canApiflowParseType = 'image';
          const blob = new Blob([bodyBuffer as unknown as BlobPart], { type: responseInfo.contentType });
          responseInfo.responseData.fileData.url = URL.createObjectURL(blob);
        } else if (responseInfo.contentType.includes('application/pdf')) {
          responseInfo.responseData.canApiflowParseType = 'pdf';
          const blob = new Blob([bodyBuffer as unknown as BlobPart], { type: 'application/pdf' });
          responseInfo.responseData.fileData.url = URL.createObjectURL(blob);
        } else {
          responseInfo.responseData.canApiflowParseType = 'unknown';
          responseInfo.responseData.textData = `Content-Type: ${responseInfo.contentType}`;
        }
      } catch (e) {
        //base64 解码失败，当作错误处理
        responseInfo.responseData.canApiflowParseType = 'text';
        responseInfo.responseData.errorData = 'Failed to decode response body: ' + (e as Error).message;
        bodyBuffer = new Uint8Array(0);
      }

      responseInfo.body = bodyBuffer;
    }

    //触发回调
    options.onResponse?.(responseInfo);
    options.onResponseEnd?.(responseInfo);
  } catch (error) {
    options.onError(error as Error);
  }
};

//Web模式下的HTTP请求入口
export const webRequest = async (options: GotRequestOptions) => {
  const proxyServerUrl = appSettingsCache.getProxyServerUrl().trim();
  const normalizedProxyServerUrl = proxyServerUrl.endsWith('/') ? proxyServerUrl.slice(0, -1) : proxyServerUrl;
  const proxyUrl = normalizedProxyServerUrl ? `${normalizedProxyServerUrl}/api/proxy/http` : '/api/proxy/http';

  //转换为代理参数
  const params = convertToProxyParams(options);

  //检测是否为SSE（根据Accept头判断）
  const acceptHeader = options.headers['accept'] || '';
  const isSSE = acceptHeader.includes('text/event-stream') ||
    (options.body?.type === 'json' &&
      typeof options.body.value === 'string' &&
      options.body.value.includes('"stream":true'));

  if (isSSE) {
    //SSE流式请求
    await handleSSEStream(proxyUrl, params, options);
  } else {
    //普通HTTP请求
    await handleNormalRequest(proxyUrl, params, options);
  }
};
