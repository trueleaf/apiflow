import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "copySingleHttpNode",
  description: "复制单个httpNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个httpNode节点,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个httpNode节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner节点树中,右键点击一个httpNode节点(显示GET/POST等方法图标)"
      },
      {
        "id": "2",
        "name": "在右键菜单中点击\"复制\"选项(快捷键Ctrl+C)"
      },
      {
        "id": "3",
        "name": "观察复制操作完成,无明显UI反馈"
      },
      {
        "id": "4",
        "name": "在banner空白区域右键点击(或按Ctrl+V)"
      },
      {
        "id": "5",
        "name": "在右键菜单中点击\"粘贴\"选项"
      },
      {
        "id": "6",
        "name": "观察节点树变化,新节点被添加到根节点下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击\"复制\"后,handleCopyNode方法被触发"
      },
      {
        "id": "2",
        "name": "selectNodes数组(包含被复制的httpNode)被写入剪贴板"
      },
      {
        "id": "3",
        "name": "剪贴板数据格式:{ type: \"apiflow-apidoc-node\", data: [httpNode数据] }"
      },
      {
        "id": "4",
        "name": "cutNodes.value被清空(区分复制和剪切)"
      },
      {
        "id": "5",
        "name": "点击\"粘贴\"后,handlePasteNode方法被触发"
      },
      {
        "id": "6",
        "name": "从剪贴板读取数据并解析JSON"
      },
      {
        "id": "7",
        "name": "调用pasteNodes函数,currentOperationalNode.value为null(表示根节点)"
      },
      {
        "id": "8",
        "name": "生成新的节点ID(使用nanoid)"
      },
      {
        "id": "9",
        "name": "新节点的pid设置为空字符串(根节点)"
      },
      {
        "id": "10",
        "name": "新节点保存到apiNodesCache(离线模式)或调用/api/project/paste_docs(在线模式)"
      },
      {
        "id": "11",
        "name": "新节点被添加到banner节点树的根层级"
      },
      {
        "id": "12",
        "name": "新节点的所有数据(URL,headers,body等)与原节点完全相同,仅ID不同"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue第536-544行:handleCopyNode方法将selectNodes写入剪贴板"
      },
      {
        "id": "2",
        "name": "Banner.vue第540-543行:navigator.clipboard.writeText写入JSON字符串"
      },
      {
        "id": "3",
        "name": "Banner.vue第537行:cutNodes.value = []清空剪切节点"
      },
      {
        "id": "4",
        "name": "Banner.vue第559-579行:handlePasteNode方法从剪贴板读取并粘贴"
      },
      {
        "id": "5",
        "name": "Banner.vue第560行:检查currentOperationalNode.type !== \"folder\"时return(仅folder和根节点可粘贴)"
      },
      {
        "id": "6",
        "name": "Banner.vue第563-564行:navigator.clipboard.readText读取剪贴板"
      },
      {
        "id": "7",
        "name": "Banner.vue第565-567行:检查copyDataJson.type === \"apiflow-apidoc-node\""
      },
      {
        "id": "8",
        "name": "curd-node.ts第285-431行:pasteNodes函数实现粘贴逻辑"
      },
      {
        "id": "9",
        "name": "curd-node.ts第286行:深拷贝节点JSON.parse(JSON.stringify(pastedNodes))"
      },
      {
        "id": "10",
        "name": "curd-node.ts第336-347行:生成新ID并创建processedDoc"
      },
      {
        "id": "11",
        "name": "curd-node.ts第357-361行:设置pid为currentOperationalNode.value?._id || \"\""
      },
      {
        "id": "12",
        "name": "curd-node.ts第366行:await apiNodesCache.addNode(doc)保存节点"
      },
      {
        "id": "13",
        "name": "curd-node.ts第386行:addFileAndFolderCb更新UI"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "复制使用浏览器剪贴板API(navigator.clipboard)而非Electron clipboard"
      },
      {
        "id": "2",
        "name": "剪贴板数据包含type字段用于验证数据来源,防止粘贴非法数据"
      },
      {
        "id": "3",
        "name": "复制后可以在任意支持粘贴的位置粘贴,包括跨项目粘贴"
      },
      {
        "id": "4",
        "name": "粘贴到根节点时,currentOperationalNode为null,pid设置为空字符串"
      },
      {
        "id": "5",
        "name": "nanoid用于生成唯一ID,避免与现有节点冲突"
      },
      {
        "id": "6",
        "name": "复制不会删除原节点,与剪切(cutNodes)区分"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个httpNode节点,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个httpNode节点"
      },
      {
        "id": "3",
        "name": "项目中存在至少一个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击一个httpNode节点,选择\"复制\"(或按Ctrl+C)"
      },
      {
        "id": "2",
        "name": "右键点击一个folder节点(显示folder图标)"
      },
      {
        "id": "3",
        "name": "在右键菜单中点击\"粘贴\"选项(或按Ctrl+V)"
      },
      {
        "id": "4",
        "name": "观察folder节点展开,新节点被添加到该folder下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "复制操作将httpNode写入剪贴板"
      },
      {
        "id": "2",
        "name": "粘贴操作检查currentOperationalNode为folder类型"
      },
      {
        "id": "3",
        "name": "调用pasteNodes函数,currentOperationalNode.value为folder节点"
      },
      {
        "id": "4",
        "name": "生成新节点ID(nanoid)"
      },
      {
        "id": "5",
        "name": "新节点的pid设置为folder节点的_id"
      },
      {
        "id": "6",
        "name": "新节点保存到数据库,成为folder的子节点"
      },
      {
        "id": "7",
        "name": "folder节点自动展开(bannerStore.changeExpandItems)"
      },
      {
        "id": "8",
        "name": "新节点显示在folder节点的子列表中"
      },
      {
        "id": "9",
        "name": "新节点的层级缩进比folder深一级"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue第560行:检查currentOperationalNode.type,folder类型不会return"
      },
      {
        "id": "2",
        "name": "curd-node.ts第357行:pid = currentOperationalNode.value?._id(folder的_id)"
      },
      {
        "id": "3",
        "name": "curd-node.ts第385行:pasteNode.pid = currentOperationalNode.value?._id"
      },
      {
        "id": "4",
        "name": "Banner.vue第575行:bannerStore.changeExpandItems([folder._id])自动展开folder"
      },
      {
        "id": "5",
        "name": "addFileAndFolderCb函数将新节点添加到folder的children数组"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder节点可以接收粘贴,非folder节点不行"
      },
      {
        "id": "2",
        "name": "粘贴后folder自动展开,方便用户查看新添加的节点"
      },
      {
        "id": "3",
        "name": "新节点成为folder的直接子节点,pid指向folder"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个httpNode节点,跨项目,在folder右键粘贴(ctrl+v粘贴)到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并创建至少两个项目:项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中存在至少一个httpNode节点"
      },
      {
        "id": "3",
        "name": "项目B中存在至少一个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "打开项目A工作区"
      },
      {
        "id": "2",
        "name": "右键点击项目A中的一个httpNode节点,选择\"复制\""
      },
      {
        "id": "3",
        "name": "切换到项目B工作区(通过顶部tab或主页项目列表)"
      },
      {
        "id": "4",
        "name": "右键点击项目B中的一个folder节点"
      },
      {
        "id": "5",
        "name": "在右键菜单中点击\"粘贴\""
      },
      {
        "id": "6",
        "name": "观察节点被添加到项目B的folder下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "复制操作在项目A中将httpNode写入剪贴板,数据包含projectId字段"
      },
      {
        "id": "2",
        "name": "切换项目不会清空剪贴板数据"
      },
      {
        "id": "3",
        "name": "粘贴操作检测到fromProjectId !== currentProjectId(跨项目粘贴)"
      },
      {
        "id": "4",
        "name": "从项目A的apiNodesCache.getNodesByProjectId获取完整文档数据"
      },
      {
        "id": "5",
        "name": "生成新ID并更新projectId为项目B的ID"
      },
      {
        "id": "6",
        "name": "新节点的pid设置为项目B的folder._id"
      },
      {
        "id": "7",
        "name": "新节点保存到项目B的数据库"
      },
      {
        "id": "8",
        "name": "新节点显示在项目B的folder下,包含完整的请求数据(URL,headers,body等)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "curd-node.ts第292行:fromProjectId = pastedNodes[0].projectId"
      },
      {
        "id": "2",
        "name": "curd-node.ts第303行:if (fromProjectId !== currentProjectId)判断跨项目"
      },
      {
        "id": "3",
        "name": "curd-node.ts第305行:apiNodesCache.getNodesByProjectId(fromProjectId)获取源项目数据"
      },
      {
        "id": "4",
        "name": "curd-node.ts第342行:processedDoc.projectId = currentProjectId更新项目ID"
      },
      {
        "id": "5",
        "name": "curd-node.ts第366行:保存到当前项目的数据库"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目复制是常见需求,用于复用API配置"
      },
      {
        "id": "2",
        "name": "剪贴板使用浏览器API,切换项目不影响剪贴板数据"
      },
      {
        "id": "3",
        "name": "跨项目复制需要获取完整文档数据,因为不同项目的缓存独立"
      },
      {
        "id": "4",
        "name": "新节点的projectId必须更新为目标项目,否则会导致数据混乱"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个httpNode节点,跨项目,在banner空白区域右键粘贴(ctrl+v粘贴)到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并创建了项目A和项目B"
      },
      {
        "id": "2",
        "name": "项目A中包含至少一个httpNode节点"
      },
      {
        "id": "3",
        "name": "当前在项目A的工作台页面,banner树展开显示节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在项目A的banner树中,右键点击要复制的httpNode节点"
      },
      {
        "id": "2",
        "name": "在右键菜单中点击\"复制\"选项(或使用ctrl+c快捷键)"
      },
      {
        "id": "3",
        "name": "切换到项目B的工作台页面"
      },
      {
        "id": "4",
        "name": "在banner树的空白区域右键点击(非任何节点上)"
      },
      {
        "id": "5",
        "name": "在右键菜单中点击\"粘贴\"选项(或使用ctrl+v快捷键)"
      },
      {
        "id": "6",
        "name": "观察项目B的banner树根节点变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "复制操作成功,剪贴板包含节点数据(clipboard格式:{\"type\":\"apiflow-apidoc-node\",\"data\":[节点数组]})"
      },
      {
        "id": "2",
        "name": "在banner空白区域右键时,菜单显示\"粘贴\"选项"
      },
      {
        "id": "3",
        "name": "粘贴操作成功,项目B的banner根节点下新增一个httpNode节点"
      },
      {
        "id": "4",
        "name": "新节点被添加到banner树的根节点末尾位置(bannerStore.banner数组末尾)"
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
        "name": "新节点的projectId为项目B的ID"
      },
      {
        "id": "8",
        "name": "新节点的其他属性(url,method,headers,body等)与源节点完全一致"
      },
      {
        "id": "9",
        "name": "源节点(项目A)保持不变,不受影响"
      },
      {
        "id": "10",
        "name": "新节点在项目B的IndexedDB中成功保存"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue的handleCopyNode函数被调用,向剪贴板写入数据(line 535-544)"
      },
      {
        "id": "2",
        "name": "navigator.clipboard.writeText写入的数据格式正确,type为\"apiflow-apidoc-node\""
      },
      {
        "id": "3",
        "name": "Banner.vue的handlePasteNode函数被调用(line 559-579)"
      },
      {
        "id": "4",
        "name": "handlePasteNode中currentOperationalNode.value为null(banner空白区域右键)"
      },
      {
        "id": "5",
        "name": "curd-node.ts的pasteNodes函数被调用(line 285)"
      },
      {
        "id": "6",
        "name": "pasteNodes检测到跨项目粘贴(fromProjectId !== currentProjectId,line 292)"
      },
      {
        "id": "7",
        "name": "apiNodesCache.getNodesByProjectId被调用,获取源项目完整doc数据(line 305)"
      },
      {
        "id": "8",
        "name": "ID映射Map正确生成,源_id映射到新nanoid(line 342)"
      },
      {
        "id": "9",
        "name": "新节点的pid被设置为空字符串(currentOperationalNode.value为null,line 378, 385)"
      },
      {
        "id": "10",
        "name": "addFileAndFolderCb函数进入else分支,插入到根节点(curd-node.ts line 168)"
      },
      {
        "id": "11",
        "name": "bannerStore.splice被调用,start为bannerStore.banner.length(添加到数组末尾,line 186)"
      },
      {
        "id": "12",
        "name": "apiNodesCache.addNodes被调用,保存新节点到IndexedDB(line 366)"
      },
      {
        "id": "13",
        "name": "bannerStore.banner数组包含新节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "banner空白区域右键时,currentOperationalNode为null,触发插入到根节点的逻辑"
      },
      {
        "id": "2",
        "name": "根节点下的httpNode节点统一添加到数组末尾,folder节点会按特殊规则插入"
      },
      {
        "id": "3",
        "name": "跨项目粘贴必须获取源项目完整doc数据,因为不同项目的IndexedDB缓存相互独立"
      },
      {
        "id": "4",
        "name": "pid为空字符串表示该节点属于根节点,与pid为projectId效果相同"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个httpNode节点,在非folder节点鼠标右键不会出现粘贴操作",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少两个httpNode节点(节点A和节点B)"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击httpNode节点A,选择\"复制\"(或使用ctrl+c)"
      },
      {
        "id": "2",
        "name": "右键点击httpNode节点B(非folder类型节点)"
      },
      {
        "id": "3",
        "name": "观察右键菜单内容"
      },
      {
        "id": "4",
        "name": "检查菜单中是否有\"粘贴\"选项"
      },
      {
        "id": "5",
        "name": "检查菜单中是否有\"生成副本\"选项"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "节点A复制成功,剪贴板包含节点数据"
      },
      {
        "id": "2",
        "name": "在httpNode节点B上右键时,右键菜单正常弹出"
      },
      {
        "id": "3",
        "name": "右键菜单中不显示\"粘贴\"选项"
      },
      {
        "id": "4",
        "name": "右键菜单中显示\"生成副本\"选项(热键Ctrl+V)"
      },
      {
        "id": "5",
        "name": "菜单中显示其他常规选项:重命名,删除,复制,剪切等"
      },
      {
        "id": "6",
        "name": "此限制同样适用于其他非folder类型节点(websocket,httpMock,websocketMock等)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue中粘贴选项的v-show条件为:!currentOperationalNode || currentOperationalNode?.type === \"folder\"(line 238)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.value指向节点B,其type为\"http\""
      },
      {
        "id": "3",
        "name": "v-show条件计算结果为false(因为节点B存在且type不是folder)"
      },
      {
        "id": "4",
        "name": "SContextmenuItem粘贴组件不渲染到DOM中"
      },
      {
        "id": "5",
        "name": "Banner.vue中生成副本选项的v-show条件为:currentOperationalNode && currentOperationalNode.type !== \"folder\"(line 236)"
      },
      {
        "id": "6",
        "name": "v-show条件计算结果为true(节点B存在且不是folder)"
      },
      {
        "id": "7",
        "name": "SContextmenuItem生成副本组件渲染到DOM中,绑定Ctrl+V热键"
      },
      {
        "id": "8",
        "name": "handlePasteNode函数有二次校验(line 560),即使被调用也会直接return"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "粘贴操作只允许在folder节点或banner空白区域执行,这是设计约束"
      },
      {
        "id": "2",
        "name": "在非folder节点上,Ctrl+V热键绑定到\"生成副本\"功能而非粘贴功能"
      },
      {
        "id": "3",
        "name": "粘贴选项和生成副本选项是互斥的,通过v-show条件控制显示"
      },
      {
        "id": "4",
        "name": "此设计避免了将节点粘贴到不合理位置的错误操作"
      }
    ]
  },
  {
    "purpose": "鼠标右键复制(ctrl+c复制)单个httpNode节点,focus非folder节点ctrl+v不生效",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含至少两个httpNode节点(节点A和节点B)"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "右键点击httpNode节点A,选择\"复制\"(或使用ctrl+c)"
      },
      {
        "id": "2",
        "name": "单击选中httpNode节点B(非folder类型节点),使其获得焦点"
      },
      {
        "id": "3",
        "name": "按下Ctrl+V快捷键"
      },
      {
        "id": "4",
        "name": "观察banner树变化和新节点的创建情况"
      },
      {
        "id": "5",
        "name": "检查新节点的名称和位置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "节点A复制成功,剪贴板包含节点数据"
      },
      {
        "id": "2",
        "name": "节点B获得焦点,在banner树中高亮显示"
      },
      {
        "id": "3",
        "name": "按下Ctrl+V后,未触发粘贴操作(不从剪贴板粘贴节点A)"
      },
      {
        "id": "4",
        "name": "触发了生成副本操作,创建了节点B的副本节点"
      },
      {
        "id": "5",
        "name": "副本节点的名称为\"节点B的名称_副本\""
      },
      {
        "id": "6",
        "name": "副本节点插入到节点B的下一个位置(相邻兄弟节点之间)"
      },
      {
        "id": "7",
        "name": "副本节点拥有全新的_id(使用nanoid生成)"
      },
      {
        "id": "8",
        "name": "副本节点的其他属性(url,method,headers等)与节点B完全一致"
      },
      {
        "id": "9",
        "name": "剪贴板中的节点A数据未被使用"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue中粘贴选项绑定Ctrl+V的v-show条件为false(line 238)"
      },
      {
        "id": "2",
        "name": "Banner.vue中生成副本选项绑定Ctrl+V的v-show条件为true(line 236-237)"
      },
      {
        "id": "3",
        "name": "按下Ctrl+V时,触发handleForkNode函数(line 546-548)"
      },
      {
        "id": "4",
        "name": "handleForkNode调用curd-node.ts的forkNode函数(line 436)"
      },
      {
        "id": "5",
        "name": "forkNode从apiNodesCache获取节点B的完整数据(line 443)"
      },
      {
        "id": "6",
        "name": "forkNode生成新的nanoid作为副本_id(line 452)"
      },
      {
        "id": "7",
        "name": "副本文档的name字段添加\"_副本\"后缀(line 460)"
      },
      {
        "id": "8",
        "name": "副本的sort值通过计算插入位置确定(line 450)"
      },
      {
        "id": "9",
        "name": "apiNodesCache.addNode被调用保存副本到IndexedDB(line 464)"
      },
      {
        "id": "10",
        "name": "handlePasteNode函数未被调用"
      },
      {
        "id": "11",
        "name": "navigator.clipboard.readText未被调用(不读取剪贴板)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "在非folder节点上,Ctrl+V快捷键被生成副本功能独占,不触发粘贴功能"
      },
      {
        "id": "2",
        "name": "生成副本(fork)和粘贴(paste)是两个完全不同的功能:副本复制当前节点,粘贴使用剪贴板数据"
      },
      {
        "id": "3",
        "name": "副本节点的插入位置由sort值控制,插入到原节点的紧邻下一个位置"
      },
      {
        "id": "4",
        "name": "此设计确保在非folder节点上快捷键Ctrl+V有明确的语义(生成副本),不会引起歧义"
      }
    ]
  },
  {
    "purpose": "A httpNode节点切换到B httpNode节点,按ctrl+c复制节点,可以粘贴(验证各种粘贴模式,不同节点(如:复制到根节点下,复制到folder节点下等)和不同粘贴模式(快捷键和鼠标右键)组合,)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录系统并打开项目工作台"
      },
      {
        "id": "2",
        "name": "项目中包含httpNode节点A,httpNode节点B,folder节点F"
      },
      {
        "id": "3",
        "name": "banner树展开显示所有节点"
      },
      {
        "id": "4",
        "name": "当前正在编辑httpNode节点A(右侧内容区显示节点A的详情)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner树中点击httpNode节点B,切换到节点B的编辑界面"
      },
      {
        "id": "2",
        "name": "确认右侧内容区显示节点B的详情(URL,请求参数等)"
      },
      {
        "id": "3",
        "name": "在banner树中单击选中节点B,按ctrl+c复制节点B"
      },
      {
        "id": "4",
        "name": "场景1:在banner空白区域右键,点击\"粘贴\""
      },
      {
        "id": "5",
        "name": "验证节点B的副本粘贴到根节点下"
      },
      {
        "id": "6",
        "name": "场景2:在banner空白区域按ctrl+v"
      },
      {
        "id": "7",
        "name": "验证节点B的副本再次粘贴到根节点下"
      },
      {
        "id": "8",
        "name": "场景3:在folder节点F上右键,点击\"粘贴\""
      },
      {
        "id": "9",
        "name": "验证节点B的副本粘贴到folder节点F的子节点中"
      },
      {
        "id": "10",
        "name": "场景4:在folder节点F上按ctrl+v"
      },
      {
        "id": "11",
        "name": "验证节点B的副本再次粘贴到folder节点F的子节点中"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "节点切换成功,右侧内容区从节点A切换到节点B"
      },
      {
        "id": "2",
        "name": "在节点B上按ctrl+c,复制操作成功,剪贴板包含节点B数据"
      },
      {
        "id": "3",
        "name": "场景1:右键粘贴到根节点成功,创建节点B的副本在根节点末尾"
      },
      {
        "id": "4",
        "name": "场景2:ctrl+v粘贴到根节点成功,创建节点B的副本在根节点末尾"
      },
      {
        "id": "5",
        "name": "场景3:右键粘贴到folder成功,创建节点B的副本在folder的子节点末尾"
      },
      {
        "id": "6",
        "name": "场景4:ctrl+v粘贴到folder成功,创建节点B的副本在folder的子节点末尾"
      },
      {
        "id": "7",
        "name": "所有粘贴的副本节点拥有全新的_id(使用nanoid生成)"
      },
      {
        "id": "8",
        "name": "所有粘贴的副本节点的其他属性与节点B完全一致"
      },
      {
        "id": "9",
        "name": "所有粘贴的副本节点正确保存到IndexedDB"
      },
      {
        "id": "10",
        "name": "剪贴板数据在多次粘贴后保持不变,可以重复粘贴"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "点击节点B后,projectNavStore更新,节点B的selected属性为true"
      },
      {
        "id": "2",
        "name": "Banner.vue的handleCopyNode函数被调用(line 535-544)"
      },
      {
        "id": "3",
        "name": "navigator.clipboard.writeText写入节点B的数据"
      },
      {
        "id": "4",
        "name": "场景1和2:handlePasteNode被调用,currentOperationalNode为null(根节点)"
      },
      {
        "id": "5",
        "name": "场景3和4:handlePasteNode被调用,currentOperationalNode为folder节点F"
      },
      {
        "id": "6",
        "name": "pasteNodes函数被调用4次,每次都读取剪贴板数据(line 285)"
      },
      {
        "id": "7",
        "name": "每次粘贴都生成新的nanoid,4个副本节点拥有不同的_id"
      },
      {
        "id": "8",
        "name": "场景1和2:addFileAndFolderCb进入根节点插入分支(curd-node.ts line 168)"
      },
      {
        "id": "9",
        "name": "场景3和4:addFileAndFolderCb进入folder子节点插入分支(curd-node.ts line 142)"
      },
      {
        "id": "10",
        "name": "apiNodesCache.addNodes被调用4次,每次保存一个副本节点"
      },
      {
        "id": "11",
        "name": "bannerStore.banner数组包含所有新粘贴的节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例验证节点切换不影响复制粘贴功能的正常工作"
      },
      {
        "id": "2",
        "name": "验证了粘贴操作的两种方式(右键菜单和快捷键)都能正常工作"
      },
      {
        "id": "3",
        "name": "验证了粘贴到两种不同位置(根节点和folder节点)都能正常工作"
      },
      {
        "id": "4",
        "name": "剪贴板数据不会因为粘贴操作而清空,支持多次粘贴"
      },
      {
        "id": "5",
        "name": "每次粘贴都会生成全新的节点副本,互不影响"
      }
    ]
  }
],
}

export default node
