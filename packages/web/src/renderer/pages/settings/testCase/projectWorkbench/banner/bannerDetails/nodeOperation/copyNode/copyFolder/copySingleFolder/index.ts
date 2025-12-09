import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copySingleFolder",
  description: "复制单个folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个folder节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个folder节点(可包含子节点)"
      },
      {
        "id": "2",
        "name": "folder节点可包含嵌套的子节点(http/websocket/httpMock/websocketMock/folder)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击folder节点,选择\"复制\"操作或按Ctrl+C"
      },
      {
        "id": "2",
        "name": "在banner树形区域的空白区域右键,选择\"粘贴\"操作或按Ctrl+V"
      },
      {
        "id": "3",
        "name": "观察folder节点及其所有子节点是否成功粘贴到根节点下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,根节点下新增1个folder节点"
      },
      {
        "id": "2",
        "name": "新folder节点生成唯一的新ID(通过nanoid),与原folder节点ID不同"
      },
      {
        "id": "3",
        "name": "如果原folder包含子节点,所有子节点也被递归复制,子节点也生成新ID"
      },
      {
        "id": "4",
        "name": "新folder节点插入到所有folder之后,非folder节点之前的位置(curd-node.ts:169-183)"
      },
      {
        "id": "5",
        "name": "新folder节点的父子关系正确维护:子节点的pid指向新folder的新ID"
      },
      {
        "id": "6",
        "name": "复制完成后,原folder节点保持不变(仍存在于原位置)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode方法将selectNodes写入剪贴板,格式为{type:\"apiflow-apidoc-node\",data:[nodes]}(Banner.vue:535-544)"
      },
      {
        "id": "2",
        "name": "handlePasteNode方法读取剪贴板并调用pasteNodes(Banner.vue:559-579)"
      },
      {
        "id": "3",
        "name": "pasteNodes通过flatTree函数递归获取folder及所有子节点(curd-node.ts:296-298, helper/index.ts:586-601)"
      },
      {
        "id": "4",
        "name": "pasteNodes为所有节点生成新ID并建立idMapping映射(curd-node.ts:334-347)"
      },
      {
        "id": "5",
        "name": "pasteNodes更新所有子节点的pid为新的父节点ID(curd-node.ts:351-362)"
      },
      {
        "id": "6",
        "name": "addFileAndFolderCb判断粘贴位置为根节点且节点类型为folder,插入到lastFolderIndex位置(curd-node.ts:169-183)"
      },
      {
        "id": "7",
        "name": "bannerStore.splice方法将新folder插入到banner数组指定位置"
      },
      {
        "id": "8",
        "name": "apiNodesCache.addNodes批量保存所有新节点到IndexedDB(curd-node.ts:366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder节点复制会递归复制所有子节点,通过flatTree扁平化后统一处理ID映射"
      },
      {
        "id": "2",
        "name": "插入位置规则:folder始终排在前面,确保树形结构的folder优先显示"
      },
      {
        "id": "3",
        "name": "ID映射维护了完整的父子关系,确保嵌套结构不被破坏"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个folder节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少2个folder节点(一个作为复制源,一个作为粘贴目标)"
      },
      {
        "id": "2",
        "name": "目标folder节点可以是空folder或包含子节点的folder"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击源folder节点,选择\"复制\"操作或按Ctrl+C"
      },
      {
        "id": "2",
        "name": "右键点击目标folder节点,选择\"粘贴\"操作或按Ctrl+V"
      },
      {
        "id": "3",
        "name": "观察源folder节点及其所有子节点是否成功粘贴到目标folder内部"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,目标folder节点内新增1个folder子节点"
      },
      {
        "id": "2",
        "name": "新folder子节点的pid指向目标folder的_id"
      },
      {
        "id": "3",
        "name": "新folder子节点及其所有子节点都生成新ID"
      },
      {
        "id": "4",
        "name": "新folder子节点插入到目标folder的children数组末尾(curd-node.ts:162-166)"
      },
      {
        "id": "5",
        "name": "目标folder在树形视图中自动展开,显示新粘贴的子folder"
      },
      {
        "id": "6",
        "name": "原源folder节点保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode将源folder写入剪贴板(Banner.vue:535-544)"
      },
      {
        "id": "2",
        "name": "handlePasteNode读取剪贴板并调用pasteNodes,传入currentOperationalNode为目标folder(Banner.vue:559-579)"
      },
      {
        "id": "3",
        "name": "pasteNodes通过flatTree递归获取源folder及所有子节点(curd-node.ts:296-298)"
      },
      {
        "id": "4",
        "name": "pasteNodes生成新ID映射,子节点的pid更新为新的父节点ID(curd-node.ts:351-362)"
      },
      {
        "id": "5",
        "name": "addFileAndFolderCb判断currentOperationalNode不为null,将新folder插入到目标folder的children末尾(curd-node.ts:162-166)"
      },
      {
        "id": "6",
        "name": "bannerStore.changeExpandItems展开目标folder(Banner.vue:576)"
      },
      {
        "id": "7",
        "name": "apiNodesCache.addNodes保存所有新节点到IndexedDB"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder可以嵌套复制到另一个folder内,形成多级嵌套结构"
      },
      {
        "id": "2",
        "name": "粘贴后目标folder自动展开,方便用户查看新粘贴的内容"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个folder节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "至少打开2个项目(项目A和项目B)"
      },
      {
        "id": "2",
        "name": "项目A中包含至少1个folder节点(作为复制源)"
      },
      {
        "id": "3",
        "name": "项目B中包含至少1个folder节点(作为粘贴目标)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中右键点击源folder节点,选择\"复制\"操作或按Ctrl+C"
      },
      {
        "id": "2",
        "name": "切换到项目B"
      },
      {
        "id": "3",
        "name": "在项目B中右键点击目标folder节点,选择\"粘贴\"操作或按Ctrl+V"
      },
      {
        "id": "4",
        "name": "观察源folder节点是否成功跨项目粘贴到项目B的目标folder内"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B的目标folder节点内新增1个folder子节点"
      },
      {
        "id": "2",
        "name": "新folder子节点的projectId更新为项目B的projectId(curd-node.ts:342)"
      },
      {
        "id": "3",
        "name": "新folder子节点及其所有子节点的projectId都更新为项目B的projectId"
      },
      {
        "id": "4",
        "name": "新folder子节点及其所有子节点都生成新ID"
      },
      {
        "id": "5",
        "name": "新folder子节点的pid指向项目B目标folder的_id"
      },
      {
        "id": "6",
        "name": "项目A中的原folder节点保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode将源folder写入剪贴板,剪贴板数据包含projectId字段"
      },
      {
        "id": "2",
        "name": "pasteNodes检测到fromProjectId !== currentProjectId,触发跨项目粘贴逻辑(curd-node.ts:303)"
      },
      {
        "id": "3",
        "name": "apiNodesCache.getNodesByProjectId(fromProjectId)从项目A获取完整文档数据(curd-node.ts:305)"
      },
      {
        "id": "4",
        "name": "pasteNodes为所有节点更新projectId为currentProjectId(项目B)(curd-node.ts:342)"
      },
      {
        "id": "5",
        "name": "pasteNodes生成新ID映射并更新父子关系(curd-node.ts:351-362)"
      },
      {
        "id": "6",
        "name": "apiNodesCache.addNodes将新节点保存到项目B的IndexedDB"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目粘贴时,系统会从源项目IndexedDB获取完整文档数据,确保数据完整性"
      },
      {
        "id": "2",
        "name": "所有节点的projectId统一更新为目标项目ID,确保数据隔离"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个folder节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "至少打开2个项目(项目A和项目B)"
      },
      {
        "id": "2",
        "name": "项目A中包含至少1个folder节点(作为复制源)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中右键点击源folder节点,选择\"复制\"操作或按Ctrl+C"
      },
      {
        "id": "2",
        "name": "切换到项目B"
      },
      {
        "id": "3",
        "name": "在项目B的banner树形区域空白处右键,选择\"粘贴\"操作或按Ctrl+V"
      },
      {
        "id": "4",
        "name": "观察源folder节点是否成功跨项目粘贴到项目B的根节点下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "粘贴成功,项目B根节点下新增1个folder节点"
      },
      {
        "id": "2",
        "name": "新folder节点的projectId更新为项目B的projectId"
      },
      {
        "id": "3",
        "name": "新folder节点及其所有子节点的projectId都更新为项目B的projectId"
      },
      {
        "id": "4",
        "name": "新folder节点及其所有子节点都生成新ID"
      },
      {
        "id": "5",
        "name": "新folder节点插入到项目B所有folder之后,非folder节点之前的位置"
      },
      {
        "id": "6",
        "name": "项目A中的原folder节点保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCopyNode将源folder写入剪贴板,剪贴板数据包含projectId字段"
      },
      {
        "id": "2",
        "name": "pasteNodes检测到fromProjectId !== currentProjectId,触发跨项目粘贴逻辑(curd-node.ts:303)"
      },
      {
        "id": "3",
        "name": "apiNodesCache.getNodesByProjectId(fromProjectId)从项目A获取完整文档数据(curd-node.ts:305)"
      },
      {
        "id": "4",
        "name": "pasteNodes为所有节点更新projectId为项目B的projectId(curd-node.ts:342)"
      },
      {
        "id": "5",
        "name": "addFileAndFolderCb判断粘贴位置为根节点且节点类型为folder,插入到lastFolderIndex位置(curd-node.ts:169-183)"
      },
      {
        "id": "6",
        "name": "apiNodesCache.addNodes将新节点保存到项目B的IndexedDB"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目粘贴到根节点时,folder的插入位置规则与同项目粘贴相同"
      },
      {
        "id": "2",
        "name": "所有节点的projectId统一更新,确保跨项目数据隔离"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个folder节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个folder节点和1个非folder节点(httpNode/websocketNode/httpMockNode/websocketMockNode)"
      },
      {
        "id": "2",
        "name": "剪贴板中已复制folder节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击folder节点,选择\"复制\"操作或按Ctrl+C"
      },
      {
        "id": "2",
        "name": "右键点击非folder节点(如httpNode)"
      },
      {
        "id": "3",
        "name": "观察右键菜单中是否显示\"粘贴\"选项"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右键菜单中不显示\"粘贴\"选项"
      },
      {
        "id": "2",
        "name": "右键菜单中显示其他操作(如\"复制\",\"删除\",\"分叉\"等),但没有\"粘贴\""
      },
      {
        "id": "3",
        "name": "非folder节点不支持作为粘贴目标"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue中SContextmenuItem的v-show指令判断currentOperationalNode?.type === 'folder'(Banner.vue:238)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode为非folder节点时,v-show条件为false,粘贴菜单项隐藏"
      },
      {
        "id": "3",
        "name": "粘贴操作只允许在folder节点或banner空白区域(根节点)执行"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "非folder节点(http/websocket/httpMock/websocketMock)不能作为粘贴目标,因为它们不能包含子节点"
      },
      {
        "id": "2",
        "name": "该限制通过v-show指令在UI层面实现,防止用户尝试无效操作"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个folder节点,focus非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "项目中包含至少1个folder节点和1个非folder节点"
      },
      {
        "id": "2",
        "name": "剪贴板中已复制folder节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击folder节点,选择\"复制\"操作或按Ctrl+C"
      },
      {
        "id": "2",
        "name": "单击选中非folder节点(使其获得焦点)"
      },
      {
        "id": "3",
        "name": "按下Ctrl+V快捷键"
      },
      {
        "id": "4",
        "name": "观察是否触发粘贴操作"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "Ctrl+V快捷键不生效,不会触发粘贴操作"
      },
      {
        "id": "2",
        "name": "非folder节点保持选中状态,没有新增子节点"
      },
      {
        "id": "3",
        "name": "系统不显示任何粘贴相关的提示或错误信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handlePasteNode方法中首行判断:if (currentOperationalNode.value && currentOperationalNode.value.type !== 'folder') return(Banner.vue:560)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode为非folder节点时,方法直接返回,不执行后续粘贴逻辑"
      },
      {
        "id": "3",
        "name": "Ctrl+V快捷键绑定到handlePasteNode方法,但在方法内部被拦截"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "快捷键层面的限制:即使用户按下Ctrl+V,方法也会在开头判断节点类型并提前返回"
      },
      {
        "id": "2",
        "name": "该限制与右键菜单限制双重保护,确保非folder节点不会接收粘贴操作"
      }
    ]
  }
],
}

export default node
