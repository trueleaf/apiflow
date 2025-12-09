import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "queryValueUndo",
  description: "query参数value撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "path参数在value中输入字符串ab,按ctrl+z,当前value输入框值为a,再按ctrl+z,当前value输入框值为空字符串,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,path参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在value输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,value值为ab"
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
        "name": "第一次按快捷键后value值为a"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后value值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "每个字符输入记录为独立操作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "文本输入撤销功能正常"
      }
    ]
  },
  {
    "purpose": "path参数value输入字符串a,输入@唤起变量框选择mock字段,按ctrl+z, 输入框值为a,再按ctrl+z,value输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,path参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在value输入框输入字符a"
      },
      {
        "id": "2",
        "name": "输入@符号唤起变量框"
      },
      {
        "id": "3",
        "name": "选择mock字段"
      },
      {
        "id": "4",
        "name": "按ctrl+z快捷键"
      },
      {
        "id": "5",
        "name": "再次按ctrl+z快捷键"
      },
      {
        "id": "6",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次按快捷键后value值为a(取消mock选择)"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后value值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "变量选择操作记录到操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "变量选择可以撤销"
      }
    ]
  },
  {
    "purpose": "path参数value输入字符串a,输入@唤起变量框选择变量字段,按ctrl+z, 输入框值为a,再按ctrl+z,value输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在value输入框输入字符a"
      },
      {
        "id": "2",
        "name": "输入@符号唤起变量框"
      },
      {
        "id": "3",
        "name": "选择变量字段"
      },
      {
        "id": "4",
        "name": "按ctrl+z快捷键"
      },
      {
        "id": "5",
        "name": "再次按ctrl+z快捷键"
      },
      {
        "id": "6",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次按快捷键后value值为a(取消变量选择)"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后value值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "变量选择操作记录到操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "变量选择撤销功能正常"
      }
    ]
  },
  {
    "purpose": "path参数在value中输入字符串ab,点击撤销按钮,当前value输入框值为a,再点击撤销按钮,当前value输入框值为空字符串,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在value输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,value值为ab"
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
        "name": "第一次点击撤销后value值为a"
      },
      {
        "id": "2",
        "name": "第二次点击撤销后value值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销按钮与快捷键共享操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "撤销按钮与快捷键行为一致"
      }
    ]
  },
  {
    "purpose": "path参数value输入字符串a,输入@唤起变量框选择mock字段,点击撤销按钮, 输入框值为a,再点击撤销按钮,value输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在value输入框输入字符a"
      },
      {
        "id": "2",
        "name": "输入@符号唤起变量框"
      },
      {
        "id": "3",
        "name": "选择mock字段"
      },
      {
        "id": "4",
        "name": "点击撤销按钮"
      },
      {
        "id": "5",
        "name": "再次点击撤销按钮"
      },
      {
        "id": "6",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次点击撤销后value值为a(取消mock选择)"
      },
      {
        "id": "2",
        "name": "第二次点击撤销后value值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销按钮撤销变量选择"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "按钮与快捷键行为一致"
      }
    ]
  },
  {
    "purpose": "path参数value输入字符串a,输入@唤起变量框选择变量字段,点击撤销按钮, 输入框值为a,再点击撤销按钮,value输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在value输入框输入字符a"
      },
      {
        "id": "2",
        "name": "输入@符号唤起变量框"
      },
      {
        "id": "3",
        "name": "选择变量字段"
      },
      {
        "id": "4",
        "name": "点击撤销按钮"
      },
      {
        "id": "5",
        "name": "再次点击撤销按钮"
      },
      {
        "id": "6",
        "name": "尝试继续按ctrl+z"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次点击撤销后value值为a(取消变量选择)"
      },
      {
        "id": "2",
        "name": "第二次点击撤销后value值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销按钮撤销变量选择操作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "撤销按钮与快捷键功能一致"
      }
    ]
  }
],
}

export default node
