import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "cutSingleHttpNode",
  description: "剪切单个httpNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个httpNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个httpNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击httpNode节点,选择\"剪切\"操作或按Ctrl+X"
      },
      {
        "id": "2",
        "name": "观察被剪切节点的视觉状态变化"
      },
      {
        "id": "3",
        "name": "在banner空白区域右键粘贴或按Ctrl+V"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "剪切后,原httpNode节点添加\"cut-node\"类名,显示视觉标识"
      },
      {
        "id": "2",
        "name": "粘贴成功,根节点下新增1个httpNode节点(生成新ID)"
      },
      {
        "id": "3",
        "name": "粘贴完成后,原httpNode节点从原位置自动删除"
      },
      {
        "id": "4",
        "name": "cutNodes数组被清空"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCutNode将selectNodes存入cutNodes.value数组(Banner.vue:550)"
      },
      {
        "id": "2",
        "name": "handleCutNode将selectNodes写入剪贴板(Banner.vue:553-556)"
      },
      {
        "id": "3",
        "name": "节点模板根据cutNodes判断添加\"cut-node\"类名(Banner.vue:28)"
      },
      {
        "id": "4",
        "name": "handlePasteNode完成粘贴后调用deleteNode删除cutNodes中的节点(Banner.vue:571)"
      },
      {
        "id": "5",
        "name": "cutNodes数组被清空(Banner.vue:572)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切与复制的核心区别:粘贴后原节点被删除,通过cutNodes数组跟踪"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个httpNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个httpNode节点和1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切httpNode节点"
      },
      {
        "id": "2",
        "name": "在folder节点粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,folder内新增1个httpNode子节点"
      },
      {
        "id": "2",
        "name": "原httpNode节点从原位置被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes完成粘贴后,deleteNode删除原节点(Banner.vue:571)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切到folder时,新节点的pid更新为folder的_id,原节点被删除"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个httpNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少1个httpNode节点"
      },
      {
        "id": "2",
        "name": "项目B中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A剪切httpNode节点"
      },
      {
        "id": "2",
        "name": "切换到项目B,在folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder内新增1个httpNode子节点"
      },
      {
        "id": "2",
        "name": "新节点的projectId更新为项目B的projectId"
      },
      {
        "id": "3",
        "name": "项目A中的原httpNode节点被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测跨项目并更新projectId(curd-node.ts:342)"
      },
      {
        "id": "2",
        "name": "deleteNode删除项目A中的原节点(Banner.vue:571)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目剪切时,原节点从源项目删除,新节点添加到目标项目"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个httpNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少1个httpNode节点"
      },
      {
        "id": "2",
        "name": "项目B为目标项目"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A剪切httpNode节点"
      },
      {
        "id": "2",
        "name": "切换到项目B,在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增1个httpNode节点"
      },
      {
        "id": "2",
        "name": "新节点的projectId更新为项目B的projectId"
      },
      {
        "id": "3",
        "name": "项目A中的原httpNode节点被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes处理跨项目粘贴并更新projectId"
      },
      {
        "id": "2",
        "name": "deleteNode删除项目A中的原节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目剪切相当于移动节点到另一个项目"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个httpNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个httpNode节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切httpNode节点"
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
        "name": "Banner.vue的v-show指令隐藏粘贴菜单项(Banner.vue:238)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切的粘贴限制与复制相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个httpNode节点,focus非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个httpNode节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切httpNode节点"
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
        "name": "handlePasteNode首行判断拦截非folder节点(Banner.vue:560)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切的快捷键限制与复制相同"
      }
    ]
  }
],
}

export default node
