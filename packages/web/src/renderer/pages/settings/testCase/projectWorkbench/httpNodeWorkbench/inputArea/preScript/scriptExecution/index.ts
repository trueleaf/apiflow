import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "scriptExecution",
  description: "脚本执行",
  children: [],
  atomicFunc: [
  {
    "purpose": "前置脚本语法错误时,发送请求后在响应区域展示脚本错误信息",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入有语法错误的代码:const x = { invalid syntax }"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
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
    "purpose": "前置脚本运行时错误时,发送请求后在响应区域展示运行时错误信息",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入会导致运行时错误的代码:const x = null; x.property"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
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
    "purpose": "前置脚本正常执行后,主请求继续发送",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域和请求配置"
      },
      {
        "id": "2",
        "name": "主请求已配置"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入正确的脚本代码"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域查看是否发送了主请求并获得响应"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正常执行"
      },
      {
        "id": "2",
        "name": "脚本执行完成后主请求继续发送"
      },
      {
        "id": "3",
        "name": "响应区域显示主请求的响应数据(不是脚本错误)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "脚本执行和主请求是独立的流程"
      },
      {
        "id": "2",
        "name": "脚本正确执行后主请求正常发送"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "前置脚本的作用是在主请求前修改请求或执行其他操作"
      }
    ]
  }
],
}

export default node
