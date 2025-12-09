import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "sendButton",
  description: "发送请求按钮",
  children: [],
  atomicFunc: [
  {
    "purpose": "发送请求按钮点击后,请求过程中出现取消请求按钮,点击后取消请求,并且在返回值区域展示请求已取消",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面,配置了有效的请求url"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击发送请求按钮"
      },
      {
        "id": "2",
        "name": "在请求进行中点击取消请求按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求被中止,返回值区域显示\"请求已取消\"或类似提示"
      },
      {
        "id": "2",
        "name": "按钮恢复为发送请求状态"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "使用AbortController或类似机制取消请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "取消功能避免长时间等待无响应的请求"
      }
    ]
  },
  {
    "purpose": "发送请求按钮点击后变成取消请求按钮,请求成功或者失败后,取消请求按钮变为发送请求按钮",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击发送请求按钮"
      },
      {
        "id": "2",
        "name": "等待请求完成(成功或失败)"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求过程中按钮文本变为\"取消请求\""
      },
      {
        "id": "2",
        "name": "请求完成后按钮文本恢复为\"发送请求\""
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "按钮状态通过loading或requesting响应式变量控制"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "按钮状态反馈请求生命周期"
      }
    ]
  }
],
}

export default node
