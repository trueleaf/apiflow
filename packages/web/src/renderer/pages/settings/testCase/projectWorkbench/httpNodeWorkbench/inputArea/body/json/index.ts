import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "json",
  description: "json参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "输入满足json5格式数据以后,调用127.0.0.1:{环境变量中的端口}/echo,返回结果body参数正确,并且content-type为application/json",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求方法为POST,URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已选择body类型为json"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在json编辑器中输入json5格式数据:{name: \"test\", age: 25, active: true}"
      },
      {
        "id": "2",
        "name": "观察编辑器是否出现语法错误提示"
      },
      {
        "id": "3",
        "name": "点击发送按钮发送请求"
      },
      {
        "id": "4",
        "name": "观察请求头和响应数据"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "json5格式数据被正确识别和解析,编辑器无错误提示"
      },
      {
        "id": "2",
        "name": "请求头中Content-Type为application/json"
      },
      {
        "id": "3",
        "name": "响应体中body参数与输入数据一致"
      },
      {
        "id": "4",
        "name": "服务器正确接收并返回json数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "支持json5格式(允许无引号的key,单引号等)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持json和json5格式的自动检测和转换"
      }
    ]
  },
  {
    "purpose": "json数据的值字段支持变量,支持超大数字,mock,调用127.0.0.1:{环境变量中的端口}/echo,返回结果body参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求方法为POST,URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置变量:user_id=\"123\", api_version=\"v1\""
      },
      {
        "id": "4",
        "name": "已配置mock:@id,@name"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在json编辑器中输入包含变量和mock的json数据"
      },
      {
        "id": "2",
        "name": "例如:{\"user_id\": \"{{user_id}}\", \"version\": \"{{api_version}}\", \"id\": \"@id\", \"username\": \"@name\", \"big_number\": 9007199254740992}"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      },
      {
        "id": "4",
        "name": "观察响应中的json数据是否被正确替换和解析"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量被正确替换:user_id=123, version=v1"
      },
      {
        "id": "2",
        "name": "mock数据被正确生成:id和username为随机值"
      },
      {
        "id": "3",
        "name": "超大数字被正确处理:big_number=9007199254740992"
      },
      {
        "id": "4",
        "name": "响应体显示完整的替换后的json数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "json值支持变量,mock和大数字的处理"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "需验证json中对超大数字的精度保持"
      }
    ]
  }
],
}

export default node
