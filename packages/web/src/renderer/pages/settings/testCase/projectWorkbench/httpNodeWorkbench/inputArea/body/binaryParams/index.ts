import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "binary参数",
  description: "binary参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "变量模式,若没有输入有效变量,发送返回值中正确提示发送被终止",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "body类型为binary,模式为变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "不输入任何变量或输入无效变量"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "显示错误提示:变量不存在或无效"
      },
      {
        "id": "2",
        "name": "发送被阻止"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "变量模式下验证变量的有效性"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应进行客户端验证"
      }
    ]
  },
  {
    "purpose": "变量模式,输入有效变量,请求头自动添加contentType:xxx(验证常见文件格式),调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已配置变量:pdf_file=\"/tmp/document.pdf\""
      },
      {
        "id": "3",
        "name": "文件/tmp/document.pdf存在"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "选择body类型为binary,模式为变量"
      },
      {
        "id": "2",
        "name": "输入变量:{{pdf_file}}"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量被解析为文件路径"
      },
      {
        "id": "2",
        "name": "请求头自动设置Content-Type: application/pdf"
      },
      {
        "id": "3",
        "name": "文件内容被正确发送"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "根据文件格式自动设置Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持常见文件格式的MIME类型"
      }
    ]
  },
  {
    "purpose": "文件模式,选择文件被删除或者未选择文件,发送返回值中正确提示发送被终止",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "body类型为binary,模式为文件"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "未选择任何文件或选择的文件已被删除"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "显示错误提示:文件不存在"
      },
      {
        "id": "2",
        "name": "发送被阻止"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "文件模式下验证文件的存在性"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应提供清晰的错误提示"
      }
    ]
  },
  {
    "purpose": "文件模式,选择正确的文件,请请求头自动添加contentType:xxx(验证常见文件格式),调用127.0.0.1:{环境变量中的端口}/echo,返回结果参数和请求头正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "body类型为binary,模式为文件"
      },
      {
        "id": "3",
        "name": "系统存在文件:/tmp/image.png"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击文件选择按钮"
      },
      {
        "id": "2",
        "name": "选择/tmp/image.png文件"
      },
      {
        "id": "3",
        "name": "观察自动设置的Content-Type"
      },
      {
        "id": "4",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "请求头自动设置Content-Type: image/png"
      },
      {
        "id": "2",
        "name": "文件二进制内容被正确发送"
      },
      {
        "id": "3",
        "name": "服务器接收到完整的文件内容"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "根据文件扩展名自动识别Content-Type"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持多种常见文件格式"
      }
    ]
  }
],
}

export default node
