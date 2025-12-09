import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "query",
  description: "Query参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "query参数key输入值以后,如果不存在next节点,则自动新增一行数据,自动新增数据需要被选中",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "query参数表格中只有一行,且该行的key,value都为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在第一行query参数的key输入框中输入page"
      },
      {
        "id": "2",
        "name": "点击key输入框外的区域使其失焦(或按Tab键)"
      },
      {
        "id": "3",
        "name": "观察query参数表格的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一行key值为page,自动新增第二行空的query参数行"
      },
      {
        "id": "2",
        "name": "新增的第二行被自动选中(高亮显示)"
      },
      {
        "id": "3",
        "name": "第二行的key输入框获得焦点,可直接输入"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "自动新增逻辑在httpNode编辑器中实现"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "新增行应自动获得焦点提升用户体验"
      }
    ]
  },
  {
    "purpose": "query参数key,value,description输入值以后,调用127.0.0.1:{环境变量中的端口}/echo,返回结果query参数正确",
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
        "name": "环境变量中端口变量已配置为8000"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在query参数表格中添加一条参数:key=\"page\", value=\"1\", description=\"页码\""
      },
      {
        "id": "2",
        "name": "添加第二条参数:key=\"size\", value=\"10\", description=\"分页大小\""
      },
      {
        "id": "3",
        "name": "点击发送按钮发送请求"
      },
      {
        "id": "4",
        "name": "观察响应数据中query参数的值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求URL中包含query参数:?page=1&size=10"
      },
      {
        "id": "2",
        "name": "服务器返回正确的query参数,响应体中包含page=1和size=10"
      },
      {
        "id": "3",
        "name": "响应中的description字段被正确地记录和展示"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "手动编辑的query参数正确发送到服务器"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持多个query参数的同时发送"
      }
    ]
  },
  {
    "purpose": "query参数key,value支持变量(需验证所有的变量类型),调用127.0.0.1:{环境变量中的端口}/echo,返回结果query参数正确",
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
        "name": "已配置项目变量:page_num=2"
      },
      {
        "id": "4",
        "name": "已配置全局变量:page_size=20"
      },
      {
        "id": "5",
        "name": "已配置环境变量:page_offset=0"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在query参数表格中添加参数:key=\"page\", value=\"{{page_num}}\"(项目变量)"
      },
      {
        "id": "2",
        "name": "添加参数:key=\"size\", value=\"{{page_size}}\"(全局变量)"
      },
      {
        "id": "3",
        "name": "添加参数:key=\"offset\", value=\"{{page_offset}}\"(环境变量)"
      },
      {
        "id": "4",
        "name": "点击发送按钮发送请求"
      },
      {
        "id": "5",
        "name": "观察响应中的query参数值是否被正确替换"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求URL中query参数被正确替换:?page=2&size=20&offset=0"
      },
      {
        "id": "2",
        "name": "响应体显示所有变量已被正确解析和替换"
      },
      {
        "id": "3",
        "name": "三种变量类型(项目,全局,环境)都能正确工作"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "query参数变量替换在发送前执行"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "需验证项目变量,全局变量,环境变量的优先级"
      }
    ]
  },
  {
    "purpose": "query参数key,value支持mock(需验证所有的mock情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果query参数正确",
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
        "name": "已配置mock数据:@name(用户名),@int(1-100),@email,@date"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在query参数中添加参数:key=\"username\", value=\"@name\""
      },
      {
        "id": "2",
        "name": "添加参数:key=\"user_id\", value=\"@int(1-100)\""
      },
      {
        "id": "3",
        "name": "添加参数:key=\"email\", value=\"@email\""
      },
      {
        "id": "4",
        "name": "添加参数:key=\"date\", value=\"@date\""
      },
      {
        "id": "5",
        "name": "点击发送按钮发送请求"
      },
      {
        "id": "6",
        "name": "观察响应中的query参数值是否被正确生成"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求URL中query参数被mock数据替换,如:?username=张三&user_id=45&email=test@example.com&date=2024-01-15"
      },
      {
        "id": "2",
        "name": "每次发送请求时mock数据会重新生成不同的值"
      },
      {
        "id": "3",
        "name": "响应体中显示生成后的mock数据"
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
        "name": "需验证所有支持的mock函数及其参数"
      }
    ]
  },
  {
    "purpose": "query参数key,value支持混合变量(需验证所有的混合情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果query参数正确",
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
        "name": "已配置变量:prefix=\"api_v1\",已配置mock:@id"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在query参数中添加参数:key=\"type\", value=\"{{prefix}}_user\"(变量混合文本)"
      },
      {
        "id": "2",
        "name": "添加参数:key=\"id\", value=\"ID_@id\"(文本混合mock)"
      },
      {
        "id": "3",
        "name": "添加参数:key=\"request\", value=\"{{prefix}}_@id\"(变量混合mock)"
      },
      {
        "id": "4",
        "name": "点击发送按钮发送请求"
      },
      {
        "id": "5",
        "name": "观察响应中的query参数值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求URL中参数被正确替换:?type=api_v1_user&id=ID_12345&request=api_v1_abc123"
      },
      {
        "id": "2",
        "name": "混合场景中变量和mock都能正确解析"
      },
      {
        "id": "3",
        "name": "混合顺序正确处理,不会出现残留标记符"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "混合变量处理逻辑支持变量+文本,文本+mock,变量+mock的组合"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "需验证混合情况下的优先级和执行顺序"
      }
    ]
  },
  {
    "purpose": "query参数是否发送未勾选那么当前参数不会发送,调用127.0.0.1:{环境变量中的端口}/echo,返回结果query参数正确",
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
        "name": "query参数表格中有两个参数:page=1(已勾选),size=10(未勾选)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "确认size参数的\"是否发送\"checkbox处于未勾选状态"
      },
      {
        "id": "2",
        "name": "点击发送按钮发送请求"
      },
      {
        "id": "3",
        "name": "观察响应中的query参数"
      },
      {
        "id": "4",
        "name": "勾选size参数的\"是否发送\"checkbox"
      },
      {
        "id": "5",
        "name": "再次点击发送按钮"
      },
      {
        "id": "6",
        "name": "观察响应中的query参数变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "未勾选时,请求URL只包含page参数:?page=1,不包含size参数"
      },
      {
        "id": "2",
        "name": "响应体中也不包含size参数的信息"
      },
      {
        "id": "3",
        "name": "勾选后,请求URL包含所有参数:?page=1&size=10"
      },
      {
        "id": "4",
        "name": "响应体中包含完整的query参数信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "未勾选参数在HTTP请求中被过滤,不会发送到服务器"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持动态启用/禁用个别query参数而不删除"
      }
    ]
  }
],
}

export default node
