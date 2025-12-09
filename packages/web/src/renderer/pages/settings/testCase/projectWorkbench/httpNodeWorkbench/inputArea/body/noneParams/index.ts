import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "none参数",
  description: "none参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "变量模式,若没有输入有效变量,发送返回值中正确提示发送被终止",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "body类型为none"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "不输入任何内容或值"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求被正确发送,body为空"
      },
      {
        "id": "2",
        "name": "服务器接收到不包含body的请求"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "none类型表示没有请求体"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "适用于GET,DELETE等无body的请求方法"
      }
    ]
  }
],
}

export default node
