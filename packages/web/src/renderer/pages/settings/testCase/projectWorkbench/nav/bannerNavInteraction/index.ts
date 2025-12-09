import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "bannerNavInteraction",
  description: "banner与项目工作区导航交互",
  children: [],
  atomicFunc: [
  {
    "purpose": "单击左侧非folder类型节点,右侧导航栏会新增一个tab页签,并且页签为非固定状态,页签中字体为斜体",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在非folder类型节点(http/websocket/mock)"
      },
      {
        "id": "3",
        "name": "导航栏已正常加载"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到任意非folder节点"
      },
      {
        "id": "2",
        "name": "单击该节点(非双击)"
      },
      {
        "id": "3",
        "name": "观察导航栏的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "导航栏新增一个tab页签"
      },
      {
        "id": "2",
        "name": "tab页签的fixed属性为false(非固定状态)"
      },
      {
        "id": "3",
        "name": "页签文字显示为斜体样式"
      },
      {
        "id": "4",
        "name": "页签处于选中状态(selected: true)"
      },
      {
        "id": "5",
        "name": "内容区域显示对应节点的编辑界面"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "banner节点单击事件触发addNav"
      },
      {
        "id": "2",
        "name": "addNav设置fixed: false表示非固定"
      },
      {
        "id": "3",
        "name": "CSS样式通过fixed属性控制font-style: italic"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "非固定页签可被后续单击覆盖"
      },
      {
        "id": "2",
        "name": "斜体样式提示用户该页签为预览状态"
      }
    ]
  },
  {
    "purpose": "双击左侧非folder类型节点,右侧导航栏会新增一个tab页签,并且页签为固定状态,页签中字体正常展示",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在非folder类型节点"
      },
      {
        "id": "3",
        "name": "导航栏已正常加载"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到任意非folder节点"
      },
      {
        "id": "2",
        "name": "双击该节点"
      },
      {
        "id": "3",
        "name": "观察导航栏的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "导航栏新增一个tab页签"
      },
      {
        "id": "2",
        "name": "tab页签的fixed属性为true(固定状态)"
      },
      {
        "id": "3",
        "name": "页签文字显示为正常样式(非斜体)"
      },
      {
        "id": "4",
        "name": "页签处于选中状态"
      },
      {
        "id": "5",
        "name": "固定页签不会被单击其他节点覆盖"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "banner节点双击事件触发addNav"
      },
      {
        "id": "2",
        "name": "addNav设置fixed: true表示固定"
      },
      {
        "id": "3",
        "name": "CSS样式通过fixed属性控制正常字体"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "双击直接打开为固定页签"
      },
      {
        "id": "2",
        "name": "固定页签需要手动关闭"
      }
    ]
  },
  {
    "purpose": "单击左侧folder类型节点,右侧导航栏不会新增一个tab页签",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在folder类型节点"
      },
      {
        "id": "3",
        "name": "导航栏已正常加载"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到任意folder节点"
      },
      {
        "id": "2",
        "name": "单击该folder节点"
      },
      {
        "id": "3",
        "name": "观察导航栏的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "导航栏不新增任何tab页签"
      },
      {
        "id": "2",
        "name": "folder节点展开或折叠状态切换"
      },
      {
        "id": "3",
        "name": "当前选中的页签保持不变"
      },
      {
        "id": "4",
        "name": "内容区域保持原有内容"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "folder节点点击事件只处理展开/折叠"
      },
      {
        "id": "2",
        "name": "addNav不会为folder类型调用"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder只作为容器节点,没有编辑内容"
      },
      {
        "id": "2",
        "name": "单击folder展开/折叠其子节点"
      }
    ]
  },
  {
    "purpose": "单击左侧非folder类型节点A,再点击左侧folder类型节点B,节点B的tab会覆盖节点A的tab",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在多个非folder类型节点"
      },
      {
        "id": "3",
        "name": "当前无选中页签或有非固定页签"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "单击非folder节点A,产生非固定页签A"
      },
      {
        "id": "2",
        "name": "单击另一个非folder节点B"
      },
      {
        "id": "3",
        "name": "观察导航栏页签的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "页签A被页签B替换覆盖"
      },
      {
        "id": "2",
        "name": "导航栏页签总数不变"
      },
      {
        "id": "3",
        "name": "页签B仍为非固定状态(斜体)"
      },
      {
        "id": "4",
        "name": "内容区域显示节点B的内容"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "单击替换逻辑:找到非固定页签并覆盖"
      },
      {
        "id": "2",
        "name": "projectNavStore处理页签替换"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "单击预览模式避免打开过多页签"
      },
      {
        "id": "2",
        "name": "类似VS Code的预览模式行为"
      }
    ]
  },
  {
    "purpose": "tab页签存在固定页签和非固定页签,当前选中页签可以是固定也可以是非固定的,单击左侧非folder类型节点,会选中并覆盖未固定页签,并且也是未固定的",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "导航栏存在固定页签和非固定页签"
      },
      {
        "id": "3",
        "name": "当前选中的可能是固定或非固定页签"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "确保导航栏有固定页签和非固定页签"
      },
      {
        "id": "2",
        "name": "单击左侧任意非folder节点"
      },
      {
        "id": "3",
        "name": "观察导航栏页签变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "非固定页签被新节点覆盖"
      },
      {
        "id": "2",
        "name": "固定页签保持不变"
      },
      {
        "id": "3",
        "name": "新页签仍为非固定状态"
      },
      {
        "id": "4",
        "name": "新页签成为选中状态"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "单击逻辑只覆盖fixed: false的页签"
      },
      {
        "id": "2",
        "name": "fixed: true的页签受保护不被覆盖"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "固定页签用于用户主动打开的重要内容"
      },
      {
        "id": "2",
        "name": "非固定页签用于快速预览"
      }
    ]
  },
  {
    "purpose": "tab页签存在固定页签和非固定页签,当前选中页签可以是固定也可以是非固定的,双击左侧非folder类型节点,会选中并覆盖未固定页签,并且是固定的",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "导航栏存在非固定页签"
      },
      {
        "id": "3",
        "name": "项目中存在非folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "确保导航栏有非固定页签"
      },
      {
        "id": "2",
        "name": "双击左侧任意非folder节点"
      },
      {
        "id": "3",
        "name": "观察导航栏页签变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "非固定页签被新节点覆盖"
      },
      {
        "id": "2",
        "name": "新页签变为固定状态"
      },
      {
        "id": "3",
        "name": "页签文字变为正常样式(非斜体)"
      },
      {
        "id": "4",
        "name": "新页签成为选中状态"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "双击设置fixed: true"
      },
      {
        "id": "2",
        "name": "覆盖非固定页签后设为固定"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "双击表示用户确定要打开该节点"
      },
      {
        "id": "2",
        "name": "固定页签防止意外覆盖"
      }
    ]
  },
  {
    "purpose": "banner新增一个节点会在右侧导航栏新增一个tab页签,页签位置在当前激活页签右侧",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "导航栏已有若干页签"
      },
      {
        "id": "3",
        "name": "当前有选中的激活页签"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "通过右键菜单或工具栏新增一个节点"
      },
      {
        "id": "2",
        "name": "观察导航栏页签的位置变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "新页签出现在当前激活页签的右侧"
      },
      {
        "id": "2",
        "name": "新页签成为选中状态"
      },
      {
        "id": "3",
        "name": "新页签为固定状态(新建即固定)"
      },
      {
        "id": "4",
        "name": "其他页签位置相应右移"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "addFileAndFolderCb调用addNav(curd-node.ts:210-264)"
      },
      {
        "id": "2",
        "name": "addNav在当前选中页签后插入"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "新建节点自动打开编辑"
      },
      {
        "id": "2",
        "name": "插入位置便于用户管理相关页签"
      }
    ]
  },
  {
    "purpose": "删除banner节点,右侧导航栏删除对应tab页签",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner中存在节点且对应页签已打开"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner中删除一个节点"
      },
      {
        "id": "2",
        "name": "观察导航栏页签的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "对应的tab页签被自动关闭"
      },
      {
        "id": "2",
        "name": "如果删除的是当前选中页签,选中下一个页签"
      },
      {
        "id": "3",
        "name": "folder删除时其所有子节点的页签也被关闭"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "deleteNode调用projectNavStore.deleteNavByIds(curd-node.ts:101-106)"
      },
      {
        "id": "2",
        "name": "forEachForest收集所有需删除的节点ID"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "删除节点自动清理相关页签"
      },
      {
        "id": "2",
        "name": "防止出现无效的孤立页签"
      }
    ]
  },
  {
    "purpose": "重命名banner节点,右侧导航栏对应tab页签字体更新",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner中存在节点且对应页签已打开"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner中重命名一个节点"
      },
      {
        "id": "2",
        "name": "观察导航栏页签的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "对应的tab页签名称同步更新"
      },
      {
        "id": "2",
        "name": "页签的label字段更新为新名称"
      },
      {
        "id": "3",
        "name": "页签的title提示也同步更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "renameNode调用projectNavStore.changeNavInfoById(curd-node.ts:669-673)"
      },
      {
        "id": "2",
        "name": "changeNavInfoById更新label字段"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "名称同步确保banner和nav一致"
      },
      {
        "id": "2",
        "name": "用户可通过页签识别对应节点"
      }
    ]
  },
  {
    "purpose": "点击tab页签,左侧banner节点高亮,若无节点相关tab页签被选中,则取消banner高亮",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "导航栏存在多个页签"
      },
      {
        "id": "3",
        "name": "banner中对应节点可见"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击导航栏中的某个节点类型页签"
      },
      {
        "id": "2",
        "name": "观察banner中对应节点的高亮状态"
      },
      {
        "id": "3",
        "name": "点击特殊功能页签(如变量,Cookie)"
      },
      {
        "id": "4",
        "name": "观察banner节点的高亮状态"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击节点页签后,banner对应节点高亮"
      },
      {
        "id": "2",
        "name": "banner自动滚动使节点可见(如果需要)"
      },
      {
        "id": "3",
        "name": "点击特殊功能页签后,banner取消所有节点高亮"
      },
      {
        "id": "4",
        "name": "el-tree的current-node-key同步更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "activeNode computed根据选中页签计算"
      },
      {
        "id": "2",
        "name": "el-tree的highlight-current属性控制高亮"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "banner与nav双向联动"
      },
      {
        "id": "2",
        "name": "高亮帮助用户定位当前编辑的节点"
      }
    ]
  }
],
}

export default node
