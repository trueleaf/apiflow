import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "moveSingleHttpNode",
  description: "移动单个httpNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "拖拽单个httpNode节点到banner空白区域,移动到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个httpNode节点,且该节点位于某个folder内(非根节点)"
      },
      {
        "id": "3",
        "name": "el-tree组件的draggable属性为true(enableDrag.value为true)"
      },
      {
        "id": "4",
        "name": "节点未处于重命名编辑状态(editNode.value为null)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标httpNode节点(显示GET/POST等方法图标)"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该httpNode节点"
      },
      {
        "id": "3",
        "name": "拖动节点到banner区域的空白位置(树的根级别区域)"
      },
      {
        "id": "4",
        "name": "释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽过程中显示拖拽占位符指示器"
      },
      {
        "id": "2",
        "name": "释放后节点从原父节点下移除"
      },
      {
        "id": "3",
        "name": "节点出现在根节点列表中(所有folder之后)"
      },
      {
        "id": "4",
        "name": "节点的pid字段更新为空字符串"
      },
      {
        "id": "5",
        "name": "节点的sort字段更新为新的排序值"
      },
      {
        "id": "6",
        "name": "离线模式下IndexedDB中该节点数据被更新"
      },
      {
        "id": "7",
        "name": "在线模式下服务器API被调用更新节点位置"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "el-tree组件配置:draggable=\"enableDrag\"(Banner.vue:18)"
      },
      {
        "id": "2",
        "name": "handleCheckNodeCouldDrop函数判断拖拽是否允许(Banner.vue:581-599)"
      },
      {
        "id": "3",
        "name": "释放时触发@node-drop事件调用handleNodeDropSuccess(Banner.vue:22)"
      },
      {
        "id": "4",
        "name": "handleNodeDropSuccess调用dragNode函数(Banner.vue:601-605)"
      },
      {
        "id": "5",
        "name": "dragNode函数中type为\"before\"或\"after\"时,计算新的pid和sort(curd-node.ts:580-650)"
      },
      {
        "id": "6",
        "name": "离线模式调用apiNodesCache.replaceNode更新IndexedDB(curd-node.ts:615)"
      },
      {
        "id": "7",
        "name": "在线模式调用request.put(\"/api/project/change_doc_pos\")更新服务器(curd-node.ts:648)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "拖拽到根节点的httpNode节点会排列在所有folder之后"
      },
      {
        "id": "2",
        "name": "sort值通过(previousSiblingSort + nextSiblingSort) / 2计算"
      },
      {
        "id": "3",
        "name": "拖拽期间editNode必须为null,否则输入框会干扰拖拽操作"
      }
    ]
  },
  {
    "purpose": "拖拽单个httpNode节点到folder节点上,移动到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个httpNode节点和一个folder节点"
      },
      {
        "id": "3",
        "name": "httpNode节点当前不在目标folder内"
      },
      {
        "id": "4",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到目标httpNode节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该httpNode节点"
      },
      {
        "id": "3",
        "name": "拖动节点到目标folder节点上方(触发inner模式)"
      },
      {
        "id": "4",
        "name": "等待folder节点高亮显示可放置状态"
      },
      {
        "id": "5",
        "name": "释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "folder节点高亮显示表示可以接受放置"
      },
      {
        "id": "2",
        "name": "释放后httpNode节点移动到folder内部"
      },
      {
        "id": "3",
        "name": "folder自动展开显示新加入的httpNode节点"
      },
      {
        "id": "4",
        "name": "节点的pid字段更新为目标folder的_id"
      },
      {
        "id": "5",
        "name": "节点的sort字段更新为Date.now()(追加到末尾)"
      },
      {
        "id": "6",
        "name": "bannerStore.changeExpandItems被调用展开folder"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCheckNodeCouldDrop判断type===\"inner\"且dropData.type===\"folder\"返回true(Banner.vue:596-598)"
      },
      {
        "id": "2",
        "name": "handleNodeDropSuccess中type为\"inner\"时调用bannerStore.changeExpandItems(Banner.vue:603-605)"
      },
      {
        "id": "3",
        "name": "dragNode函数中type===\"inner\"时设置params.sort = Date.now()(curd-node.ts:592)"
      },
      {
        "id": "4",
        "name": "dragData.pid被设置为dropData._id(curd-node.ts:593)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "只有folder类型节点才能接受inner放置"
      },
      {
        "id": "2",
        "name": "拖入folder后自动展开该folder以显示新节点"
      },
      {
        "id": "3",
        "name": "新节点排序值使用Date.now()确保排在folder内最后"
      }
    ]
  },
  {
    "purpose": "拖拽单个httpNode节点调整在同一层级的顺序",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "同一层级(根目录或同一folder内)存在至少2个httpNode节点"
      },
      {
        "id": "3",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到需要移动的httpNode节点A"
      },
      {
        "id": "2",
        "name": "找到目标位置的httpNode节点B"
      },
      {
        "id": "3",
        "name": "鼠标左键按住节点A"
      },
      {
        "id": "4",
        "name": "拖动到节点B的上方或下方(触发before/after模式)"
      },
      {
        "id": "5",
        "name": "观察拖拽指示线出现在目标位置"
      },
      {
        "id": "6",
        "name": "释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽过程中显示横线指示器表示放置位置"
      },
      {
        "id": "2",
        "name": "节点A移动到节点B的指定位置(before或after)"
      },
      {
        "id": "3",
        "name": "节点A的pid字段保持不变(同层级移动)"
      },
      {
        "id": "4",
        "name": "节点A的sort字段更新为相邻节点sort值的中间值"
      },
      {
        "id": "5",
        "name": "文档树实时刷新显示新的节点顺序"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCheckNodeCouldDrop判断type===\"prev\"或\"next\"时,非folder节点返回true(Banner.vue:596)"
      },
      {
        "id": "2",
        "name": "dragNode函数计算newSort = (previousSiblingSort + nextSiblingSort) / 2(curd-node.ts:605-607)"
      },
      {
        "id": "3",
        "name": "findSiblingById函数查找前后兄弟节点获取sort值(curd-node.ts:601-604)"
      },
      {
        "id": "4",
        "name": "dragData.sort被更新为计算后的中间值(curd-node.ts:608)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "sort值采用中间值算法避免频繁重排整个列表"
      },
      {
        "id": "2",
        "name": "如果前一个节点不存在,previousSiblingSort默认为0"
      },
      {
        "id": "3",
        "name": "如果后一个节点不存在,nextSiblingSort默认为Date.now()"
      },
      {
        "id": "4",
        "name": "同层级移动不改变pid,只改变sort"
      }
    ]
  },
  {
    "purpose": "拖拽httpNode节点到非folder节点(如httpNode,mockNode等)中,操作被阻止",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少2个httpNode节点或1个httpNode和1个mockNode"
      },
      {
        "id": "3",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到源httpNode节点A"
      },
      {
        "id": "2",
        "name": "鼠标左键按住节点A"
      },
      {
        "id": "3",
        "name": "拖动到另一个httpNode节点B上方并尝试放入其内部(inner模式)"
      },
      {
        "id": "4",
        "name": "观察放置指示器状态"
      },
      {
        "id": "5",
        "name": "释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽到非folder节点上时,不显示inner放置指示器"
      },
      {
        "id": "2",
        "name": "只显示before/after放置指示器(横线)"
      },
      {
        "id": "3",
        "name": "尝试inner放置时,handleCheckNodeCouldDrop返回false"
      },
      {
        "id": "4",
        "name": "节点A不会成为节点B的子节点"
      },
      {
        "id": "5",
        "name": "如果释放位置无效,节点A保持原位置不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCheckNodeCouldDrop函数检查dropData.type !== \"folder\"(Banner.vue:596-598)"
      },
      {
        "id": "2",
        "name": "当dropData.type !== \"folder\"且type === \"inner\"时返回false(Banner.vue:598)"
      },
      {
        "id": "3",
        "name": "el-tree组件根据allow-drop返回值控制放置指示器显示"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "只有folder类型节点才能包含子节点"
      },
      {
        "id": "2",
        "name": "http,websocket,httpMock,websocketMock类型节点都不能作为容器"
      },
      {
        "id": "3",
        "name": "handleCheckNodeCouldDrop返回false时el-tree禁止该放置操作"
      }
    ]
  }
],
}

export default node
