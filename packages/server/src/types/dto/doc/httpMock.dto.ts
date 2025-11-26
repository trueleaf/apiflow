import { Rule, RuleType, getSchema } from '@midwayjs/validate';

/**
 * Mock基础属性（与HTTP节点共用的属性结构）
 */
class MockProperty {
  @Rule(RuleType.string().required())
  _id: string;

  @Rule(RuleType.string().allow(''))
  key: string;

  @Rule(RuleType.string().valid('string').required())
  type: 'string';

  @Rule(RuleType.string().allow(''))
  description: string;

  @Rule(RuleType.string().allow(''))
  value: string;

  @Rule(RuleType.boolean())
  required: boolean;

  @Rule(RuleType.boolean())
  select: boolean;
}

/**
 * Mock请求条件
 */
class MockRequestCondition {
  @Rule(RuleType.array().items(RuleType.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'ALL')).required())
  method: string[];

  @Rule(RuleType.string().required().allow(''))
  url: string;

  @Rule(RuleType.number().required())
  port: number;
}

/**
 * Mock配置
 */
class MockConfig {
  @Rule(RuleType.number().required())
  delay: number;
}

/**
 * SSE事件ID配置
 */
class SseEventId {
  @Rule(RuleType.boolean().required())
  enable: boolean;

  @Rule(RuleType.string().valid('increment', 'random', 'timestamp').required())
  valueMode: 'increment' | 'random' | 'timestamp';
}

/**
 * SSE事件名称配置
 */
class SseEventName {
  @Rule(RuleType.boolean().required())
  enable: boolean;

  @Rule(RuleType.string().allow(''))
  value: string;
}

/**
 * SSE事件数据配置
 */
class SseEventData {
  @Rule(RuleType.string().valid('json', 'string').required())
  mode: 'json' | 'string';

  @Rule(RuleType.string().allow(''))
  value: string;
}

/**
 * SSE重试配置
 */
class SseRetry {
  @Rule(RuleType.boolean().required())
  enable: boolean;

  @Rule(RuleType.number().required())
  value: number;
}

/**
 * SSE事件配置
 */
class SseEvent {
  @Rule(getSchema(SseEventId).required())
  id: SseEventId;

  @Rule(getSchema(SseEventName).required())
  event: SseEventName;

  @Rule(getSchema(SseEventData).required())
  data: SseEventData;

  @Rule(getSchema(SseRetry).required())
  retry: SseRetry;
}

/**
 * SSE配置
 */
class SseConfig {
  @Rule(getSchema(SseEvent).required())
  event: SseEvent;

  @Rule(RuleType.number().required())
  interval: number;

  @Rule(RuleType.number().required())
  maxNum: number;
}

/**
 * JSON配置
 */
class JsonConfig {
  @Rule(RuleType.string().valid('random', 'fixed', 'randomAi').required())
  mode: 'random' | 'fixed' | 'randomAi';

  @Rule(RuleType.string().allow(''))
  fixedData: string;

  @Rule(RuleType.number().required())
  randomSize: number;

  @Rule(RuleType.string().allow(''))
  prompt: string;
}

/**
 * 文本配置
 */
class TextConfig {
  @Rule(RuleType.string().valid('random', 'fixed', 'randomAi').required())
  mode: 'random' | 'fixed' | 'randomAi';

  @Rule(RuleType.string().valid('text/plain', 'html', 'xml', 'yaml', 'csv', 'any').required())
  textType: 'text/plain' | 'html' | 'xml' | 'yaml' | 'csv' | 'any';

  @Rule(RuleType.string().allow(''))
  fixedData: string;

  @Rule(RuleType.number().required())
  randomSize: number;

  @Rule(RuleType.string().allow(''))
  prompt: string;
}

/**
 * 图片配置
 */
class ImageConfig {
  @Rule(RuleType.string().valid('random', 'fixed').required())
  mode: 'random' | 'fixed';

  @Rule(RuleType.string().valid('png', 'jpg', 'webp', 'svg').required())
  imageConfig: 'png' | 'jpg' | 'webp' | 'svg';

  @Rule(RuleType.number().required())
  randomSize: number;

  @Rule(RuleType.number().required())
  randomWidth: number;

  @Rule(RuleType.number().required())
  randomHeight: number;

  @Rule(RuleType.string().allow(''))
  fixedFilePath: string;
}

/**
 * 文件配置
 */
class FileConfig {
  @Rule(RuleType.string().valid('doc', 'docx', 'xls', 'xlsx', 'pdf', 'ppt', 'pptx', 'zip', '7z').required())
  fileType: 'doc' | 'docx' | 'xls' | 'xlsx' | 'pdf' | 'ppt' | 'pptx' | 'zip' | '7z';
}

/**
 * 二进制配置
 */
class BinaryConfig {
  @Rule(RuleType.string().allow(''))
  filePath: string;
}

/**
 * 重定向配置
 */
class RedirectConfig {
  @Rule(RuleType.number().valid(301, 302, 303, 307, 308).required())
  statusCode: 301 | 302 | 303 | 307 | 308;

  @Rule(RuleType.string().allow(''))
  location: string;
}

/**
 * Mock响应头配置
 */
class MockResponseHeaders {
  @Rule(RuleType.boolean().required())
  enabled: boolean;

  @Rule(RuleType.array().items(getSchema(MockProperty)))
  defaultHeaders: MockProperty[];

  @Rule(RuleType.array().items(getSchema(MockProperty)))
  customHeaders: MockProperty[];
}

/**
 * Mock条件配置
 */
class MockConditions {
  @Rule(RuleType.string().allow(''))
  name: string;

  @Rule(RuleType.string().allow(''))
  scriptCode: string;

  @Rule(RuleType.boolean().required())
  enabled: boolean;
}

/**
 * Mock响应项
 */
class MockResponseItem {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.boolean().required())
  isDefault: boolean;

  @Rule(getSchema(MockConditions).required())
  conditions: MockConditions;

  @Rule(RuleType.number().required())
  statusCode: number;

  @Rule(getSchema(MockResponseHeaders).required())
  headers: MockResponseHeaders;

  @Rule(RuleType.string().valid('sse', 'json', 'text', 'image', 'file', 'binary', 'redirect').required())
  dataType: 'sse' | 'json' | 'text' | 'image' | 'file' | 'binary' | 'redirect';

  @Rule(getSchema(SseConfig).required())
  sseConfig: SseConfig;

  @Rule(getSchema(JsonConfig).required())
  jsonConfig: JsonConfig;

  @Rule(getSchema(TextConfig).required())
  textConfig: TextConfig;

  @Rule(getSchema(ImageConfig).required())
  imageConfig: ImageConfig;

  @Rule(getSchema(FileConfig).required())
  fileConfig: FileConfig;

  @Rule(getSchema(BinaryConfig).required())
  binaryConfig: BinaryConfig;

  @Rule(getSchema(RedirectConfig).required())
  redirectConfig: RedirectConfig;
}

/**
 * HttpMock节点数据结构（用于更新文档时的httpMockItem字段）
 */
export class HttpMockItem {
  @Rule(getSchema(MockRequestCondition).required())
  requestCondition: MockRequestCondition;

  @Rule(getSchema(MockConfig).required())
  config: MockConfig;

  @Rule(RuleType.array().items(getSchema(MockResponseItem)).required())
  response: MockResponseItem[];
}
