import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "queryKeyUndo",
  description: "query参数key撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "query参数key没有值并且处于末尾,在key中输入字符串ab,按ctrl+z,取消选中next输入项选中状态,再按ctrl+z,删除next输入项并且当前key输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格末尾存在空输入行"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在末尾空行的key输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,key值为ab,自动选中next输入项"
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
        "name": "第一次按快捷键后取消next输入项选中状态"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后删除next输入项且key输入框值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "key输入触发自动添加next输入行,记录操作历史"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "末尾输入key时会自动添加下一行输入框"
      }
    ]
  },
  {
    "purpose": "query参数key存在值,在key中输入字符串ab,按ctrl+z, 输入框值为a,再按ctrl+z,key输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中间行key值为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在中间行key输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,key值为ab"
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
        "name": "第一次按快捷键后key值为a"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后key值为空"
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
        "name": "中间行输入不会触发添加next输入项"
      }
    ]
  },
  {
    "purpose": "query参数key没有值并且处于末尾,在key中输入字符串ab,按撤销按钮,取消选中next输入项选中状态,再按撤销按钮,删除next输入项并且当前key输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格末尾存在空输入行"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在末尾空行的key输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,key值为ab,自动选中next输入项"
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
        "name": "第一次点击撤销后取消next输入项选中状态"
      },
      {
        "id": "2",
        "name": "第二次点击撤销后删除next输入项且key输入框值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销按钮与快捷键共享同一操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "撤销按钮行为与快捷键一致"
      }
    ]
  },
  {
    "purpose": "query参数key存在值,在key中输入字符串ab,按撤销按钮, 输入框值为a,再按撤销按钮,key输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中间行key值为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在中间行key输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,key值为ab"
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
        "name": "第一次点击撤销后key值为a"
      },
      {
        "id": "2",
        "name": "第二次点击撤销后key值为空"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销按钮撤销文本输入操作"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "撤销按钮与快捷键行为一致"
      }
    ]
  }
],
}

export default node
