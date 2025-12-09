import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "addHttpNode",
  description: "新增http节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键空白区域添加http节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
      },
      {
        "id": "3",
        "name": "节点树有空白区域可以右键点击"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标移动到banner节点树的空白区域(非节点区域)"
      },
      {
        "id": "2",
        "name": "点击鼠标右键触发handleWrapContextmenu方法"
      },
      {
        "id": "3",
        "name": "观察SContextmenu右键菜单弹出"
      },
      {
        "id": "4",
        "name": "在右键菜单中点击\"新建接口\"选项"
      },
      {
        "id": "5",
        "name": "观察SAddFileDialog对话框弹出"
      },
      {
        "id": "6",
        "name": "在对话框中输入接口名称(例如:\"测试HTTP接口\")"
      },
      {
        "id": "7",
        "name": "选择接口类型为\"HTTP\"(默认选中)"
      },
      {
        "id": "8",
        "name": "点击确定按钮保存"
      },
      {
        "id": "9",
        "name": "观察对话框关闭,新HTTP节点出现在节点树根目录下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右键空白区域后,handleWrapContextmenu方法被触发(Banner.vue第363-379行)"
      },
      {
        "id": "2",
        "name": "showContextmenu.value被设置为true,contextmenuLeft和contextmenuTop记录鼠标位置"
      },
      {
        "id": "3",
        "name": "currentOperationalNode.value为null(因为是空白区域,非节点操作)"
      },
      {
        "id": "4",
        "name": "SContextmenu组件渲染在鼠标点击位置(Banner.vue第221-245行)"
      },
      {
        "id": "5",
        "name": "右键菜单显示\"新建接口\",\"新建文件夹\",\"设置公共请求头\"等选项"
      },
      {
        "id": "6",
        "name": "点击\"新建接口\"后,handleOpenAddFileDialog方法被调用(Banner.vue第488-497行)"
      },
      {
        "id": "7",
        "name": "addFileDialogVisible.value被设置为true"
      },
      {
        "id": "8",
        "name": "SAddFileDialog组件条件渲染(Banner.vue第255-256行,v-if=\"addFileDialogVisible\"为true)"
      },
      {
        "id": "9",
        "name": "对话框显示接口名称输入框,接口类型选择(HTTP/WebSocket/HTTP Mock/WebSocket Mock)"
      },
      {
        "id": "10",
        "name": "接口类型默认选中HTTP(第一个选项)"
      },
      {
        "id": "11",
        "name": "点击确定后触发handleAddFile方法,创建新的HTTP节点"
      },
      {
        "id": "12",
        "name": "handleAddFileAndFolderCb回调被调用(Banner.vue第503-506行)"
      },
      {
        "id": "13",
        "name": "addFileAndFolderCb函数将新节点添加到banner树的根目录下(因为pid为空)"
      },
      {
        "id": "14",
        "name": "新HTTP节点显示在节点树根目录最下方,包含用户输入的名称和HTTP图标"
      },
      {
        "id": "15",
        "name": "bannerStore.addExpandItem被调用,将新节点ID添加到展开列表"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleWrapContextmenu方法定义在Banner.vue第363-379行"
      },
      {
        "id": "2",
        "name": "空白区域右键绑定:@contextmenu.prevent=\"handleWrapContextmenu\"(Banner.vue第10行)"
      },
      {
        "id": "3",
        "name": "SContextmenu单节点菜单在Banner.vue第221-245行"
      },
      {
        "id": "4",
        "name": "\"新建接口\"菜单项绑定:@click=\"handleOpenAddFileDialog\"(Banner.vue第223-224行)"
      },
      {
        "id": "5",
        "name": "handleOpenAddFileDialog方法在Banner.vue第488-497行"
      },
      {
        "id": "6",
        "name": "SAddFileDialog组件引用在Banner.vue第255-256行"
      },
      {
        "id": "7",
        "name": "SAddFileDialog组件文件路径:dialog/addFile/AddFile.vue"
      },
      {
        "id": "8",
        "name": "对话框接收pid属性为空字符串(表示在根目录添加)"
      },
      {
        "id": "9",
        "name": "对话框@success事件绑定handleAddFileAndFolderCb方法"
      },
      {
        "id": "10",
        "name": "handleAddFileAndFolderCb方法在Banner.vue第503-506行"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空白区域右键与节点右键的区别:空白区域currentOperationalNode为null,节点右键currentOperationalNode为节点数据"
      },
      {
        "id": "2",
        "name": "右键菜单通过v-show控制选项显示:!currentOperationalNode表示仅在空白区域或folder节点显示\"新建接口\""
      },
      {
        "id": "3",
        "name": "SAddFileDialog对话框通过v-if=\"addFileDialogVisible\"控制显示/隐藏"
      },
      {
        "id": "4",
        "name": "pid属性传递给SAddFileDialog,为空表示在根目录添加,非空表示在指定父节点下添加"
      },
      {
        "id": "5",
        "name": "handleAddFileAndFolderCb调用addFileAndFolderCb函数(来自composables/curd-node)完成实际的节点添加逻辑"
      },
      {
        "id": "6",
        "name": "新节点会自动展开其父节点(通过bannerStore.addExpandItem实现)"
      }
    ]
  },
  {
    "purpose": "鼠标右键空白区域添加http节点(AI)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
      },
      {
        "id": "3",
        "name": "节点树有空白区域可以右键点击"
      },
      {
        "id": "4",
        "name": "应用处于独立模式(runtimeStore.networkMode为\"offline\",isStandalone为true)"
      },
      {
        "id": "5",
        "name": "AI配置已完成(isAiConfigValid()返回true,已配置ApiKey)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标移动到banner节点树的空白区域(非节点区域)"
      },
      {
        "id": "2",
        "name": "点击鼠标右键触发handleWrapContextmenu方法"
      },
      {
        "id": "3",
        "name": "观察SContextmenu右键菜单弹出"
      },
      {
        "id": "4",
        "name": "在右键菜单中点击\"新建接口\"选项"
      },
      {
        "id": "5",
        "name": "观察SAddFileDialog对话框弹出"
      },
      {
        "id": "6",
        "name": "在对话框中输入接口名称(例如:\"AI生成的HTTP接口\")"
      },
      {
        "id": "7",
        "name": "选择接口类型为\"HTTP\""
      },
      {
        "id": "8",
        "name": "在AI提示词输入框(CodeEditor组件)中输入提示词(例如:\"创建一个获取用户列表的接口,GET请求,路径/api/users\")"
      },
      {
        "id": "9",
        "name": "点击确定按钮保存"
      },
      {
        "id": "10",
        "name": "观察loading状态,等待AI处理完成"
      },
      {
        "id": "11",
        "name": "观察对话框关闭,新HTTP节点出现在节点树根目录下,且包含AI生成的接口信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "对话框弹出后,因为isStandalone为true,AI提示词表单项条件渲染(AddFile.vue第24-51行,v-if=\"isStandalone\"为true)"
      },
      {
        "id": "2",
        "name": "如果isAiConfigValid()返回true,显示CodeEditor组件用于输入AI提示词"
      },
      {
        "id": "3",
        "name": "CodeEditor组件配置:language为\"javascript\",auto-height为true,min-height为120,max-height为300"
      },
      {
        "id": "4",
        "name": "CodeEditor的placeholder为\"可自动识别自然语言描述,cURL请求,任意类型接口结构数据\""
      },
      {
        "id": "5",
        "name": "如果isAiConfigValid()返回false,显示\"配置ApiKey\"按钮,点击后调用handleOpenAiSettings打开AI设置"
      },
      {
        "id": "6",
        "name": "点击确定后,formData.aiPrompt有值时触发AI生成逻辑"
      },
      {
        "id": "7",
        "name": "handleAddFile方法中调用buildAiSystemPromptForNode构建AI系统提示词"
      },
      {
        "id": "8",
        "name": "发送AI请求到LLM服务(通过window.electronAPI或API调用)"
      },
      {
        "id": "9",
        "name": "loading.value被设置为true,确定按钮显示loading状态"
      },
      {
        "id": "10",
        "name": "AI返回结果后解析生成HTTP节点的详细信息(URL,请求方法,headers,body等)"
      },
      {
        "id": "11",
        "name": "新HTTP节点包含AI生成的完整接口信息,包括路径,方法,参数等"
      },
      {
        "id": "12",
        "name": "handleAddFileAndFolderCb回调被调用,新节点添加到banner树根目录下"
      },
      {
        "id": "13",
        "name": "loading.value被设置为false,对话框关闭"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "AI提示词表单项在AddFile.vue第24-51行"
      },
      {
        "id": "2",
        "name": "isStandalone计算属性定义:computed(() => runtimeStore.networkMode === \"offline\")"
      },
      {
        "id": "3",
        "name": "isAiConfigValid方法检查AI配置是否有效(ApiKey是否已配置)"
      },
      {
        "id": "4",
        "name": "CodeEditor组件导入在AddFile.vue第72行"
      },
      {
        "id": "5",
        "name": "buildAiSystemPromptForNode函数导入在AddFile.vue第68行"
      },
      {
        "id": "6",
        "name": "formData.aiPrompt存储用户输入的AI提示词"
      },
      {
        "id": "7",
        "name": "handleOpenAiSettings方法打开AI设置页面(router.push到AI settings)"
      },
      {
        "id": "8",
        "name": "ArrowRight图标来自lucide-vue-next库(AddFile.vue第75行)"
      },
      {
        "id": "9",
        "name": "llmProviderCache用于获取LLM配置信息(AddFile.vue第76行)"
      },
      {
        "id": "10",
        "name": "useLLMClientStore用于调用LLM API(AddFile.vue第77行)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "AI功能仅在独立模式(offline模式)下可用,通过isStandalone判断"
      },
      {
        "id": "2",
        "name": "AI提示词输入框使用CodeEditor组件,支持自动高度调整(120px-300px)"
      },
      {
        "id": "3",
        "name": "AI提示词支持自然语言描述,cURL命令,接口结构数据等多种输入格式"
      },
      {
        "id": "4",
        "name": "buildAiSystemPromptForNode函数负责构建AI系统提示词,将用户输入转换为AI可理解的格式"
      },
      {
        "id": "5",
        "name": "AI生成过程中会显示loading状态,防止用户重复提交"
      },
      {
        "id": "6",
        "name": "AI生成失败时会显示错误提示,不会创建节点"
      },
      {
        "id": "7",
        "name": "如果未配置ApiKey,显示\"配置ApiKey\"按钮,引导用户完成配置"
      }
    ]
  },
  {
    "purpose": "鼠标右键目录添加http节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
      },
      {
        "id": "3",
        "name": "节点树中存在至少一个folder类型节点"
      },
      {
        "id": "4",
        "name": "folder节点内文件数量未达到限制(FILE_IN_FOLDER_LIMIT)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标移动到banner节点树中的某个folder节点上"
      },
      {
        "id": "2",
        "name": "点击鼠标右键触发handleShowContextmenu方法"
      },
      {
        "id": "3",
        "name": "观察SContextmenu右键菜单弹出"
      },
      {
        "id": "4",
        "name": "在右键菜单中点击\"新建接口\"选项"
      },
      {
        "id": "5",
        "name": "观察SAddFileDialog对话框弹出"
      },
      {
        "id": "6",
        "name": "在对话框中输入接口名称"
      },
      {
        "id": "7",
        "name": "选择接口类型为\"HTTP\""
      },
      {
        "id": "8",
        "name": "点击确定按钮保存"
      },
      {
        "id": "9",
        "name": "观察对话框关闭,新HTTP节点出现在该folder节点下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "右键folder节点后,handleShowContextmenu方法被触发(Banner.vue第339-362行)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.value被设置为folder节点数据"
      },
      {
        "id": "3",
        "name": "SContextmenu组件显示,\"新建接口\"选项可见(v-show=\"!currentOperationalNode || currentOperationalNode?.type === 'folder'\"为true)"
      },
      {
        "id": "4",
        "name": "点击\"新建接口\"后,handleOpenAddFileDialog方法被调用"
      },
      {
        "id": "5",
        "name": "handleOpenAddFileDialog方法检查folder内文件数量(childFileNodeNum)"
      },
      {
        "id": "6",
        "name": "如果childFileNodeNum < FILE_IN_FOLDER_LIMIT,addFileDialogVisible.value被设置为true"
      },
      {
        "id": "7",
        "name": "如果childFileNodeNum >= FILE_IN_FOLDER_LIMIT,显示警告message:\"单个文件夹里面文档个数不超过X个\""
      },
      {
        "id": "8",
        "name": "SAddFileDialog组件渲染,pid属性为folder节点的_id"
      },
      {
        "id": "9",
        "name": "点击确定后,新HTTP节点添加到该folder节点的children数组中"
      },
      {
        "id": "10",
        "name": "新HTTP节点显示在folder节点下的最后位置"
      },
      {
        "id": "11",
        "name": "folder节点自动展开,显示新添加的HTTP节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleShowContextmenu方法定义在Banner.vue第339-362行"
      },
      {
        "id": "2",
        "name": "el-tree的@node-contextmenu绑定handleShowContextmenu(Banner.vue第23行)"
      },
      {
        "id": "3",
        "name": "\"新建接口\"菜单项的v-show条件:!currentOperationalNode || currentOperationalNode?.type === 'folder'(Banner.vue第223行)"
      },
      {
        "id": "4",
        "name": "handleOpenAddFileDialog中文件数量检查逻辑在第489行"
      },
      {
        "id": "5",
        "name": "FILE_IN_FOLDER_LIMIT常量定义了单个文件夹内文件数量限制"
      },
      {
        "id": "6",
        "name": "SAddFileDialog的pid属性传递currentOperationalNode?._id(Banner.vue第255行)"
      },
      {
        "id": "7",
        "name": "addFileAndFolderCb函数根据pid将节点添加到对应父节点的children中"
      },
      {
        "id": "8",
        "name": "bannerStore.addExpandItem确保父folder节点展开"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "右键folder节点与右键空白区域的区别:currentOperationalNode有值且类型为folder"
      },
      {
        "id": "2",
        "name": "folder内文件数量限制通过childFileNodeNum计算:children.filter(v => v.type !== 'folder').length"
      },
      {
        "id": "3",
        "name": "只统计非folder类型的子节点,folder节点不计入限制"
      },
      {
        "id": "4",
        "name": "pid属性用于确定新节点的父节点,非空时添加到指定父节点下"
      },
      {
        "id": "5",
        "name": "新节点添加成功后,父folder节点会自动展开,方便用户查看新添加的节点"
      }
    ]
  },
  {
    "purpose": "鼠标右键目录添加http节点(AI)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
      },
      {
        "id": "3",
        "name": "节点树中存在至少一个folder类型节点"
      },
      {
        "id": "4",
        "name": "folder节点内文件数量未达到限制"
      },
      {
        "id": "5",
        "name": "应用处于独立模式,AI配置已完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标移动到folder节点上并右键"
      },
      {
        "id": "2",
        "name": "点击\"新建接口\"选项"
      },
      {
        "id": "3",
        "name": "在对话框中输入接口名称"
      },
      {
        "id": "4",
        "name": "选择接口类型为\"HTTP\""
      },
      {
        "id": "5",
        "name": "在AI提示词框中输入提示词"
      },
      {
        "id": "6",
        "name": "点击确定按钮"
      },
      {
        "id": "7",
        "name": "等待AI处理完成"
      },
      {
        "id": "8",
        "name": "观察新HTTP节点出现在folder节点下,包含AI生成的接口信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "currentOperationalNode.value为folder节点数据,pid为folder的_id"
      },
      {
        "id": "2",
        "name": "对话框显示AI提示词输入框(isStandalone为true)"
      },
      {
        "id": "3",
        "name": "填写AI提示词后,点击确定触发AI生成逻辑"
      },
      {
        "id": "4",
        "name": "loading状态显示,等待AI返回结果"
      },
      {
        "id": "5",
        "name": "AI生成完整HTTP接口信息(URL,方法,参数等)"
      },
      {
        "id": "6",
        "name": "新HTTP节点添加到folder节点的children数组中"
      },
      {
        "id": "7",
        "name": "folder节点自动展开,显示新添加的节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "SAddFileDialog的pid属性为folder节点的_id"
      },
      {
        "id": "2",
        "name": "AI提示词表单项条件渲染(v-if=\"isStandalone\")"
      },
      {
        "id": "3",
        "name": "buildAiSystemPromptForNode构建AI系统提示词"
      },
      {
        "id": "4",
        "name": "addFileAndFolderCb根据pid将节点添加到folder的children中"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "结合右键目录和AI功能的综合测试用例"
      },
      {
        "id": "2",
        "name": "新节点位置在folder节点下,而非根目录"
      },
      {
        "id": "3",
        "name": "AI生成的节点同样遵循folder内文件数量限制"
      }
    ]
  },
  {
    "purpose": "点击新增按钮添加http节点",
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
        "name": "点击banner顶部工具栏的\"新增文件\"按钮"
      },
      {
        "id": "2",
        "name": "观察SAddFileDialog对话框弹出"
      },
      {
        "id": "3",
        "name": "输入接口名称"
      },
      {
        "id": "4",
        "name": "选择接口类型为\"HTTP\""
      },
      {
        "id": "5",
        "name": "点击确定按钮"
      },
      {
        "id": "6",
        "name": "观察新HTTP节点出现在节点树根目录下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击\"新增文件\"按钮后,handleEmit方法被调用,参数为\"addRootFile\"(Tool.vue第290-292行)"
      },
      {
        "id": "2",
        "name": "addFileDialogVisible.value被设置为true"
      },
      {
        "id": "3",
        "name": "SAddFileDialog组件渲染,pid为空(在根目录添加)"
      },
      {
        "id": "4",
        "name": "点击确定后,新HTTP节点添加到banner树根目录下"
      },
      {
        "id": "5",
        "name": "新节点显示在根目录最下方"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "\"新增文件\"按钮在Tool.vue中,icon为\"#iconwenjian\",op为\"addRootFile\""
      },
      {
        "id": "2",
        "name": "handleEmit中addRootFile分支在Tool.vue第290-292行"
      },
      {
        "id": "3",
        "name": "SAddFileDialog的pid属性为空字符串"
      },
      {
        "id": "4",
        "name": "addFileAndFolderCb根据pid为空将节点添加到根目录"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "通过工具栏按钮添加与右键空白区域添加效果相同,都是在根目录添加"
      },
      {
        "id": "2",
        "name": "工具栏按钮是从Tool.vue组件触发,而非Banner.vue"
      },
      {
        "id": "3",
        "name": "Tool.vue的handleEmit方法设置addFileDialogVisible,Banner.vue监听并显示对话框"
      }
    ]
  },
  {
    "purpose": "点击新增按钮添加http节点(AI)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成"
      },
      {
        "id": "3",
        "name": "应用处于独立模式,AI配置已完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击banner顶部工具栏的\"新增文件\"按钮"
      },
      {
        "id": "2",
        "name": "观察SAddFileDialog对话框弹出"
      },
      {
        "id": "3",
        "name": "输入接口名称"
      },
      {
        "id": "4",
        "name": "选择接口类型为\"HTTP\""
      },
      {
        "id": "5",
        "name": "在AI提示词框中输入提示词"
      },
      {
        "id": "6",
        "name": "点击确定按钮"
      },
      {
        "id": "7",
        "name": "等待AI处理完成"
      },
      {
        "id": "8",
        "name": "观察新HTTP节点出现在节点树根目录下,包含AI生成的接口信息"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "对话框显示AI提示词输入框(isStandalone为true)"
      },
      {
        "id": "2",
        "name": "填写AI提示词后,点击确定触发AI生成逻辑"
      },
      {
        "id": "3",
        "name": "loading状态显示,等待AI返回结果"
      },
      {
        "id": "4",
        "name": "AI生成完整HTTP接口信息"
      },
      {
        "id": "5",
        "name": "新HTTP节点添加到根目录下"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "SAddFileDialog的pid属性为空字符串(根目录)"
      },
      {
        "id": "2",
        "name": "AI提示词表单项条件渲染(v-if=\"isStandalone\")"
      },
      {
        "id": "3",
        "name": "buildAiSystemPromptForNode构建AI系统提示词"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "通过工具栏按钮添加,结合AI功能"
      },
      {
        "id": "2",
        "name": "新节点位置在根目录"
      },
      {
        "id": "3",
        "name": "AI功能与添加方式(工具栏/右键)无关,只与isStandalone有关"
      }
    ]
  }
],
}

export default node
