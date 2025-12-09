import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "httpMockNode",
  description: "http mock节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键空白区域添加httpMock节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标右键空白区域"
      },
      {
        "id": "2",
        "name": "点击\"新建接口\""
      },
      {
        "id": "3",
        "name": "输入接口名称"
      },
      {
        "id": "4",
        "name": "选择接口类型为\"HTTP Mock\""
      },
      {
        "id": "5",
        "name": "点击确定"
      },
      {
        "id": "6",
        "name": "观察新HTTP Mock节点出现在根目录"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "formData.type选择为\"httpMock\""
      },
      {
        "id": "2",
        "name": "调用generateEmptyHttpMockNode生成HTTP Mock节点"
      },
      {
        "id": "3",
        "name": "新节点包含Mock服务器配置(端口,路径,响应规则等)"
      },
      {
        "id": "4",
        "name": "节点显示Mock图标和用户输入的名称"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "AddFile.vue第20行:<el-radio value=\"httpMock\">HTTP Mock</el-radio>"
      },
      {
        "id": "2",
        "name": "generateEmptyHttpMockNode函数导入在AddFile.vue第68行"
      },
      {
        "id": "3",
        "name": "新节点type属性为\"httpMock\""
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "HTTP Mock节点用于模拟HTTP服务器响应"
      },
      {
        "id": "2",
        "name": "generateEmptyHttpMockNode生成包含Mock规则的默认配置"
      }
    ]
  },
  {
    "purpose": "鼠标右键空白区域添加httpMock节点(AI)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "应用处于独立模式,AI配置已完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标右键空白区域"
      },
      {
        "id": "2",
        "name": "点击\"新建接口\""
      },
      {
        "id": "3",
        "name": "输入接口名称,选择\"HTTP Mock\"类型"
      },
      {
        "id": "4",
        "name": "在AI提示词框中输入Mock规则描述"
      },
      {
        "id": "5",
        "name": "点击确定,等待AI处理"
      },
      {
        "id": "6",
        "name": "观察新HTTP Mock节点出现,包含AI生成的Mock配置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "AI根据提示词生成Mock路径,响应数据,状态码等配置"
      },
      {
        "id": "2",
        "name": "新节点包含完整的Mock服务器规则"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "formData.type为\"httpMock\",formData.aiPrompt有值"
      },
      {
        "id": "2",
        "name": "buildAiSystemPromptForNode处理HTTP Mock类型节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "AI可以生成Mock响应数据,条件匹配规则等"
      }
    ]
  },
  {
    "purpose": "鼠标右键目录添加httpMock节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "节点树中存在folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标右键folder节点"
      },
      {
        "id": "2",
        "name": "点击\"新建接口\""
      },
      {
        "id": "3",
        "name": "输入接口名称,选择\"HTTP Mock\"类型"
      },
      {
        "id": "4",
        "name": "点击确定"
      },
      {
        "id": "5",
        "name": "观察新HTTP Mock节点出现在folder下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "SAddFileDialog的pid为folder的_id"
      },
      {
        "id": "2",
        "name": "新HTTP Mock节点添加到folder的children中"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "addFileAndFolderCb根据pid将节点添加到folder下"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "遵循folder内文件数量限制"
      }
    ]
  },
  {
    "purpose": "鼠标右键目录添加httpMock节点(AI)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "节点树中存在folder节点"
      },
      {
        "id": "3",
        "name": "应用处于独立模式,AI配置已完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标右键folder节点"
      },
      {
        "id": "2",
        "name": "点击\"新建接口\",选择\"HTTP Mock\"类型"
      },
      {
        "id": "3",
        "name": "输入AI提示词"
      },
      {
        "id": "4",
        "name": "点击确定,等待AI处理"
      },
      {
        "id": "5",
        "name": "观察新HTTP Mock节点出现在folder下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "AI生成的HTTP Mock节点添加到folder下"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pid为folder的_id,formData.type为\"httpMock\""
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "结合folder和AI功能的HTTP Mock节点创建"
      }
    ]
  },
  {
    "purpose": "点击新增按钮添加httpMock节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击工具栏\"新增文件\"按钮"
      },
      {
        "id": "2",
        "name": "输入接口名称,选择\"HTTP Mock\"类型"
      },
      {
        "id": "3",
        "name": "点击确定"
      },
      {
        "id": "4",
        "name": "观察新HTTP Mock节点出现在根目录"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "handleEmit(\"addRootFile\")触发"
      },
      {
        "id": "2",
        "name": "新HTTP Mock节点添加到根目录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "SAddFileDialog的pid为空"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "通过工具栏按钮添加HTTP Mock节点到根目录"
      }
    ]
  },
  {
    "purpose": "点击新增按钮添加httpMock节点(AI)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "应用处于独立模式,AI配置已完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击工具栏\"新增文件\"按钮"
      },
      {
        "id": "2",
        "name": "输入接口名称,选择\"HTTP Mock\"类型"
      },
      {
        "id": "3",
        "name": "输入AI提示词"
      },
      {
        "id": "4",
        "name": "点击确定,等待AI处理"
      },
      {
        "id": "5",
        "name": "观察新HTTP Mock节点出现在根目录"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "AI生成HTTP Mock配置并添加到根目录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pid为空,formData.type为\"httpMock\",formData.aiPrompt有值"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "工具栏按钮结合AI功能创建HTTP Mock节点"
      }
    ]
  }
],
}

export default node
