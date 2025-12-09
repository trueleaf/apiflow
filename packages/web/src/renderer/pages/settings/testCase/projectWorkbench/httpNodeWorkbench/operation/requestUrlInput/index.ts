import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "requestUrlInput",
  description: "请求url录入区域",
  children: [],
  atomicFunc: [
  {
    "purpose": "输入http://localhost:{环境变量中的端口}/echo,点击发送请求,调用测试服务器/echo接口,成功返回",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "测试服务器已启动"
      },
      {
        "id": "4",
        "name": "环境变量中已配置端口变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入http://localhost:{{port}}/echo"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "查看响应结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量{{port}}被正确解析为实际端口"
      },
      {
        "id": "2",
        "name": "请求成功返回200状态码"
      },
      {
        "id": "3",
        "name": "响应body包含echo接口返回内容"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "ClRichInput组件处理变量语法"
      },
      {
        "id": "2",
        "name": "variableStore解析变量值"
      },
      {
        "id": "3",
        "name": "localhost解析为127.0.0.1"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "localhost在某些环境可能需要配置hosts"
      }
    ]
  },
  {
    "purpose": "输入http://127.0.0.1:{环境变量中的端口}/echo,点击发送请求,调用测试服务器/echo接口,成功返回",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "测试服务器已启动"
      },
      {
        "id": "4",
        "name": "环境变量中已配置端口变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入http://127.0.0.1:{{port}}/echo"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "查看响应结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "变量{{port}}被正确解析"
      },
      {
        "id": "2",
        "name": "请求成功返回200状态码"
      },
      {
        "id": "3",
        "name": "IP地址直接访问成功"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "IP地址格式验证通过"
      },
      {
        "id": "2",
        "name": "变量替换在发送前完成"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "127.0.0.1是最可靠的本地地址"
      }
    ]
  },
  {
    "purpose": "定义一个localUrl变量,输入http://{{ localUrl }}:{环境变量中的端口}/echo,点击发送请求,调用测试服务器/echo接口,成功返回",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "测试服务器已启动"
      },
      {
        "id": "4",
        "name": "已定义localUrl变量值为127.0.0.1"
      },
      {
        "id": "5",
        "name": "已定义port变量为测试服务器端口"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入http://{{localUrl}}:{{port}}/echo"
      },
      {
        "id": "2",
        "name": "点击发送请求按钮"
      },
      {
        "id": "3",
        "name": "查看响应结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "localUrl变量被解析为127.0.0.1"
      },
      {
        "id": "2",
        "name": "port变量被解析为实际端口"
      },
      {
        "id": "3",
        "name": "请求成功返回"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "getVariableValue(label)获取变量值"
      },
      {
        "id": "2",
        "name": "variableStore.objectVariable存储变量映射"
      },
      {
        "id": "3",
        "name": "多个变量同时替换"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "变量可以在URL的任意位置使用"
      },
      {
        "id": "2",
        "name": "变量语法为双大括号包裹"
      }
    ]
  },
  {
    "purpose": "输入127.0.0.1:{环境变量中的端口}/echo(没有协议自动添加http), 点击发送请求,调用测试服务器/echo接口,成功返回",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "测试服务器已启动"
      },
      {
        "id": "4",
        "name": "环境变量中已配置端口变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入127.0.0.1:{{port}}/echo(不带http://)"
      },
      {
        "id": "2",
        "name": "blur失焦或点击发送请求"
      },
      {
        "id": "3",
        "name": "查看请求地址展示区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "自动添加http://协议前缀"
      },
      {
        "id": "2",
        "name": "请求地址展示为http://127.0.0.1:port/echo"
      },
      {
        "id": "3",
        "name": "请求成功返回"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleFormatUrl(Operation.vue:21)处理blur事件"
      },
      {
        "id": "2",
        "name": "URL校验与自动补全逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "类似http.baidu.com也需要添加http://"
      },
      {
        "id": "2",
        "name": "自动补全提升用户体验"
      }
    ]
  },
  {
    "purpose": "输入127.0.0.1:{环境变量中的端口}/echo?id=3&name=lee, blur后,url结果为http://127.0.0.1:{环境变量中的端口}/echo,id和name会出现在query参数中",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "环境变量中已配置端口变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入127.0.0.1:{{port}}/echo?id=3&name=lee"
      },
      {
        "id": "2",
        "name": "blur失焦URL输入框"
      },
      {
        "id": "3",
        "name": "查看URL展示区域和query参数列表"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "URL展示区域为http://127.0.0.1:port/echo(不含查询参数)"
      },
      {
        "id": "2",
        "name": "query参数列表出现id参数,值为3"
      },
      {
        "id": "3",
        "name": "query参数列表出现name参数,值为lee"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleChangeUrl解析URL中的查询参数"
      },
      {
        "id": "2",
        "name": "查询参数自动提取到params列表"
      },
      {
        "id": "3",
        "name": "path和query分离处理"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "查询参数自动解析方便用户管理"
      },
      {
        "id": "2",
        "name": "支持多个查询参数同时解析"
      }
    ]
  },
  {
    "purpose": "输入127.0.0.1:{环境变量中的端口}/echo?id=3&name=lee, blur后,url结果为http://127.0.0.1:{环境变量中的端口}/echo,id和name会出现在query参数中,点击发送请求,返回结果中url和query参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "测试服务器已启动"
      },
      {
        "id": "4",
        "name": "环境变量中已配置端口变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入127.0.0.1:{{port}}/echo?id=3&name=lee"
      },
      {
        "id": "2",
        "name": "blur失焦确保参数解析"
      },
      {
        "id": "3",
        "name": "点击发送请求按钮"
      },
      {
        "id": "4",
        "name": "查看响应结果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "响应中包含正确的url地址"
      },
      {
        "id": "2",
        "name": "响应中query参数包含id=3"
      },
      {
        "id": "3",
        "name": "响应中query参数包含name=lee"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "httpNodeRequestStore.fullUrl包含完整URL"
      },
      {
        "id": "2",
        "name": "查询参数正确拼接到请求URL"
      },
      {
        "id": "3",
        "name": "echo接口返回完整请求信息"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "查询参数会被自动URL编码"
      }
    ]
  },
  {
    "purpose": "输入127.0.0.1:{环境变量中的端口}/echo/{userId}/posts/{postId},userId和postId会出现在query参数中,点击发送请求,返回结果中url和path参数正确",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "测试服务器已启动"
      },
      {
        "id": "4",
        "name": "环境变量中已配置端口变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入127.0.0.1:{{port}}/echo/{userId}/posts/{postId}"
      },
      {
        "id": "2",
        "name": "查看path参数列表"
      },
      {
        "id": "3",
        "name": "填userId和postId的值"
      },
      {
        "id": "4",
        "name": "点击发送请求"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "path参数列表出现userId和postId"
      },
      {
        "id": "2",
        "name": "填写的值会替换URL中的占位符"
      },
      {
        "id": "3",
        "name": "响应中url包含替换后的path"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "{param}语法解析为path参数"
      },
      {
        "id": "2",
        "name": "path参数与query参数分开管理"
      },
      {
        "id": "3",
        "name": "发送前path参数替换到URL"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "path参数使用单大括号语法"
      },
      {
        "id": "2",
        "name": "与变量双大括号语法不同"
      }
    ]
  },
  {
    "purpose": "输入127.0.0.1:{环境变量中的端口}/echo/{变量名称},点击变量名称如果存在,显示变量名称和变量值,如果变量不存在提醒跳转到变量管理页面,点击跳转后,跳转到变量管理页面并且关闭变量弹窗",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "存在已定义和未定义的变量"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL中输入{{existVar}}已存在的变量"
      },
      {
        "id": "2",
        "name": "点击变量标签查看popover"
      },
      {
        "id": "3",
        "name": "在URL中输入{{notExist}}不存在的变量"
      },
      {
        "id": "4",
        "name": "点击变量标签查看popover"
      },
      {
        "id": "5",
        "name": "点击前往变量管理链接"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "已存在变量显示名称和值"
      },
      {
        "id": "2",
        "name": "不存在变量显示警告提示"
      },
      {
        "id": "3",
        "name": "提供前往变量管理链接"
      },
      {
        "id": "4",
        "name": "点击后跳转到变量管理页签"
      },
      {
        "id": "5",
        "name": "popover自动关闭"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "ClRichInput的#variable插槽处理变量popover"
      },
      {
        "id": "2",
        "name": "getVariableValue(label)判断变量是否存在"
      },
      {
        "id": "3",
        "name": "handleGoToVariableManage跳转变量管理"
      },
      {
        "id": "4",
        "name": "urlRichInputRef.hideVariablePopover()关闭popover"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "变量不存在时给用户明确引导"
      }
    ]
  },
  {
    "purpose": "粘贴的url需要去除前后空格",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "剪贴板中包含前后有空格的URL"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "复制一个前后带空格的URL到剪贴板"
      },
      {
        "id": "2",
        "name": "在URL输入框中Ctrl+V粘贴"
      },
      {
        "id": "3",
        "name": "查看URL输入框内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "URL前后的空格被自动去除"
      },
      {
        "id": "2",
        "name": "URL内容中间的空格保留(如果有)"
      },
      {
        "id": "3",
        "name": "粘贴后URL格式正确"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "ClRichInput的trim-on-paste属性为true"
      },
      {
        "id": "2",
        "name": "粘贴事件处理中调用trim()"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "避免意外空格导致请求失败"
      }
    ]
  },
  {
    "purpose": "url中存在内容,光标在内容中间,ctrl+v粘贴时候,url展示内容正确",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "URL输入框已有内容"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在URL输入框输入http://test.com/api"
      },
      {
        "id": "2",
        "name": "将光标定位到test.com之后"
      },
      {
        "id": "3",
        "name": "复制.example到剪贴板"
      },
      {
        "id": "4",
        "name": "Ctrl+V粘贴"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "URL变为http://test.com.example/api"
      },
      {
        "id": "2",
        "name": "粘贴内容插入到光标位置"
      },
      {
        "id": "3",
        "name": "前后内容保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "ClRichInput组件处理中间位置粘贴"
      },
      {
        "id": "2",
        "name": "光标位置正确记录和恢复"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "确保编辑体验符合预期"
      }
    ]
  }
],
}

export default node
