import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "af.sessionStorage API",
  description: "af.sessionStorage API",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.sessionStorage.set(key, value)存储会话数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.sessionStorage.set(\"token\", \"abc123\")"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "数据成功保存在会话存储中"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "会话数据成功存储"
      },
      {
        "id": "3",
        "name": "键值对可以在后续请求中访问"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.sessionStorage.set()方法可调用"
      },
      {
        "id": "2",
        "name": "数据存储成功"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "会话存储只在当前应用会话期间有效"
      }
    ]
  },
  {
    "purpose": "使用af.sessionStorage.get(key)获取会话数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已通过af.sessionStorage.set()存储会话数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:const token = af.sessionStorage.get(\"token\"); console.log(token)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在控制台输出中查看获取的值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "成功获取之前存储的会话数据"
      },
      {
        "id": "3",
        "name": "控制台输出显示正确的值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.sessionStorage.get()方法可调用"
      },
      {
        "id": "2",
        "name": "返回正确的存储值"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "如果键不存在返回null或undefined"
      }
    ]
  },
  {
    "purpose": "使用af.sessionStorage.remove(key)删除会话数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已通过af.sessionStorage.set()存储会话数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.sessionStorage.remove(\"token\")"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "验证数据已被删除:af.sessionStorage.get(\"token\")返回null"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "会话数据成功删除"
      },
      {
        "id": "3",
        "name": "再次获取该键时返回null或undefined"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.sessionStorage.remove()方法可调用"
      },
      {
        "id": "2",
        "name": "指定键的数据被删除"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "删除不存在的键不会报错"
      }
    ]
  },
  {
    "purpose": "使用af.sessionStorage.clear()清空所有会话数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已存储多个会话数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.sessionStorage.clear()"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "验证所有数据已清空"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "所有会话数据被清空"
      },
      {
        "id": "3",
        "name": "后续get()调用返回null"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.sessionStorage.clear()方法可调用"
      },
      {
        "id": "2",
        "name": "清空所有会话数据"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "清空操作是不可逆的"
      }
    ]
  },
  {
    "purpose": "会话数据在关闭应用后清空",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已存储会话数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.sessionStorage.set(\"session_key\", \"session_value\")"
      },
      {
        "id": "2",
        "name": "发送请求确保数据存储成功"
      },
      {
        "id": "3",
        "name": "完全关闭应用(退出Electron)"
      },
      {
        "id": "4",
        "name": "重新打开应用"
      },
      {
        "id": "5",
        "name": "在后置脚本中验证:console.log(af.sessionStorage.get(\"session_key\"))"
      },
      {
        "id": "6",
        "name": "发送请求查看控制台输出"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "初始时会话数据存储成功"
      },
      {
        "id": "2",
        "name": "应用关闭后会话数据被清空"
      },
      {
        "id": "3",
        "name": "重新打开应用后get()返回null(数据已清空)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "会话存储只在应用运行期间保留"
      },
      {
        "id": "2",
        "name": "应用关闭时自动清空会话数据"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "会话存储的生命周期仅为应用会话期间"
      }
    ]
  }
],
}

export default node
