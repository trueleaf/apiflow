import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "contextMenuBlank",
  description: "鼠标右键空白区域",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键空白区域,出现新建接口,新建文件夹,设置公共请求头,粘贴节点(可能置灰)等功能",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成"
      },
      {
        "id": "3",
        "name": "showContextmenu初始值为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的空白位置点击鼠标右键"
      },
      {
        "id": "2",
        "name": "观察弹出的右键菜单内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "showContextmenu变为true"
      },
      {
        "id": "2",
        "name": "显示SContextmenu组件"
      },
      {
        "id": "3",
        "name": "菜单中显示\"新建接口\"选项"
      },
      {
        "id": "4",
        "name": "菜单中显示\"新建文件夹\"选项"
      },
      {
        "id": "5",
        "name": "菜单中显示\"设置公共请求头\"选项"
      },
      {
        "id": "6",
        "name": "菜单中显示\"粘贴\"选项(若无剪贴板数据则置灰)"
      },
      {
        "id": "7",
        "name": "不显示剪切,复制,重命名,删除等选项"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleWrapContextmenu处理空白区域右键事件(Banner.vue:10)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode为null时显示新建相关菜单项(Banner.vue:223-228)"
      },
      {
        "id": "3",
        "name": "pasteValue判断粘贴按钮是否可用(Banner.vue:238-239)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空白区域右键不选中任何节点"
      },
      {
        "id": "2",
        "name": "菜单位置跟随鼠标点击位置"
      }
    ]
  },
  {
    "purpose": "鼠标右键空白区域,点击新建接口(httpNode,websocketNode,httpMockNode,websocketMockNode),成功后在根节点末尾生成节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已在空白区域右键打开菜单"
      },
      {
        "id": "3",
        "name": "菜单中显示\"新建接口\"选项"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"新建接口\"选项"
      },
      {
        "id": "2",
        "name": "在弹出的对话框中选择节点类型(HTTP/WebSocket/HTTPMock/WebSocketMock)"
      },
      {
        "id": "3",
        "name": "输入接口名称"
      },
      {
        "id": "4",
        "name": "点击确定按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "addFileDialogVisible变为true,弹出SAddFileDialog对话框"
      },
      {
        "id": "2",
        "name": "对话框pid参数为undefined(空白区域)"
      },
      {
        "id": "3",
        "name": "确认后新节点出现在根节点列表末尾"
      },
      {
        "id": "4",
        "name": "新节点的pid为空字符串"
      },
      {
        "id": "5",
        "name": "新节点的sort值为Date.now()确保排在末尾"
      },
      {
        "id": "6",
        "name": "离线模式下调用apiNodesCache.addNode保存数据"
      },
      {
        "id": "7",
        "name": "在线模式下调用/api/project/doc接口创建节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleOpenAddFileDialog打开新建对话框(Banner.vue:224)"
      },
      {
        "id": "2",
        "name": "SAddFileDialog组件接收pid参数(Banner.vue:256-257)"
      },
      {
        "id": "3",
        "name": "handleAddFileAndFolderCb回调处理新节点添加"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "新建的节点类型由对话框内选择决定"
      },
      {
        "id": "2",
        "name": "节点名称支持自定义输入"
      }
    ]
  },
  {
    "purpose": "鼠标右键空白区域,点击新建文件夹,成功后在根节点最后一个目录节点下面生成目录节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已在空白区域右键打开菜单"
      },
      {
        "id": "3",
        "name": "菜单中显示\"新建文件夹\"选项"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"新建文件夹\"选项"
      },
      {
        "id": "2",
        "name": "在弹出的对话框中输入文件夹名称"
      },
      {
        "id": "3",
        "name": "点击确定按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "addFolderDialogVisible变为true,弹出SAddFolderDialog对话框"
      },
      {
        "id": "2",
        "name": "确认后新folder出现在根级别"
      },
      {
        "id": "3",
        "name": "新folder排在已有folder之后,非folder节点之前"
      },
      {
        "id": "4",
        "name": "新folder的type为\"folder\""
      },
      {
        "id": "5",
        "name": "新folder的pid为空字符串"
      },
      {
        "id": "6",
        "name": "离线模式下调用apiNodesCache.addNode保存数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleOpenAddFolderDialog打开新建文件夹对话框(Banner.vue:226)"
      },
      {
        "id": "2",
        "name": "SAddFolderDialog组件接收pid参数(Banner.vue:258-259)"
      },
      {
        "id": "3",
        "name": "folder节点的sort值需要保证排在非folder节点之前"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder始终排在非folder节点之前"
      },
      {
        "id": "2",
        "name": "新建folder默认处于展开状态"
      }
    ]
  },
  {
    "purpose": "鼠标右键空白区域,点击设置公共请求头,导航区域增加公共请求头标签,内容区域出现公共请求头设置内容",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已在空白区域右键打开菜单"
      },
      {
        "id": "3",
        "name": "菜单中显示\"设置公共请求头\"选项"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"设置公共请求头\"选项"
      },
      {
        "id": "2",
        "name": "观察导航区域和内容区域的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右键菜单关闭"
      },
      {
        "id": "2",
        "name": "导航区域新增\"公共请求头\"标签页"
      },
      {
        "id": "3",
        "name": "标签页自动切换到\"公共请求头\""
      },
      {
        "id": "4",
        "name": "内容区域显示公共请求头配置界面"
      },
      {
        "id": "5",
        "name": "公共请求头标签显示正确的名称和图标"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleJumpToCommonHeader处理跳转逻辑(Banner.vue:228)"
      },
      {
        "id": "2",
        "name": "projectNavStore添加公共请求头nav项"
      },
      {
        "id": "3",
        "name": "内容区域根据nav类型渲染对应组件"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "公共请求头会应用到项目下所有HTTP请求"
      },
      {
        "id": "2",
        "name": "每个项目可以独立配置公共请求头"
      }
    ]
  },
  {
    "purpose": "鼠标右键空白区域,点击粘贴,可以粘贴节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已执行过复制或剪切操作,pasteValue有数据"
      },
      {
        "id": "3",
        "name": "已在空白区域右键打开菜单"
      },
      {
        "id": "4",
        "name": "\"粘贴\"选项未置灰"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"粘贴\"选项"
      },
      {
        "id": "2",
        "name": "观察banner区域的节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "调用pasteNodes函数执行粘贴操作"
      },
      {
        "id": "2",
        "name": "粘贴的节点出现在根节点列表中"
      },
      {
        "id": "3",
        "name": "粘贴的节点生成新的_id"
      },
      {
        "id": "4",
        "name": "粘贴节点的pid设置为空字符串"
      },
      {
        "id": "5",
        "name": "离线模式下调用apiNodesCache.addNode保存数据"
      },
      {
        "id": "6",
        "name": "在线模式下调用/api/project/paste_docs接口"
      },
      {
        "id": "7",
        "name": "如果是剪切操作,原节点被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handlePasteNode调用pasteNodes函数(Banner.vue:239)"
      },
      {
        "id": "2",
        "name": "pasteNodes函数处理节点复制和ID映射(curd-node.ts:285-422)"
      },
      {
        "id": "3",
        "name": "currentOperationalNode为null时粘贴到根级别"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "粘贴操作支持同项目和跨项目"
      },
      {
        "id": "2",
        "name": "跨项目粘贴会复制完整的节点数据"
      }
    ]
  }
],
}

export default node
