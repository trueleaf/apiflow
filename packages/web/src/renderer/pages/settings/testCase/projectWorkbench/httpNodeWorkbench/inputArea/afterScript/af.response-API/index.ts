import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "af.response API",
  description: "af.response API",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.response.statusCode获取响应状态码",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已发送请求并获得响应"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:console.log(af.response.statusCode)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看状态码"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示响应的HTTP状态码(如200,404等)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.response.statusCode属性可读"
      },
      {
        "id": "2",
        "name": "返回正确的HTTP状态码数值"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "状态码在响应完成后通过后置脚本可以获取"
      }
    ]
  },
  {
    "purpose": "使用af.response.headers获取响应头",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已发送请求并获得响应"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:console.log(af.response.headers)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看响应头对象"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示响应头对象,包含Content-Type,Content-Length等"
      },
      {
        "id": "3",
        "name": "可以访问特定的响应头,如af.response.headers[\"content-type\"]"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.response.headers属性可读"
      },
      {
        "id": "2",
        "name": "返回响应头键值对对象"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "响应头为键值对对象格式"
      }
    ]
  },
  {
    "purpose": "使用af.response.cookies获取响应Cookie",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已发送请求并获得包含Set-Cookie的响应"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:console.log(af.response.cookies)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看Cookie信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示响应中设置的Cookie信息"
      },
      {
        "id": "3",
        "name": "如果响应包含Set-Cookie头,可以访问Cookie详情"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.response.cookies属性可读"
      },
      {
        "id": "2",
        "name": "返回响应中的Cookie信息"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "只有在响应包含Set-Cookie时才会有值"
      }
    ]
  },
  {
    "purpose": "使用af.response.body获取响应体数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已发送请求并获得响应"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:console.log(af.response.body)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看响应体"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示完整的响应体数据"
      },
      {
        "id": "3",
        "name": "响应体可以是JSON对象,字符串,HTML等"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.response.body属性可读"
      },
      {
        "id": "2",
        "name": "返回响应体的实际内容"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "响应体可以是任何格式的数据"
      }
    ]
  },
  {
    "purpose": "使用af.response.rt获取响应时长",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已发送请求并获得响应"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:console.log(af.response.rt)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看响应时长"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示响应时长(毫秒)"
      },
      {
        "id": "3",
        "name": "响应时长是数值类型,表示从请求发送到收到完整响应的时间"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.response.rt属性可读"
      },
      {
        "id": "2",
        "name": "返回响应时长数值(毫秒)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "响应时长(rt)以毫秒为单位"
      }
    ]
  },
  {
    "purpose": "使用af.response.size获取响应大小",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已发送请求并获得响应"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:console.log(af.response.size)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看响应大小"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示响应大小(字节)"
      },
      {
        "id": "3",
        "name": "响应大小是数值类型,表示响应体的字节数"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.response.size属性可读"
      },
      {
        "id": "2",
        "name": "返回响应大小数值(字节)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "响应大小(size)以字节为单位"
      }
    ]
  },
  {
    "purpose": "使用af.response.ip获取远端IP地址",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已发送请求并获得响应"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:console.log(af.response.ip)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看远端IP地址"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "控制台输出显示响应服务器的IP地址"
      },
      {
        "id": "3",
        "name": "IP地址是字符串格式,如\"192.168.1.1\""
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.response.ip属性可读"
      },
      {
        "id": "2",
        "name": "返回远端服务器的IP地址字符串"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "远端IP是响应来源的服务器IP地址"
      }
    ]
  }
],
}

export default node
