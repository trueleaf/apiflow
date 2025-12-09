import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "moveSingleWebsocketNode",
  description: "移动单个websocketNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "拖拽单个websocketNode节点到banner空白区域,移动到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个websocketNode节点,且该节点位于某个folder内"
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
        "name": "在banner区域找到目标websocketNode节点(显示WS/WSS图标)"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该websocketNode节点"
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
        "name": "websocketNode节点拖拽逻辑与httpNode完全相同(Banner.vue:18-22)"
      },
      {
        "id": "2",
        "name": "handleCheckNodeCouldDrop对websocketNode节点应用相同规则(Banner.vue:581-599)"
      },
      {
        "id": "3",
        "name": "dragNode函数统一处理所有节点类型的拖拽(curd-node.ts:580-650)"
      },
      {
        "id": "4",
        "name": "websocketNode的type字段为\"websocket\",不影响拖拽逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketNode节点显示protocol.toUpperCase()图标(WS或WSS)"
      },
      {
        "id": "2",
        "name": "拖拽逻辑对所有非folder类型节点一视同仁"
      },
      {
        "id": "3",
        "name": "websocketNode同样不能拖拽到folder前面"
      }
    ]
  },
  {
    "purpose": "拖拽单个websocketNode节点到folder节点上,移动到folder节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个websocketNode节点和一个folder节点"
      },
      {
        "id": "3",
        "name": "websocketNode节点当前不在目标folder内"
      },
      {
        "id": "4",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到目标websocketNode节点(显示WS/WSS图标)"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该websocketNode节点"
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
        "name": "释放后websocketNode节点移动到folder内部"
      },
      {
        "id": "3",
        "name": "folder自动展开显示新加入的websocketNode节点"
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
        "name": "dragNode函数中type===\"inner\"时设置newSort = Date.now()(curd-node.ts:592)"
      },
      {
        "id": "4",
        "name": "dragData.pid被设置为dropData._id(curd-node.ts:593)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketNode拖入folder的逻辑与httpNode完全相同"
      },
      {
        "id": "2",
        "name": "拖入folder后节点排在该folder内所有现有节点之后"
      },
      {
        "id": "3",
        "name": "folder会自动展开以显示新加入的节点"
      }
    ]
  },
  {
    "purpose": "拖拽单个websocketNode节点调整在同一层级的顺序",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "同一层级存在至少2个websocketNode节点或1个websocketNode和其他类型节点"
      },
      {
        "id": "3",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到需要移动的websocketNode节点A"
      },
      {
        "id": "2",
        "name": "找到目标位置的节点B"
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
        "name": "节点A移动到节点B的指定位置"
      },
      {
        "id": "3",
        "name": "节点A的pid字段保持不变"
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
        "name": "handleCheckNodeCouldDrop对非folder节点的before/after放置返回true(Banner.vue:596)"
      },
      {
        "id": "2",
        "name": "dragNode计算sort = (previousSiblingSort + nextSiblingSort) / 2(curd-node.ts:605-607)"
      },
      {
        "id": "3",
        "name": "findSiblingById获取前后兄弟节点的sort值(curd-node.ts:601-604)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "websocketNode同层级排序逻辑与所有节点类型相同"
      },
      {
        "id": "2",
        "name": "sort中间值算法确保不需要重排所有节点"
      },
      {
        "id": "3",
        "name": "非folder节点不能排在folder节点前面"
      }
    ]
  },
  {
    "purpose": "拖拽websocketNode节点到非folder节点,操作被阻止",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在websocketNode节点和其他非folder节点"
      },
      {
        "id": "3",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到源websocketNode节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该节点"
      },
      {
        "id": "3",
        "name": "拖动到httpNode或mockNode节点上方并尝试放入其内部"
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
        "name": "websocketNode的拖拽限制与httpNode完全一致"
      }
    ]
  }
],
}

export default node
