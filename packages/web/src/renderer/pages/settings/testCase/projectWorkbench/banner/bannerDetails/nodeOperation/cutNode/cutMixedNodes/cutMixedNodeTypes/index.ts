import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "cutMixedNodeTypes",
  description: "剪切httpNode,websocketNode,httpMockNode,websocketMockNode和folderNode混合节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "批量选择所有类型节点各一个,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含httpNode,websocketNode,httpMockNode,websocketMockNode,folder各至少1个节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选5种类型节点各一个并批量剪切,在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增5个节点,原5个节点被删除,folder节点插入到lastFolderIndex位置,非folder节点插入到末尾"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode批量删除cutNodes中的5个节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "混合节点批量剪切时,按类型分组插入,所有原节点统一删除"
      }
    ]
  },
  {
    "purpose": "批量选择所有类型节点各一个,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含5种类型节点各至少1个,且至少1个空folder作为粘贴目标"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选5种类型节点各一个并批量剪切,在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,目标folder内新增5个子节点,原5个节点被删除"
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
        "name": "混合节点剪切到folder时,所有节点按顺序插入到children数组"
      }
    ]
  },
  {
    "purpose": "批量选择所有类型节点各一个,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含5种类型节点各至少1个,项目B中包含至少1个folder作为粘贴目标"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选5种类型节点各一个并批量剪切,切换到项目B在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B目标folder内新增5个子节点,项目A中的原5个节点被删除"
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
        "name": "跨项目批量剪切混合节点时,所有节点的projectId统一更新"
      }
    ]
  },
  {
    "purpose": "批量选择所有类型节点各一个,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含5种类型节点各至少1个"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选5种类型节点各一个并批量剪切,切换到项目B在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增5个节点,项目A中的原5个节点被删除"
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
        "name": "跨项目混合节点剪切相当于批量移动到另一个项目"
      }
    ]
  },
  {
    "purpose": "批量选择所有类型节点各一个,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含5种类型节点各至少1个"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选5种类型节点各一个并批量剪切,在非folder节点(如httpNode)右键"
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
        "name": "混合节点批量剪切的粘贴限制与单一类型节点相同"
      }
    ]
  }
],
}

export default node
