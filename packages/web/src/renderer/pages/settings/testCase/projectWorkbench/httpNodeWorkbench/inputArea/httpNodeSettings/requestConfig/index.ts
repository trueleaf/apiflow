import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "requestConfig",
  description: "请求配置",
  children: [],
  atomicFunc: [
  {
    "purpose": "修改最大文本Body大小配置,验证超过限制时的处理",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "请求配置选项可见"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置面板中找到\"最大文本Body大小\"配置项"
      },
      {
        "id": "2",
        "name": "修改该值为较小的值,如1MB"
      },
      {
        "id": "3",
        "name": "创建一个超过该限制的文本Body请求"
      },
      {
        "id": "4",
        "name": "发送请求并观察处理结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "设置值成功修改"
      },
      {
        "id": "2",
        "name": "超过限制时显示警告提示或限制传输"
      },
      {
        "id": "3",
        "name": "用户能了解到数据大小的限制"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "最大Body大小配置可修改"
      },
      {
        "id": "2",
        "name": "超过限制时有相应处理"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "防止意外发送过大数据"
      }
    ]
  },
  {
    "purpose": "修改最大原始Body大小配置,验证超过限制时的处理",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "请求配置选项可见"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置面板中找到\"最大原始Body大小\"配置项"
      },
      {
        "id": "2",
        "name": "修改该值为较小的值,如2MB"
      },
      {
        "id": "3",
        "name": "创建一个超过该限制的Raw Body请求"
      },
      {
        "id": "4",
        "name": "发送请求并观察处理结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "设置值成功修改"
      },
      {
        "id": "2",
        "name": "超过限制时显示警告提示或限制传输"
      },
      {
        "id": "3",
        "name": "用户能了解到原始数据的大小限制"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "最大原始Body大小配置可修改"
      },
      {
        "id": "2",
        "name": "超过限制时有相应处理"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "原始Body指Raw参数类型的数据"
      }
    ]
  },
  {
    "purpose": "修改自定义User-Agent配置,发送请求后验证User-Agent已更改",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "请求配置选项可见"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置面板中找到\"自定义User-Agent\"配置项"
      },
      {
        "id": "2",
        "name": "输入自定义User-Agent字符串"
      },
      {
        "id": "3",
        "name": "保存配置"
      },
      {
        "id": "4",
        "name": "发送请求并查看请求头中的User-Agent"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "自定义User-Agent配置成功保存"
      },
      {
        "id": "2",
        "name": "请求的User-Agent请求头已更改为自定义值"
      },
      {
        "id": "3",
        "name": "验证请求头确实包含自定义的User-Agent"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "自定义User-Agent配置可修改"
      },
      {
        "id": "2",
        "name": "配置生效于实际请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "用于模拟不同客户端的请求"
      }
    ]
  },
  {
    "purpose": "修改请求头值最大展示长度配置,验证请求头展示截断正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "请求配置选项可见"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置面板中找到\"请求头值最大展示长度\"配置项"
      },
      {
        "id": "2",
        "name": "修改该值为较小的值,如50字符"
      },
      {
        "id": "3",
        "name": "保存配置"
      },
      {
        "id": "4",
        "name": "添加一个很长的自定义请求头"
      },
      {
        "id": "5",
        "name": "发送请求并查看请求头的展示效果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "设置值成功修改"
      },
      {
        "id": "2",
        "name": "请求头值在展示时被截断为配置的长度"
      },
      {
        "id": "3",
        "name": "可能会显示省略号或提示表示数据被截断"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "展示长度配置可修改"
      },
      {
        "id": "2",
        "name": "配置生效于响应区域的显示"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "只影响UI展示,不影响实际请求"
      }
    ]
  }
],
}

export default node
