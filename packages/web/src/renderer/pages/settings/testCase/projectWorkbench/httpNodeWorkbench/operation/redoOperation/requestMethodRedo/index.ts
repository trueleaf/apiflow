import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "requestMethodRedo",
  description: "请求方法重做",
  children: [],
  atomicFunc: [
  {
    "purpose": "切换请求方法两次后点击撤销按钮,再点击重做按钮,请求方法恢复到撤销前的状态",
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
        "name": "点击重做按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "撤销后请求方法为POST"
      },
      {
        "id": "2",
        "name": "重做后请求方法恢复为PUT"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "重做按钮依赖canRedo状态"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "重做功能恢复上一次撤销的操作"
      }
    ]
  },
  {
    "purpose": "切换请求方法两次后按ctrl+z,再按ctrl+shift+z,请求方法恢复到撤销前的状态",
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
        "name": "按ctrl+z快捷键撤销"
      },
      {
        "id": "4",
        "name": "按ctrl+shift+z快捷键重做"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "撤销后请求方法为POST"
      },
      {
        "id": "2",
        "name": "重做后请求方法恢复为PUT"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "快捷键与按钮共享重做历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "ctrl+shift+z快捷键与重做按钮功能一致"
      }
    ]
  }
],
}

export default node
