import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copyMultipleHttpMockNode",
  description: "复制多个httpMockNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpMockNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个httpMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个httpMockNode节点并批量复制"
      },
      {
        "id": "2",
        "name": "在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增3个httpMockNode节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes处理3个节点的粘贴(line 285)"
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
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpMockNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含3个httpMockNode节点和1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个httpMockNode节点并批量复制"
      },
      {
        "id": "2",
        "name": "在folder节点上粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,folder下新增3个httpMockNode节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "addFileAndFolderCb被调用3次(line 162)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "所有节点成为folder的直接子节点"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpMockNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含3个httpMockNode节点"
      },
      {
        "id": "2",
        "name": "项目B中包含folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中批量复制3个节点"
      },
      {
        "id": "2",
        "name": "切换到项目B并在folder上粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder下新增3个httpMockNode节点"
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
        "name": "跨项目批量粘贴需要获取源项目完整文档数据"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpMockNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含3个httpMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中批量复制3个节点"
      },
      {
        "id": "2",
        "name": "切换到项目B并在空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的根节点下新增3个httpMockNode节点"
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
        "name": "所有节点的pid为空字符串"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpMockNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少4个httpMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个节点并批量复制"
      },
      {
        "id": "2",
        "name": "右键点击另一个httpMockNode节点"
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
        "name": "selectNodes数组重置为单选模式(line 411)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "在非folder节点上右键会退出多选模式"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpMockNode节点,focus 非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少4个httpMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个节点并批量复制"
      },
      {
        "id": "2",
        "name": "单击选中另一个httpMockNode节点"
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
  }
],
}

export default node
