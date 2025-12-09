import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "redirectConfig",
  description: "重定向配置",
  children: [],
  atomicFunc: [
  {
    "purpose": "开启自动跟随重定向时,请求自动跟随重定向并返回最终响应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "重定向配置选项可见"
      },
      {
        "id": "3",
        "name": "有一个返回重定向响应的API"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置面板中启用\"自动跟随重定向\"选项"
      },
      {
        "id": "2",
        "name": "保存配置"
      },
      {
        "id": "3",
        "name": "发送一个返回301/302重定向的请求"
      },
      {
        "id": "4",
        "name": "观察是否自动跟随重定向并返回最终响应"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "配置成功启用"
      },
      {
        "id": "2",
        "name": "请求自动跟随重定向"
      },
      {
        "id": "3",
        "name": "响应显示最终页面的响应数据,而非重定向响应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "重定向配置可启用"
      },
      {
        "id": "2",
        "name": "自动跟随重定向功能正常工作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "自动跟随重定向可简化API测试"
      }
    ]
  },
  {
    "purpose": "关闭自动跟随重定向时,请求返回重定向响应不继续跟随",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "重定向配置选项可见"
      },
      {
        "id": "3",
        "name": "有一个返回重定向响应的API"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置面板中禁用\"自动跟随重定向\"选项"
      },
      {
        "id": "2",
        "name": "保存配置"
      },
      {
        "id": "3",
        "name": "发送一个返回301/302重定向的请求"
      },
      {
        "id": "4",
        "name": "观察是否返回重定向响应并停止"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "配置成功禁用"
      },
      {
        "id": "2",
        "name": "请求返回重定向响应"
      },
      {
        "id": "3",
        "name": "不继续跟随重定向到最终页面"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "重定向配置可禁用"
      },
      {
        "id": "2",
        "name": "禁用时不自动跟随重定向"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "禁用可用于调试重定向逻辑"
      }
    ]
  },
  {
    "purpose": "修改最大重定向次数配置,超过次数后停止重定向并提示",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "重定向配置选项可见"
      },
      {
        "id": "3",
        "name": "自动跟随重定向已启用"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置面板中找到\"最大重定向次数\"配置"
      },
      {
        "id": "2",
        "name": "修改为较小的值,如2次"
      },
      {
        "id": "3",
        "name": "保存配置"
      },
      {
        "id": "4",
        "name": "发送一个产生多次重定向的请求"
      },
      {
        "id": "5",
        "name": "观察是否在超过限制后停止并提示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "配置成功修改"
      },
      {
        "id": "2",
        "name": "超过重定向次数后停止跟随"
      },
      {
        "id": "3",
        "name": "显示提示或错误信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "最大重定向次数配置可修改"
      },
      {
        "id": "2",
        "name": "超过限制时有相应提示"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "防止无限重定向循环"
      }
    ]
  }
],
}

export default node
