import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "displayOrderConfig",
  description: "显示顺序配置",
  children: [],
  atomicFunc: [
  {
    "purpose": "拖拽调整Body参数模式显示顺序后,Body区域按新顺序展示",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "显示顺序配置选项可见"
      },
      {
        "id": "3",
        "name": "Body参数模式选项可见(JSON,FormData,Raw等)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在显示顺序配置中找到Body参数模式列表"
      },
      {
        "id": "2",
        "name": "拖拽改变模式的顺序,如将Raw移到最前"
      },
      {
        "id": "3",
        "name": "保存配置"
      },
      {
        "id": "4",
        "name": "回到请求编辑页面查看Body区域的模式顺序"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "顺序成功修改"
      },
      {
        "id": "2",
        "name": "Body区域按新顺序展示参数模式"
      },
      {
        "id": "3",
        "name": "拖拽操作流畅无卡顿"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Body参数模式顺序可拖拽调整"
      },
      {
        "id": "2",
        "name": "配置生效于实际UI展示"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "帮助用户自定义常用模式的顺序"
      }
    ]
  },
  {
    "purpose": "拖拽调整标签页显示顺序后,标签按新顺序展示",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "显示顺序配置选项可见"
      },
      {
        "id": "3",
        "name": "标签页选项可见(URL,Params,Body,返回参数等)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在显示顺序配置中找到标签页列表"
      },
      {
        "id": "2",
        "name": "拖拽改变标签页的顺序"
      },
      {
        "id": "3",
        "name": "保存配置"
      },
      {
        "id": "4",
        "name": "回到请求编辑页面查看标签页顺序"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "顺序成功修改"
      },
      {
        "id": "2",
        "name": "标签页按新顺序显示"
      },
      {
        "id": "3",
        "name": "拖拽操作流畅"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "标签页顺序可拖拽调整"
      },
      {
        "id": "2",
        "name": "配置生效于实际UI展示"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "帮助用户自定义常用标签的顺序"
      }
    ]
  },
  {
    "purpose": "显示顺序修改后刷新页面,顺序保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点的设置面板"
      },
      {
        "id": "2",
        "name": "已修改了Body参数模式或标签页的顺序"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "修改显示顺序配置中的某个顺序"
      },
      {
        "id": "2",
        "name": "保存配置"
      },
      {
        "id": "3",
        "name": "刷新整个页面"
      },
      {
        "id": "4",
        "name": "重新打开httpNode节点的设置面板"
      },
      {
        "id": "5",
        "name": "验证顺序是否仍为修改后的顺序"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "配置保存成功"
      },
      {
        "id": "2",
        "name": "刷新后顺序保持不变"
      },
      {
        "id": "3",
        "name": "顺序持久化正确"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "显示顺序配置正确保存"
      },
      {
        "id": "2",
        "name": "刷新不会重置顺序"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "用户偏好设置需要持久化"
      }
    ]
  }
],
}

export default node
