import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "headerPriority",
  description: "请求头优先级",
  children: [],
  atomicFunc: [
  {
    "purpose": "自定义请求头优先级大于公共请求头,公共请求头优先级大于可更改的默认请求头,需要验证尽可能所有情况",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "添加公共请求头:key=\"X-Custom\", value=\"from-common\""
      },
      {
        "id": "2",
        "name": "在自定义header中添加相同key:key=\"X-Custom\", value=\"from-custom\""
      },
      {
        "id": "3",
        "name": "点击发送按钮观察哪个值被发送"
      },
      {
        "id": "4",
        "name": "再测试修改默认请求头User-Agent与自定义值的优先级"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "自定义请求头的值优先级最高"
      },
      {
        "id": "2",
        "name": "服务器接收到X-Custom=from-custom"
      },
      {
        "id": "3",
        "name": "自定义header优先级 > 公共header优先级 > 默认header"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "请求头优先级规则正确实现"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "需验证所有优先级组合情况"
      }
    ]
  }
],
}

export default node
