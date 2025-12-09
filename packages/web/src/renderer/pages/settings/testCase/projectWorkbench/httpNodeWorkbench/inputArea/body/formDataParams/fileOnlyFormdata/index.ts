import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "fileOnlyFormdata",
  description: "类型全为file的formdata参数",
  children: [],
  atomicFunc: [
  {
    "purpose": "value模式切换后要清空之前的数据",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已选择body类型为formData"
      },
      {
        "id": "3",
        "name": "formdata参数类型已设为file"
      },
      {
        "id": "4",
        "name": "formdata参数的value值已输入为/path/to/file.txt"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击formdata参数的value输入框旁的模式切换按钮"
      },
      {
        "id": "2",
        "name": "从文件模式切换为变量模式(或文本模式)"
      },
      {
        "id": "3",
        "name": "观察value输入框的值"
      },
      {
        "id": "4",
        "name": "再次点击切换回文件模式"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "切换模式后,value值被清空"
      },
      {
        "id": "2",
        "name": "新的模式对应的输入框显示,旧的value值不再显示"
      },
      {
        "id": "3",
        "name": "再次切换回文件模式,value仍为空"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "模式切换时清空前一个模式的数据"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "防止模式混淆导致的数据错误"
      }
    ]
  },
  {
    "purpose": "value如果为文件模式,选择文件,调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "formdata参数为file类型"
      },
      {
        "id": "4",
        "name": "系统存在测试文件:/tmp/test.txt"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中,key=\"avatar\",type=\"file\""
      },
      {
        "id": "2",
        "name": "点击value输入框旁的文件选择按钮"
      },
      {
        "id": "3",
        "name": "在文件浏览器中选择/tmp/test.txt文件"
      },
      {
        "id": "4",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "文件被正确上传"
      },
      {
        "id": "2",
        "name": "请求Content-Type为multipart/form-data"
      },
      {
        "id": "3",
        "name": "服务器接收到avatar参数和文件内容"
      },
      {
        "id": "4",
        "name": "响应体显示上传的文件信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "文件上传使用FormData API"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持大文件上传的进度显示"
      }
    ]
  },
  {
    "purpose": "value如果为文件模式,未选择文件,调用127.0.0.1:{环境变量中的端口}/echo,value输入框下方提示文件不存在,返回值提示准确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "formdata参数为file类型,但未选择文件"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中,key=\"avatar\",type=\"file\",value为空"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      },
      {
        "id": "3",
        "name": "观察value输入框下方的提示信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击发送前显示错误提示:文件不存在"
      },
      {
        "id": "2",
        "name": "发送被阻止,不会发起HTTP请求"
      },
      {
        "id": "3",
        "name": "提示信息清晰明确"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "未选择文件时应验证并拦截发送"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应提供友好的错误提示"
      }
    ]
  },
  {
    "purpose": "value如果为变量模式,并且值为文件类型变量,并且文件存在,调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置文件类型变量:avatar_path=\"/tmp/avatar.jpg\""
      },
      {
        "id": "4",
        "name": "文件/tmp/avatar.jpg存在"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中,key=\"avatar\",type=\"file\""
      },
      {
        "id": "2",
        "name": "点击value输入框的模式切换按钮,选择变量模式"
      },
      {
        "id": "3",
        "name": "输入变量:{{avatar_path}}"
      },
      {
        "id": "4",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量被正确解析为文件路径"
      },
      {
        "id": "2",
        "name": "文件被正确上传"
      },
      {
        "id": "3",
        "name": "响应体显示上传的文件信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "文件类型变量在发送前被解析"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持动态文件路径的上传"
      }
    ]
  },
  {
    "purpose": "value如果为变量模式,并且值为文件类型变量,并且文件不存在,调用127.0.0.1:{环境变量中的端口}/echo,value输入框下方提示文件不存在,返回值提示准确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "已配置变量:avatar_path=\"/nonexistent/file.jpg\""
      },
      {
        "id": "3",
        "name": "该文件实际不存在"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在formdata参数中输入变量:{{avatar_path}}"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      },
      {
        "id": "3",
        "name": "观察提示信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "显示提示:文件不存在或无法访问"
      },
      {
        "id": "2",
        "name": "发送被阻止"
      },
      {
        "id": "3",
        "name": "提示信息包含文件路径信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "发送前验证文件类型变量的有效性"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应检查文件系统权限和路径有效性"
      }
    ]
  },
  {
    "purpose": "value如果为变量模式,并且值不是变量,调用127.0.0.1:{环境变量中的端口}/echo,value输入框下方提示文件不存在,返回值提示准确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "formdata参数的value模式为变量"
      },
      {
        "id": "3",
        "name": "value值为普通文本,不是合法的变量格式"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "切换value为变量模式"
      },
      {
        "id": "2",
        "name": "输入普通文本:invalid_file_path"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "显示提示:变量不存在或无效"
      },
      {
        "id": "2",
        "name": "发送被阻止"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "变量模式下验证变量格式"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应区分文件不存在和变量不存在的错误"
      }
    ]
  },
  {
    "purpose": "value值合法,formdata参数key为变量(需验证所有的变量类型),调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置变量:upload_key=\"document\",file_path=\"/tmp/doc.pdf\""
      },
      {
        "id": "4",
        "name": "文件/tmp/doc.pdf存在"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "formdata参数的key设为变量:{{upload_key}}"
      },
      {
        "id": "2",
        "name": "类型为file,value设为{{file_path}}"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量被正确替换:key=\"document\",value=\"/tmp/doc.pdf\""
      },
      {
        "id": "2",
        "name": "文件被正确上传"
      },
      {
        "id": "3",
        "name": "响应体显示正确的key和文件信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "formdata的key和value都支持变量替换"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持多种变量类型的组合"
      }
    ]
  },
  {
    "purpose": "value值合法,formdata参数key为变量(需验证所有的mock情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置mock:@filename,@ext"
      },
      {
        "id": "4",
        "name": "文件/tmp/test.pdf存在"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "formdata参数的key设为mock生成:@filename"
      },
      {
        "id": "2",
        "name": "类型为file,value设为真实文件路径:/tmp/test.pdf"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "key被mock数据替换为动态文件名,如:document_abc123"
      },
      {
        "id": "2",
        "name": "文件被正确上传"
      },
      {
        "id": "3",
        "name": "响应体显示生成后的key和文件信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "formdata的key支持mock生成"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持key和value的不同类型处理组合"
      }
    ]
  },
  {
    "purpose": "value值合法,formdata参数key为变量(需验证所有的混合情况),调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "已配置变量:file_field=\"upload_file\",已配置mock:@ext"
      },
      {
        "id": "4",
        "name": "文件/tmp/test.doc存在"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "formdata参数的key设为混合:{{file_field}}_@ext,如:upload_file_pdf"
      },
      {
        "id": "2",
        "name": "类型为file,value设为文件路径:/tmp/test.doc"
      },
      {
        "id": "3",
        "name": "点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "key被混合后正确替换为:upload_file_pdf"
      },
      {
        "id": "2",
        "name": "文件被正确上传"
      },
      {
        "id": "3",
        "name": "响应体显示混合后的key和文件信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "formdata的key支持变量和mock的混合"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "支持复杂的混合处理场景"
      }
    ]
  },
  {
    "purpose": "formdata参数是否发送未勾选那么当前参数不会发送,调用127.0.0.1:{环境变量中的端口}/echo,返回结果formdata参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已打开httpNode节点编辑页面"
      },
      {
        "id": "2",
        "name": "请求URL为http://127.0.0.1:8000/echo"
      },
      {
        "id": "3",
        "name": "formdata参数有两个file类型:avatar(已勾选),document(未勾选)"
      },
      {
        "id": "4",
        "name": "两个文件都已选择"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "确认document参数的\"是否发送\"checkbox处于未勾选状态"
      },
      {
        "id": "2",
        "name": "点击发送按钮"
      },
      {
        "id": "3",
        "name": "观察响应中发送的formdata参数"
      },
      {
        "id": "4",
        "name": "勾选document的\"是否发送\"checkbox"
      },
      {
        "id": "5",
        "name": "再次点击发送按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "未勾选时,只发送avatar文件,不发送document"
      },
      {
        "id": "2",
        "name": "响应体中只包含avatar的上传信息"
      },
      {
        "id": "3",
        "name": "勾选后,发送所有文件"
      },
      {
        "id": "4",
        "name": "响应体中包含avatar和document的上传信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "未勾选的file类型参数在formdata中被过滤"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "应支持动态启用/禁用file参数"
      }
    ]
  }
],
}

export default node
