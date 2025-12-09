import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "renameWebsocketMockNode",
  description: "重命名节点websocketMock节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "active 节点,点击节点右键,点击重命名,输入名称,回车或blur",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少一个websocketMockNode节点"
      },
      {
        "id": "3",
        "name": "websocketMockNode节点未处于编辑状态"
      },
      {
        "id": "4",
        "name": "readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "找到websocketMockNode节点(显示Radio图标)"
      },
      {
        "id": "2",
        "name": "鼠标右键点击该节点"
      },
      {
        "id": "3",
        "name": "点击\"重命名\""
      },
      {
        "id": "4",
        "name": "输入新名称并回车或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "节点名称变为可编辑输入框"
      },
      {
        "id": "2",
        "name": "节点名称更新成功"
      },
      {
        "id": "3",
        "name": "bannerStore和projectNavStore同步更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "websocketMockNode节点渲染逻辑判断editNode(Banner.vue:167)"
      },
      {
        "id": "2",
        "name": "renameNode函数执行更新逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketMockNode重命名逻辑与其他节点类型相同"
      }
    ]
  },
  {
    "purpose": "active 节点,F2重命名,输入名称,回车或blur",
    "precondition": [
      {
        "id": "1",
        "name": "websocketMockNode节点处于active状态"
      },
      {
        "id": "2",
        "name": "readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击选中websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "按F2键"
      },
      {
        "id": "3",
        "name": "输入新名称并回车或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按F2后节点名称变为输入框"
      },
      {
        "id": "2",
        "name": "节点名称更新成功"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "F2快捷键触发handleRenameNode"
      },
      {
        "id": "2",
        "name": "renameNode函数执行"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "F2快捷键在active状态下生效"
      }
    ]
  },
  {
    "purpose": "点击节点更多操作,点击重命名,输入名称,回车或blur",
    "precondition": [
      {
        "id": "1",
        "name": "websocketMockNode节点readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标悬停websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "点击\"更多操作\"按钮"
      },
      {
        "id": "3",
        "name": "点击\"重命名\"并输入新名称"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "节点名称更新成功"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": ".more按钮触发handleShowContextmenu"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "更多操作和右键菜单效果相同"
      }
    ]
  },
  {
    "purpose": "节点名称未填写不允许重命名",
    "precondition": [
      {
        "id": "1",
        "name": "websocketMockNode节点处于编辑状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "触发重命名并删除所有文字"
      },
      {
        "id": "2",
        "name": "尝试回车或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "重命名被阻止,节点名称保持原值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "renameNode检查空值并return"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空值验证阻止重命名"
      }
    ]
  }
],
}

export default node
