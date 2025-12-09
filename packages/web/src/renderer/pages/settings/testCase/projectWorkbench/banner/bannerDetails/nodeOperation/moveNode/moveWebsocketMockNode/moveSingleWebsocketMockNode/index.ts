import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "moveSingleWebsocketMockNode",
  description: "移动单个websocketMockNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "拖拽单个websocketMockNode节点到banner空白区域,移动到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个websocketMockNode节点,且位于某个folder内"
      },
      {
        "id": "3",
        "name": "el-tree组件的draggable属性为true"
      },
      {
        "id": "4",
        "name": "节点未处于重命名编辑状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到目标websocketMockNode节点(显示ws mock图标)"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该websocketMockNode节点"
      },
      {
        "id": "3",
        "name": "拖动节点到banner区域的空白位置(根级别区域)"
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
        "name": "离线模式下IndexedDB数据同步更新"
      },
      {
        "id": "7",
        "name": "在线模式下调用/api/project/change_doc_pos接口"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "websocketMockNode节点type为\"websocketMock\""
      },
      {
        "id": "2",
        "name": "handleCheckNodeCouldDrop对websocketMockNode应用相同拖拽规则(Banner.vue:581-599)"
      },
      {
        "id": "3",
        "name": "dragNode函数统一处理所有节点类型(curd-node.ts:580-650)"
      },
      {
        "id": "4",
        "name": "离线模式调用apiNodesCache.replaceNode更新数据(curd-node.ts:615)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketMockNode显示特定图标区分于普通websocket节点"
      },
      {
        "id": "2",
        "name": "websocketMockNode可能有state状态指示器(running/starting/stopping/error)"
      },
      {
        "id": "3",
        "name": "拖拽逻辑不受Mock运行状态影响"
      }
    ]
  },
  {
    "purpose": "拖拽单个websocketMockNode节点到folder节点上,移动到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个websocketMockNode节点和一个folder节点"
      },
      {
        "id": "3",
        "name": "websocketMockNode节点当前不在目标folder内"
      },
      {
        "id": "4",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到目标websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该websocketMockNode节点"
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
        "name": "释放后websocketMockNode节点移动到folder内部"
      },
      {
        "id": "3",
        "name": "folder自动展开显示新加入的websocketMockNode节点"
      },
      {
        "id": "4",
        "name": "节点的pid字段更新为目标folder的_id"
      },
      {
        "id": "5",
        "name": "节点的sort字段更新为Date.now()"
      },
      {
        "id": "6",
        "name": "Mock状态指示器(如果有)随节点一起移动"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCheckNodeCouldDrop对websocketMockNode的inner放置返回true(Banner.vue:596-598)"
      },
      {
        "id": "2",
        "name": "dragNode设置newPid = dropData._id, newSort = Date.now()(curd-node.ts:596-597)"
      },
      {
        "id": "3",
        "name": "bannerStore.changeExpandItems展开目标folder(Banner.vue:603-605)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketMockNode拖入folder不影响其Mock服务运行状态"
      },
      {
        "id": "2",
        "name": "folder内可包含不同类型节点(http,websocket,mock等)"
      }
    ]
  },
  {
    "purpose": "拖拽单个websocketMockNode节点调整在同一层级的顺序",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "同一层级存在多个websocketMockNode节点"
      },
      {
        "id": "3",
        "name": "enableDrag.value为true"
      },
      {
        "id": "4",
        "name": "节点未处于重命名编辑状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到需要调整顺序的websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该websocketMockNode节点"
      },
      {
        "id": "3",
        "name": "拖动节点到同层级其他节点的before或after位置"
      },
      {
        "id": "4",
        "name": "观察放置指示线显示在目标位置"
      },
      {
        "id": "5",
        "name": "释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽过程中显示before/after放置指示线"
      },
      {
        "id": "2",
        "name": "释放后节点调整到新的顺序位置"
      },
      {
        "id": "3",
        "name": "节点的sort字段更新为相邻节点sort值的中间值"
      },
      {
        "id": "4",
        "name": "节点的pid保持不变(同一层级)"
      },
      {
        "id": "5",
        "name": "离线模式下调用apiNodesCache.replaceNode更新数据"
      },
      {
        "id": "6",
        "name": "在线模式下调用/api/project/change_doc_pos接口"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "dragNode函数对before/after类型计算newSort = (nextSiblingSort + previousSiblingSort) / 2(curd-node.ts:602-606)"
      },
      {
        "id": "2",
        "name": "findSiblingById获取前后兄弟节点的sort值(curd-node.ts:600-604)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "sort值使用中间值策略避免频繁重排所有节点"
      },
      {
        "id": "2",
        "name": "websocketMockNode顺序调整不影响Mock服务运行状态"
      }
    ]
  },
  {
    "purpose": "跨项目拖拽单个websocketMockNode节点到目标项目根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "当前工作区同时打开了多个项目"
      },
      {
        "id": "3",
        "name": "源项目中存在websocketMockNode节点"
      },
      {
        "id": "4",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在源项目的banner区域找到websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该websocketMockNode节点"
      },
      {
        "id": "3",
        "name": "拖动节点到目标项目的banner区域"
      },
      {
        "id": "4",
        "name": "释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "跨项目拖拽被系统禁止"
      },
      {
        "id": "2",
        "name": "节点保持在原项目中不变"
      },
      {
        "id": "3",
        "name": "不触发任何数据更新操作"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "el-tree组件不支持跨树实例拖拽"
      },
      {
        "id": "2",
        "name": "每个项目有独立的el-tree实例"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "跨项目移动节点应使用复制/剪切/粘贴功能"
      },
      {
        "id": "2",
        "name": "Mock节点跨项目复制可能需要重新配置端口等信息"
      }
    ]
  },
  {
    "purpose": "拖拽websocketMockNode节点到非folder节点,操作被阻止",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个websocketMockNode节点和一个非folder节点"
      },
      {
        "id": "3",
        "name": "el-tree组件的draggable属性为true"
      },
      {
        "id": "4",
        "name": "目标节点为httpNode,websocketNode或其他Mock节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到websocketMockNode节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该websocketMockNode节点"
      },
      {
        "id": "3",
        "name": "拖动节点到非folder节点上方(尝试触发inner模式)"
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
        "name": "只显示before/after放置指示器"
      },
      {
        "id": "3",
        "name": "handleCheckNodeCouldDrop对inner模式返回false"
      },
      {
        "id": "4",
        "name": "节点不会成为目标节点的子节点"
      },
      {
        "id": "5",
        "name": "无效释放位置节点保持原位置"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCheckNodeCouldDrop检查dropData.type !== \"folder\"时inner模式返回false(Banner.vue:596-598)"
      },
      {
        "id": "2",
        "name": "el-tree组件根据allow-drop返回值禁止inner放置"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "所有非folder节点都不能作为容器接受子节点"
      },
      {
        "id": "2",
        "name": "websocketMockNode的拖拽限制与其他非folder节点完全一致"
      }
    ]
  }
],
}

export default node
