import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "cutSingleFolder",
  description: "剪切单个folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个folder节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切folder并在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增folder,原folder被删除,子节点随folder一起移动"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCutNode存入cutNodes,deleteNode递归删除原folder及所有子节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切folder时,所有子节点一起被移动,通过flatTree递归处理"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个folder节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少2个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切源folder并在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,目标folder内新增子folder,原folder被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode删除原folder及其子节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切folder到另一个folder时,形成嵌套结构"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个folder节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少1个folder节点,项目B中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A剪切folder,切换到项目B在目标folder粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder内新增子folder,项目A中的原folder被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes处理跨项目粘贴并更新projectId,deleteNode删除项目A中的原folder"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目剪切folder时,所有子节点的projectId统一更新"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个folder节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目A中包含至少1个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A剪切folder,切换到项目B在banner空白区域粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增folder,项目A中的原folder被删除"
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
        "name": "跨项目剪切folder相当于移动整个folder树到另一个项目"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个folder节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个folder节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切folder后在非folder节点右键"
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
        "name": "剪切folder的粘贴限制与复制相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键剪切(ctrl+x剪切)单个folder节点,focus非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个folder节点和1个非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切folder后选中非folder节点按Ctrl+V"
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
        "name": "快捷键限制与复制相同"
      }
    ]
  },
  {
    "purpose": "剪切包含子节点的folder,粘贴后层级结构保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含1个folder节点,该folder内包含多个嵌套子节点(httpNode/websocketNode/子folder等)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "剪切包含复杂层级结构的folder"
      },
      {
        "id": "2",
        "name": "在banner空白区域或另一个folder粘贴"
      },
      {
        "id": "3",
        "name": "展开新粘贴的folder,观察子节点层级结构"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,folder内所有子节点的层级结构完全保持不变"
      },
      {
        "id": "2",
        "name": "所有子节点的pid关系正确维护,父子关系不被破坏"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes通过flatTree递归获取所有子节点(curd-node.ts:296-298)"
      },
      {
        "id": "2",
        "name": "pasteNodes为所有节点生成新ID并建立idMapping,更新子节点的pid(curd-node.ts:351-362)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "剪切folder时,系统通过ID映射机制维护完整的父子关系"
      }
    ]
  }
],
}

export default node
