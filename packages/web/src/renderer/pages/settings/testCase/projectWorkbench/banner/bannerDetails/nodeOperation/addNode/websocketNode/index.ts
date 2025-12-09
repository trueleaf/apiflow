import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "websocketNode",
  description: "websocket节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键空白区域添加websocket节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
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
        "name": "选择接口类型为\"WebSocket\""
      },
      {
        "id": "5",
        "name": "点击确定"
      },
      {
        "id": "6",
        "name": "观察新WebSocket节点出现在根目录下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "SAddFileDialog对话框弹出,formData.type选择为\"websocket\""
      },
      {
        "id": "2",
        "name": "点击确定后调用generateEmptyWebsocketNode生成WebSocket节点"
      },
      {
        "id": "3",
        "name": "新WebSocket节点添加到根目录,包含默认的WebSocket配置(URL,连接参数等)"
      },
      {
        "id": "4",
        "name": "节点显示WebSocket图标和用户输入的名称"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "AddFile.vue第19行:<el-radio value=\"websocket\">WebSocket</el-radio>"
      },
      {
        "id": "2",
        "name": "generateEmptyWebsocketNode函数导入在AddFile.vue第68行"
      },
      {
        "id": "3",
        "name": "新节点type属性为\"websocket\""
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "与HTTP节点添加流程相同,唯一区别是接口类型选择WebSocket"
      },
      {
        "id": "2",
        "name": "generateEmptyWebsocketNode生成的节点包含WebSocket特有的配置字段"
      }
    ]
  },
  {
    "purpose": "鼠标右键空白区域添加websocket节点(AI)",
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
        "name": "输入接口名称"
      },
      {
        "id": "4",
        "name": "选择接口类型为\"WebSocket\""
      },
      {
        "id": "5",
        "name": "在AI提示词框中输入WebSocket相关提示词"
      },
      {
        "id": "6",
        "name": "点击确定,等待AI处理"
      },
      {
        "id": "7",
        "name": "观察新WebSocket节点出现,包含AI生成的配置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "AI提示词框显示(isStandalone为true)"
      },
      {
        "id": "2",
        "name": "AI根据提示词生成WebSocket连接URL,消息格式等配置"
      },
      {
        "id": "3",
        "name": "新WebSocket节点包含AI生成的完整配置信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "formData.type为\"websocket\""
      },
      {
        "id": "2",
        "name": "formData.aiPrompt包含用户输入的AI提示词"
      },
      {
        "id": "3",
        "name": "buildAiSystemPromptForNode处理WebSocket类型节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "AI可以生成WebSocket特定的配置,如连接参数,消息模板等"
      }
    ]
  },
  {
    "purpose": "鼠标右键目录添加websocket节点",
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
        "name": "输入接口名称"
      },
      {
        "id": "4",
        "name": "选择接口类型为\"WebSocket\""
      },
      {
        "id": "5",
        "name": "点击确定"
      },
      {
        "id": "6",
        "name": "观察新WebSocket节点出现在folder节点下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "SAddFileDialog的pid为folder节点的_id"
      },
      {
        "id": "2",
        "name": "新WebSocket节点添加到folder的children数组中"
      },
      {
        "id": "3",
        "name": "folder节点自动展开"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "currentOperationalNode.value为folder节点数据"
      },
      {
        "id": "2",
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
    "purpose": "鼠标右键目录添加websocket节点(AI)",
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
        "name": "点击\"新建接口\""
      },
      {
        "id": "3",
        "name": "输入接口名称,选择\"WebSocket\"类型"
      },
      {
        "id": "4",
        "name": "输入AI提示词"
      },
      {
        "id": "5",
        "name": "点击确定,等待AI处理"
      },
      {
        "id": "6",
        "name": "观察新WebSocket节点出现在folder下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "pid为folder的_id,AI生成的WebSocket节点添加到folder下"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "formData.type为\"websocket\",formData.aiPrompt有值"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "结合folder和AI功能的WebSocket节点创建"
      }
    ]
  },
  {
    "purpose": "点击新增按钮添加websocket节点",
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
        "name": "输入接口名称"
      },
      {
        "id": "3",
        "name": "选择接口类型为\"WebSocket\""
      },
      {
        "id": "4",
        "name": "点击确定"
      },
      {
        "id": "5",
        "name": "观察新WebSocket节点出现在根目录"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "handleEmit(\"addRootFile\")触发,addFileDialogVisible为true"
      },
      {
        "id": "2",
        "name": "SAddFileDialog的pid为空,新WebSocket节点添加到根目录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue的\"新增文件\"按钮op为\"addRootFile\""
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "通过工具栏按钮添加WebSocket节点到根目录"
      }
    ]
  },
  {
    "purpose": "点击新增按钮添加websocket节点(AI)",
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
        "name": "输入接口名称,选择\"WebSocket\"类型"
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
        "name": "观察新WebSocket节点出现在根目录,包含AI生成的配置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "AI生成WebSocket节点配置并添加到根目录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pid为空,formData.type为\"websocket\",formData.aiPrompt有值"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "工具栏按钮结合AI功能创建WebSocket节点"
      }
    ]
  }
],
}

export default node
