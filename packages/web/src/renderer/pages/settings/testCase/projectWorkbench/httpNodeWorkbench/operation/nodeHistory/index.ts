import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "nodeHistory",
  description: "节点历史记录",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击历史记录按钮,展示当前节点的发送历史列表,列表按时间倒序排列",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "该节点有多条历史请求记录(按时间顺序为A,B,C)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击工具栏中的历史记录按钮"
      },
      {
        "id": "2",
        "name": "观察历史记录列表的显示内容和顺序"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "历史记录弹窗或面板打开"
      },
      {
        "id": "2",
        "name": "列表显示所有历史请求,按时间倒序排列(C在最上方,A在最下方)"
      },
      {
        "id": "3",
        "name": "每条历史记录显示时间戳和请求概要信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "历史记录在IndexedDB中按时间戳排序"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "列表应展示最近的请求在顶部"
      }
    ]
  },
  {
    "purpose": "历史记录列表滚动到底部时自动加载更多历史记录",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "该节点的历史记录数量超过50条(当前显示前50条)"
      },
      {
        "id": "3",
        "name": "历史记录面板已打开"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "向下滚动历史记录列表至底部"
      },
      {
        "id": "2",
        "name": "观察列表是否自动加载更多历史记录"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "滚动到底部时触发自动加载"
      },
      {
        "id": "2",
        "name": "新的历史记录项自动追加到列表底部"
      },
      {
        "id": "3",
        "name": "加载过程中显示加载提示或骨架屏"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "分页加载机制,默认50条为一页"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应使用虚拟滚动以优化大量历史记录的显示"
      }
    ]
  },
  {
    "purpose": "历史记录支持搜索功能,输入关键字后过滤匹配的历史记录",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "该节点有多条历史记录,url为/user/list,/user/detail,/user/delete"
      },
      {
        "id": "3",
        "name": "历史记录面板已打开"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在搜索输入框中输入关键字detail"
      },
      {
        "id": "2",
        "name": "观察历史记录列表的变化"
      },
      {
        "id": "3",
        "name": "清空搜索输入框"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入关键字后,列表实时过滤出包含detail的历史记录"
      },
      {
        "id": "2",
        "name": "仅显示/user/detail记录"
      },
      {
        "id": "3",
        "name": "清空搜索后,列表恢复显示所有历史记录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "搜索应支持url和请求方法的模糊匹配"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "搜索应实时过滤,无需点击搜索按钮"
      }
    ]
  },
  {
    "purpose": "点击刷新按钮重新加载历史记录列表",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "历史记录面板已打开,显示旧的历史记录列表"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击历史记录面板中的刷新按钮"
      },
      {
        "id": "2",
        "name": "观察历史记录列表是否更新"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "刷新按钮显示加载中状态(如旋转图标)"
      },
      {
        "id": "2",
        "name": "列表重新从数据库加载最新的历史记录"
      },
      {
        "id": "3",
        "name": "如果有新的请求,列表会显示新增的历史记录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "刷新操作从IndexedDB重新查询最新数据"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "刷新应清除当前的搜索和过滤条件"
      }
    ]
  },
  {
    "purpose": "点击历史记录项可以查看该次请求的详细信息,包括请求参数,响应数据,时间戳",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "历史记录面板已打开,列表中有多条历史记录"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击历史记录列表中的某条记录"
      },
      {
        "id": "2",
        "name": "观察详细信息面板的显示内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右侧显示该历史记录的详细信息面板"
      },
      {
        "id": "2",
        "name": "面板显示请求参数(URL,方法,Headers,Body等)"
      },
      {
        "id": "3",
        "name": "面板显示响应数据(状态码,Headers,Body等)"
      },
      {
        "id": "4",
        "name": "面板显示请求的时间戳和响应耗时"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "历史记录详情来自IndexedDB中的完整记录"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持查看原始请求和响应的比对"
      }
    ]
  },
  {
    "purpose": "节点没有历史记录时展示空状态提示",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "该节点从未发送过任何请求,历史记录为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击历史记录按钮打开历史记录面板"
      },
      {
        "id": "2",
        "name": "观察面板中的内容显示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "历史记录面板打开"
      },
      {
        "id": "2",
        "name": "显示空状态提示,如\"暂无历史记录\"或无数据提示图"
      },
      {
        "id": "3",
        "name": "提示建议用户先发送请求以生成历史记录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "空状态应显示合适的提示文案和图标"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空状态设计应符合UI规范,提升用户体验"
      }
    ]
  }
],
}

export default node
