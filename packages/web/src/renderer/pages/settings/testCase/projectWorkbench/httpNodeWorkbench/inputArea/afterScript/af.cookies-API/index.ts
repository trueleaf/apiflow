import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "af.cookies API",
  description: "af.cookies API",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.cookies.get(name)获取指定Cookie值",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已存在Cookie数据(通过响应头Set-Cookie或脚本设置)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:const sessionId = af.cookies.get(\"session_id\"); console.log(sessionId)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在控制台输出中查看Cookie值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "成功获取指定的Cookie值"
      },
      {
        "id": "3",
        "name": "控制台输出显示正确的Cookie值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.cookies.get()方法可调用"
      },
      {
        "id": "2",
        "name": "返回正确的Cookie值"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "如果Cookie不存在返回null或undefined"
      }
    ]
  },
  {
    "purpose": "使用af.cookies.getAll()获取所有Cookie",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已存在多个Cookie数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:const allCookies = af.cookies.getAll(); console.log(allCookies)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在控制台输出中查看所有Cookie"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "获取所有可用的Cookie"
      },
      {
        "id": "3",
        "name": "控制台输出显示Cookie对象或数组"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.cookies.getAll()方法可调用"
      },
      {
        "id": "2",
        "name": "返回所有Cookie的集合"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "返回值可能是对象或数组格式"
      }
    ]
  },
  {
    "purpose": "使用af.cookies.set(name, value)设置Cookie值",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.cookies.set(\"auth_token\", \"xyz789\")"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在后续请求中验证Cookie已设置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "Cookie成功设置"
      },
      {
        "id": "3",
        "name": "后续请求的请求头中包含该Cookie"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.cookies.set()方法可调用"
      },
      {
        "id": "2",
        "name": "Cookie成功保存"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Cookie在后续请求中自动附加到请求头"
      }
    ]
  },
  {
    "purpose": "使用af.cookies.remove(name)删除Cookie",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已存在Cookie数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.cookies.remove(\"auth_token\")"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "验证Cookie已被删除:af.cookies.get(\"auth_token\")返回null"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "Cookie成功删除"
      },
      {
        "id": "3",
        "name": "再次获取该Cookie时返回null或undefined"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.cookies.remove()方法可调用"
      },
      {
        "id": "2",
        "name": "指定的Cookie被删除"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "删除不存在的Cookie不会报错"
      }
    ]
  }
],
}

export default node
