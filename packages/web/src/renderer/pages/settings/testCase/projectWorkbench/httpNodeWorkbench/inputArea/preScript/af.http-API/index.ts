import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "af.http API",
  description: "af.http API",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.http.get()发送GET请求,请求成功并获取响应数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "有可用的GET接口URL"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:const response = await af.http.get(\"https://api.example.com/users\")"
      },
      {
        "id": "2",
        "name": "添加日志输出该响应:console.log(response)"
      },
      {
        "id": "3",
        "name": "点击发送请求按钮"
      },
      {
        "id": "4",
        "name": "在响应区域查看控制台输出"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行GET请求"
      },
      {
        "id": "2",
        "name": "返回响应对象包含状态码,响应头,响应体等信息"
      },
      {
        "id": "3",
        "name": "控制台输出显示响应数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.http.get()方法可调用"
      },
      {
        "id": "2",
        "name": "支持async/await异步调用"
      },
      {
        "id": "3",
        "name": "返回完整的响应对象"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "可以在前置脚本中进行其他API调用"
      }
    ]
  },
  {
    "purpose": "使用af.http.post()发送POST请求,请求成功并获取响应数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "有可用的POST接口URL"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:const response = await af.http.post(\"https://api.example.com/users\", { name: \"John\" })"
      },
      {
        "id": "2",
        "name": "添加日志输出该响应"
      },
      {
        "id": "3",
        "name": "点击发送请求按钮"
      },
      {
        "id": "4",
        "name": "在响应区域查看控制台输出"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行POST请求"
      },
      {
        "id": "2",
        "name": "返回响应对象包含状态码,响应头,响应体等信息"
      },
      {
        "id": "3",
        "name": "控制台输出显示响应数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.http.post()方法可调用"
      },
      {
        "id": "2",
        "name": "支持传递请求体数据"
      },
      {
        "id": "3",
        "name": "返回完整的响应对象"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "POST请求可以传递数据作为第二个参数"
      }
    ]
  },
  {
    "purpose": "使用af.http.put()发送PUT请求,请求成功并获取响应数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "有可用的PUT接口URL"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:const response = await af.http.put(\"https://api.example.com/users/123\", { name: \"Jane\" })"
      },
      {
        "id": "2",
        "name": "添加日志输出该响应"
      },
      {
        "id": "3",
        "name": "点击发送请求按钮"
      },
      {
        "id": "4",
        "name": "在响应区域查看控制台输出"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行PUT请求"
      },
      {
        "id": "2",
        "name": "返回响应对象包含状态码,响应头,响应体等信息"
      },
      {
        "id": "3",
        "name": "控制台输出显示响应数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.http.put()方法可调用"
      },
      {
        "id": "2",
        "name": "支持传递请求体数据"
      },
      {
        "id": "3",
        "name": "返回完整的响应对象"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "PUT请求通常用于更新资源"
      }
    ]
  },
  {
    "purpose": "使用af.http.delete()发送DELETE请求,请求成功并获取响应数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "有可用的DELETE接口URL"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:const response = await af.http.delete(\"https://api.example.com/users/123\")"
      },
      {
        "id": "2",
        "name": "添加日志输出该响应"
      },
      {
        "id": "3",
        "name": "点击发送请求按钮"
      },
      {
        "id": "4",
        "name": "在响应区域查看控制台输出"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行DELETE请求"
      },
      {
        "id": "2",
        "name": "返回响应对象包含状态码,响应头,响应体等信息"
      },
      {
        "id": "3",
        "name": "控制台输出显示响应数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.http.delete()方法可调用"
      },
      {
        "id": "2",
        "name": "返回完整的响应对象"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "DELETE请求通常用于删除资源"
      }
    ]
  },
  {
    "purpose": "af.http请求失败时正确抛出错误并在响应区域展示错误信息",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:try { const response = await af.http.get(\"https://api.example.com/invalid-endpoint\") } catch(e) { console.error(e.message) }"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看错误信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求失败时正确抛出错误"
      },
      {
        "id": "2",
        "name": "错误信息可以被catch捕获"
      },
      {
        "id": "3",
        "name": "响应区域显示详细的错误信息(如网络错误,超时等)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "请求失败时抛出异常对象"
      },
      {
        "id": "2",
        "name": "异常可以被try-catch捕获"
      },
      {
        "id": "3",
        "name": "错误信息包含错误类型和详细描述"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "错误处理使用标准的JavaScript异常机制"
      }
    ]
  }
],
}

export default node
