import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "moveSingleFolder",
  description: "移动单个folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "拖拽单个folder节点到banner空白区域,移动到根节点下",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个folder节点,且位于某个父folder内"
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
        "name": "在banner区域找到目标folder节点(显示文件夹图标)"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该folder节点"
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
        "name": "释放后folder节点从原父节点下移除"
      },
      {
        "id": "3",
        "name": "folder节点出现在根节点列表中(与其他folder同级)"
      },
      {
        "id": "4",
        "name": "folder内的所有子节点随之移动"
      },
      {
        "id": "5",
        "name": "节点的pid字段更新为空字符串"
      },
      {
        "id": "6",
        "name": "节点的sort字段更新为新的排序值"
      },
      {
        "id": "7",
        "name": "离线模式下IndexedDB数据同步更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "folder节点type为\"folder\""
      },
      {
        "id": "2",
        "name": "handleCheckNodeCouldDrop对folder节点允许拖拽(Banner.vue:581-599)"
      },
      {
        "id": "3",
        "name": "dragNode函数统一处理所有节点类型(curd-node.ts:580-650)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder拖拽时其所有子节点保持层级关系"
      },
      {
        "id": "2",
        "name": "folder只能放在其他folder之间,不能放在非folder节点之前"
      }
    ]
  },
  {
    "purpose": "拖拽单个folder节点到folder节点上,移动到folder节点下作为子节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少两个folder节点"
      },
      {
        "id": "3",
        "name": "被拖拽folder不是目标folder的父级或自身"
      },
      {
        "id": "4",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到需要移动的folder节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该folder节点"
      },
      {
        "id": "3",
        "name": "拖动节点到目标folder节点上方(触发inner模式)"
      },
      {
        "id": "4",
        "name": "等待目标folder节点高亮显示可放置状态"
      },
      {
        "id": "5",
        "name": "释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "目标folder节点高亮显示表示可以接受放置"
      },
      {
        "id": "2",
        "name": "释放后folder节点移动到目标folder内部"
      },
      {
        "id": "3",
        "name": "目标folder自动展开显示新加入的folder节点"
      },
      {
        "id": "4",
        "name": "节点的pid字段更新为目标folder的_id"
      },
      {
        "id": "5",
        "name": "被移动folder内的所有子节点保持层级关系"
      },
      {
        "id": "6",
        "name": "节点的sort字段更新为Date.now()"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleCheckNodeCouldDrop对folder的inner放置返回true(Banner.vue:596-598)"
      },
      {
        "id": "2",
        "name": "dragNode设置newPid = dropData._id(curd-node.ts:596)"
      },
      {
        "id": "3",
        "name": "bannerStore.changeExpandItems展开目标folder(Banner.vue:603-605)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder支持多层嵌套结构"
      },
      {
        "id": "2",
        "name": "嵌套层级无限制,但建议控制在3-5层以内"
      }
    ]
  },
  {
    "purpose": "拖拽folder节点调整在同一层级的顺序",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "同一层级存在多个folder节点"
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
        "name": "在banner区域找到需要调整顺序的folder节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该folder节点"
      },
      {
        "id": "3",
        "name": "拖动节点到同层级其他folder节点的before或after位置"
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
        "name": "释放后folder节点调整到新的顺序位置"
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
        "name": "folder内的子节点顺序不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "dragNode函数对before/after类型计算newSort = (nextSiblingSort + previousSiblingSort) / 2(curd-node.ts:602-606)"
      },
      {
        "id": "2",
        "name": "folder只能在folder之间移动,不能移动到非folder节点之后(Banner.vue:591-593)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder节点始终排在非folder节点之前"
      },
      {
        "id": "2",
        "name": "sort值使用中间值策略避免频繁重排"
      }
    ]
  },
  {
    "purpose": "拖拽folder节点调整在同一层级的顺序",
    "precondition": [
      {
        "id": "1",
        "name": "同一层级存在至少2个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "拖拽folderA到folderB的上方或下方"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "folderA移动到指定位置,sort值更新,pid保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "dragNode计算新sort值(curd-node.ts:605-608)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder同层级移动逻辑与httpNode相同"
      }
    ]
  },
  {
    "purpose": "跨项目拖拽单个folder节点到目标项目folder节点下",
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
        "name": "源项目中存在folder节点"
      },
      {
        "id": "4",
        "name": "enableDrag.value为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在源项目的banner区域找到folder节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该folder节点"
      },
      {
        "id": "3",
        "name": "拖动节点到目标项目的folder节点上"
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
        "name": "folder节点保持在原项目中不变"
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
        "name": "跨项目移动folder应使用复制/剪切/粘贴功能"
      },
      {
        "id": "2",
        "name": "复制/粘贴会保持folder内部的层级结构"
      }
    ]
  },
  {
    "purpose": "拖拽folder节点到其自身子节点下,操作被阻止并提示错误",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个包含子节点的folder节点"
      },
      {
        "id": "3",
        "name": "el-tree组件的draggable属性为true"
      },
      {
        "id": "4",
        "name": "folder节点已展开显示子节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到包含子节点的folder节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该folder节点"
      },
      {
        "id": "3",
        "name": "拖动节点到其子节点(或子folder)上方"
      },
      {
        "id": "4",
        "name": "尝试释放鼠标左键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "el-tree内置逻辑阻止将父节点拖入子节点"
      },
      {
        "id": "2",
        "name": "不显示有效的放置指示器"
      },
      {
        "id": "3",
        "name": "释放后folder节点保持原位置"
      },
      {
        "id": "4",
        "name": "防止循环引用的数据结构"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "el-tree组件内置父子关系检查逻辑"
      },
      {
        "id": "2",
        "name": "handleCheckNodeCouldDrop不会被调用到这种情况"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "el-tree组件自动处理循环引用检查"
      },
      {
        "id": "2",
        "name": "无需在handleCheckNodeCouldDrop中额外处理"
      }
    ]
  },
  {
    "purpose": "移动包含多层嵌套的folder节点,层级结构保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "存在包含多层嵌套子节点的folder节点"
      },
      {
        "id": "3",
        "name": "enableDrag.value为true"
      },
      {
        "id": "4",
        "name": "嵌套folder内包含各类型节点(http,websocket,mock等)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到包含多层嵌套的folder节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该folder节点"
      },
      {
        "id": "3",
        "name": "拖动节点到目标位置(根级别或其他folder内)"
      },
      {
        "id": "4",
        "name": "释放鼠标左键"
      },
      {
        "id": "5",
        "name": "展开移动后的folder验证层级结构"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "folder节点成功移动到目标位置"
      },
      {
        "id": "2",
        "name": "所有子节点随父folder一起移动"
      },
      {
        "id": "3",
        "name": "嵌套层级结构完全保持不变"
      },
      {
        "id": "4",
        "name": "子节点的pid关系保持正确"
      },
      {
        "id": "5",
        "name": "只更新被拖拽folder的pid和sort"
      },
      {
        "id": "6",
        "name": "子节点数据无需单独更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "dragNode只更新被拖拽节点本身的pid和sort(curd-node.ts:593-608)"
      },
      {
        "id": "2",
        "name": "el-tree组件自动维护children数组关系"
      },
      {
        "id": "3",
        "name": "子节点通过pid引用父节点,父节点移动不影响子节点pid"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "树形结构通过pid实现父子关系,拖拽时保持引用完整"
      },
      {
        "id": "2",
        "name": "性能优化:只需更新一条记录即可完成整棵子树移动"
      }
    ]
  }
],
}

export default node
