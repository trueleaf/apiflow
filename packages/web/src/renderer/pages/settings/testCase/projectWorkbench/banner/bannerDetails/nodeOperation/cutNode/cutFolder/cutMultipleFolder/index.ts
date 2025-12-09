import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "cutMultipleFolder",
  description: "剪切多个folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个folder节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量剪切,在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增3个folder节点,原3个folder被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode批量删除cutNodes中的3个folder及其所有子节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量剪切folder时,每个folder的子节点都随之移动"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个folder节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少4个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量剪切,在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,目标folder内新增3个子folder,原3个folder被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode批量删除原folder"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量剪切folder到另一个folder时,形成多个嵌套子folder"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个folder节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少3个folder节点,项目B中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选3个folder节点并批量剪切,切换到项目B在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder内新增3个子folder,项目A中的原3个folder被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode删除项目A中的原folder"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量剪切folder时,所有folder及其子节点的projectId统一更新"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个folder节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少3个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选3个folder节点并批量剪切,切换到项目B在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增3个folder节点,项目A中的原3个folder被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode删除项目A中的原folder"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量剪切folder相当于批量移动folder树"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个folder节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个folder节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量剪切,在非folder节点右键"
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
        "name": "批量剪切folder的粘贴限制与单个剪切相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)多个folder节点,focus 非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个folder节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量剪切,选中非folder节点后按Ctrl+V"
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
  },
  {
    "purpose": "剪切多个folder节点后,原节点从原位置删除,撤销操作(ctrl+z)可恢复",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量剪切,在banner空白区域粘贴"
      },
      {
        "id": "2",
        "name": "粘贴完成后按Ctrl+Z撤销操作"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "撤销成功,新粘贴的3个folder被删除,原3个folder恢复到原位置"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销操作通过redoUndo store管理,记录操作历史"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切粘贴操作支持撤销,但具体撤销逻辑依赖于项目的undo/redo实现"
      }
    ]
  }
],
}

export default node
