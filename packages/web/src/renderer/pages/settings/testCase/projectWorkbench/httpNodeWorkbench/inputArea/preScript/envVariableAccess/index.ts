import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "envVariableAccess",
  description: "环境变量访问",
  children: [],
  atomicFunc: [
  {
    "purpose": "使用af.envs获取所有环境变量列表",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "已配置多个环境变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:console.log(af.envs)"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看所有环境变量"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行"
      },
      {
        "id": "2",
        "name": "输出显示所有可用的环境变量列表"
      },
      {
        "id": "3",
        "name": "列表包含所有已配置的环境及其变量集合"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.envs属性可读"
      },
      {
        "id": "2",
        "name": "返回所有环境变量的完整列表"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "af.envs返回环境变量对象或数组"
      }
    ]
  },
  {
    "purpose": "使用af.currentEnv获取当前激活的环境变量",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "已激活某个环境"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在前置脚本中输入:console.log(af.currentEnv)"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "在响应区域的控制台输出中查看当前环境变量"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "前置脚本正确执行"
      },
      {
        "id": "2",
        "name": "输出显示当前激活的环境名称"
      },
      {
        "id": "3",
        "name": "可以访问该环境下的所有变量"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "af.currentEnv属性可读"
      },
      {
        "id": "2",
        "name": "返回当前激活的环境信息"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "af.currentEnv返回当前激活环境的变量集合"
      }
    ]
  }
],
}

export default node
