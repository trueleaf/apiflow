import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "af.localStorage API",
  description: "af.localStorage API",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.localStorage.set(key, value)存储持久数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.localStorage.set(\"user_id\", \"12345\")"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "数据成功保存在本地存储中"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "持久数据成功存储"
      },
      {
        "id": "3",
        "name": "键值对可以在后续请求中持续访问"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.localStorage.set()方法可调用"
      },
      {
        "id": "2",
        "name": "数据存储成功"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "本地存储数据在应用关闭后仍然保留"
      }
    ]
  },
  {
    "purpose": "使用af.localStorage.get(key)获取持久数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已通过af.localStorage.set()存储持久数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:const userId = af.localStorage.get(\"user_id\"); console.log(userId)"
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
        "name": "成功获取之前存储的持久数据"
      },
      {
        "id": "3",
        "name": "控制台输出显示正确的值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.localStorage.get()方法可调用"
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
    "purpose": "使用af.localStorage.remove(key)删除持久数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已通过af.localStorage.set()存储持久数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.localStorage.remove(\"user_id\")"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "验证数据已被删除:af.localStorage.get(\"user_id\")返回null"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "持久数据成功删除"
      },
      {
        "id": "3",
        "name": "再次获取该键时返回null或undefined"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.localStorage.remove()方法可调用"
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
    "purpose": "使用af.localStorage.clear()清空所有持久数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已存储多个持久数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.localStorage.clear()"
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
        "name": "所有持久数据被清空"
      },
      {
        "id": "3",
        "name": "后续get()调用返回null"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.localStorage.clear()方法可调用"
      },
      {
        "id": "2",
        "name": "清空所有持久数据"
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
    "purpose": "持久数据在关闭应用后仍然保留",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.localStorage.set(\"persist_key\", \"persist_value\")"
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
        "name": "在后置脚本中验证:console.log(af.localStorage.get(\"persist_key\"))"
      },
      {
        "id": "6",
        "name": "发送请求查看控制台输出"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "初始时持久数据存储成功"
      },
      {
        "id": "2",
        "name": "应用关闭后持久数据仍然保留"
      },
      {
        "id": "3",
        "name": "重新打开应用后get()返回存储的值(数据未被清空)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "持久存储在应用生命周期内保留"
      },
      {
        "id": "2",
        "name": "应用关闭和重新启动不影响数据"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "本地存储的生命周期超越应用会话期间"
      },
      {
        "id": "2",
        "name": "只有显式调用remove()或clear()才能删除数据"
      }
    ]
  }
],
}

export default node
