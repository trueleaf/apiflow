import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "queryRequiredCheckboxUndo",
  description: "query参数必有checkbox撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "取消勾选path参数必有选项,再次勾选path参数必有选项,按ctrl+z, 必有选项未被勾选,再按ctrl+z,必有选项被勾选,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数,必有选项初始为勾选状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击必有checkbox取消勾选"
      },
      {
        "id": "2",
        "name": "再次点击必有checkbox勾选"
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
        "name": "第一次按快捷键后必有选项恢复为未勾选"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后必有选项恢复为勾选"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "checkbox勾选状态变化记录到操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "checkbox操作可以撤销"
      }
    ]
  },
  {
    "purpose": "取消勾选path参数必有选项,再次勾选path参数必有选项,按撤销按钮, 必有选项未被勾选,再按撤销按钮,必有选项被勾选,并且撤销按钮置灰不可点击,ctrl+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数表格中存在一行参数,必有选项初始为勾选状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击必有checkbox取消勾选"
      },
      {
        "id": "2",
        "name": "再次点击必有checkbox勾选"
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
        "name": "第一次点击撤销后必有选项恢复为未勾选"
      },
      {
        "id": "2",
        "name": "第二次点击撤销后必有选项恢复为勾选"
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
