import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "renameHttpMockNode",
  description: "重命名节点httpMockNode节点",
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
        "name": "项目中已存在至少一个httpMockNode节点"
      },
      {
        "id": "3",
        "name": "httpMockNode节点未处于编辑状态"
      },
      {
        "id": "4",
        "name": "httpMockNode节点readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "找到目标httpMockNode节点(显示\"mock\"图标)"
      },
      {
        "id": "2",
        "name": "鼠标右键点击该httpMockNode节点"
      },
      {
        "id": "3",
        "name": "在弹出的右键菜单中点击\"重命名\""
      },
      {
        "id": "4",
        "name": "在输入框中输入新名称"
      },
      {
        "id": "5",
        "name": "按回车或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "节点名称变为可编辑输入框"
      },
      {
        "id": "2",
        "name": "输入框自动获得焦点"
      },
      {
        "id": "3",
        "name": "输入新名称后节点名称更新"
      },
      {
        "id": "4",
        "name": "bannerStore和projectNavStore同步更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "httpMockNode节点渲染逻辑判断editNode?._id !== scope.data._id(Banner.vue:70)"
      },
      {
        "id": "2",
        "name": "handleChangeNodeName调用renameNode函数"
      },
      {
        "id": "3",
        "name": "renameNode更新bannerStore和projectNavStore"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "httpMockNode重命名逻辑与其他节点类型相同"
      }
    ]
  },
  {
    "purpose": "active 节点,F2重命名,输入名称,回车或blur",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "httpMockNode节点处于active状态"
      },
      {
        "id": "3",
        "name": "readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击选中httpMockNode节点"
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
        "name": "按F2后节点名称变为可编辑输入框"
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
        "name": "renameNode函数执行更新逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "F2快捷键必须在active状态下使用"
      }
    ]
  },
  {
    "purpose": "点击节点更多操作,点击重命名,输入名称,回车或blur",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "httpMockNode节点readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标悬停httpMockNode节点"
      },
      {
        "id": "2",
        "name": "点击\"更多操作\"按钮"
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
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": ".more按钮触发handleShowContextmenu"
      },
      {
        "id": "2",
        "name": "点击\"重命名\"触发handleRenameNode"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "更多操作按钮和右键菜单效果相同"
      }
    ]
  },
  {
    "purpose": "节点名称未填写不允许重命名",
    "precondition": [
      {
        "id": "1",
        "name": "httpMockNode节点处于编辑状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "触发重命名"
      },
      {
        "id": "2",
        "name": "删除所有文字"
      },
      {
        "id": "3",
        "name": "尝试回车或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入框显示错误样式"
      },
      {
        "id": "2",
        "name": "重命名被阻止"
      },
      {
        "id": "3",
        "name": "节点名称保持原值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleWatchNodeInput实时检查"
      },
      {
        "id": "2",
        "name": "renameNode检查空值并return"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空值验证分两层"
      }
    ]
  }
],
}

export default node
