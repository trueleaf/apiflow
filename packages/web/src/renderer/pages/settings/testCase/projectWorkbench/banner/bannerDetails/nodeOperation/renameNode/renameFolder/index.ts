import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "renameFolder",
  description: "重命名节点folder节点",
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
        "name": "项目中已存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "folder节点未处于编辑状态"
      },
      {
        "id": "4",
        "name": "folder节点readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "找到目标folder节点(显示文件夹图标)"
      },
      {
        "id": "2",
        "name": "鼠标右键点击该folder节点"
      },
      {
        "id": "3",
        "name": "在弹出的右键菜单中点击\"重命名\""
      },
      {
        "id": "4",
        "name": "在输入框中输入新的文件夹名称"
      },
      {
        "id": "5",
        "name": "按回车或点击输入框外部区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "folder节点名称变为可编辑输入框"
      },
      {
        "id": "2",
        "name": "输入框自动获得焦点"
      },
      {
        "id": "3",
        "name": "输入新名称后folder节点名称更新"
      },
      {
        "id": "4",
        "name": "bannerStore中该folder的name字段更新为新名称"
      },
      {
        "id": "5",
        "name": "重命名成功后自动调用getCommonHeaders()重新拉取公共请求头"
      },
      {
        "id": "6",
        "name": "离线模式下IndexedDB更新,在线模式下服务器数据更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "folder节点渲染逻辑判断editNode?._id !== scope.data._id(Banner.vue:119)"
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
        "name": "renameNode函数检查data.type === \"folder\"(curd-node.ts:693或723)"
      },
      {
        "id": "5",
        "name": "如果是folder类型,调用getCommonHeaders()重新拉取公共请求头(curd-node.ts:694或724)"
      },
      {
        "id": "6",
        "name": "bannerStore.changeBannerInfoById更新name字段"
      },
      {
        "id": "7",
        "name": "离线模式调用apiNodesCache.updateNodeName"
      },
      {
        "id": "8",
        "name": "在线模式调用request.put(\"/api/project/change_doc_info\")"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder重命名有特殊逻辑:重命名成功后需要重新拉取公共请求头"
      },
      {
        "id": "2",
        "name": "公共请求头可能与folder名称相关,因此需要重新获取"
      },
      {
        "id": "3",
        "name": "folder重命名不更新projectNavStore(folder不在nav中)"
      },
      {
        "id": "4",
        "name": "folder显示.folder-icon文件夹图标(Banner.vue:118)"
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
        "name": "folder节点处于active状态"
      },
      {
        "id": "3",
        "name": "folder节点readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击选中目标folder节点,使其处于active状态"
      },
      {
        "id": "2",
        "name": "按下键盘F2键"
      },
      {
        "id": "3",
        "name": "观察folder节点名称变为可编辑的输入框"
      },
      {
        "id": "4",
        "name": "在输入框中输入新的文件夹名称"
      },
      {
        "id": "5",
        "name": "按下回车键或点击输入框外部区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按F2键后folder节点名称立即变为可编辑输入框"
      },
      {
        "id": "2",
        "name": "输入新名称后folder节点名称更新"
      },
      {
        "id": "3",
        "name": "bannerStore中的folder名称同步更新"
      },
      {
        "id": "4",
        "name": "自动调用getCommonHeaders()重新拉取公共请求头"
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
      },
      {
        "id": "5",
        "name": "检查data.type === \"folder\"后调用getCommonHeaders()"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "F2快捷键必须在folder处于active状态时才能使用"
      },
      {
        "id": "2",
        "name": "folder重命名成功后会触发公共请求头的重新获取"
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
        "name": "folder节点readonly为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "将鼠标移动到folder节点上"
      },
      {
        "id": "2",
        "name": "点击\"更多操作\"按钮"
      },
      {
        "id": "3",
        "name": "在弹出的右键菜单中点击\"重命名\""
      },
      {
        "id": "4",
        "name": "在输入框中输入新的文件夹名称"
      },
      {
        "id": "5",
        "name": "按回车或blur"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击\"更多操作\"按钮后显示右键菜单"
      },
      {
        "id": "2",
        "name": "点击\"重命名\"后folder节点名称变为可编辑输入框"
      },
      {
        "id": "3",
        "name": "输入新名称后folder节点名称更新"
      },
      {
        "id": "4",
        "name": "自动调用getCommonHeaders()重新拉取公共请求头"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "folder节点渲染包含.more按钮(Banner.vue:132-136)"
      },
      {
        "id": "2",
        "name": ".more按钮绑定@click.stop事件,调用handleShowContextmenu"
      },
      {
        "id": "3",
        "name": "handleShowContextmenu设置currentOperationalNode"
      },
      {
        "id": "4",
        "name": "点击\"重命名\"触发handleRenameNode方法"
      },
      {
        "id": "5",
        "name": "renameNode函数检查folder类型并调用getCommonHeaders()"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "更多操作按钮和右键菜单效果相同"
      },
      {
        "id": "2",
        "name": "folder节点可能显示.folder-mock-indicator(如果包含运行中的Mock接口)"
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
        "name": "folder节点处于重命名编辑状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "触发folder节点的重命名"
      },
      {
        "id": "2",
        "name": "删除输入框中的所有文字,使其内容为空"
      },
      {
        "id": "3",
        "name": "观察输入框样式变化"
      },
      {
        "id": "4",
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
        "name": "folder节点名称保持原值不变"
      },
      {
        "id": "4",
        "name": "不调用getCommonHeaders()(因为重命名被阻止)"
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
      },
      {
        "id": "4",
        "name": "getCommonHeaders()不会被调用(重命名未成功)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空值验证分两层:实时反馈和最终拦截"
      },
      {
        "id": "2",
        "name": "folder节点的空值验证逻辑与其他节点类型完全相同"
      }
    ]
  }
],
}

export default node
