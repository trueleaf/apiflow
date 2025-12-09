import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "requestUrlRedo",
  description: "请求url重做",
  children: [],
  atomicFunc: [
  {
    "purpose": "请求url中输入字符串ab,按ctrl+z撤销到a,再按ctrl+shift+z重做,url值为ab",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,请求url为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框中输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,url值变为ab"
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
        "name": "撤销后url值为a"
      },
      {
        "id": "2",
        "name": "重做后url值恢复为ab"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "url输入变更操作被记录到撤销栈中"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "快捷键重做应恢复被撤销的输入"
      }
    ]
  },
  {
    "purpose": "请求url中输入字符串ab,点击撤销按钮撤销到a,再点击重做按钮,url值为ab",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,请求url为空"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在url输入框中输入字符a"
      },
      {
        "id": "2",
        "name": "继续输入字符b,url值变为ab"
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
        "name": "撤销后url值为a"
      },
      {
        "id": "2",
        "name": "重做后url值恢复为ab"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销重做按钮与快捷键共享操作历史栈"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "按钮操作与快捷键效果应一致"
      }
    ]
  }
],
}

export default node
