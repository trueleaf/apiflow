import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "af.variables API",
  description: "af.variables API",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.variables.get(name)获取指定变量值",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已定义变量或通过脚本设置了变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:const apiUrl = af.variables.get(\"api_url\"); console.log(apiUrl)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "在控制台输出中查看变量值"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "成功获取指定变量的值"
      },
      {
        "id": "3",
        "name": "控制台输出显示正确的变量值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.variables.get()方法可调用"
      },
      {
        "id": "2",
        "name": "返回正确的变量值"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "如果变量不存在返回null或undefined"
      }
    ]
  },
  {
    "purpose": "使用af.variables.set(name, value)设置变量值",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在后置脚本中输入:af.variables.set(\"next_page\", 2)"
      },
      {
        "id": "2",
        "name": "再次发送请求"
      },
      {
        "id": "3",
        "name": "验证变量已被设置并可以在后续请求中使用"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后置脚本正确执行"
      },
      {
        "id": "2",
        "name": "变量成功设置"
      },
      {
        "id": "3",
        "name": "在后续请求中可以通过{{next_page}}访问该变量"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.variables.set()方法可调用"
      },
      {
        "id": "2",
        "name": "变量值成功保存"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "设置的变量作用域为当前项目或会话"
      }
    ]
  },
  {
    "purpose": "后置脚本中设置的变量在下次请求中可以使用",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的后置脚本区域"
      },
      {
        "id": "2",
        "name": "已配置前一个请求的后置脚本用于设置变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "第一个请求的后置脚本中输入:af.variables.set(\"token_from_response\", response.body.token)"
      },
      {
        "id": "2",
        "name": "发送第一个请求"
      },
      {
        "id": "3",
        "name": "在第二个请求的URL或Header中使用该变量:{{token_from_response}}"
      },
      {
        "id": "4",
        "name": "发送第二个请求"
      },
      {
        "id": "5",
        "name": "验证变量值已被正确替换"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "第一个请求的后置脚本成功设置变量"
      },
      {
        "id": "2",
        "name": "第二个请求可以访问到该变量"
      },
      {
        "id": "3",
        "name": "变量值在请求中被正确替换"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "变量持久化存储正常"
      },
      {
        "id": "2",
        "name": "变量在请求前的替换流程中可用"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "变量的跨请求使用是测试链接多个API的关键"
      }
    ]
  }
],
}

export default node
