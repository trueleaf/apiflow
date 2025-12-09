import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "remark",
  description: "备注",
  children: [],
  atomicFunc: [
  {
    "purpose": "备注编辑器支持Markdown格式输入和预览",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注编辑器中输入Markdown格式内容"
      },
      {
        "id": "2",
        "name": "切换到预览模式或观察编辑器的实时预览"
      },
      {
        "id": "3",
        "name": "观察Markdown内容是否正确渲染"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "备注编辑器支持Markdown输入"
      },
      {
        "id": "2",
        "name": "Markdown内容正确渲染为格式化内容"
      },
      {
        "id": "3",
        "name": "编辑和预览模式之间可以切换"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Markdown编辑器基于标准Markdown语法"
      },
      {
        "id": "2",
        "name": "预览功能可用"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "备注用于记录API的使用说明或测试备忘"
      }
    ]
  },
  {
    "purpose": "输入普通文本后保存,刷新页面内容保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注编辑器中输入普通文本:测试备注"
      },
      {
        "id": "2",
        "name": "保存内容(Ctrl+S或点击保存按钮)"
      },
      {
        "id": "3",
        "name": "刷新页面或重新打开该节点"
      },
      {
        "id": "4",
        "name": "验证备注内容是否保持不变"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "普通文本成功输入"
      },
      {
        "id": "2",
        "name": "保存后内容持久化"
      },
      {
        "id": "3",
        "name": "刷新后备注内容完全保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "备注内容正确保存到数据库"
      },
      {
        "id": "2",
        "name": "刷新不会丢失内容"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "备注内容是持久化的"
      }
    ]
  },
  {
    "purpose": "输入Markdown标题(# 标题)正确渲染为标题样式",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注编辑器中输入:# 主标题"
      },
      {
        "id": "2",
        "name": "输入:## 子标题"
      },
      {
        "id": "3",
        "name": "切换到预览模式查看渲染效果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "# 号标题渲染为大标题样式"
      },
      {
        "id": "2",
        "name": "## 号标题渲染为中等标题样式"
      },
      {
        "id": "3",
        "name": "标题大小和样式正确区分"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Markdown标题语法支持"
      },
      {
        "id": "2",
        "name": "标题样式正确渲染"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持#,##,###等多级标题"
      }
    ]
  },
  {
    "purpose": "输入Markdown粗体(**粗体**)正确渲染为粗体样式",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注编辑器中输入:这是**粗体文本**"
      },
      {
        "id": "2",
        "name": "输入:这是***粗体斜体***"
      },
      {
        "id": "3",
        "name": "切换到预览模式查看渲染效果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "**粗体文本**渲染为加粗样式"
      },
      {
        "id": "2",
        "name": "***粗体斜体***渲染为加粗斜体样式"
      },
      {
        "id": "3",
        "name": "样式效果正确"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Markdown粗体语法支持"
      },
      {
        "id": "2",
        "name": "粗体样式正确渲染"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持**粗体**和***粗体斜体***等格式"
      }
    ]
  },
  {
    "purpose": "输入Markdown链接([文字](url))正确渲染为可点击链接",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注编辑器中输入:[Apiflow官网](https://apiflow.example.com)"
      },
      {
        "id": "2",
        "name": "切换到预览模式"
      },
      {
        "id": "3",
        "name": "验证链接是否可点击"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "链接文本显示为可点击的链接样式(通常为蓝色下划线)"
      },
      {
        "id": "2",
        "name": "点击链接可以打开指定的URL"
      },
      {
        "id": "3",
        "name": "链接跳转正确"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Markdown链接语法支持"
      },
      {
        "id": "2",
        "name": "链接可点击并正确跳转"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "链接格式为[显示文本](URL)"
      }
    ]
  },
  {
    "purpose": "输入Markdown代码块正确渲染并支持语法高亮",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注编辑器中输入代码块(三个反引号+语言)"
      },
      {
        "id": "2",
        "name": "输入:```json\n{\"key\": \"value\"}\n```"
      },
      {
        "id": "3",
        "name": "切换到预览模式查看渲染效果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "代码块正确显示为代码区域"
      },
      {
        "id": "2",
        "name": "JSON代码支持语法高亮"
      },
      {
        "id": "3",
        "name": "代码可读性良好"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Markdown代码块语法支持"
      },
      {
        "id": "2",
        "name": "代码语法高亮功能正常"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持多种语言的代码高亮(js,json,python等)"
      }
    ]
  },
  {
    "purpose": "备注内容变更后出现未保存小圆点,保存后小圆点消失",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      },
      {
        "id": "2",
        "name": "备注已保存"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "修改备注内容"
      },
      {
        "id": "2",
        "name": "观察节点标签或编辑器标题是否出现未保存标记(通常为小圆点)"
      },
      {
        "id": "3",
        "name": "保存内容"
      },
      {
        "id": "4",
        "name": "观察未保存标记是否消失"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "内容修改后出现未保存标记"
      },
      {
        "id": "2",
        "name": "标记清晰可见"
      },
      {
        "id": "3",
        "name": "保存后标记立即消失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "未保存状态指示正常工作"
      },
      {
        "id": "2",
        "name": "保存状态同步准确"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "未保存标记帮助用户了解内容状态"
      }
    ]
  },
  {
    "purpose": "备注支持撤销操作,ctrl+z可以撤销输入",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      },
      {
        "id": "2",
        "name": "已在备注中输入内容"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注中输入一些文本"
      },
      {
        "id": "2",
        "name": "按Ctrl+Z快捷键"
      },
      {
        "id": "3",
        "name": "观察最后的输入是否被撤销"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "最后的输入被正确撤销"
      },
      {
        "id": "2",
        "name": "可以多次撤销回到更早的状态"
      },
      {
        "id": "3",
        "name": "撤销功能流畅无卡顿"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "撤销功能实现正确"
      },
      {
        "id": "2",
        "name": "支持多步撤销"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "撤销历史记录在编辑器中维护"
      }
    ]
  },
  {
    "purpose": "备注支持重做操作,ctrl+shift+z可以重做撤销的操作",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的备注区域"
      },
      {
        "id": "2",
        "name": "已执行过撤销操作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在备注中输入一些文本"
      },
      {
        "id": "2",
        "name": "按Ctrl+Z撤销"
      },
      {
        "id": "3",
        "name": "按Ctrl+Shift+Z重做"
      },
      {
        "id": "4",
        "name": "观察撤销的内容是否恢复"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "撤销的内容被正确恢复"
      },
      {
        "id": "2",
        "name": "可以多次重做"
      },
      {
        "id": "3",
        "name": "重做功能流畅无卡顿"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "重做功能实现正确"
      },
      {
        "id": "2",
        "name": "支持多步重做"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "重做历史记录在撤销后维护"
      }
    ]
  }
],
}

export default node
