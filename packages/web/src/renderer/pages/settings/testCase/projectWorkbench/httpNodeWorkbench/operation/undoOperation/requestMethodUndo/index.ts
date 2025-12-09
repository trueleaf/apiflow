import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "requestMethodUndo",
  description: "请求方法撤销",
  children: [],
  atomicFunc: [
  {
    "purpose": "切换请求方法两次,点击撤销按钮,请求方法恢复到上一次的状态,再次点击撤销按钮,请求方法恢复到最初,并且撤销按钮置灰不可点击",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,初始请求方法为GET"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "将请求方法切换为POST"
      },
      {
        "id": "2",
        "name": "将请求方法切换为PUT"
      },
      {
        "id": "3",
        "name": "点击撤销按钮"
      },
      {
        "id": "4",
        "name": "再次点击撤销按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次撤销后请求方法恢复为POST"
      },
      {
        "id": "2",
        "name": "第二次撤销后请求方法恢复为GET"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "redoUndoStore管理操作历史栈,撤销按钮依赖canUndo状态"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "撤销功能使用栈结构记录每次操作"
      }
    ]
  },
  {
    "purpose": "切换请求方法两次,按ctrl+z,请求方法恢复到上一次的状态,再次按ctrl+z,请求方法恢复到最初,并且撤销按钮置灰不可点击",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,初始请求方法为GET"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "将请求方法切换为POST"
      },
      {
        "id": "2",
        "name": "将请求方法切换为PUT"
      },
      {
        "id": "3",
        "name": "按ctrl+z快捷键"
      },
      {
        "id": "4",
        "name": "再次按ctrl+z快捷键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一次按快捷键后请求方法恢复为POST"
      },
      {
        "id": "2",
        "name": "第二次按快捷键后请求方法恢复为GET"
      },
      {
        "id": "3",
        "name": "撤销按钮置灰不可点击,继续按ctrl+z无反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "快捷键监听绑定到redoUndoStore.undo方法"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "ctrl+z快捷键与撤销按钮功能一致"
      }
    ]
  }
],
}

export default node
