import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copyMultipleFolder",
  description: "复制多个folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个folder节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点(Ctrl+点击)"
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
        "name": "粘贴成功,根节点下新增3个folder节点"
      },
      {
        "id": "2",
        "name": "所有folder节点及其子节点都生成新ID"
      },
      {
        "id": "3",
        "name": "所有新folder插入到lastFolderIndex位置"
      },
      {
        "id": "4",
        "name": "批量粘贴时节点的相对顺序保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode将selectNodes数组(包含3个folder)写入剪贴板(Banner.vue:535-544)"
      },
      {
        "id": "2",
        "name": "pasteNodes遍历处理3个folder节点,每个folder递归复制子节点(curd-node.ts:296-298)"
      },
      {
        "id": "3",
        "name": "addFileAndFolderCb多次调用,依次插入3个新folder到根节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量复制folder时,每个folder独立生成新ID映射,维护各自的子节点关系"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个folder节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少4个folder节点(3个作为复制源,1个作为粘贴目标)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量复制"
      },
      {
        "id": "2",
        "name": "在目标folder右键粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,目标folder内新增3个folder子节点"
      },
      {
        "id": "2",
        "name": "所有新folder子节点的pid指向目标folder的_id"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes处理3个folder,更新它们的pid为目标folder的_id(curd-node.ts:357-361)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量粘贴到folder内时,所有节点按顺序插入到children数组末尾"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个folder节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少3个folder节点"
      },
      {
        "id": "2",
        "name": "项目B中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选3个folder节点并批量复制"
      },
      {
        "id": "2",
        "name": "切换到项目B,在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B目标folder内新增3个folder子节点"
      },
      {
        "id": "2",
        "name": "所有新folder及其子节点的projectId更新为项目B的projectId"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测跨项目,从项目A获取3个folder的完整数据(curd-node.ts:305)"
      },
      {
        "id": "2",
        "name": "pasteNodes批量更新所有节点的projectId(curd-node.ts:342)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量粘贴folder时,系统批量获取源项目数据并统一更新projectId"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个folder节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少3个folder节点"
      },
      {
        "id": "2",
        "name": "项目B为目标项目"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A多选3个folder节点并批量复制"
      },
      {
        "id": "2",
        "name": "切换到项目B,在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增3个folder节点"
      },
      {
        "id": "2",
        "name": "所有folder及其子节点的projectId更新为项目B的projectId"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测跨项目并批量处理3个folder的projectId更新"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量粘贴到根节点时,folder的插入位置规则与单个folder相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个folder节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个folder节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量复制"
      },
      {
        "id": "2",
        "name": "在非folder节点右键"
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
        "name": "批量复制folder时,粘贴限制与单个folder相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个folder节点,focus 非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少3个folder节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "多选3个folder节点并批量复制"
      },
      {
        "id": "2",
        "name": "选中非folder节点后按Ctrl+V"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "Ctrl+V不生效,不会触发粘贴操作"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handlePasteNode首行判断拦截非folder节点的粘贴操作(Banner.vue:560)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量复制folder时,快捷键限制与单个folder相同"
      }
    ]
  }
],
}

export default node
