import { ApidocBodyMode } from "@src/types/global.ts";
import { RendererFormDataBody } from "@src/types/types.ts";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [member: string]: JsonValue };
type JsonArray = JsonValue[];
export type BasicJSON = JsonObject;

export type InitDataMessage = {
  type: 'initData';
  variables: { [key: string]: BasicJSON | JsonValue };
  sessionStorage: Record<string, unknown>;
  localStorage: Record<string, unknown>;
  cookies: Record<string, string>;
  reqeustInfo: {
    _id: string;
    projectId: string;
    name: string;
    item: {
      method: string;
      url: string;
      paths: Record<string, string>;
      queryParams: Record<string, string>;
      requestBody: {
        json: string;
        formdata: RendererFormDataBody;
        urlencoded: Record<string, string>;
        raw: string;
        binary: {
          mode: 'var' | 'file';
          path: string;
        };
      };
      headers: Record<string, string>;
      bodyType: ApidocBodyMode;
    };
  };
};
export type EvalMessage = {
  type: 'eval';
  code: string;
};
export type OnSetQueryParamsEvent = {
  type: 'pre-request-set-query-params';
  value: Record<string, string>;
};
export type OnDeleteQueryParamsEvent = {
  type: 'pre-request-delete-query-params';
  value: Record<string, string>;
};
export type OnSetPathParamsEvent = {
  type: 'pre-request-set-path-params';
  value: Record<string, string>;
};
export type OnDeletePathParamsEvent = {
  type: 'pre-request-delete-path-params';
  value: Record<string, string>;
};
export type OnSetHeadersEvent = {
  type: 'pre-request-set-header-params';
  value: Record<string, string>;
};
export type OnDeleteHeadersEvent = {
  type: 'pre-request-delete-header-params';
  value: Record<string, string>;
};
export type OnSetJsonEvent = {
  type: 'pre-request-set-json-params';
  value: Record<string, string>;
};
export type OnDeleteJsonEvent = {
  type: 'pre-request-delete-json-params';
  value: Record<string, string>;
};
export type OnDeleteUrlencodedEvent = {
  type: 'pre-request-delete-urlencoded';
  value: Record<string, string>;
};
export type OnSetUrlencodedEvent = {
  type: 'pre-request-set-urlencoded';
  value: Record<string, string>;
};
export type OnSetMethodEvent = {
  type: 'pre-request-set-method';
  value: Record<string, string>;
};
export type OnSetUrlEvent = {
  type: 'pre-request-set-url';
  value: Record<string, string>;
};
export type OnSetBodyTypeEvent = {
  type: 'pre-request-set-body-type';
  value: Record<string, string>;
};
export type OnSetRawBodyEvent = {
  type: 'pre-request-set-raw-body';
  value: Record<string, string>;
};
export type OnSetBinaryBodyEvent = {
  type: 'pre-request-set-binary-body';
  value: Record<string, string>;
};
export type OnDeleteBinaryBodyEvent = {
  type: 'pre-request-delete-binary-body';
  value: Record<string, string>;
};
export type OnSetFormdataEvent = {
  type: 'pre-request-set-formdata';
  value: Record<string, string>;
};
export type OnDeleteFormdataEvent = {
  type: 'pre-request-delete-formdata';
  value: Record<string, string>;
};
/*
|--------------------------------------------------------------------------
| sessionStorage、localStorage、cookies、variables
|--------------------------------------------------------------------------
*/
export type OnSetVariableEvent = {
  type: 'pre-request-set-variable';
  value: Record<string, string>;
};
export type OnDeleteVariableEvent = {
  type: 'pre-request-delete-variable';
  value: Record<string, string>;
};
export type OnSetSessionStorageEvent = {
  type: 'pre-request-set-session-storage';
  value: Record<string, string>;
};
export type OnDeleteSessionStorageEvent = {
  type: 'pre-request-delete-session-storage';
  value: Record<string, string>;
};
export type OnSetLocalStorageEvent = {
  type: 'pre-request-set-local-storage';
  value: Record<string, string>;
};
export type OnDeleteLocalStorageEvent = {
  type: 'pre-request-delete-local-storage';
  value: Record<string, string>;
};
export type OnSetCookieEvent = {
  type: 'pre-request-set-cookie';
  value: Record<string, string>;
};
export type OnDeleteCookieEvent = {
  type: 'pre-request-delete-cookie';
  value: Record<string, string>;
};
//========================================================================//
export type OnEvalSuccess = {
  type: 'pre-request-eval-success';
  value: any;
};
export type OnInitSuccess = {
  type: 'pre-request-init-success';
  value: any;
};

export type ReceivedEvent =
  | OnDeletePathParamsEvent
  | OnDeleteQueryParamsEvent
  | OnDeleteHeadersEvent
  | OnSetHeadersEvent
  | OnSetPathParamsEvent
  | OnSetQueryParamsEvent
  | OnSetJsonEvent
  | OnDeleteJsonEvent
  | OnSetUrlencodedEvent
  | OnDeleteUrlencodedEvent
  | OnSetMethodEvent
  | OnSetUrlEvent
  | OnSetRawBodyEvent
  | OnSetFormdataEvent
  | OnDeleteFormdataEvent
  | OnSetBinaryBodyEvent
  | OnSetVariableEvent
  | OnDeleteVariableEvent
  | OnSetSessionStorageEvent
  | OnDeleteSessionStorageEvent
  | OnSetLocalStorageEvent
  | OnDeleteLocalStorageEvent
  | OnSetCookieEvent
  | OnDeleteCookieEvent
  | OnDeleteBinaryBodyEvent
  | OnEvalSuccess
  | OnInitSuccess;
export type AF = {
  nodeId: string;
  projectId: string;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    pathParams: Record<string, string>;
    body: {
      json: BasicJSON;
      urlencoded: Record<string, string>;
      formdata: Record<string, {
        type: 'string' | 'file';
        value: string;
      }>;
      raw: string;
      binary: {
        mode: 'var' | 'file',
        path: string;
      };
    };
    bodyType: 'json' | 'urlencoded' | 'formdata' | 'raw' | 'binary' | 'none';
  };
  variables: { [key: string]: BasicJSON };
  sessionStorage: Record<string, any>;
  localStorage: Record<string, any>;
  cookies: { [key: string]: BasicJSON };
};
