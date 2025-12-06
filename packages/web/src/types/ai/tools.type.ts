import type {
  HttpNodeRequestMethod,
  ApidocProperty,
  HttpNodeBodyParams,
  HttpNodeResponseParams,
  HttpNodeContentType,
} from '../httpNode/types';

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
