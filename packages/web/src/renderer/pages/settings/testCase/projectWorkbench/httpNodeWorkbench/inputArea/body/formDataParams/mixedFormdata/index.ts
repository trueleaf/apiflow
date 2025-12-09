import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "mixedFormdata",
  description: "类型为file和string的混合类型的formdata参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "存在string类型value和file类型value时候,调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "文件/tmp/image.jpg存在"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中添加string类型:key=\"username\", value=\"admin\""
      },
      {
        "id": "2",
        "name": "添加file类型:key=\"avatar\", value=\"/tmp/image.jpg\""
      },
      {
        "id": "3",
        "name": "添加string类型:key=\"desc\", value=\"user description\""
      },
      {
        "id": "4",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "混合类型的formdata被正确发送"
      },
      {
        "id": "2",
        "name": "服务器接收到string和file参数"
      },
      {
        "id": "3",
        "name": "响应体显示所有参数信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "混合类型formdata使用multipart/form-data编码"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应正确处理string和file的混合"
      }
    ]
  }
],
}

export default node
