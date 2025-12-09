import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copyMixedNodeTypes",
  description: "复制httpNode,websocketNode,httpMockNode,websocketNode和folderNode混合节点",
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
        "name": "多选5种类型节点各一个(Ctrl+点击)"
      },
      {
        "id": "2",
        "name": "批量复制(右键或Ctrl+C)"
      },
      {
        "id": "3",
        "name": "在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增5个节点(包含所有类型)"
      },
      {
        "id": "2",
        "name": "所有节点都生成新ID,folder节点的子节点也递归生成新ID"
      },
      {
        "id": "3",
        "name": "folder节点插入到lastFolderIndex位置,非folder节点插入到末尾"
      },
      {
        "id": "4",
        "name": "混合节点按类型分组插入:folder在前,非folder在后"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode将selectNodes数组(包含5种类型)写入剪贴板(Banner.vue:535-544)"
      },
      {
        "id": "2",
        "name": "pasteNodes遍历处理5个节点,folder节点通过flatTree递归复制子节点(curd-node.ts:296-298)"
      },
      {
        "id": "3",
        "name": "addFileAndFolderCb根据节点类型判断插入位置:folder插入到lastFolderIndex,非folder插入到末尾(curd-node.ts:169-190)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "混合节点批量粘贴时,系统自动按类型分组插入,维护folder在前的顺序规则"
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
        "name": "多选5种类型节点各一个并批量复制"
      },
      {
        "id": "2",
        "name": "在目标folder右键粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,目标folder内新增5个子节点(包含所有类型)"
      },
      {
        "id": "2",
        "name": "所有新子节点的pid指向目标folder的_id"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes处理5个节点,更新它们的pid为目标folder的_id(curd-node.ts:357-361)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "混合节点粘贴到folder内时,按顺序插入到children数组,不区分类型"
      }
    ]
  },
  {
    "purpose": "批量选择所有类型节点各一个,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含5种类型节点各至少1个"
      },
      {
        "id": "2",
        "name": "项目B中包含至少1个folder作为粘贴目标"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选5种类型节点各一个并批量复制"
      },
      {
        "id": "2",
        "name": "切换到项目B,在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B目标folder内新增5个子节点"
      },
      {
        "id": "2",
        "name": "所有新子节点的projectId更新为项目B的projectId"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测跨项目,从项目A获取5个节点的完整数据(curd-node.ts:305)"
      },
      {
        "id": "2",
        "name": "pasteNodes批量更新所有节点的projectId(curd-node.ts:342)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量粘贴混合节点时,系统统一处理projectId更新和ID映射"
      }
    ]
  },
  {
    "purpose": "批量选择所有类型节点各一个,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含5种类型节点各至少1个"
      },
      {
        "id": "2",
        "name": "项目B为目标项目"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选5种类型节点各一个并批量复制"
      },
      {
        "id": "2",
        "name": "切换到项目B,在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增5个节点"
      },
      {
        "id": "2",
        "name": "所有节点的projectId更新为项目B的projectId"
      },
      {
        "id": "3",
        "name": "folder节点插入到lastFolderIndex位置,非folder节点插入到末尾"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测跨项目并批量处理5个节点的projectId更新和插入位置判断"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目混合节点粘贴到根节点时,插入位置规则与同项目相同"
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
        "name": "多选5种类型节点各一个并批量复制"
      },
      {
        "id": "2",
        "name": "在非folder节点(如httpNode)右键"
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
        "name": "Banner.vue的v-show指令判断currentOperationalNode?.type !== 'folder',隐藏粘贴菜单项"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "混合节点批量复制时,粘贴限制与单一类型节点相同"
      }
    ]
  }
],
}

export default node
