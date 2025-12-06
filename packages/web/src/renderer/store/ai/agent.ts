// 如果当前页面为项目中，则提示词中给出当前上下文为项目相关信息，包含项目名称、项目id、项目创建者、项目最近更新时间、项目节点总数等
// agent模式下，需要在输入框上方展示当前上下文，在项目中则上下文为当前项目名称，如果打开了某个tab，则当前上下文为当前tab名称和tab相关内容信息
// 发送消息时候，需要在消息下方添加上当前上下文信息，允许删除上下文
// httpNodeStore中添加一个patchHttpNodeInfoById,允许根据节点id，更新httpNode任意字段
// 问gpt，patchHttpNodeUrlById tool,我希望告诉大模型url支持变量，应该是在提示词中处理还是直接在tools description中处理

export type ToolExecuteResult = {
  code: number;
  data: any;
};
export type AgentToolType = 'httpNode' | 'websocketNode' | 'httpMockNode' | 'websocketMockNode' | 'projectManager' | 'history' | 'undoRedo' | 'sendRequest';
export type AgentTool = {
  name: string;
  description: string;
  type: AgentToolType;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
  needConfirm: boolean;
  execute?: (args: Record<string, unknown>) => Promise<ToolExecuteResult>;
};

export type OpenAiToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
};

const httpNodeTools: AgentTool[] = [
  {
    name: 'patchHttpNodeMethodById',
    description: '根据ID更改当前httpNode节点的请求方法',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '节点id',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          description: '请求方法',
        },
      },
      required: ['method', 'id'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      // 这里可以添加具体的执行逻辑
      return {
        code: 0,
        data: null,
      };
    },
  },
  {
    name: 'patchHttpNodeUrlById',
    description: '根据ID更改当前httpNode节点的请求地址',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '节点id',
        },
        url: {
          type: 'string',
          description: '请求的URL路径，例如/api/users',
        },
      },
      required: ['id', 'url'],
    },
    needConfirm: false,
  },
  {
    name: 'addHttpNodeQueryParamsById',
    description: '根据ID添加一个query参数到当前httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '节点id',
        },
        queryParams: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: '参数id',
            },
            key: {
              type: 'string',
              description: '字段名称(键)',
            },
            value: {
              type: 'string',
              description: '字段值',
            },
            type: {
              type: 'string',
              const: 'string',
              description: '字段类型',
            },
            required: {
              type: 'boolean',
              description: '是否必填',
            },
            description: {
              type: 'string',
              description: '备注',
            },
            select: {
              type: 'boolean',
              description: '是否选中(选中数据会随请求一起发送)',
            },
          },
          required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
        },
      },
      required: ['id', 'queryParams'],
    },
    needConfirm: false,
  },
];



const tools: AgentTool[] = [];
