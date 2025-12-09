import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copyMultipleHttpNode",
  description: "复制多个httpNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少3个httpNode节点(节点A,B,C)"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击选中httpNode节点A"
      },
      {
        "id": "2",
        "name": "按住Ctrl键,依次点击httpNode节点B和节点C,完成多选"
      },
      {
        "id": "3",
        "name": "验证3个节点都处于选中状态(高亮显示)"
      },
      {
        "id": "4",
        "name": "在任意选中节点上右键,打开批量操作菜单"
      },
      {
        "id": "5",
        "name": "点击\"批量复制\"选项(或使用ctrl+c快捷键)"
      },
      {
        "id": "6",
        "name": "在banner树的空白区域右键点击"
      },
      {
        "id": "7",
        "name": "点击\"粘贴\"选项(或使用ctrl+v快捷键)"
      },
      {
        "id": "8",
        "name": "观察banner根节点的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "多选操作成功,3个节点同时高亮显示"
      },
      {
        "id": "2",
        "name": "右键菜单显示批量操作选项:批量剪切,批量复制,批量删除"
      },
      {
        "id": "3",
        "name": "批量复制成功,剪贴板包含3个节点的数据数组"
      },
      {
        "id": "4",
        "name": "粘贴操作成功,在根节点下新增3个httpNode节点"
      },
      {
        "id": "5",
        "name": "3个新节点的名称和属性分别与源节点A,B,C一致"
      },
      {
        "id": "6",
        "name": "3个新节点都被添加到banner根节点末尾,保持原有的相对顺序"
      },
      {
        "id": "7",
        "name": "3个新节点都拥有全新的_id(各自使用nanoid生成)"
      },
      {
        "id": "8",
        "name": "3个新节点的pid都为空字符串(表示根节点)"
      },
      {
        "id": "9",
        "name": "源节点A,B,C保持不变,不受影响"
      },
      {
        "id": "10",
        "name": "3个新节点都成功保存到IndexedDB"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "selectNodes数组包含3个节点(line 315)"
      },
      {
        "id": "2",
        "name": "右键菜单条件selectNodes.length > 1为true,显示批量操作菜单(line 247)"
      },
      {
        "id": "3",
        "name": "Banner.vue的handleCopyNode函数被调用(line 535-544)"
      },
      {
        "id": "4",
        "name": "navigator.clipboard.writeText写入包含3个节点的数组,type为\"apiflow-apidoc-node\"(line 542)"
      },
      {
        "id": "5",
        "name": "Banner.vue的handlePasteNode函数被调用(line 559-579)"
      },
      {
        "id": "6",
        "name": "curd-node.ts的pasteNodes函数被调用,pastedNodes参数包含3个节点(line 285)"
      },
      {
        "id": "7",
        "name": "pasteNodes函数遍历copyPasteNodes数组,使用flatTree展开所有节点(line 299)"
      },
      {
        "id": "8",
        "name": "为3个节点分别生成新的nanoid作为_id(line 342)"
      },
      {
        "id": "9",
        "name": "3个新节点的pid都被设置为空字符串(currentOperationalNode为null,line 378, 385)"
      },
      {
        "id": "10",
        "name": "addFileAndFolderCb函数被调用3次,每次插入一个节点到根节点(line 386)"
      },
      {
        "id": "11",
        "name": "bannerStore.splice被调用3次,依次添加到banner数组末尾(curd-node.ts line 186)"
      },
      {
        "id": "12",
        "name": "apiNodesCache.addNodes被调用,批量保存3个节点到IndexedDB(line 366)"
      },
      {
        "id": "13",
        "name": "bannerStore.banner数组包含所有3个新节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "多选通过按住Ctrl键依次点击节点实现,selectNodes数组记录所有选中节点"
      },
      {
        "id": "2",
        "name": "多选时右键菜单只显示批量操作选项,不显示单个节点的操作选项如\"生成副本\""
      },
      {
        "id": "3",
        "name": "批量复制将整个selectNodes数组写入剪贴板,粘贴时批量处理所有节点"
      },
      {
        "id": "4",
        "name": "批量粘贴时节点的相对顺序保持不变,按照selectNodes数组的顺序依次插入"
      },
      {
        "id": "5",
        "name": "pasteNodes函数使用flatTree展开嵌套节点,确保folder下的子节点也被正确复制"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少3个httpNode节点(节点A,B,C)和1个folder节点F"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "按住Ctrl键,依次点击httpNode节点A,B,C,完成多选"
      },
      {
        "id": "2",
        "name": "在任意选中节点上右键,点击\"批量复制\"(或使用ctrl+c)"
      },
      {
        "id": "3",
        "name": "在folder节点F上右键点击"
      },
      {
        "id": "4",
        "name": "点击\"粘贴\"选项(或使用ctrl+v快捷键)"
      },
      {
        "id": "5",
        "name": "观察folder节点F的子节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "多选操作成功,3个节点同时高亮"
      },
      {
        "id": "2",
        "name": "批量复制成功,剪贴板包含3个节点的数据"
      },
      {
        "id": "3",
        "name": "粘贴操作成功,folder节点F下新增3个httpNode节点"
      },
      {
        "id": "4",
        "name": "3个新节点被添加到folder F的子节点列表末尾"
      },
      {
        "id": "5",
        "name": "3个新节点的pid都为folder节点F的_id"
      },
      {
        "id": "6",
        "name": "3个新节点都拥有全新的_id"
      },
      {
        "id": "7",
        "name": "3个新节点的其他属性与源节点一致"
      },
      {
        "id": "8",
        "name": "folder节点F自动展开显示新粘贴的子节点"
      },
      {
        "id": "9",
        "name": "3个新节点成功保存到IndexedDB"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "selectNodes数组包含3个httpNode节点"
      },
      {
        "id": "2",
        "name": "handleCopyNode写入3个节点到剪贴板(Banner.vue line 542)"
      },
      {
        "id": "3",
        "name": "handlePasteNode被调用,currentOperationalNode为folder节点F(line 560)"
      },
      {
        "id": "4",
        "name": "pasteNodes函数被调用,处理3个节点的粘贴(curd-node.ts line 285)"
      },
      {
        "id": "5",
        "name": "3个新节点的pid都被设置为folder F的_id(line 378, 385)"
      },
      {
        "id": "6",
        "name": "addFileAndFolderCb被调用3次,插入到folder子节点末尾(line 162)"
      },
      {
        "id": "7",
        "name": "bannerStore.changeExpandItems被调用,展开folder节点F(Banner.vue line 576)"
      },
      {
        "id": "8",
        "name": "apiNodesCache.addNodes批量保存3个节点(curd-node.ts line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量粘贴到folder时,所有节点都成为folder的直接子节点"
      },
      {
        "id": "2",
        "name": "folder节点会自动展开以显示新粘贴的子节点"
      },
      {
        "id": "3",
        "name": "粘贴后节点的相对顺序保持不变"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并创建了项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中包含至少3个httpNode节点"
      },
      {
        "id": "3",
        "name": "项目B中包含至少1个folder节点F"
      },
      {
        "id": "4",
        "name": "当前在项目A的工作台页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中,按住Ctrl键多选3个httpNode节点"
      },
      {
        "id": "2",
        "name": "右键点击\"批量复制\"(或ctrl+c)"
      },
      {
        "id": "3",
        "name": "切换到项目B的工作台页面"
      },
      {
        "id": "4",
        "name": "在folder节点F上右键点击"
      },
      {
        "id": "5",
        "name": "点击\"粘贴\"选项(或ctrl+v)"
      },
      {
        "id": "6",
        "name": "观察folder节点F的子节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "批量复制成功,剪贴板包含项目A的3个节点数据"
      },
      {
        "id": "2",
        "name": "粘贴操作成功,项目B的folder F下新增3个httpNode节点"
      },
      {
        "id": "3",
        "name": "3个新节点的projectId都为项目B的ID"
      },
      {
        "id": "4",
        "name": "3个新节点的pid都为folder F的_id"
      },
      {
        "id": "5",
        "name": "3个新节点都拥有全新的_id"
      },
      {
        "id": "6",
        "name": "3个新节点的其他属性与源节点一致"
      },
      {
        "id": "7",
        "name": "项目A的源节点保持不变"
      },
      {
        "id": "8",
        "name": "3个新节点保存到项目B的IndexedDB"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测到跨项目粘贴(fromProjectId !== currentProjectId,line 292)"
      },
      {
        "id": "2",
        "name": "apiNodesCache.getNodesByProjectId获取项目A的完整doc数据(line 305)"
      },
      {
        "id": "3",
        "name": "为3个节点分别生成新的_id(line 342)"
      },
      {
        "id": "4",
        "name": "3个新节点的projectId更新为项目B的ID"
      },
      {
        "id": "5",
        "name": "3个新节点的pid设置为folder F的_id(line 378)"
      },
      {
        "id": "6",
        "name": "addFileAndFolderCb被调用3次,插入到folder F的子节点(line 386)"
      },
      {
        "id": "7",
        "name": "apiNodesCache.addNodes保存到项目B的IndexedDB(line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量粘贴需要从源项目获取完整文档数据"
      },
      {
        "id": "2",
        "name": "所有新节点的projectId必须更新为目标项目ID"
      },
      {
        "id": "3",
        "name": "批量操作在跨项目时的处理逻辑与单个节点一致"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并创建了项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中包含至少3个httpNode节点"
      },
      {
        "id": "3",
        "name": "当前在项目A的工作台页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A中,按住Ctrl键多选3个httpNode节点"
      },
      {
        "id": "2",
        "name": "右键点击\"批量复制\"(或ctrl+c)"
      },
      {
        "id": "3",
        "name": "切换到项目B的工作台页面"
      },
      {
        "id": "4",
        "name": "在banner空白区域右键点击"
      },
      {
        "id": "5",
        "name": "点击\"粘贴\"选项(或ctrl+v)"
      },
      {
        "id": "6",
        "name": "观察项目B的banner根节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "批量复制成功,剪贴板包含项目A的3个节点数据"
      },
      {
        "id": "2",
        "name": "粘贴操作成功,项目B的根节点下新增3个httpNode节点"
      },
      {
        "id": "3",
        "name": "3个新节点被添加到banner根节点末尾"
      },
      {
        "id": "4",
        "name": "3个新节点的projectId都为项目B的ID"
      },
      {
        "id": "5",
        "name": "3个新节点的pid都为空字符串(根节点)"
      },
      {
        "id": "6",
        "name": "3个新节点都拥有全新的_id"
      },
      {
        "id": "7",
        "name": "项目A的源节点保持不变"
      },
      {
        "id": "8",
        "name": "3个新节点保存到项目B的IndexedDB"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes检测到跨项目粘贴(fromProjectId !== currentProjectId,line 292)"
      },
      {
        "id": "2",
        "name": "apiNodesCache.getNodesByProjectId获取项目A的完整doc数据(line 305)"
      },
      {
        "id": "3",
        "name": "currentOperationalNode为null(banner空白区域)"
      },
      {
        "id": "4",
        "name": "为3个节点分别生成新的_id(line 342)"
      },
      {
        "id": "5",
        "name": "3个新节点的pid设置为空字符串(line 378, 385)"
      },
      {
        "id": "6",
        "name": "addFileAndFolderCb进入根节点插入分支(curd-node.ts line 168)"
      },
      {
        "id": "7",
        "name": "bannerStore.splice被调用3次,添加到banner数组末尾(line 186)"
      },
      {
        "id": "8",
        "name": "apiNodesCache.addNodes保存到项目B的IndexedDB(line 366)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目批量粘贴到根节点时,所有节点的pid为空字符串"
      },
      {
        "id": "2",
        "name": "批量操作保持节点的原有顺序不变"
      },
      {
        "id": "3",
        "name": "跨项目粘贴必须更新projectId,避免数据混乱"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少4个httpNode节点"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "按住Ctrl键,多选3个httpNode节点"
      },
      {
        "id": "2",
        "name": "右键点击\"批量复制\"(或ctrl+c)"
      },
      {
        "id": "3",
        "name": "右键点击另一个httpNode节点D(非folder类型)"
      },
      {
        "id": "4",
        "name": "观察右键菜单内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "批量复制成功,剪贴板包含3个节点数据"
      },
      {
        "id": "2",
        "name": "在节点D上右键时,右键菜单正常弹出"
      },
      {
        "id": "3",
        "name": "右键菜单中不显示\"粘贴\"选项"
      },
      {
        "id": "4",
        "name": "右键菜单显示单个节点操作选项(重命名,删除,复制,生成副本等)"
      },
      {
        "id": "5",
        "name": "此限制同样适用于其他非folder类型节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "selectNodes数组包含3个httpNode节点"
      },
      {
        "id": "2",
        "name": "点击节点D后,selectNodes数组重置为只包含节点D(单选模式,line 411)"
      },
      {
        "id": "3",
        "name": "右键菜单条件selectNodes.length <= 1为true,显示单选菜单(line 221)"
      },
      {
        "id": "4",
        "name": "粘贴选项的v-show条件为false(节点D存在且不是folder,line 238)"
      },
      {
        "id": "5",
        "name": "生成副本选项的v-show条件为true(line 236)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "在非folder节点上右键会退出多选模式,进入单选模式"
      },
      {
        "id": "2",
        "name": "粘贴选项只在folder节点或banner空白区域显示"
      },
      {
        "id": "3",
        "name": "多选复制后,在非folder节点右键不能粘贴,只能在folder或空白区域粘贴"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)多个httpNode节点,focus 非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少4个httpNode节点"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "按住Ctrl键,多选3个httpNode节点"
      },
      {
        "id": "2",
        "name": "右键点击\"批量复制\"(或ctrl+c)"
      },
      {
        "id": "3",
        "name": "单击选中另一个httpNode节点D,使其获得焦点"
      },
      {
        "id": "4",
        "name": "按下Ctrl+V快捷键"
      },
      {
        "id": "5",
        "name": "观察banner树变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "批量复制成功,剪贴板包含3个节点数据"
      },
      {
        "id": "2",
        "name": "节点D获得焦点,在banner树中高亮显示"
      },
      {
        "id": "3",
        "name": "按下Ctrl+V后,未触发粘贴操作(不从剪贴板粘贴3个节点)"
      },
      {
        "id": "4",
        "name": "触发了生成副本操作,创建了节点D的副本节点"
      },
      {
        "id": "5",
        "name": "副本节点的名称为\"节点D的名称_副本\""
      },
      {
        "id": "6",
        "name": "副本节点插入到节点D的下一个位置"
      },
      {
        "id": "7",
        "name": "剪贴板中的3个节点数据未被使用"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "点击节点D后,selectNodes数组重置为只包含节点D"
      },
      {
        "id": "2",
        "name": "粘贴选项绑定Ctrl+V的v-show条件为false(line 238)"
      },
      {
        "id": "3",
        "name": "生成副本选项绑定Ctrl+V的v-show条件为true(line 236-237)"
      },
      {
        "id": "4",
        "name": "按下Ctrl+V时,触发handleForkNode函数(line 546-548)"
      },
      {
        "id": "5",
        "name": "forkNode生成节点D的副本(curd-node.ts line 436)"
      },
      {
        "id": "6",
        "name": "handlePasteNode函数未被调用"
      },
      {
        "id": "7",
        "name": "navigator.clipboard.readText未被调用(不读取剪贴板)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "在非folder节点上,Ctrl+V快捷键触发生成副本功能,不触发粘贴功能"
      },
      {
        "id": "2",
        "name": "即使剪贴板中有多个节点数据,也不会被粘贴"
      },
      {
        "id": "3",
        "name": "生成副本只复制当前焦点节点,与剪贴板内容无关"
      }
    ]
  }
],
}

export default node
