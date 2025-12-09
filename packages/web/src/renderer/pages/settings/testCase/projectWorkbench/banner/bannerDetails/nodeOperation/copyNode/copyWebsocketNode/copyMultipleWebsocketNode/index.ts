import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copyMultipleWebsocketNode",
  description: "复制多个websocketNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个websocketNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少3个websocketNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "按住Ctrl键,依次点击3个websocketNode节点,完成多选"
      },
      {
        "id": "2",
        "name": "右键点击\"批量复制\"(或ctrl+c)"
      },
      {
        "id": "3",
        "name": "在banner空白区域右键粘贴(或ctrl+v)"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "批量复制成功,剪贴板包含3个节点数据"
      },
      {
        "id": "2",
        "name": "粘贴成功,根节点下新增3个websocketNode节点"
      },
      {
        "id": "3",
        "name": "3个新节点添加到banner根节点末尾,保持原有顺序"
      },
      {
        "id": "4",
        "name": "3个新节点都拥有全新的_id"
      },
      {
        "id": "5",
        "name": "3个新节点的pid都为空字符串"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "selectNodes数组包含3个websocketNode节点"
      },
      {
        "id": "2",
        "name": "handleCopyNode写入3个节点到剪贴板(line 542)"
      },
      {
        "id": "3",
        "name": "pasteNodes处理3个节点的粘贴(line 285)"
      },
      {
        "id": "4",
        "name": "apiNodesCache.addNodes批量保存3个节点(line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量粘贴时节点的相对顺序保持不变"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个websocketNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少3个websocketNode节点和1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "按住Ctrl键,多选3个websocketNode节点"
      },
      {
        "id": "2",
        "name": "右键\"批量复制\""
      },
      {
        "id": "3",
        "name": "在folder节点上右键粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,folder下新增3个websocketNode节点"
      },
      {
        "id": "2",
        "name": "3个新节点的pid都为folder的_id"
      },
      {
        "id": "3",
        "name": "folder节点自动展开显示新节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes处理3个节点(line 285)"
      },
      {
        "id": "2",
        "name": "addFileAndFolderCb被调用3次,插入到folder子节点(line 162)"
      },
      {
        "id": "3",
        "name": "bannerStore.changeExpandItems展开folder(line 576)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量粘贴到folder时,所有节点都成为folder的直接子节点"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个websocketNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并创建了项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中包含至少3个websocketNode节点"
      },
      {
        "id": "3",
        "name": "项目B中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中,多选3个websocketNode节点并批量复制"
      },
      {
        "id": "2",
        "name": "切换到项目B"
      },
      {
        "id": "3",
        "name": "在folder节点上右键粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder下新增3个websocketNode节点"
      },
      {
        "id": "2",
        "name": "3个新节点的projectId都为项目B的ID"
      },
      {
        "id": "3",
        "name": "3个新节点的pid都为folder的_id"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测到跨项目粘贴(line 292)"
      },
      {
        "id": "2",
        "name": "apiNodesCache.getNodesByProjectId获取项目A的完整doc数据(line 305)"
      },
      {
        "id": "3",
        "name": "3个新节点的projectId更新为项目B的ID"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量粘贴需要从源项目获取完整文档数据"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个websocketNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并创建了项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中包含至少3个websocketNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中,多选3个websocketNode节点并批量复制"
      },
      {
        "id": "2",
        "name": "切换到项目B"
      },
      {
        "id": "3",
        "name": "在banner空白区域右键粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的根节点下新增3个websocketNode节点"
      },
      {
        "id": "2",
        "name": "3个新节点的projectId都为项目B的ID"
      },
      {
        "id": "3",
        "name": "3个新节点的pid都为空字符串"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测到跨项目粘贴(line 292)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode为null(banner空白区域)"
      },
      {
        "id": "3",
        "name": "addFileAndFolderCb进入根节点插入分支(line 168)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量粘贴到根节点时,所有节点的pid为空字符串"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个websocketNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少4个websocketNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个websocketNode节点并批量复制"
      },
      {
        "id": "2",
        "name": "右键点击另一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "观察右键菜单"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右键菜单中不显示\"粘贴\"选项"
      },
      {
        "id": "2",
        "name": "显示单个节点操作选项(重命名,删除,生成副本等)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "点击节点后,selectNodes数组重置为单选模式(line 411)"
      },
      {
        "id": "2",
        "name": "粘贴选项的v-show条件为false(line 238)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "在非folder节点上右键会退出多选模式,进入单选模式"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个websocketNode节点,focus 非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少4个websocketNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个websocketNode节点并批量复制"
      },
      {
        "id": "2",
        "name": "单击选中另一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "按下Ctrl+V"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "未触发粘贴操作"
      },
      {
        "id": "2",
        "name": "触发生成副本操作,创建当前节点的副本"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "按下Ctrl+V触发handleForkNode(line 546)"
      },
      {
        "id": "2",
        "name": "handlePasteNode未被调用"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Ctrl+V在非folder节点上触发生成副本,不触发粘贴"
      }
    ]
  }
],
}

export default node
