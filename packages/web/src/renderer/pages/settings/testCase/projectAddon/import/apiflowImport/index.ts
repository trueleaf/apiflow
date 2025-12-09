import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "apiflow类型数据导入",
  description: "apiflow类型数据导入",
  children: [],
  atomicFunc: [
  {
    "purpose": "导入完整的apiflow类型数据(所有节点的所有可能的数据情况),需要完整展示所有数据",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,已打开一个项目工作区"
      },
      {
        "id": "2",
        "name": "当前处于项目编辑页面(/v1/apidoc/doc-edit)"
      },
      {
        "id": "3",
        "name": "准备好符合Apiflow格式的JSON文件,包含所有节点类型:http,websocket,httpMock,websocketMock,folder"
      },
      {
        "id": "4",
        "name": "JSON文件包含type: \"apiflow\"标识字段"
      },
      {
        "id": "5",
        "name": "JSON文件size不超过config.renderConfig.importProjectConfig.maxSize"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击项目工作区顶部工具栏的\"导入文档\"按钮(ArrowDownToLine图标)或使用快捷键Ctrl+I"
      },
      {
        "id": "2",
        "name": "等待导入页面加载,验证Import.vue组件正确渲染"
      },
      {
        "id": "3",
        "name": "确认\"导入方式\"选择为\"file\"(本地文件上传)"
      },
      {
        "id": "4",
        "name": "点击或拖拽上传准备好的Apiflow JSON文件到el-upload拖拽区域"
      },
      {
        "id": "5",
        "name": "等待文件读取和格式识别完成"
      },
      {
        "id": "6",
        "name": "观察导入数据预览区域,检查el-tree展示的节点结构"
      },
      {
        "id": "7",
        "name": "验证所有节点类型(http,websocket,httpMock,websocketMock,folder)都正确解析"
      },
      {
        "id": "8",
        "name": "检查每个节点的完整数据:名称,URL,方法,参数,脚本,响应等字段"
      },
      {
        "id": "9",
        "name": "配置导入选项:选择\"追加方式\",不选择目标目录"
      },
      {
        "id": "10",
        "name": "点击\"确定\"按钮执行导入"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击导入按钮后,projectNavStore.addProjectNav创建新Tab,tabType为\"importDoc\""
      },
      {
        "id": "2",
        "name": "导入页面正确渲染,显示三个导入方式选项:file,url,paste"
      },
      {
        "id": "3",
        "name": "el-upload组件显示拖拽上传区域,accept属性为\".json\""
      },
      {
        "id": "4",
        "name": "上传文件后,beforeUpload方法验证文件大小和类型"
      },
      {
        "id": "5",
        "name": "FileReader读取文件内容,JSON.parse解析为对象"
      },
      {
        "id": "6",
        "name": "格式识别逻辑检测到jsonText.value.type === \"apiflow\",设置importTypeInfo.name为\"apiflow\""
      },
      {
        "id": "7",
        "name": "formInfo.value.moyuData.docs填充为解析后的节点数组"
      },
      {
        "id": "8",
        "name": "el-tree组件渲染节点树形结构,使用默认展开(default-expand-all)"
      },
      {
        "id": "9",
        "name": "所有节点类型正确显示对应图标:FileText(http),Globe(websocket),Server(mock),Folder(folder)"
      },
      {
        "id": "10",
        "name": "每个节点的完整数据都被保留:item.method,item.url,item.headers,item.queryParams,item.paths,item.requestBody,item.responseParams,preRequestScript,afterRequestScript"
      },
      {
        "id": "11",
        "name": "点击确定后,调用apiNodesCache.appendNodes方法(离线模式)"
      },
      {
        "id": "12",
        "name": "节点成功追加到根目录,不影响现有节点"
      },
      {
        "id": "13",
        "name": "bannerStore.getDocBanner刷新左侧导航树"
      },
      {
        "id": "14",
        "name": "ElMessage.success显示\"导入成功\"提示"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "导入按钮配置:operations.ts中op: \"importDoc\",shortcut: [\"Ctrl\", \"I\"]"
      },
      {
        "id": "2",
        "name": "Import.vue组件路径:pages/projectWorkbench/layout/content/import/Import.vue"
      },
      {
        "id": "3",
        "name": "文件上传:el-upload组件,:before-upload=\"beforeUpload\",:on-change=\"handleFileChange\""
      },
      {
        "id": "4",
        "name": "文件大小限制:config.renderConfig.importProjectConfig.maxSize(默认10MB)"
      },
      {
        "id": "5",
        "name": "格式识别:Import.vue行303-306,检查(jsonText.value as ApiflowInfo).type === \"apiflow\""
      },
      {
        "id": "6",
        "name": "formInfo.value.moyuData结构:{ docs: HttpNode[], info: { projectName: string } }"
      },
      {
        "id": "7",
        "name": "追加逻辑:Import.vue行514-520,apiNodesCache.appendNodes(copiedDocs, projectId)"
      },
      {
        "id": "8",
        "name": "appendNodes方法:nodesCache.ts,遍历docs数组,为每个节点调用addNode"
      },
      {
        "id": "9",
        "name": "addNode自动生成_id(nanoid),设置projectId,保存到IndexedDB"
      },
      {
        "id": "10",
        "name": "bannerStore.getDocBanner触发:行518,刷新projectNavStore中的导航树数据"
      },
      {
        "id": "11",
        "name": "ApiflowInfo类型定义包含type字段和docs数组"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Apiflow标准格式:{ type: \"apiflow\", docs: HttpNode[], info: { projectName: string } }"
      },
      {
        "id": "2",
        "name": "节点类型包括:http(HTTP请求),websocket(WebSocket连接),httpMock(HTTP Mock服务器),websocketMock(WebSocket Mock服务器),folder(文件夹)"
      },
      {
        "id": "3",
        "name": "完整数据字段包括:基本信息(_id,pid,projectId,sort,info),请求配置(item),脚本(preRequestScript,afterRequestScript),响应(responseParams)"
      },
      {
        "id": "4",
        "name": "导入流程:文件选择 -> 读取解析 -> 格式识别 -> 数据预览 -> 配置选项 -> 执行导入 -> 刷新UI"
      },
      {
        "id": "5",
        "name": "离线模式直接操作IndexedDB,在线模式调用/api/project/import/moyu API"
      },
      {
        "id": "6",
        "name": "JSON.parse可能抛出异常,需要try-catch包裹并提示\"文件格式错误\""
      }
    ]
  },
  {
    "purpose": "验证追加方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,已打开一个项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在节点结构:根目录下有文件夹A,文件夹B,HTTP节点C"
      },
      {
        "id": "3",
        "name": "准备好Apiflow格式JSON文件,包含3个节点:HTTP节点1,HTTP节点2,文件夹D"
      },
      {
        "id": "4",
        "name": "已打开导入页面,文件已上传并解析完成"
      },
      {
        "id": "5",
        "name": "导入模式选择区域显示\"追加方式\"和\"覆盖方式\"两个选项"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "**场景1:追加方式 + 不选择目标目录**"
      },
      {
        "id": "2",
        "name": "选择导入模式为\"追加方式\"(formInfo.value.cover = false)"
      },
      {
        "id": "3",
        "name": "不勾选任何目标文件夹(mountedId为空)"
      },
      {
        "id": "4",
        "name": "点击\"确定\"按钮执行导入"
      },
      {
        "id": "5",
        "name": "观察左侧导航树的变化"
      },
      {
        "id": "6",
        "name": "验证导入的节点位置"
      },
      {
        "id": "7",
        "name": "**场景2:追加方式 + 选择目标目录**"
      },
      {
        "id": "8",
        "name": "重新打开导入页面,上传相同的JSON文件"
      },
      {
        "id": "9",
        "name": "选择导入模式为\"追加方式\""
      },
      {
        "id": "10",
        "name": "在目标文件夹选择区域,展开el-tree并点击选择\"文件夹A\""
      },
      {
        "id": "11",
        "name": "验证mountedId.value已设置为文件夹A的_id"
      },
      {
        "id": "12",
        "name": "点击\"确定\"按钮执行导入"
      },
      {
        "id": "13",
        "name": "观察左侧导航树的变化,展开文件夹A"
      },
      {
        "id": "14",
        "name": "验证导入的节点位置"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "**场景1结果**:导入的3个节点(HTTP节点1,HTTP节点2,文件夹D)追加到根目录"
      },
      {
        "id": "2",
        "name": "根目录节点列表变为:文件夹A,文件夹B,HTTP节点C,HTTP节点1,HTTP节点2,文件夹D"
      },
      {
        "id": "3",
        "name": "原有节点(文件夹A,文件夹B,HTTP节点C)保持不变"
      },
      {
        "id": "4",
        "name": "新导入节点的pid为null(根节点)"
      },
      {
        "id": "5",
        "name": "新导入节点的sort自动递增,排在原有节点之后"
      },
      {
        "id": "6",
        "name": "**场景2结果**:导入的3个节点追加到文件夹A下"
      },
      {
        "id": "7",
        "name": "文件夹A展开后显示:HTTP节点1,HTTP节点2,文件夹D"
      },
      {
        "id": "8",
        "name": "新导入节点的pid为文件夹A的_id"
      },
      {
        "id": "9",
        "name": "文件夹B和HTTP节点C不受影响"
      },
      {
        "id": "10",
        "name": "根目录仍然只有:文件夹A,文件夹B,HTTP节点C"
      },
      {
        "id": "11",
        "name": "两种场景都不删除或覆盖任何现有节点"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "追加模式配置:Import.vue行108-111,el-radio :value=\"false\"绑定到formInfo.value.cover"
      },
      {
        "id": "2",
        "name": "目标文件夹选择:Import.vue行113-130,el-tree组件,@node-click=\"handleNodeClick\""
      },
      {
        "id": "3",
        "name": "handleNodeClick方法:行269-277,设置mountedId.value = data._id"
      },
      {
        "id": "4",
        "name": "pid处理逻辑:Import.vue行498-506,(!val.pid && mountedId) ? mountedId : val.pid"
      },
      {
        "id": "5",
        "name": "场景1:mountedId为空,根节点的pid保持为null"
      },
      {
        "id": "6",
        "name": "场景2:mountedId为文件夹A的_id,根节点的pid被设置为mountedId"
      },
      {
        "id": "7",
        "name": "apiNodesCache.appendNodes方法:遍历docs,为每个节点调用addNode"
      },
      {
        "id": "8",
        "name": "addNode方法保留节点的pid值,自动生成新的_id和projectId"
      },
      {
        "id": "9",
        "name": "sort字段自动计算:获取同级最大sort值+1"
      },
      {
        "id": "10",
        "name": "bannerStore.getDocBanner刷新后,projectNavStore中的节点树更新"
      },
      {
        "id": "11",
        "name": "el-tree渲染逻辑根据pid关系构建树形结构"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "追加方式(append)的核心特征:不删除,不覆盖,只添加新节点"
      },
      {
        "id": "2",
        "name": "目标目录选择使用el-tree的node-key=\"_id\"属性标识节点"
      },
      {
        "id": "3",
        "name": "pid字段决定节点的父子关系:null表示根节点,非null表示子节点"
      },
      {
        "id": "4",
        "name": "导入的JSON文件中如果包含嵌套结构(有pid关系),追加时会保持该结构"
      },
      {
        "id": "5",
        "name": "选择目标目录后,只有JSON中的根节点(pid为null)的pid会被修改为目标目录ID,子节点的pid保持不变"
      },
      {
        "id": "6",
        "name": "sort字段用于同级节点的排序,新节点排在同级节点最后"
      }
    ]
  },
  {
    "purpose": "验证覆盖方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "已在任意项目中点击顶部工具栏\"导入\"按钮打开Import.vue导入对话框"
      },
      {
        "id": "2",
        "name": "已选择一个包含apiflow格式的JSON文件(formInfo.value.type自动识别为\"apiflow\")"
      },
      {
        "id": "3",
        "name": "当前项目已存在节点数据(例如根目录下有文件夹A,文件夹B和HTTP节点C)"
      },
      {
        "id": "4",
        "name": "formInfo.value.moyuData.docs已解析完成,包含待导入的节点数据"
      },
      {
        "id": "5",
        "name": "当前运行在standalone模式(isStandalone.value为true,使用IndexedDB)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在Import.vue对话框的\"导入方式\"区域,选择el-radio value为true的\"覆盖\"选项"
      },
      {
        "id": "2",
        "name": "验证formInfo.value.cover值变为true"
      },
      {
        "id": "3",
        "name": "场景1:不选择目标目录 - 保持el-tree\"选择目标文件夹\"为空,直接点击\"确认导入\"按钮"
      },
      {
        "id": "4",
        "name": "在弹出的el-message-box确认对话框中查看警告内容:\"覆盖导入会清空当前项目所有接口数据,导入后无法恢复,是否继续\""
      },
      {
        "id": "5",
        "name": "点击\"确定\"按钮确认覆盖操作"
      },
      {
        "id": "6",
        "name": "等待导入完成,观察项目节点树的变化"
      },
      {
        "id": "7",
        "name": "记录导入后的节点结构和pid关系"
      },
      {
        "id": "8",
        "name": "重新打开Import.vue对话框,再次选择相同的apiflow JSON文件"
      },
      {
        "id": "9",
        "name": "选择\"覆盖\"导入方式"
      },
      {
        "id": "10",
        "name": "场景2:选择目标目录 - 在el-tree中点击并选中\"文件夹A\"作为目标目录(mountedId为文件夹A的_id)"
      },
      {
        "id": "11",
        "name": "点击\"确认导入\"按钮"
      },
      {
        "id": "12",
        "name": "在确认对话框中再次点击\"确定\"按钮"
      },
      {
        "id": "13",
        "name": "等待导入完成,观察项目节点树的变化"
      },
      {
        "id": "14",
        "name": "对比两次导入后的节点结构差异,特别关注根节点的pid字段"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "场景1(不选择目标目录):覆盖导入会完全清空项目原有的所有节点(文件夹A,B,HTTP节点C全部被删除)"
      },
      {
        "id": "2",
        "name": "场景1:导入的节点完全按照JSON文件中的pid结构组织,保持原有层级关系不变"
      },
      {
        "id": "3",
        "name": "场景1:JSON中pid为null/undefined的根节点在导入后pid仍为null/undefined,位于项目根目录"
      },
      {
        "id": "4",
        "name": "场景1:JSON中所有子节点的pid保持原值,指向其父节点的_id,维持原有父子关系"
      },
      {
        "id": "5",
        "name": "场景2(选择目标目录\"文件夹A\"):覆盖导入同样清空项目原有所有节点"
      },
      {
        "id": "6",
        "name": "场景2:导入的根节点(JSON中pid为null/undefined的节点)的pid被设置为选中的文件夹A的_id"
      },
      {
        "id": "7",
        "name": "场景2:导入的根节点现在成为文件夹A的子节点,全部显示在文件夹A下"
      },
      {
        "id": "8",
        "name": "场景2:JSON中原本就有pid值的子节点保持原有pid值不变,维持相对层级关系"
      },
      {
        "id": "9",
        "name": "两个场景都显示\"导入成功\"的el-message提示信息"
      },
      {
        "id": "10",
        "name": "两个场景都会调用bannerStore.getDocBanner刷新文档数量统计"
      },
      {
        "id": "11",
        "name": "覆盖导入前都会弹出el-message-box确认对话框,避免误操作导致数据丢失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Import.vue第498-506行:pid处理逻辑 - const processedDoc = { ...val, pid: (!val.pid && mountedId) ? mountedId : val.pid }"
      },
      {
        "id": "2",
        "name": "Import.vue第514-520行:standalone模式下覆盖导入判断 - if (isStandalone.value && formInfo.value.cover)"
      },
      {
        "id": "3",
        "name": "Import.vue第522-527行:调用apiNodesCache.replaceAllNodes(copiedDocs, projectId)执行覆盖操作"
      },
      {
        "id": "4",
        "name": "nodesCache.ts的replaceAllNodes方法会先清空IndexedDB中该projectId的所有httpNodeList记录"
      },
      {
        "id": "5",
        "name": "replaceAllNodes方法然后批量写入新的节点数据到IndexedDB"
      },
      {
        "id": "6",
        "name": "Import.vue第478-485行:el-message-box确认对话框配置 - 标题\"覆盖导入\",内容警告数据丢失"
      },
      {
        "id": "7",
        "name": "Import.vue第488行:用户点击\"取消\"时return阻止导入操作,点击\"确定\"时继续执行"
      },
      {
        "id": "8",
        "name": "Import.vue第206行:el-tree的node-click事件设置mountedId = node._id"
      },
      {
        "id": "9",
        "name": "场景1(不选择目标目录):mountedId为undefined,JSON中pid为null/undefined的节点保持pid为null/undefined"
      },
      {
        "id": "10",
        "name": "场景2(选择目标目录):mountedId为文件夹A的_id,JSON中pid为null/undefined的节点的pid被设置为mountedId"
      },
      {
        "id": "11",
        "name": "Import.vue第529行:调用bannerStore.getDocBanner({ projectId })更新顶部Banner的文档统计数字"
      },
      {
        "id": "12",
        "name": "Import.vue第530行:message.success(t(\"导入成功\"))显示成功提示"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "覆盖导入的核心区别:formInfo.value.cover = true时调用apiNodesCache.replaceAllNodes()而非appendNodes()"
      },
      {
        "id": "2",
        "name": "replaceAllNodes方法会先清空项目所有节点,然后写入新数据,是破坏性操作,因此需要确认对话框"
      },
      {
        "id": "3",
        "name": "pid处理逻辑与追加模式相同:选择目标目录时,仅处理JSON中原本pid为null/undefined的根节点"
      },
      {
        "id": "4",
        "name": "选择目标目录后,导入的节点树整体作为选中目录的子树挂载,但内部相对层级关系保持不变"
      },
      {
        "id": "5",
        "name": "覆盖导入适用场景:完全替换项目接口数据,从备份恢复,团队成员之间同步完整项目结构"
      },
      {
        "id": "6",
        "name": "el-message-box确认对话框使用ElMessageBox.confirm方法,type为\"warning\",confirmButtonText为\"确定\",cancelButtonText为\"取消\""
      },
      {
        "id": "7",
        "name": "覆盖导入后IndexedDB中该项目的httpNodeList表会被完全重建,旧数据无法恢复,建议操作前先备份"
      }
    ]
  }
],
}

export default node
