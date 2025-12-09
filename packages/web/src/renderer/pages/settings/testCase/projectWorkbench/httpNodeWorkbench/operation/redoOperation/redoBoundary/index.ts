import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "redoBoundary",
  description: "重做边界情况",
  children: [],
  atomicFunc: [
  {
    "purpose": "没有可重做的操作时,重做按钮置灰不可点击,ctrl+shift+z无反应",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,未进行任何撤销操作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察重做按钮的状态"
      },
      {
        "id": "2",
        "name": "尝试按ctrl+shift+z快捷键"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "重做按钮呈灰色禁用状态"
      },
      {
        "id": "2",
        "name": "ctrl+shift+z快捷键无响应,不执行任何操作"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "当canRedo为false时重做按钮应禁用"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "边界情况:无可重做操作时的表现"
      }
    ]
  },
  {
    "purpose": "撤销后进行新操作,重做历史被清空,重做按钮置灰不可点击",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,请求方法为GET"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "将请求方法切换为POST"
      },
      {
        "id": "2",
        "name": "点击撤销按钮,请求方法恢复为GET"
      },
      {
        "id": "3",
        "name": "将请求方法切换为PUT(进行新操作)"
      },
      {
        "id": "4",
        "name": "观察重做按钮状态"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "进行新操作后,重做历史栈被清空"
      },
      {
        "id": "2",
        "name": "重做按钮变为灰色禁用状态"
      },
      {
        "id": "3",
        "name": "无法再重做到POST状态,只能撤销到GET"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "新操作应清空重做历史栈,更新canRedo为false"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "边界情况:撤销后新操作导致重做历史丢失"
      }
    ]
  }
],
}

export default node
