import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "editorFeatures",
  description: "编辑器功能",
  children: [],
  atomicFunc: [
  {
    "purpose": "前置脚本编辑器支持JavaScript语法高亮",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在编辑器中输入JavaScript代码,包括关键字,函数,变量等"
      },
      {
        "id": "2",
        "name": "观察不同类型代码的颜色显示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "编辑器显示JavaScript语法高亮"
      },
      {
        "id": "2",
        "name": "关键字显示为蓝色,字符串显示为绿色,注释显示为灰色等"
      },
      {
        "id": "3",
        "name": "语法高亮准确反映JavaScript语法"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "使用Monaco Editor提供语法高亮"
      },
      {
        "id": "2",
        "name": "支持JavaScript语言定义"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "语法高亮基于Monaco Editor的内置JavaScript支持"
      }
    ]
  },
  {
    "purpose": "输入af.后出现代码补全提示,包括request,http,envs等API",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在编辑器中输入af."
      },
      {
        "id": "2",
        "name": "等待代码补全列表出现"
      },
      {
        "id": "3",
        "name": "观察补全列表中是否包含request,http,envs,variables,cookies等API"
      },
      {
        "id": "4",
        "name": "选择request并观察子属性补全"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入af.后自动弹出代码补全列表"
      },
      {
        "id": "2",
        "name": "补全列表包含所有af对象的可用API(request,http,envs,variables,cookies等)"
      },
      {
        "id": "3",
        "name": "可以通过键盘或鼠标选择补全项"
      },
      {
        "id": "4",
        "name": "选择request后可以继续补全其属性(如request.prefix,request.path等)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "代码补全通过Monaco Editor的IntelliSense实现"
      },
      {
        "id": "2",
        "name": "补全列表包含所有af API定义"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "代码补全通过ProvideCompletionItems实现"
      },
      {
        "id": "2",
        "name": "支持嵌套属性补全"
      }
    ]
  },
  {
    "purpose": "点击格式化按钮,代码格式化正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "编辑器中有未格式化的JavaScript代码"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在编辑器中输入格式不规范的JavaScript代码(如缩进不对,括号不整齐)"
      },
      {
        "id": "2",
        "name": "点击编辑器的格式化按钮"
      },
      {
        "id": "3",
        "name": "观察代码是否被正确格式化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击格式化按钮后代码自动重新格式化"
      },
      {
        "id": "2",
        "name": "缩进统一为规范的空格数(如2空格或4空格)"
      },
      {
        "id": "3",
        "name": "括号对齐,代码结构清晰"
      },
      {
        "id": "4",
        "name": "格式化后代码仍能正常执行"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "格式化通过Prettier或Monaco Editor的格式化服务实现"
      },
      {
        "id": "2",
        "name": "保持代码功能不变"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "格式化遵循JavaScript标准风格指南"
      }
    ]
  },
  {
    "purpose": "鼠标悬停在af对象属性上时显示API说明提示",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面的前置脚本区域"
      },
      {
        "id": "2",
        "name": "编辑器中已输入af.request或其他af API"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在编辑器中输入代码af.request.prefix"
      },
      {
        "id": "2",
        "name": "鼠标悬停在request属性上"
      },
      {
        "id": "3",
        "name": "观察是否显示说明提示"
      },
      {
        "id": "4",
        "name": "鼠标悬停在prefix属性上"
      },
      {
        "id": "5",
        "name": "观察说明提示的内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "鼠标悬停时显示对应属性的说明提示(Hover提示)"
      },
      {
        "id": "2",
        "name": "提示包含属性的描述,类型等信息"
      },
      {
        "id": "3",
        "name": "提示及时出现和消失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Hover提示通过Monaco Editor的Hover服务实现"
      },
      {
        "id": "2",
        "name": "提示内容来自af API定义"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "鼠标悬停提示基于Monaco Editor的IntelliSense"
      }
    ]
  }
],
}

export default node
