import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "urlencoded参数",
  description: "urlencoded参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "urlencoded参数key输入值以后,如果不存在next节点,则自动新增一行数据,自动新增数据需要被选中",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已选择body类型为urlencoded"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在urlencoded参数的key输入框中输入username"
      },
      {
        "id": "2",
        "name": "点击key输入框外的区域使其失焦"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "key值为username,自动新增一行空的参数行"
      },
      {
        "id": "2",
        "name": "新增的行被自动选中"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "自动新增逻辑在urlencoded编辑器中实现"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "与query和formdata保持一致的行为"
      }
    ]
  },
  {
    "purpose": "urlencoded参数key,value,description输入值以后,调用127.0.0.1:{环境变量中的端口}/echo,返回结果urlencoded参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo,method为POST"
      },
      {
        "id": "3",
        "name": "已选择body类型为urlencoded"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "添加参数:key=\"username\", value=\"admin\""
      },
      {
        "id": "2",
        "name": "添加参数:key=\"password\", value=\"secret\""
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求Content-Type为application/x-www-form-urlencoded"
      },
      {
        "id": "2",
        "name": "服务器接收到正确的urlencoded参数"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "urlencoded参数正确编码和发送"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持多个参数的同时发送"
      }
    ]
  },
  {
    "purpose": "urlencoded参数key,value支持变量(需验证所有的变量类型),调用127.0.0.1:{环境变量中的端口}/echo,返回结果urlencoded参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已配置变量:account=\"user123\""
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在urlencoded参数中添加:key=\"user\", value=\"{{account}}\""
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量被正确替换为account的值"
      },
      {
        "id": "2",
        "name": "服务器接收到:user=user123"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "urlencoded参数支持变量替换"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应验证多种变量类型"
      }
    ]
  },
  {
    "purpose": "urlencoded参数key,value支持mock(需验证所有的mock情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果urlencoded参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已配置mock:@name,@email"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在urlencoded参数中添加:key=\"name\", value=\"@name\""
      },
      {
        "id": "2",
        "name": "添加:key=\"email\", value=\"@email\""
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "mock数据被正确生成和替换"
      },
      {
        "id": "2",
        "name": "服务器接收到生成后的mock数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "urlencoded参数支持mock"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "需验证所有支持的mock函数"
      }
    ]
  },
  {
    "purpose": "urlencoded参数key,value支持混合变量(需验证所有的混合情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果urlencoded参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已配置变量:api_v=\"v1\",已配置mock:@id"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在urlencoded参数中添加:key=\"version\", value=\"api_{{api_v}}\""
      },
      {
        "id": "2",
        "name": "添加:key=\"request_id\", value=\"REQ_@id\""
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "混合变量被正确替换和生成"
      },
      {
        "id": "2",
        "name": "服务器接收到:version=api_v1&request_id=REQ_abc123"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "urlencoded参数支持混合变量"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持复杂的混合场景"
      }
    ]
  },
  {
    "purpose": "urlencoded参数是否发送未勾选那么当前参数不会发送,调用127.0.0.1:{环境变量中的端口}/echo,返回结果urlencoded参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "urlencoded参数有两个:user(已勾选),token(未勾选)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "确认token参数未勾选"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      },
      {
        "id": "3",
        "name": "观察响应中的参数"
      },
      {
        "id": "4",
        "name": "勾选token后再发送"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "未勾选时,只发送user参数"
      },
      {
        "id": "2",
        "name": "勾选后,发送所有参数"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "未勾选的参数被过滤"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持动态启用/禁用参数"
      }
    ]
  }
],
}

export default node
