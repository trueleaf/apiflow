import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copySingleWebsocketNode",
  description: "复制单个websocketNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "banner树展开显示节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner树中右键点击websocketNode节点"
      },
      {
        "id": "2",
        "name": "在右键菜单中点击\"复制\"选项(或使用ctrl+c快捷键)"
      },
      {
        "id": "3",
        "name": "在banner树的空白区域右键点击"
      },
      {
        "id": "4",
        "name": "在右键菜单中点击\"粘贴\"选项(或使用ctrl+v快捷键)"
      },
      {
        "id": "5",
        "name": "观察banner根节点的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "复制操作成功,剪贴板包含websocketNode节点数据"
      },
      {
        "id": "2",
        "name": "在空白区域右键时,菜单显示\"粘贴\"选项"
      },
      {
        "id": "3",
        "name": "粘贴操作成功,在根节点下新增一个websocketNode节点"
      },
      {
        "id": "4",
        "name": "新节点被添加到banner根节点末尾"
      },
      {
        "id": "5",
        "name": "新节点拥有全新的_id(使用nanoid生成)"
      },
      {
        "id": "6",
        "name": "新节点的pid为空字符串(表示根节点)"
      },
      {
        "id": "7",
        "name": "新节点的type为\"websocket\""
      },
      {
        "id": "8",
        "name": "新节点的其他属性(url,连接参数等)与源节点完全一致"
      },
      {
        "id": "9",
        "name": "源节点保持不变,不受影响"
      },
      {
        "id": "10",
        "name": "新节点成功保存到IndexedDB"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue的handleCopyNode函数被调用(line 535-544)"
      },
      {
        "id": "2",
        "name": "navigator.clipboard.writeText写入websocketNode数据,type为\"apiflow-apidoc-node\""
      },
      {
        "id": "3",
        "name": "Banner.vue的handlePasteNode函数被调用(line 559-579)"
      },
      {
        "id": "4",
        "name": "currentOperationalNode.value为null(banner空白区域)"
      },
      {
        "id": "5",
        "name": "curd-node.ts的pasteNodes函数被调用(line 285)"
      },
      {
        "id": "6",
        "name": "生成新的nanoid作为_id(line 342)"
      },
      {
        "id": "7",
        "name": "新节点的pid被设置为空字符串(line 378, 385)"
      },
      {
        "id": "8",
        "name": "addFileAndFolderCb进入根节点插入分支(curd-node.ts line 168)"
      },
      {
        "id": "9",
        "name": "bannerStore.splice添加到banner数组末尾(line 186)"
      },
      {
        "id": "10",
        "name": "apiNodesCache.addNodes保存到IndexedDB(line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketNode的复制粘贴逻辑与httpNode完全相同"
      },
      {
        "id": "2",
        "name": "粘贴到根节点时pid为空字符串,表示该节点属于根节点"
      },
      {
        "id": "3",
        "name": "复制粘贴支持所有节点类型(http,websocket,httpMock,websocketMock,folder)"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少一个websocketNode节点和一个folder节点"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击websocketNode节点,选择\"复制\"(或ctrl+c)"
      },
      {
        "id": "2",
        "name": "右键点击folder节点"
      },
      {
        "id": "3",
        "name": "点击\"粘贴\"选项(或ctrl+v)"
      },
      {
        "id": "4",
        "name": "观察folder节点的子节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "复制成功,剪贴板包含websocketNode数据"
      },
      {
        "id": "2",
        "name": "粘贴成功,folder节点下新增一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "新节点添加到folder的子节点列表末尾"
      },
      {
        "id": "4",
        "name": "新节点的pid为folder节点的_id"
      },
      {
        "id": "5",
        "name": "新节点拥有全新的_id"
      },
      {
        "id": "6",
        "name": "新节点的其他属性与源节点一致"
      },
      {
        "id": "7",
        "name": "folder节点自动展开显示新节点"
      },
      {
        "id": "8",
        "name": "新节点成功保存到IndexedDB"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode写入websocketNode到剪贴板"
      },
      {
        "id": "2",
        "name": "handlePasteNode被调用,currentOperationalNode为folder节点(line 560)"
      },
      {
        "id": "3",
        "name": "pasteNodes函数处理粘贴(line 285)"
      },
      {
        "id": "4",
        "name": "新节点的pid设置为folder的_id(line 378)"
      },
      {
        "id": "5",
        "name": "addFileAndFolderCb插入到folder子节点末尾(line 162)"
      },
      {
        "id": "6",
        "name": "bannerStore.changeExpandItems展开folder(Banner.vue line 576)"
      },
      {
        "id": "7",
        "name": "apiNodesCache.addNodes保存节点(line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "粘贴到folder时,新节点成为folder的直接子节点"
      },
      {
        "id": "2",
        "name": "folder会自动展开以显示新粘贴的子节点"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并创建了项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中包含至少一个websocketNode节点"
      },
      {
        "id": "3",
        "name": "项目B中包含至少一个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中右键复制websocketNode节点"
      },
      {
        "id": "2",
        "name": "切换到项目B"
      },
      {
        "id": "3",
        "name": "在folder节点上右键粘贴"
      },
      {
        "id": "4",
        "name": "观察folder节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的folder下新增websocketNode节点"
      },
      {
        "id": "2",
        "name": "新节点的projectId为项目B的ID"
      },
      {
        "id": "3",
        "name": "新节点的pid为folder的_id"
      },
      {
        "id": "4",
        "name": "新节点拥有全新的_id"
      },
      {
        "id": "5",
        "name": "新节点的其他属性与源节点一致"
      },
      {
        "id": "6",
        "name": "项目A的源节点保持不变"
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
        "name": "新节点的projectId更新为项目B的ID"
      },
      {
        "id": "4",
        "name": "新节点的pid设置为folder的_id(line 378)"
      },
      {
        "id": "5",
        "name": "apiNodesCache.addNodes保存到项目B的IndexedDB(line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目粘贴需要获取源项目完整文档数据"
      },
      {
        "id": "2",
        "name": "projectId必须更新为目标项目ID"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并创建了项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中包含至少一个websocketNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中右键复制websocketNode节点"
      },
      {
        "id": "2",
        "name": "切换到项目B"
      },
      {
        "id": "3",
        "name": "在banner空白区域右键粘贴"
      },
      {
        "id": "4",
        "name": "观察项目B的banner根节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的根节点下新增websocketNode节点"
      },
      {
        "id": "2",
        "name": "新节点添加到banner根节点末尾"
      },
      {
        "id": "3",
        "name": "新节点的projectId为项目B的ID"
      },
      {
        "id": "4",
        "name": "新节点的pid为空字符串"
      },
      {
        "id": "5",
        "name": "新节点拥有全新的_id"
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
        "name": "新节点的pid设置为空字符串(line 378, 385)"
      },
      {
        "id": "4",
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
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少两个websocketNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键复制websocketNode节点A"
      },
      {
        "id": "2",
        "name": "右键点击websocketNode节点B"
      },
      {
        "id": "3",
        "name": "观察右键菜单内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右键菜单中不显示\"粘贴\"选项"
      },
      {
        "id": "2",
        "name": "右键菜单显示\"生成副本\"选项(Ctrl+V)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "粘贴选项的v-show条件为false(line 238)"
      },
      {
        "id": "2",
        "name": "生成副本选项的v-show条件为true(line 236)"
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
    "purpose": "鼠标右键复制(ctrl+c复制)单个websocketNode节点,focus非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少两个websocketNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键复制websocketNode节点A"
      },
      {
        "id": "2",
        "name": "单击选中websocketNode节点B"
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
        "name": "触发生成副本操作,创建节点B的副本"
      },
      {
        "id": "3",
        "name": "副本节点名称为\"节点B名称_副本\""
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "按下Ctrl+V触发handleForkNode(line 546)"
      },
      {
        "id": "2",
        "name": "forkNode生成节点B的副本(line 436)"
      },
      {
        "id": "3",
        "name": "handlePasteNode未被调用"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Ctrl+V在非folder节点上触发生成副本,不触发粘贴"
      }
    ]
  },
  {
    "purpose": "A websocketNode节点切换到B websocketNode节点,按ctrl+c复制节点,可以粘贴(验证各种粘贴模式,不同节点(如:复制到根节点下,复制到folder节点下等)和不同粘贴模式(快捷键和鼠标右键)组合,)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含websocketNode节点A,B和folder节点F"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击切换到websocketNode节点B"
      },
      {
        "id": "2",
        "name": "按ctrl+c复制节点B"
      },
      {
        "id": "3",
        "name": "场景1:在banner空白区域右键粘贴"
      },
      {
        "id": "4",
        "name": "场景2:在banner空白区域ctrl+v粘贴"
      },
      {
        "id": "5",
        "name": "场景3:在folder节点F上右键粘贴"
      },
      {
        "id": "6",
        "name": "场景4:在folder节点F上ctrl+v粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "场景1:粘贴成功,根节点下新增节点B副本"
      },
      {
        "id": "2",
        "name": "场景2:粘贴成功,根节点下新增节点B副本"
      },
      {
        "id": "3",
        "name": "场景3:粘贴成功,folder F下新增节点B副本"
      },
      {
        "id": "4",
        "name": "场景4:粘贴成功,folder F下新增节点B副本"
      },
      {
        "id": "5",
        "name": "所有副本节点拥有全新的_id"
      },
      {
        "id": "6",
        "name": "剪贴板数据可重复粘贴"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode写入节点B数据到剪贴板"
      },
      {
        "id": "2",
        "name": "pasteNodes被调用4次,每次读取剪贴板数据"
      },
      {
        "id": "3",
        "name": "每次粘贴生成新的nanoid"
      },
      {
        "id": "4",
        "name": "apiNodesCache.addNodes被调用4次"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "节点切换不影响复制粘贴功能"
      },
      {
        "id": "2",
        "name": "验证了两种粘贴方式和两种粘贴位置的组合"
      }
    ]
  }
],
}

export default node
