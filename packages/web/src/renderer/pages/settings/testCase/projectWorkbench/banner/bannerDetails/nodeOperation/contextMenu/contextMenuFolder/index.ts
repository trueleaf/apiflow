import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "contextMenuFolder",
  description: "鼠标右键folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键folder节点,出现新建接口,新建文件夹,设置公共请求头,剪切,复制,粘贴(可能置灰),重命名,删除等功能",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "showContextmenu初始值为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到目标folder节点"
      },
      {
        "id": "2",
        "name": "在该folder节点上点击鼠标右键"
      },
      {
        "id": "3",
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
        "name": "currentOperationalNode设置为当前folder节点"
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
        "name": "菜单中显示\"剪切\"选项(快捷键Ctrl+X)"
      },
      {
        "id": "7",
        "name": "菜单中显示\"复制\"选项(快捷键Ctrl+C)"
      },
      {
        "id": "8",
        "name": "菜单中显示\"粘贴\"选项(若无剪贴板数据则置灰)"
      },
      {
        "id": "9",
        "name": "菜单中显示\"重命名\"选项(快捷键F2)"
      },
      {
        "id": "10",
        "name": "菜单中显示\"删除\"选项(快捷键Delete)"
      },
      {
        "id": "11",
        "name": "不显示\"生成副本\"选项(仅非folder节点显示)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleShowContextmenu处理节点右键事件(Banner.vue:23)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.type === \"folder\"时显示完整菜单(Banner.vue:223-244)"
      },
      {
        "id": "3",
        "name": "v-show控制菜单项的显示隐藏"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder节点支持所有节点操作加新建操作"
      },
      {
        "id": "2",
        "name": "菜单项之间有分隔线区分功能组"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击新建接口(httpNode,websocketNode,httpMockNode,websocketMockNode),成功后在当前folder内生成节点,并且生成的节点排在末尾",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已在folder节点上右键打开菜单"
      },
      {
        "id": "3",
        "name": "currentOperationalNode为当前folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"新建接口\"选项"
      },
      {
        "id": "2",
        "name": "在弹出的对话框中选择节点类型"
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
        "name": "addFileDialogVisible变为true"
      },
      {
        "id": "2",
        "name": "SAddFileDialog的pid参数为当前folder的_id"
      },
      {
        "id": "3",
        "name": "确认后新节点出现在当前folder内部"
      },
      {
        "id": "4",
        "name": "新节点排在folder内所有节点末尾"
      },
      {
        "id": "5",
        "name": "新节点的pid为当前folder的_id"
      },
      {
        "id": "6",
        "name": "folder自动展开显示新节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "SAddFileDialog接收pid为currentOperationalNode._id(Banner.vue:256-257)"
      },
      {
        "id": "2",
        "name": "handleAddFileAndFolderCb处理新节点添加到folder"
      },
      {
        "id": "3",
        "name": "bannerStore.changeExpandItems展开folder"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "在folder上新建接口会自动设置正确的pid"
      },
      {
        "id": "2",
        "name": "新节点排在folder内非folder节点的最后"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击新建文件夹,成功后在当前folder内生成节点,生成的节点在当前节点最后一个folder节点下面",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已在folder节点上右键打开菜单"
      },
      {
        "id": "3",
        "name": "currentOperationalNode为当前folder节点"
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
        "name": "addFolderDialogVisible变为true"
      },
      {
        "id": "2",
        "name": "SAddFolderDialog的pid参数为当前folder的_id"
      },
      {
        "id": "3",
        "name": "确认后新folder出现在当前folder内部"
      },
      {
        "id": "4",
        "name": "新folder排在已有folder之后,非folder节点之前"
      },
      {
        "id": "5",
        "name": "新folder的pid为当前folder的_id"
      },
      {
        "id": "6",
        "name": "父folder自动展开显示新folder"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "SAddFolderDialog接收pid为currentOperationalNode._id(Banner.vue:258-259)"
      },
      {
        "id": "2",
        "name": "folder节点排序在非folder节点之前"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持folder嵌套folder"
      },
      {
        "id": "2",
        "name": "嵌套层级无限制"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击设置公共请求头,导航区域增加公共请求头标签,标签文案正确,内容区域出现公共请求头设置内容",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已在folder节点上右键打开菜单"
      },
      {
        "id": "3",
        "name": "currentOperationalNode为当前folder节点"
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
        "name": "导航区域新增公共请求头标签页"
      },
      {
        "id": "3",
        "name": "标签页显示当前folder名称相关的公共请求头"
      },
      {
        "id": "4",
        "name": "内容区域显示该folder的公共请求头配置"
      },
      {
        "id": "5",
        "name": "该配置仅对folder内的HTTP请求生效"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleJumpToCommonHeader处理跳转(Banner.vue:228)"
      },
      {
        "id": "2",
        "name": "folder级别的公共请求头与项目级别独立"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder级别公共请求头可覆盖项目级别设置"
      },
      {
        "id": "2",
        "name": "支持层级继承的公共请求头机制"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击剪切,被剪切节点样式发生改变,点击粘贴(空白区域,folder节点上),可以粘贴节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "已在folder节点上右键打开菜单"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"剪切\"选项"
      },
      {
        "id": "2",
        "name": "观察被剪切folder节点的样式变化"
      },
      {
        "id": "3",
        "name": "在目标位置(空白区域或其他folder)右键点击\"粘贴\""
      },
      {
        "id": "4",
        "name": "观察粘贴后的结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "剪切后folder节点显示剪切样式(如半透明或虚线边框)"
      },
      {
        "id": "2",
        "name": "pasteValue设置为当前folder节点数据"
      },
      {
        "id": "3",
        "name": "cutNodes记录被剪切的节点"
      },
      {
        "id": "4",
        "name": "粘贴后folder移动到目标位置"
      },
      {
        "id": "5",
        "name": "原位置的folder节点被删除"
      },
      {
        "id": "6",
        "name": "folder内的所有子节点随之移动"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCutNode设置剪切状态(Banner.vue:232)"
      },
      {
        "id": "2",
        "name": "cutNodes.value记录被剪切节点"
      },
      {
        "id": "3",
        "name": "粘贴时调用deleteNode删除原节点(curd-node.ts:33-119)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切操作是移动操作,原节点会被删除"
      },
      {
        "id": "2",
        "name": "folder剪切时包含所有子节点"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击复制,点击粘贴(空白区域,folder节点上),可以粘贴节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "已在folder节点上右键打开菜单"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"复制\"选项"
      },
      {
        "id": "2",
        "name": "在目标位置(空白区域或其他folder)右键打开菜单"
      },
      {
        "id": "3",
        "name": "点击\"粘贴\"选项"
      },
      {
        "id": "4",
        "name": "观察粘贴后的结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "pasteValue设置为当前folder节点数据"
      },
      {
        "id": "2",
        "name": "原folder节点保持不变(复制非剪切)"
      },
      {
        "id": "3",
        "name": "粘贴后在目标位置生成folder副本"
      },
      {
        "id": "4",
        "name": "副本folder拥有新的_id"
      },
      {
        "id": "5",
        "name": "副本folder内所有子节点也生成新_id"
      },
      {
        "id": "6",
        "name": "副本folder的pid设置为目标位置"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode设置pasteValue(Banner.vue:234)"
      },
      {
        "id": "2",
        "name": "pasteNodes为所有节点生成新ID(curd-node.ts:330-340)"
      },
      {
        "id": "3",
        "name": "idMapping维护新旧ID映射关系"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "复制操作不影响原节点"
      },
      {
        "id": "2",
        "name": "可多次粘贴同一个复制的folder"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击粘贴,可以按照逻辑(情况一:单个httpNode,websocketNode,httpMockNode,websocketMockNode.情况二:单个folder.情况三:多个非folder节点.情况四:多个纯folder节点.情况五:混合类型节点)粘贴节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已执行过复制或剪切操作"
      },
      {
        "id": "3",
        "name": "已在folder节点上右键打开菜单"
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
        "name": "观察粘贴后folder内的节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "单个非folder节点:粘贴到folder末尾"
      },
      {
        "id": "2",
        "name": "单个folder节点:粘贴到folder内folder区域末尾"
      },
      {
        "id": "3",
        "name": "多个非folder节点:按原顺序粘贴到folder末尾"
      },
      {
        "id": "4",
        "name": "多个folder节点:按原顺序粘贴到folder内folder区域"
      },
      {
        "id": "5",
        "name": "混合类型节点:folder排前,非folder排后"
      },
      {
        "id": "6",
        "name": "所有粘贴节点的pid设置为目标folder的_id"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes处理各种节点类型组合(curd-node.ts:285-422)"
      },
      {
        "id": "2",
        "name": "addFileAndFolderCb处理节点添加到正确位置"
      },
      {
        "id": "3",
        "name": "folder内节点排序规则:folder在前,非folder在后"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "粘贴保持原有的层级结构"
      },
      {
        "id": "2",
        "name": "混合粘贴时自动调整排序"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击重命名(或f2),可以正常重命名",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "folder节点非只读(readonly !== true)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在folder节点上右键打开菜单"
      },
      {
        "id": "2",
        "name": "点击\"重命名\"选项(或直接按F2快捷键)"
      },
      {
        "id": "3",
        "name": "在输入框中修改folder名称"
      },
      {
        "id": "4",
        "name": "按Enter键或点击其他区域确认"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "editNode设置为当前folder节点"
      },
      {
        "id": "2",
        "name": "folder节点进入编辑状态,显示输入框"
      },
      {
        "id": "3",
        "name": "enableDrag设置为false禁止拖拽"
      },
      {
        "id": "4",
        "name": "输入框自动获取焦点"
      },
      {
        "id": "5",
        "name": "确认后folder名称更新"
      },
      {
        "id": "6",
        "name": "离线模式调用apiNodesCache.updateNodeName"
      },
      {
        "id": "7",
        "name": "在线模式调用相应API更新名称"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleRenameNode触发重命名(Banner.vue:241-242)"
      },
      {
        "id": "2",
        "name": "renameNode函数处理重命名逻辑(curd-node.ts:655-738)"
      },
      {
        "id": "3",
        "name": "handleChangeNodeName处理确认事件(Banner.vue:613-617)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空名称不允许保存"
      },
      {
        "id": "2",
        "name": "重命名期间禁止拖拽操作"
      }
    ]
  },
  {
    "purpose": "鼠标右键folder节点,点击删除(或delete),可以正常删除目录",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "已在folder节点上右键打开菜单"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"删除\"选项(或直接按Delete快捷键)"
      },
      {
        "id": "2",
        "name": "在弹出的确认对话框中点击\"确定\""
      },
      {
        "id": "3",
        "name": "观察folder节点的删除结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "ElMessageBox弹出删除确认对话框"
      },
      {
        "id": "2",
        "name": "对话框显示删除提示信息"
      },
      {
        "id": "3",
        "name": "确认后folder节点从banner中移除"
      },
      {
        "id": "4",
        "name": "folder内所有子节点同时被删除"
      },
      {
        "id": "5",
        "name": "相关的nav标签页被关闭"
      },
      {
        "id": "6",
        "name": "离线模式调用apiNodesCache.deleteNodes"
      },
      {
        "id": "7",
        "name": "在线模式调用/api/project/doc DELETE接口"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleDeleteNodes调用deleteNode(Banner.vue:243)"
      },
      {
        "id": "2",
        "name": "deleteNode收集所有子节点ID(curd-node.ts:40-48)"
      },
      {
        "id": "3",
        "name": "projectNavStore.deleteNavByIds关闭相关标签(curd-node.ts:101-106)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "删除folder会级联删除所有子节点"
      },
      {
        "id": "2",
        "name": "删除操作不可撤销"
      }
    ]
  }
],
}

export default node
