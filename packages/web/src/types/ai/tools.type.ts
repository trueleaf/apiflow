import type {
  HttpNodeRequestMethod,
  ApidocProperty,
  HttpNodeBodyParams,
  HttpNodeResponseParams,
  HttpNodeContentType,
} from '../httpNode/types';
import type { Method } from 'got';

// 创建HttpNode时的可选item参数
export type CreateHttpNodeItemOptions = {
  method?: HttpNodeRequestMethod;
  url?: {
    prefix?: string;
    path?: string;
  };
  paths?: ApidocProperty<'string'>[];
  queryParams?: ApidocProperty<'string'>[];
  requestBody?: Partial<HttpNodeBodyParams>;
  responseParams?: HttpNodeResponseParams[];
  headers?: ApidocProperty<'string'>[];
  contentType?: HttpNodeContentType;
};
// 创建HttpNode时的参数
export type CreateHttpNodeOptions = {
  projectId: string;
  name: string;
  pid?: string;
  description?: string;
  version?: string;
  creator?: string;
  maintainer?: string;
  item?: CreateHttpNodeItemOptions;
  preRequest?: { raw: string };
  afterRequest?: { raw: string };
};
// 创建HttpMockNode时的参数
export type CreateHttpMockNodeOptions = {
  projectId: string;
  name: string;
  pid?: string;
  description?: string;
  method?: (Method | 'ALL')[];
  url?: string;
  port?: number;
  delay?: number;
};
// 创建WebsocketNode时的参数
export type CreateWebsocketNodeOptions = {
  projectId: string;
  name: string;
  pid?: string;
  description?: string;
  protocol?: 'ws' | 'wss';
  url?: {
    prefix?: string;
    path?: string;
  };
  queryParams?: ApidocProperty<'string'>[];
  headers?: ApidocProperty<'string'>[];
};
// 创建WebsocketMockNode时的参数
export type CreateWebsocketMockNodeOptions = {
  projectId: string;
  name: string;
  pid?: string;
  description?: string;
  path?: string;
  port?: number;
  delay?: number;
  echoMode?: boolean;
  responseContent?: string;
};
