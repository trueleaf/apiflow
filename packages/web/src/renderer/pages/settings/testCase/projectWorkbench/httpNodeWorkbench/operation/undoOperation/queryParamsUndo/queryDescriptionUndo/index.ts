import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "queryDescriptionUndo",
  description: "query参数description撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "path在description中输入字符串ab,按ctrl+z, 输入框值为a,再按ctrl+z,description输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在description输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,description值为ab"
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
        "name": "第一次按快捷键后description值为a"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后description值为空"
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
    "purpose": "path在description中输入字符串ab,按撤销按钮,输入框值为a,再按撤销按钮,description输入框值为空,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在description输入框输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,description值为ab"
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
        "name": "第一次点击撤销后description值为a"
      },
      {
        "id": "2",
        "name": "第二次点击撤销后description值为空"
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
  }
],
}

export default node
