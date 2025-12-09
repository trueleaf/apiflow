import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "raw参数",
  description: "raw参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "raw text参数输入值以后,请求头自动添加contentType:text/plain,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo,method为POST"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "选择body类型为raw,格式为text"
      },
      {
        "id": "2",
        "name": "在编辑器中输入:This is plain text content"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求头自动包含Content-Type: text/plain"
      },
      {
        "id": "2",
        "name": "服务器接收到纯文本内容"
      },
      {
        "id": "3",
        "name": "响应体显示完整的text数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "raw text格式自动设置正确的Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持自动化的Content-Type设置"
      }
    ]
  },
  {
    "purpose": "raw html参数输入值以后,请求头自动添加contentType:text/html,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo,method为POST"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "选择body类型为raw,格式为html"
      },
      {
        "id": "2",
        "name": "输入HTML代码:<html><body>Hello World</body></html>"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求头自动包含Content-Type: text/html"
      },
      {
        "id": "2",
        "name": "服务器接收到HTML内容"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "raw html格式自动设置正确的Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持HTML格式的识别"
      }
    ]
  },
  {
    "purpose": "raw xml参数输入值以后,请求头自动添加contentType:application/xml,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo,method为POST"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "选择body类型为raw,格式为xml"
      },
      {
        "id": "2",
        "name": "输入XML代码:<?xml version=\"1.0\"?><root><item>test</item></root>"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求头自动包含Content-Type: application/xml"
      },
      {
        "id": "2",
        "name": "服务器接收到正确的XML数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "raw xml格式自动设置正确的Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持XML格式的正确处理"
      }
    ]
  },
  {
    "purpose": "raw javascript参数输入值以后,请求头自动添加contentType:text/javascript,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo,method为POST"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "选择body类型为raw,格式为javascript"
      },
      {
        "id": "2",
        "name": "输入JavaScript代码:console.log(\"test\"); var x = 123;"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求头自动包含Content-Type: text/javascript"
      },
      {
        "id": "2",
        "name": "服务器接收到JavaScript代码"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "raw javascript格式自动设置正确的Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持JavaScript格式的发送"
      }
    ]
  },
  {
    "purpose": "raw 参数(text,html,xml,json格式)无任何值,请求头不自动添加,调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已选择body类型为raw"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "不在编辑器中输入任何内容(保持为空)"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      },
      {
        "id": "3",
        "name": "观察请求头中的Content-Type"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "raw body为空时,请求头不包含自动添加的Content-Type"
      },
      {
        "id": "2",
        "name": "服务器接收到空的body"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "空的raw body不触发自动Content-Type设置"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应根据内容智能识别格式"
      }
    ]
  }
],
}

export default node
