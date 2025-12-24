import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "customHeaders",
  description: "自定义请求头",
  children: [],
  atomicFunc: [
  {
    "purpose": "用户输入请求头key,如果匹配上预设的请求头,会出现请求头下拉列表,下拉列表中匹配上的关键字高亮,按tab可以选中第一个,也可以上下切换按回车选中",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "自定义请求头输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在自定义请求头的key输入框中输入\"auth\""
      },
      {
        "id": "2",
        "name": "观察是否出现下拉列表(包含Authorization等)"
      },
      {
        "id": "3",
        "name": "按tab键选中第一个下拉项"
      },
      {
        "id": "4",
        "name": "清空并再次输入,使用上下方向键切换"
      },
      {
        "id": "5",
        "name": "按回车键选中某个下拉项"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入匹配的关键字时出现下拉列表"
      },
      {
        "id": "2",
        "name": "下拉列表中匹配的关键字被高亮显示"
      },
      {
        "id": "3",
        "name": "按tab键选中第一个下拉项"
      },
      {
        "id": "4",
        "name": "可以使用方向键在下拉列表中切换"
      },
      {
        "id": "5",
        "name": "按回车键选中下拉列表中的项"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "请求头下拉列表的选择和高亮功能"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "提供请求头的自动补全和建议功能"
      }
    ]
  },
  {
    "purpose": "用户输入请求头如果key相同(key忽略大小写比较,需要验证忽略大小写情况),则会覆盖允许覆盖默认请求头(需要验证所有情况),调用127.0.0.1:{环境变量中的端口}/echo,返回请求头参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "展开隐藏请求头,记录User-Agent的默认值"
      },
      {
        "id": "2",
        "name": "在自定义请求头中添加key=\"user-agent\",value=\"CustomAgent/1.0\""
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      },
      {
        "id": "4",
        "name": "观察服务器接收到的User-Agent值"
      },
      {
        "id": "5",
        "name": "再测试其他大小写变体如\"User-Agent\",\"USER-AGENT\""
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "自定义的user-agent值覆盖了默认值"
      },
      {
        "id": "2",
        "name": "服务器接收到自定义的User-Agent值"
      },
      {
        "id": "3",
        "name": "key的大小写不同但仍然匹配和覆盖"
      },
      {
        "id": "4",
        "name": "允许覆盖所有默认的隐藏请求头"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "请求头key匹配忽略大小写"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "HTTP请求头key是大小写不敏感的"
      }
    ]
  },
  {
    "purpose": "header参数key输入值以后,如果不存在next节点,则自动新增一行数据,自动新增数据需要被选中",
      "precondition": [
        {
          "id": "1",
          "name": "已打开httpNode节点编辑页面"
        },
        {
          "id": "2",
          "name": "自定义请求头表格中只有一行,且为空"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "在第一行header的key输入框中输入X-Custom-Header"
        },
        {
          "id": "2",
          "name": "点击key输入框外的区域使其失焦"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "第一行key值为X-Custom-Header,自动新增第二行空的header行"
        },
        {
          "id": "2",
          "name": "新增的第二行被自动选中"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "自动新增逻辑在header编辑器中实现"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "与其他参数保持一致的行为"
        }
      ]
    },
    {
      "purpose": "header参数key,value,description输入值以后,调用127.0.0.1:{环境变量中的端口}/echo,返回结果header参数正确",
      "precondition": [
        {
          "id": "1",
          "name": "已打开httpNode节点编辑页面"
        },
        {
          "id": "2",
          "name": "请求URL为http://127.0.0.1:8000/echo"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "在自定义header中添加:key=\"X-Request-ID\", value=\"12345\""
        },
        {
          "id": "2",
          "name": "添加:key=\"X-API-Version\", value=\"v1\""
        },
        {
          "id": "3",
          "name": "点击发送按钮"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "服务器接收到自定义header参数"
        },
        {
          "id": "2",
          "name": "响应体显示完整的header信息"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "自定义header正确发送到服务器"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "支持多个自定义header的同时发送"
        }
      ]
    },
    {
      "purpose": "header参数key,value支持变量(需验证所有的变量类型),调用127.0.0.1:{环境变量中的端口}/echo,返回结果header参数正确",
      "precondition": [
        {
          "id": "1",
          "name": "已打开httpNode节点编辑页面"
        },
        {
          "id": "2",
          "name": "已配置变量:token=\"abc123xyz\",api_key=\"key_prod\""
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "添加header:key=\"Authorization\", value=\"Bearer {{token}}\""
        },
        {
          "id": "2",
          "name": "添加header:key=\"X-API-Key\", value=\"{{api_key}}\""
        },
        {
          "id": "3",
          "name": "点击发送按钮"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "变量被正确替换:Authorization=Bearer abc123xyz"
        },
        {
          "id": "2",
          "name": "服务器接收到替换后的header值"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "header参数支持变量替换"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "需验证多种变量类型"
        }
      ]
    },
    {
      "purpose": "header参数key,value支持mock(需验证所有的mock情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果header参数正确",
      "precondition": [
        {
          "id": "1",
          "name": "已打开httpNode节点编辑页面"
        },
        {
          "id": "2",
          "name": "已配置mock:@uuid,@timestamp"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "添加header:key=\"X-Request-ID\", value=\"@uuid\""
        },
        {
          "id": "2",
          "name": "添加header:key=\"X-Timestamp\", value=\"@timestamp\""
        },
        {
          "id": "3",
          "name": "点击发送按钮"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "mock数据被正确生成替换"
        },
        {
          "id": "2",
          "name": "每次发送时mock数据会重新生成"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "header参数支持mock"
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
      "purpose": "header参数key,value支持混合变量(需验证所有的混合情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果header参数正确",
      "precondition": [
        {
          "id": "1",
          "name": "已打开httpNode节点编辑页面"
        },
        {
          "id": "2",
          "name": "已配置变量:api_v=\"v2\",已配置mock:@uuid"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "添加header:key=\"X-API-Version\", value=\"api_{{api_v}}\""
        },
        {
          "id": "2",
          "name": "添加header:key=\"X-Session-ID\", value=\"sid_@uuid\""
        },
        {
          "id": "3",
          "name": "点击发送按钮"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "混合变量被正确替换:X-API-Version=api_v2"
        },
        {
          "id": "2",
          "name": "混合mock被正确生成:X-Session-ID=sid_<uuid>"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "header参数支持混合变量"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "支持复杂的混合场景"
        }
      ]
    },
    {
      "purpose": "header参数是否发送未勾选那么当前参数不会发送,调用127.0.0.1:{环境变量中的端口}/echo,返回结果header参数正确",
      "precondition": [
        {
          "id": "1",
          "name": "已打开httpNode节点编辑页面"
        },
        {
          "id": "2",
          "name": "自定义header中有两个参数:X-Request-ID(已勾选),X-Debug(未勾选)"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "确认X-Debug的\"是否发送\"checkbox处于未勾选状态"
        },
        {
          "id": "2",
          "name": "点击发送按钮"
        },
        {
          "id": "3",
          "name": "观察响应中的header参数"
        },
        {
          "id": "4",
          "name": "勾选X-Debug后再发送"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "未勾选时,只发送X-Request-ID,不发送X-Debug"
        },
        {
          "id": "2",
          "name": "勾选后,发送所有header参数"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "未勾选的header参数被过滤"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "应支持动态启用/禁用header参数"
        }
      ]
    }
  ]
}

export default node
