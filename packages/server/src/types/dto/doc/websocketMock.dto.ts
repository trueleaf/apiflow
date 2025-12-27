import { Rule, RuleType, getSchema } from '@midwayjs/validate';

class WebsocketMockRequestCondition {
  @Rule(RuleType.string().required().allow(''))
  path: string;

  @Rule(RuleType.number().required())
  port: number;
}

class WebsocketMockConfig {
  @Rule(RuleType.number().required())
  delay: number;

  @Rule(RuleType.boolean().required())
  echoMode: boolean;
}

class WebsocketMockResponse {
  @Rule(RuleType.string().required().allow(''))
  content: string;
}

export class WebsocketMockItem {
  @Rule(getSchema(WebsocketMockRequestCondition).required())
  requestCondition: WebsocketMockRequestCondition;

  @Rule(getSchema(WebsocketMockConfig).required())
  config: WebsocketMockConfig;

  @Rule(getSchema(WebsocketMockResponse).required())
  response: WebsocketMockResponse;
}
