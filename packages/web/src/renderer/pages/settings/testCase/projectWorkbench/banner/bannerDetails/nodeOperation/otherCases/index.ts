import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "otherCases",
  description: "节点树其他情况",
  children: [],
  atomicFunc: [
  {
    "purpose": "在根节点新增,粘贴非folder节点,会排序在末尾",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "根节点下已存在若干节点(folder和非folder混合)"
      },
      {
        "id": "3",
        "name": "执行新增或粘贴非folder节点操作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在空白区域右键打开菜单"
      },
      {
        "id": "2",
        "name": "点击\"新建接口\"或\"粘贴\"选项"
      },
      {
        "id": "3",
        "name": "完成新增或粘贴操作"
      },
      {
        "id": "4",
        "name": "观察新节点在banner中的位置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "新节点出现在根节点列表的末尾"
      },
      {
        "id": "2",
        "name": "新节点排在所有已有非folder节点之后"
      },
      {
        "id": "3",
        "name": "新节点的pid为空字符串"
      },
      {
        "id": "4",
        "name": "新节点的sort值为Date.now()确保排在末尾"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "addFileAndFolderCb对非folder节点使用bannerStore.banner.length作为插入位置(curd-node.ts:183-188)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode为null时操作根节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "非folder节点始终排在folder节点之后"
      },
      {
        "id": "2",
        "name": "新节点自动成为选中状态并打开编辑"
      }
    ]
  },
  {
    "purpose": "在根节点新增,粘贴folder节点,会排序到根目录下最后一个目录节点下面",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "根节点下已存在若干folder节点和非folder节点"
      },
      {
        "id": "3",
        "name": "执行新增或粘贴folder节点操作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在空白区域右键打开菜单"
      },
      {
        "id": "2",
        "name": "点击\"新建文件夹\"或粘贴folder节点"
      },
      {
        "id": "3",
        "name": "完成新增或粘贴操作"
      },
      {
        "id": "4",
        "name": "观察新folder节点在banner中的位置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "新folder出现在已有folder之后"
      },
      {
        "id": "2",
        "name": "新folder排在所有非folder节点之前"
      },
      {
        "id": "3",
        "name": "新folder的pid为空字符串"
      },
      {
        "id": "4",
        "name": "folder区域和非folder区域保持分离"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "addFileAndFolderCb使用findIndex找到第一个非folder节点位置(curd-node.ts:170-180)"
      },
      {
        "id": "2",
        "name": "lastFolderIndex确定folder区域的边界"
      },
      {
        "id": "3",
        "name": "bannerStore.splice在正确位置插入folder"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder始终排在非folder之前是固定规则"
      },
      {
        "id": "2",
        "name": "如果没有非folder节点,folder插入到末尾"
      }
    ]
  },
  {
    "purpose": "在根节点粘贴包含folder节点的混合节点,folder节点会排序到根目录下最后一个目录节点下面,非folder节点会排序在末尾",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "剪贴板中有包含folder和非folder的混合节点"
      },
      {
        "id": "3",
        "name": "根节点下已存在若干节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "复制或剪切包含folder和非folder的多个节点"
      },
      {
        "id": "2",
        "name": "在空白区域右键打开菜单"
      },
      {
        "id": "3",
        "name": "点击\"粘贴\"选项"
      },
      {
        "id": "4",
        "name": "观察各类型节点的最终位置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "folder节点插入到folder区域末尾"
      },
      {
        "id": "2",
        "name": "非folder节点插入到非folder区域末尾"
      },
      {
        "id": "3",
        "name": "folder区域和非folder区域保持分离"
      },
      {
        "id": "4",
        "name": "各类型节点保持原有的相对顺序"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pasteNodes遍历copyPasteNodes分别处理(curd-node.ts:384-386)"
      },
      {
        "id": "2",
        "name": "addFileAndFolderCb根据data.type决定插入位置"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "混合粘贴会自动按类型分组排序"
      },
      {
        "id": "2",
        "name": "这是系统自动行为,用户无需手动调整"
      }
    ]
  }
],
}

export default node
