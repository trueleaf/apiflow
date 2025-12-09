import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "defaultHeaders",
  description: "默认请求头",
  children: [],
  atomicFunc: [
  {
    "purpose": "未设置任何body参数,默认请求头:Host,Accept-Encoding,Connection,Content-Length,User-Agent,Accept,调用127.0.0.1:{环境变量中的端口}/echo,返回结果请求头参数正确",
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
        "name": "未添加任何body参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击发送按钮"
      },
      {
        "id": "2",
        "name": "观察响应中的请求头信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求包含默认的Host请求头"
      },
      {
        "id": "2",
        "name": "请求包含Accept-Encoding请求头"
      },
      {
        "id": "3",
        "name": "请求包含Connection请求头"
      },
      {
        "id": "4",
        "name": "请求包含User-Agent请求头"
      },
      {
        "id": "5",
        "name": "请求包含Accept请求头"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "默认请求头自动添加"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "这些是HTTP标准请求头"
      }
    ]
  },
  {
    "purpose": "隐藏请求头中user-agent和accept值可以更改,更改后调用127.0.0.1:{环境变量中的端口}/echo,返回结果请求头参数正确",
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
        "name": "展开隐藏请求头列表"
      },
      {
        "id": "2",
        "name": "修改User-Agent的值为自定义值"
      },
      {
        "id": "3",
        "name": "修改Accept的值为application/json"
      },
      {
        "id": "4",
        "name": "点击发送按钮"
      },
      {
        "id": "5",
        "name": "观察响应中的请求头值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "修改后的User-Agent值被发送到服务器"
      },
      {
        "id": "2",
        "name": "修改后的Accept值被发送到服务器"
      },
      {
        "id": "3",
        "name": "服务器返回修改后的请求头信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "隐藏请求头的值可被修改"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "允许用户自定义标准请求头"
      }
    ]
  },
  {
    "purpose": "点击隐藏请求头图标展示隐藏请求头,再次点击收起隐藏请求头,隐藏请求头和用户输入请求头直接存在分割线",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "header区域已展开"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察初始状态(隐藏请求头默认收起)"
      },
      {
        "id": "2",
        "name": "点击隐藏请求头图标展开隐藏请求头列表"
      },
      {
        "id": "3",
        "name": "观察展开后的分割线"
      },
      {
        "id": "4",
        "name": "再次点击隐藏请求头图标收起"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "隐藏请求头列表展开显示"
      },
      {
        "id": "2",
        "name": "隐藏请求头和自定义请求头之间显示分割线"
      },
      {
        "id": "3",
        "name": "再次点击后隐藏请求头列表收起"
      },
      {
        "id": "4",
        "name": "分割线消失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "隐藏请求头的展开/收起功能正常"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "分割线用于区分默认和自定义请求头"
      }
    ]
  },
  {
    "purpose": "body中参数不同的mode,并且对应mode录入了参数,会自动添加content-type,调用127.0.0.1:{环境变量中的端口}/echo,返回请求头参数正确",
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
        "name": "选择body类型为json,输入JSON数据"
      },
      {
        "id": "2",
        "name": "观察header中是否自动添加了Content-Type"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "自动添加Content-Type: application/json"
      },
      {
        "id": "2",
        "name": "服务器接收到正确的Content-Type"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "根据body类型自动设置Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "每种body类型对应特定的Content-Type"
      }
    ]
  },
  {
    "purpose": "自动添加的content-type值允许修改,调用127.0.0.1:{环境变量中的端口}/echo,返回请求头参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "body类型为json,自动添加了Content-Type"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在自定义请求头中修改或新增Content-Type"
      },
      {
        "id": "2",
        "name": "设置为自定义值:application/custom"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      },
      {
        "id": "4",
        "name": "观察服务器接收到的Content-Type"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "自动添加的Content-Type被用户修改值覆盖"
      },
      {
        "id": "2",
        "name": "服务器接收到自定义的Content-Type值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "用户可以覆盖自动设置的Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "提供灵活的请求头定制能力"
      }
    ]
  }
],
}

export default node
