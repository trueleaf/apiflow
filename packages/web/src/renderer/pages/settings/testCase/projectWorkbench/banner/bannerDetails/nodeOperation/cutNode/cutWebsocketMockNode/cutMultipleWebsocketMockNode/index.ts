import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "cutMultipleWebsocketMockNode",
  description: "剪切多个websocketMockNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个websocketMockNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个websocketMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个websocketMockNode节点并批量剪切,在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增3个websocketMockNode节点,原3个节点被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode批量删除cutNodes中的3个节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量剪切时所有原节点统一删除"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个websocketMockNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个websocketMockNode节点和1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个websocketMockNode节点并批量剪切,在folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,folder内新增3个websocketMockNode子节点,原3个节点被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode批量删除原节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量剪切到folder时原节点被删除"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个websocketMockNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少3个websocketMockNode节点,项目B中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选3个websocketMockNode节点并批量剪切,切换到项目B在folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder内新增3个websocketMockNode子节点,项目A中的原3个节点被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode删除项目A中的原节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量剪切时原节点从源项目删除"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个websocketMockNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少3个websocketMockNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选3个websocketMockNode节点并批量剪切,切换到项目B在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增3个websocketMockNode节点,项目A中的原3个节点被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode删除项目A中的原节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量剪切相当于批量移动节点"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个websocketMockNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个websocketMockNode节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个websocketMockNode节点并批量剪切,在非folder节点右键"
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
        "name": "v-show指令隐藏粘贴菜单项"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量剪切的粘贴限制与单个剪切相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个websocketMockNode节点,focus 非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个websocketMockNode节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个websocketMockNode节点并批量剪切,选中非folder节点后按Ctrl+V"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "Ctrl+V不生效"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handlePasteNode首行判断拦截"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量剪切的快捷键限制与单个剪切相同"
      }
    ]
  }
],
}

export default node
