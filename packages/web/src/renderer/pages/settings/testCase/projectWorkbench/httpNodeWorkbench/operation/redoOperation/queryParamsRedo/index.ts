import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "queryParamsRedo",
  description: "query参数重做",
  children: [],
  atomicFunc: [
  {
    "purpose": "query参数key输入值后撤销,再重做,值恢复到撤销前的状态",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数列表为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击添加query参数按钮"
      },
      {
        "id": "2",
        "name": "在query参数key输入框中输入page"
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
        "name": "撤销后query参数key为空"
      },
      {
        "id": "2",
        "name": "重做后query参数key值恢复为page"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "query参数输入变更被记录到撤销栈中"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "参数编辑的每次输入都应记录到操作历史"
      }
    ]
  },
  {
    "purpose": "query参数拖拽后撤销,再重做,顺序恢复到撤销前的状态",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,query参数中存在两个参数page和size"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标拖拽第一个query参数到第二个位置"
      },
      {
        "id": "2",
        "name": "点击撤销按钮"
      },
      {
        "id": "3",
        "name": "点击重做按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽后page和size的顺序互换"
      },
      {
        "id": "2",
        "name": "撤销后顺序恢复为page,size"
      },
      {
        "id": "3",
        "name": "重做后顺序恢复为size,page"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "拖拽操作被记录到撤销栈中"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "顺序变更应可以通过撤销重做恢复"
      }
    ]
  }
],
}

export default node
