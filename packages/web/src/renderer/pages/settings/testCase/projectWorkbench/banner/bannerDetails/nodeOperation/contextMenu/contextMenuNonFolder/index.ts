import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "contextMenuNonFolder",
  description: "鼠标右键非folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键非folder节点,出现剪切,复制,生成副本,重命名,删除等功能",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个非folder节点(http/websocket/mock等)"
      },
      {
        "id": "3",
        "name": "showContextmenu初始值为false"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到目标非folder节点"
      },
      {
        "id": "2",
        "name": "在该节点上点击鼠标右键"
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
        "name": "currentOperationalNode设置为当前节点"
      },
      {
        "id": "3",
        "name": "菜单中显示\"剪切\"选项(快捷键Ctrl+X)"
      },
      {
        "id": "4",
        "name": "菜单中显示\"复制\"选项(快捷键Ctrl+C)"
      },
      {
        "id": "5",
        "name": "菜单中显示\"生成副本\"选项"
      },
      {
        "id": "6",
        "name": "菜单中显示\"重命名\"选项(快捷键F2)"
      },
      {
        "id": "7",
        "name": "菜单中显示\"删除\"选项(快捷键Delete)"
      },
      {
        "id": "8",
        "name": "不显示\"新建接口\",\"新建文件夹\",\"粘贴\"等选项"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleShowContextmenu处理节点右键事件"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.type !== \"folder\"时隐藏新建菜单项(Banner.vue:223-228)"
      },
      {
        "id": "3",
        "name": "\"生成副本\"仅对非folder节点显示(Banner.vue:236-237)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "非folder节点不能包含子节点"
      },
      {
        "id": "2",
        "name": "非folder节点有\"生成副本\"特有功能"
      }
    ]
  },
  {
    "purpose": "鼠标右键非folder节点,点击剪切,被剪切节点样式发生改变,点击粘贴(空白区域,folder节点上),可以粘贴节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个非folder节点"
      },
      {
        "id": "3",
        "name": "已在非folder节点上右键打开菜单"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"剪切\"选项"
      },
      {
        "id": "2",
        "name": "观察被剪切节点的样式变化"
      },
      {
        "id": "3",
        "name": "在目标位置(空白区域或folder)右键点击\"粘贴\""
      },
      {
        "id": "4",
        "name": "观察粘贴后的结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "剪切后节点显示剪切样式(如半透明)"
      },
      {
        "id": "2",
        "name": "pasteValue设置为当前节点数据"
      },
      {
        "id": "3",
        "name": "cutNodes记录被剪切的节点"
      },
      {
        "id": "4",
        "name": "粘贴后节点移动到目标位置"
      },
      {
        "id": "5",
        "name": "原位置的节点被删除"
      },
      {
        "id": "6",
        "name": "节点的pid更新为目标位置"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCutNode设置剪切状态"
      },
      {
        "id": "2",
        "name": "剪切样式通过CSS类控制"
      },
      {
        "id": "3",
        "name": "粘贴后调用deleteNode删除原节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切是移动操作"
      },
      {
        "id": "2",
        "name": "剪切后再次复制/剪切会覆盖之前的剪贴板"
      }
    ]
  },
  {
    "purpose": "鼠标右键非folder节点,点击复制,点击粘贴(空白区域,folder节点上),可以粘贴节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个非folder节点"
      },
      {
        "id": "3",
        "name": "已在非folder节点上右键打开菜单"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"复制\"选项"
      },
      {
        "id": "2",
        "name": "在目标位置(空白区域或folder)右键打开菜单"
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
        "name": "pasteValue设置为当前节点数据"
      },
      {
        "id": "2",
        "name": "原节点保持不变"
      },
      {
        "id": "3",
        "name": "粘贴后在目标位置生成节点副本"
      },
      {
        "id": "4",
        "name": "副本拥有新的_id"
      },
      {
        "id": "5",
        "name": "副本的pid设置为目标位置"
      },
      {
        "id": "6",
        "name": "副本包含原节点的所有配置数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode设置pasteValue"
      },
      {
        "id": "2",
        "name": "pasteNodes为节点生成新ID"
      },
      {
        "id": "3",
        "name": "复制包含完整的节点数据(请求配置,响应等)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "复制不影响原节点"
      },
      {
        "id": "2",
        "name": "可多次粘贴同一复制内容"
      }
    ]
  },
  {
    "purpose": "鼠标右键非folder节点,点击生成副本,可以在当前节点后面生成副本节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个非folder节点"
      },
      {
        "id": "3",
        "name": "已在非folder节点上右键打开菜单"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击右键菜单中的\"生成副本\"选项"
      },
      {
        "id": "2",
        "name": "观察banner区域的节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "调用forkNode函数生成副本"
      },
      {
        "id": "2",
        "name": "副本节点出现在原节点后面"
      },
      {
        "id": "3",
        "name": "副本拥有新的_id"
      },
      {
        "id": "4",
        "name": "副本的pid与原节点相同"
      },
      {
        "id": "5",
        "name": "副本的sort值在原节点和下一节点之间"
      },
      {
        "id": "6",
        "name": "副本包含原节点的所有配置数据"
      },
      {
        "id": "7",
        "name": "离线模式调用apiNodesCache.addNode保存"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleForkNode调用forkNode(Banner.vue:237)"
      },
      {
        "id": "2",
        "name": "forkNode计算newSort = (currentSort + nextSiblingSort) / 2(curd-node.ts:449-450)"
      },
      {
        "id": "3",
        "name": "bannerStore.splice在正确位置插入副本(curd-node.ts:465-475)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "生成副本是快速复制的便捷方式"
      },
      {
        "id": "2",
        "name": "副本直接出现在原节点后面无需选择位置"
      }
    ]
  },
  {
    "purpose": "鼠标右键非folder节点,点击重命名(或f2),可以正常重命名",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个非folder节点"
      },
      {
        "id": "3",
        "name": "节点非只读(readonly !== true)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在非folder节点上右键打开菜单"
      },
      {
        "id": "2",
        "name": "点击\"重命名\"选项(或直接按F2快捷键)"
      },
      {
        "id": "3",
        "name": "在输入框中修改节点名称"
      },
      {
        "id": "4",
        "name": "按Enter键或点击其他区域确认"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "editNode设置为当前节点"
      },
      {
        "id": "2",
        "name": "节点进入编辑状态,显示输入框"
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
        "name": "确认后节点名称更新"
      },
      {
        "id": "6",
        "name": "projectNavStore.changeNavInfoById同步更新标签名称"
      },
      {
        "id": "7",
        "name": "httpNodeStore.changeHttpNodeName同步更新详情名称"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleRenameNode触发重命名"
      },
      {
        "id": "2",
        "name": "renameNode同时更新banner,nav,httpNode三处名称(curd-node.ts:667-674)"
      },
      {
        "id": "3",
        "name": "handleWatchNodeInput验证输入不为空(Banner.vue:619-626)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "名称同时在多个地方显示需同步更新"
      },
      {
        "id": "2",
        "name": "空名称会显示错误样式"
      }
    ]
  },
  {
    "purpose": "鼠标右键非folder节点,点击删除(或delete),可以正常删除目录",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个非folder节点"
      },
      {
        "id": "3",
        "name": "已在非folder节点上右键打开菜单"
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
        "name": "观察节点的删除结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "ElMessageBox弹出删除确认对话框"
      },
      {
        "id": "2",
        "name": "对话框显示\"确定删除 xxx 节点\""
      },
      {
        "id": "3",
        "name": "确认后节点从banner中移除"
      },
      {
        "id": "4",
        "name": "相关的nav标签页被关闭"
      },
      {
        "id": "5",
        "name": "离线模式调用apiNodesCache.deleteNodes"
      },
      {
        "id": "6",
        "name": "在线模式调用/api/project/doc DELETE接口"
      },
      {
        "id": "7",
        "name": "触发apidoc/deleteDocs事件"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode函数处理删除逻辑(curd-node.ts:33-119)"
      },
      {
        "id": "2",
        "name": "ElMessageBox.confirm显示确认对话框(curd-node.ts:112-118)"
      },
      {
        "id": "3",
        "name": "eventEmitter.emit触发删除事件(curd-node.ts:108)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "删除操作需要用户确认"
      },
      {
        "id": "2",
        "name": "删除后数据不可恢复"
      }
    ]
  }
],
}

export default node
