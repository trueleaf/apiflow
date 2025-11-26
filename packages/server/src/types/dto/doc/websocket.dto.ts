import { Rule, RuleType, getSchema } from '@midwayjs/validate';

/**
 * WebSocket消息类型
 */
export type WebsocketMessageType = 'text' | 'json' | 'xml' | 'html' | 'binary-base64' | 'binary-hex';

/**
 * WebSocket消息块
 */
class WebsocketMessageBlock {
  @Rule(RuleType.string().required())
  id: string;

  @Rule(RuleType.string().allow(''))
  name: string;

  @Rule(RuleType.string().allow(''))
  content: string;

  @Rule(RuleType.string().valid('text', 'json', 'xml', 'html', 'binary-base64', 'binary-hex').required())
  messageType: WebsocketMessageType;

  @Rule(RuleType.number().required())
  order: number;
}

/**
 * WebSocket URL信息
 */
class WebsocketUrl {
  @Rule(RuleType.string().allow(''))
  path: string;

  @Rule(RuleType.string().allow(''))
  prefix: string;
}

/**
 * WebSocket基础属性（与HTTP节点共用的属性结构）
 */
class WebsocketProperty {
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
 * WebSocket配置
 */
class WebsocketConfig {
  @Rule(RuleType.boolean().required())
  autoSend: boolean;

  @Rule(RuleType.number().required())
  autoSendInterval: number;

  @Rule(RuleType.string().allow(''))
  autoSendContent: string;

  @Rule(RuleType.string().valid('text', 'json', 'xml', 'html', 'binary-base64', 'binary-hex').required())
  autoSendMessageType: WebsocketMessageType;

  @Rule(RuleType.boolean().required())
  autoReconnect: boolean;
}

/**
 * WebSocket请求脚本
 */
class WebsocketRequestScript {
  @Rule(RuleType.string().allow(''))
  raw: string;
}

/**
 * WebSocket Item信息（接口相关元素）
 */
class WebsocketItemInfo {
  @Rule(RuleType.string().valid('ws', 'wss').required())
  protocol: 'ws' | 'wss';

  @Rule(getSchema(WebsocketUrl).required())
  url: WebsocketUrl;

  @Rule(RuleType.array().items(getSchema(WebsocketProperty)))
  queryParams: WebsocketProperty[];

  @Rule(RuleType.array().items(getSchema(WebsocketProperty)))
  headers: WebsocketProperty[];

  @Rule(RuleType.array().items(getSchema(WebsocketMessageBlock)))
  messageBlocks: WebsocketMessageBlock[];
}

/**
 * WebSocket节点数据结构（用于更新文档时的websocketItem字段）
 */
export class WebsocketItem {
  @Rule(getSchema(WebsocketItemInfo).required())
  item: WebsocketItemInfo;

  @Rule(getSchema(WebsocketConfig).required())
  config: WebsocketConfig;

  @Rule(getSchema(WebsocketRequestScript))
  preRequest: WebsocketRequestScript;

  @Rule(getSchema(WebsocketRequestScript))
  afterRequest: WebsocketRequestScript;
}
