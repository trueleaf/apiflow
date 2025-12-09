import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "stringOnlyFormdata",
  description: "类型全为string的formdata参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "formdata参数key输入值以后,如果不存在next节点,则自动新增一行数据,自动新增数据需要被选中",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已选择body类型为formData"
      },
      {
        "id": "3",
        "name": "formdata参数表格中只有一行,且该行为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在第一行formdata参数的key输入框中输入username"
      },
      {
        "id": "2",
        "name": "点击key输入框外的区域使其失焦"
      },
      {
        "id": "3",
        "name": "观察formdata参数表格的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一行key值为username,自动新增第二行空的formdata参数行"
      },
      {
        "id": "2",
        "name": "新增的第二行被自动选中(高亮显示)"
      },
      {
        "id": "3",
        "name": "第二行的key输入框获得焦点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "自动新增逻辑在formdata编辑器中实现"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应与query参数保持一致的自动新增行为"
      }
    ]
  },
  {
    "purpose": "formdata参数key,value,description输入值以后,调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求方法为POST,URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已选择body类型为formData"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数表格中添加参数:key=\"username\", value=\"admin\", description=\"用户名\""
      },
      {
        "id": "2",
        "name": "添加参数:key=\"password\", value=\"123456\", description=\"密码\""
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      },
      {
        "id": "4",
        "name": "观察响应数据"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求Content-Type为multipart/form-data"
      },
      {
        "id": "2",
        "name": "服务器接收到formdata参数:username=admin, password=123456"
      },
      {
        "id": "3",
        "name": "响应体显示完整的formdata参数信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "手动编辑的formdata参数正确发送到服务器"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持多个formdata参数的同时发送"
      }
    ]
  },
  {
    "purpose": "formdata参数key,value支持变量(需验证所有的变量类型),调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置项目变量:app_id=\"mobile_app\""
      },
      {
        "id": "4",
        "name": "已配置全局变量:access_token=\"token_abc123\""
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中添加:key=\"app_id\", value=\"{{app_id}}\"(项目变量)"
      },
      {
        "id": "2",
        "name": "添加:key=\"token\", value=\"{{access_token}}\"(全局变量)"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      },
      {
        "id": "4",
        "name": "观察响应中的formdata参数值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量被正确替换:app_id=mobile_app, token=token_abc123"
      },
      {
        "id": "2",
        "name": "响应体显示所有变量已被正确解析"
      },
      {
        "id": "3",
        "name": "三种变量类型都能正确工作"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "formdata参数变量替换在发送前执行"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "需验证formdata中的变量优先级"
      }
    ]
  },
  {
    "purpose": "formdata参数key,value支持mock(需验证所有的mock情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置mock:@phone,@address,@id"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中添加:key=\"phone\", value=\"@phone\""
      },
      {
        "id": "2",
        "name": "添加:key=\"address\", value=\"@address\""
      },
      {
        "id": "3",
        "name": "添加:key=\"user_id\", value=\"@id\""
      },
      {
        "id": "4",
        "name": "点击发送按钮"
      },
      {
        "id": "5",
        "name": "观察响应中的formdata参数值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "formdata参数被mock数据替换,如:phone=13800138000&address=北京市朝阳区&user_id=123456"
      },
      {
        "id": "2",
        "name": "每次发送请求时mock数据会重新生成"
      },
      {
        "id": "3",
        "name": "响应体显示生成后的mock数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "多种mock类型都能被正确解析和生成"
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
    "purpose": "formdata参数key,value支持混合变量(需验证所有的混合情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置变量:service=\"user\", 已配置mock:@id"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中添加:key=\"action\", value=\"{{service}}_query\"(变量混合文本)"
      },
      {
        "id": "2",
        "name": "添加:key=\"req_id\", value=\"REQ_@id\"(文本混合mock)"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      },
      {
        "id": "4",
        "name": "观察响应值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "formdata参数被正确替换:action=user_query&req_id=REQ_abc123"
      },
      {
        "id": "2",
        "name": "混合场景中变量和mock都能正确解析"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "混合变量处理支持多种组合方式"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持formdata中的复杂混合情况"
      }
    ]
  },
  {
    "purpose": "formdata参数是否发送未勾选那么当前参数不会发送,调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "formdata参数有两个:username(已勾选),password(未勾选)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "确认password参数的\"是否发送\"checkbox处于未勾选状态"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      },
      {
        "id": "3",
        "name": "观察响应中的formdata参数"
      },
      {
        "id": "4",
        "name": "勾选password的\"是否发送\"checkbox"
      },
      {
        "id": "5",
        "name": "再次点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "未勾选时,请求只包含username,不包含password"
      },
      {
        "id": "2",
        "name": "勾选后,请求包含所有参数"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "未勾选参数在formdata中被过滤"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持动态启用/禁用formdata参数"
      }
    ]
  }
],
}

export default node
