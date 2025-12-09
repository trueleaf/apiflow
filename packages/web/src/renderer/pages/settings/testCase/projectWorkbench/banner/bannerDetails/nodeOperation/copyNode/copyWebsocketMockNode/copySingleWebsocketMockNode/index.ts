import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copySingleWebsocketMockNode",
  description: "复制单个websocketMockNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketMockNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少一个websocketMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键复制websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "在banner空白区域右键粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增一个websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "新节点拥有全新的_id"
      },
      {
        "id": "3",
        "name": "新节点的type为\"websocketMock\""
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes函数处理粘贴(line 285)"
      },
      {
        "id": "2",
        "name": "apiNodesCache.addNodes保存到IndexedDB(line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketMockNode的复制粘贴逻辑与其他节点类型完全相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketMockNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含websocketMockNode节点和folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键复制websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "在folder节点上右键粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,folder下新增websocketMockNode节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "addFileAndFolderCb插入到folder子节点(line 162)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder会自动展开显示新节点"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketMockNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "项目B中包含folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中复制websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "切换到项目B并在folder上粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder下新增websocketMockNode节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测到跨项目粘贴(line 292)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目粘贴需要获取源项目完整文档数据"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketMockNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含websocketMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中复制websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "切换到项目B并在空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的根节点下新增websocketMockNode节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "addFileAndFolderCb进入根节点插入分支(line 168)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目粘贴到根节点,pid为空字符串"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketMockNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少两个websocketMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键复制websocketMockNode节点A"
      },
      {
        "id": "2",
        "name": "右键点击websocketMockNode节点B"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右键菜单中不显示\"粘贴\"选项"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "粘贴选项的v-show条件为false(line 238)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "粘贴操作只允许在folder节点或banner空白区域执行"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketMockNode节点,focus非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少两个websocketMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键复制websocketMockNode节点A"
      },
      {
        "id": "2",
        "name": "单击选中websocketMockNode节点B"
      },
      {
        "id": "3",
        "name": "按下Ctrl+V"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "未触发粘贴操作,触发生成副本操作"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "按下Ctrl+V触发handleForkNode(line 546)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Ctrl+V在非folder节点上触发生成副本"
      }
    ]
  },
  {
    "purpose": "A websocketMockNode节点切换到B websocketMockNode节点,按ctrl+c复制节点,可以粘贴(验证各种粘贴模式,不同节点(如:复制到根节点下,复制到folder节点下等)和不同粘贴模式(快捷键和鼠标右键)组合,)",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含websocketMockNode节点A,B和folder节点F"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击切换到websocketMockNode节点B"
      },
      {
        "id": "2",
        "name": "按ctrl+c复制节点B"
      },
      {
        "id": "3",
        "name": "分别在根节点和folder节点上粘贴4次"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "所有粘贴操作都成功"
      },
      {
        "id": "2",
        "name": "所有副本节点拥有全新的_id"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes被调用4次"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "节点切换不影响复制粘贴功能"
      }
    ]
  }
],
}

export default node
