import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "renameWebsocketNode",
  description: "重命名节点websocketNode节点",
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
        "name": "项目中已存在至少一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "websocketNode节点当前未处于编辑状态(editNode.value为null)"
      },
      {
        "id": "4",
        "name": "websocketNode节点的readonly字段为false(可编辑)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标websocketNode节点(显示WS/WSS图标)"
      },
      {
        "id": "2",
        "name": "鼠标右键点击该websocketNode节点"
      },
      {
        "id": "3",
        "name": "在弹出的SContextmenu右键菜单中找到\"重命名\"选项"
      },
      {
        "id": "4",
        "name": "点击\"重命名\"菜单项"
      },
      {
        "id": "5",
        "name": "观察节点名称变为可编辑的输入框,输入框自动获得焦点"
      },
      {
        "id": "6",
        "name": "在输入框中输入新的节点名称"
      },
      {
        "id": "7",
        "name": "按下回车键或点击输入框外部区域触发blur事件"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击\"重命名\"后,websocketNode节点名称立即变为可编辑的输入框"
      },
      {
        "id": "2",
        "name": "输入框自动获得焦点,可以直接输入"
      },
      {
        "id": "3",
        "name": "输入新名称后按回车或blur,节点名称更新为新名称"
      },
      {
        "id": "4",
        "name": "bannerStore中该websocketNode的name字段更新为新名称"
      },
      {
        "id": "5",
        "name": "projectNavStore中该websocketNode的label字段更新为新名称"
      },
      {
        "id": "6",
        "name": "离线模式下IndexedDB更新,在线模式下服务器数据更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "websocketNode节点渲染逻辑判断editNode?._id !== scope.data._id(Banner.vue:141)"
      },
      {
        "id": "2",
        "name": "输入框绑定@blur和@keydown.stop.enter事件调用handleChangeNodeName"
      },
      {
        "id": "3",
        "name": "handleChangeNodeName调用renameNode函数"
      },
      {
        "id": "4",
        "name": "renameNode函数更新bannerStore.changeBannerInfoById"
      },
      {
        "id": "5",
        "name": "renameNode函数更新projectNavStore.changeNavInfoById"
      },
      {
        "id": "6",
        "name": "离线模式调用apiNodesCache.updateNodeName"
      },
      {
        "id": "7",
        "name": "在线模式调用request.put(\"/api/project/change_doc_info\")"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketNode重命名逻辑与httpNode完全相同"
      },
      {
        "id": "2",
        "name": "websocketNode显示.ws-icon图标(WS/WSS)"
      },
      {
        "id": "3",
        "name": "重命名失败时会自动回滚前端状态"
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
        "name": "项目中已存在至少一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "websocketNode节点当前处于active状态"
      },
      {
        "id": "4",
        "name": "websocketNode节点的readonly字段为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击选中目标websocketNode节点,使其处于active状态"
      },
      {
        "id": "2",
        "name": "按下键盘F2键"
      },
      {
        "id": "3",
        "name": "观察节点名称变为可编辑的输入框"
      },
      {
        "id": "4",
        "name": "在输入框中输入新的节点名称"
      },
      {
        "id": "5",
        "name": "按下回车键或点击输入框外部区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按下F2键后,websocketNode节点名称立即变为可编辑的输入框"
      },
      {
        "id": "2",
        "name": "输入新名称后按回车或blur,节点名称更新为新名称"
      },
      {
        "id": "3",
        "name": "bannerStore,projectNavStore中的节点名称同步更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "document keydown事件监听器捕获F2键"
      },
      {
        "id": "2",
        "name": "检查currentOperationalNode.value不为null且readonly为false"
      },
      {
        "id": "3",
        "name": "调用handleRenameNode方法"
      },
      {
        "id": "4",
        "name": "renameNode函数执行重命名逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "F2快捷键必须在websocketNode处于active状态时才能使用"
      },
      {
        "id": "2",
        "name": "readonly节点无法通过F2重命名"
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
        "name": "项目中已存在至少一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "websocketNode节点的readonly字段为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "将鼠标移动到websocketNode节点上"
      },
      {
        "id": "2",
        "name": "点击\"更多操作\"按钮"
      },
      {
        "id": "3",
        "name": "在弹出的右键菜单中点击\"重命名\"选项"
      },
      {
        "id": "4",
        "name": "在输入框中输入新的节点名称"
      },
      {
        "id": "5",
        "name": "按下回车键或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击\"更多操作\"按钮后显示右键菜单"
      },
      {
        "id": "2",
        "name": "点击\"重命名\"后节点名称变为可编辑输入框"
      },
      {
        "id": "3",
        "name": "输入新名称后节点名称更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "websocketNode节点渲染包含.more按钮(Banner.vue:158-162)"
      },
      {
        "id": "2",
        "name": "handleShowContextmenu设置currentOperationalNode"
      },
      {
        "id": "3",
        "name": "点击\"重命名\"触发handleRenameNode方法"
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
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "websocketNode节点处于重命名编辑状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "触发websocketNode节点的重命名"
      },
      {
        "id": "2",
        "name": "删除输入框中的所有文字"
      },
      {
        "id": "3",
        "name": "尝试按下回车键或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入框内容为空时添加.error类名显示错误样式"
      },
      {
        "id": "2",
        "name": "重命名操作被阻止,不执行任何更新"
      },
      {
        "id": "3",
        "name": "节点名称保持原值不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleWatchNodeInput实时检查输入框是否为空"
      },
      {
        "id": "2",
        "name": "renameNode函数检查iptValue.trim() === \"\""
      },
      {
        "id": "3",
        "name": "如果为空直接return不执行重命名"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空值验证分两层:实时反馈和最终拦截"
      }
    ]
  }
],
}

export default node
