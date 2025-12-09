import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "af.request API",
  description: "af.request API",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.request.prefix获取并修改请求前缀,发送请求后验证前缀已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求URL包含前缀部分"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.prefix = \"http://new-api.example.com\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的URL"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,请求前缀被修改"
      },
      {
        "id": "2",
        "name": "实际发送的请求使用修改后的前缀"
      },
      {
        "id": "3",
        "name": "响应区域显示修改后的完整URL"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.prefix属性可读写"
      },
      {
        "id": "2",
        "name": "修改生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "前缀是URL的协议和域名部分"
      }
    ]
  },
  {
    "purpose": "使用af.request.path获取并修改请求路径,发送请求后验证路径已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求URL已配置"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.path = \"/api/v2/users\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的URL路径"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,请求路径被修改"
      },
      {
        "id": "2",
        "name": "实际发送的请求使用修改后的路径"
      },
      {
        "id": "3",
        "name": "响应区域显示修改后的完整URL"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.path属性可读写"
      },
      {
        "id": "2",
        "name": "修改生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "路径是URL的路径部分,不包括查询参数"
      }
    ]
  },
  {
    "purpose": "使用af.request.fullPath获取完整请求路径",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求URL已配置,包含查询参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:console.log(af.request.fullPath)"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看打印的fullPath值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示完整的请求路径和查询参数"
      },
      {
        "id": "3",
        "name": "fullPath包含路径和所有查询参数"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.fullPath属性可读"
      },
      {
        "id": "2",
        "name": "fullPath包含path + query参数"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "完整路径包括路径和所有查询参数"
      }
    ]
  },
  {
    "purpose": "使用af.request.headers获取并修改请求头,发送请求后验证请求头已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求已配置了初始请求头"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.headers[\"X-Custom-Header\"] = \"custom-value\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际发送的请求头"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,请求头被修改"
      },
      {
        "id": "2",
        "name": "自定义请求头成功添加到请求中"
      },
      {
        "id": "3",
        "name": "响应区域的请求头信息中包含修改后的自定义头"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.headers属性可读写"
      },
      {
        "id": "2",
        "name": "修改的请求头生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "请求头为键值对对象"
      }
    ]
  },
  {
    "purpose": "使用af.request.queryParams获取并修改Query参数,发送请求后验证参数已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求已配置了初始查询参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.queryParams[\"page\"] = \"2\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的URL"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,查询参数被修改"
      },
      {
        "id": "2",
        "name": "实际发送的请求URL包含修改后的查询参数"
      },
      {
        "id": "3",
        "name": "响应区域显示修改后的完整URL"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.queryParams属性可读写"
      },
      {
        "id": "2",
        "name": "修改的查询参数生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "查询参数为键值对对象"
      }
    ]
  },
  {
    "purpose": "使用af.request.pathParams获取并修改Path参数,发送请求后验证参数已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求URL已配置了路径参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.pathParams[\"id\"] = \"999\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的URL"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,路径参数被修改"
      },
      {
        "id": "2",
        "name": "实际发送的请求URL中路径参数被替换"
      },
      {
        "id": "3",
        "name": "响应区域显示修改后的完整URL"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.pathParams属性可读写"
      },
      {
        "id": "2",
        "name": "修改的路径参数生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "路径参数对应URL中的{paramName}占位符"
      }
    ]
  },
  {
    "purpose": "使用af.request.body.json获取并修改JSON body,发送请求后验证body已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求已配置JSON body"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.body.json.username = \"newuser\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的body"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,JSON body被修改"
      },
      {
        "id": "2",
        "name": "实际发送的请求body中JSON字段被修改"
      },
      {
        "id": "3",
        "name": "响应区域显示修改后的body内容"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.body.json属性可读写"
      },
      {
        "id": "2",
        "name": "修改的JSON字段生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "仅当body类型为JSON时可用"
      }
    ]
  },
  {
    "purpose": "使用af.request.body.formdata获取并修改formdata body,发送请求后验证body已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求已配置FormData body"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.body.formdata[\"fieldname\"] = \"newvalue\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的body"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,FormData body被修改"
      },
      {
        "id": "2",
        "name": "实际发送的请求body中FormData字段被修改"
      },
      {
        "id": "3",
        "name": "响应区域显示修改后的body内容"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.body.formdata属性可读写"
      },
      {
        "id": "2",
        "name": "修改的FormData字段生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "仅当body类型为FormData时可用"
      }
    ]
  },
  {
    "purpose": "使用af.request.method获取并修改请求方法,发送请求后验证方法已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求已配置"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.method = \"PUT\""
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的HTTP方法"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,HTTP方法被修改"
      },
      {
        "id": "2",
        "name": "实际发送的请求使用修改后的HTTP方法"
      },
      {
        "id": "3",
        "name": "响应区域显示修改后的HTTP方法"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.method属性可读写"
      },
      {
        "id": "2",
        "name": "修改的HTTP方法生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持的方法包括:GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS等"
      }
    ]
  },
  {
    "purpose": "使用af.request.replaceUrl()替换整个URL,发送请求后验证URL已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "请求已配置"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:af.request.replaceUrl(\"https://new-api.example.com/api/v2/users?id=123\")"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看实际请求的完整URL"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行,整个URL被替换"
      },
      {
        "id": "2",
        "name": "实际发送的请求使用新的完整URL"
      },
      {
        "id": "3",
        "name": "响应区域显示新的完整URL"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.request.replaceUrl()方法可调用"
      },
      {
        "id": "2",
        "name": "新的完整URL生效于实际HTTP请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "replaceUrl()方法替换整个URL,包括前缀,路径和查询参数"
      }
    ]
  }
],
}

export default node
