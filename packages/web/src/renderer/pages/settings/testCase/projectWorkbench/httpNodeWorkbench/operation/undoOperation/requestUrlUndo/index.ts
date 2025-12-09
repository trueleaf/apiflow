import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "requestUrlUndo",
  description: "请求url撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "请求url中输入字符串ab,点击撤销按钮,url值为a,再次点击撤销按钮,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,url值为ab"
      },
      {
        "id": "3",
        "name": "点击撤销按钮"
      },
      {
        "id": "4",
        "name": "再次点击撤销按钮"
      },
      {
        "id": "5",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次撤销后url值为a"
      },
      {
        "id": "2",
        "name": "第二次撤销后url值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "redoUndoStore记录每个字符输入操作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "文本输入每个字符变化都记录为独立操作"
      }
    ]
  },
  {
    "purpose": "请求url中输入字符串ab,按ctrl+z,url值为a,再次按ctrl+z,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,url值为ab"
      },
      {
        "id": "3",
        "name": "按ctrl+z快捷键"
      },
      {
        "id": "4",
        "name": "再次按ctrl+z快捷键"
      },
      {
        "id": "5",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次按快捷键后url值为a"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后url值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "快捷键与撤销按钮共享同一操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "快捷键行为与按钮一致"
      }
    ]
  },
  {
    "purpose": "请求url中输入中文字符串`你好`,点击撤销按钮,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框输入中文字符串\"你好\""
      },
      {
        "id": "2",
        "name": "点击撤销按钮"
      },
      {
        "id": "3",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "撤销后url值为空"
      },
      {
        "id": "2",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "中文输入法输入可能作为单次操作记录"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "中文输入通常在确认后才记录操作"
      }
    ]
  },
  {
    "purpose": "请求url中输入中文字符串`你好`,按ctrl+z,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框输入中文字符串\"你好\""
      },
      {
        "id": "2",
        "name": "按ctrl+z快捷键"
      },
      {
        "id": "3",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按快捷键后url值为空"
      },
      {
        "id": "2",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "快捷键处理中文输入操作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "中文输入撤销行为与英文一致"
      }
    ]
  },
  {
    "purpose": "请求url中输入字符串a,ctrl+v粘贴`test.demo.com`,点击撤销按钮,url值为a,再次点击撤销按钮,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框输入字符a"
      },
      {
        "id": "2",
        "name": "按ctrl+v粘贴\"test.demo.com\""
      },
      {
        "id": "3",
        "name": "点击撤销按钮"
      },
      {
        "id": "4",
        "name": "再次点击撤销按钮"
      },
      {
        "id": "5",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次撤销后url值为a"
      },
      {
        "id": "2",
        "name": "第二次撤销后url值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "粘贴操作作为单次操作记录"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "粘贴整段文本算一次操作,可一次性撤销"
      }
    ]
  },
  {
    "purpose": "请求url中输入字符串a,ctrl+v粘贴`test.demo.com`,按ctrl+z,url值为a,再次按ctrl+z,url值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,url输入框为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框输入字符a"
      },
      {
        "id": "2",
        "name": "按ctrl+v粘贴\"test.demo.com\""
      },
      {
        "id": "3",
        "name": "按ctrl+z快捷键"
      },
      {
        "id": "4",
        "name": "再次按ctrl+z快捷键"
      },
      {
        "id": "5",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次按快捷键后url值为a"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后url值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "快捷键处理粘贴操作撤销"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "快捷键撤销粘贴操作与按钮行为一致"
      }
    ]
  }
],
}

export default node
