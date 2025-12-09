import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "scriptExecution",
  description: "脚本执行",
  children: [],
  atomicFunc: [
  {
    "purpose": "后置脚本语法错误时,在响应区域展示脚本错误信息",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入有语法错误的代码:const x = { invalid syntax }"
      },
      {
        "id": "2",
        "name": "发送请求"
      },
      {
        "id": "3",
        "name": "观察响应区域是否显示脚本错误信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "脚本执行失败"
      },
      {
        "id": "2",
        "name": "响应区域显示脚本语法错误信息"
      },
      {
        "id": "3",
        "name": "错误信息包含错误行号和具体的语法错误描述"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "脚本语法检查功能正常"
      },
      {
        "id": "2",
        "name": "错误信息清晰准确"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "语法错误包括括号不匹配,关键字拼写错误等"
      }
    ]
  },
  {
    "purpose": "后置脚本运行时错误时,在响应区域展示运行时错误信息",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入会导致运行时错误的代码:const x = null; x.property"
      },
      {
        "id": "2",
        "name": "发送请求"
      },
      {
        "id": "3",
        "name": "观察响应区域是否显示脚本运行时错误信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "脚本执行失败"
      },
      {
        "id": "2",
        "name": "响应区域显示脚本运行时错误信息"
      },
      {
        "id": "3",
        "name": "错误信息包含错误类型和具体的错误描述"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "脚本运行时错误捕获功能正常"
      },
      {
        "id": "2",
        "name": "错误信息清晰准确"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "运行时错误包括类型错误,引用错误等"
      }
    ]
  },
  {
    "purpose": "后置脚本在主请求响应后执行",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域和请求配置"
      },
      {
        "id": "2",
        "name": "主请求已配置"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入访问响应的代码:console.log(af.response.statusCode)"
      },
      {
        "id": "2",
        "name": "发送请求"
      },
      {
        "id": "3",
        "name": "观察响应区域的执行顺序:先显示主请求响应,再执行后置脚本"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "主请求首先执行并收到响应"
      },
      {
        "id": "2",
        "name": "后置脚本在主请求完成后执行"
      },
      {
        "id": "3",
        "name": "后置脚本可以访问主请求的响应数据"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "脚本执行顺序正确"
      },
      {
        "id": "2",
        "name": "后置脚本可以访问响应对象"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "后置脚本的作用是在主请求完成后对响应进行处理"
      }
    ]
  }
],
}

export default node
