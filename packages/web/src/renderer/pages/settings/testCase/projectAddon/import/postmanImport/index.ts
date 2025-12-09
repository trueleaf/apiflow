import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "postman类型数据导入",
  description: "postman类型数据导入",
  children: [],
  atomicFunc: [
  {
    "purpose": "导入完整的postman类型数据(所有节点的所有可能的数据情况),需要完整展示所有数据",
    "precondition": [
      {
        "id": "1",
        "name": "已在任意项目中点击顶部工具栏\"导入\"按钮打开Import.vue导入对话框"
      },
      {
        "id": "2",
        "name": "准备一个Postman Collection导出的JSON文件,包含info._postman_id字段"
      },
      {
        "id": "3",
        "name": "Postman文件包含完整的collection结构:info,item数组,auth,variables等"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击\"上传文件\"区域的el-upload拖拽上传组件"
      },
      {
        "id": "2",
        "name": "选择准备好的Postman Collection JSON文件"
      },
      {
        "id": "3",
        "name": "触发handleBeforeUpload方法,文件内容被读取并解析为JSON对象"
      },
      {
        "id": "4",
        "name": "观察Import.vue第319-321行的格式识别逻辑执行"
      },
      {
        "id": "5",
        "name": "观察importTypeInfo显示区域是否正确显示\"格式: postman\""
      },
      {
        "id": "6",
        "name": "查看formInfo.value.type是否被设置为\"postman\""
      },
      {
        "id": "7",
        "name": "尝试点击\"确认导入\"按钮"
      },
      {
        "id": "8",
        "name": "观察是否出现警告提示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "文件上传后,Import.vue能够正确识别Postman格式(检测jsonText.info._postman_id字段)"
      },
      {
        "id": "2",
        "name": "importTypeInfo.value.name被设置为\"postman\""
      },
      {
        "id": "3",
        "name": "formInfo.value.type被设置为\"postman\""
      },
      {
        "id": "4",
        "name": "但formInfo.value.moyuData.docs保持为空(因为转换代码被注释)"
      },
      {
        "id": "5",
        "name": "第323行postmanTranslatorInstance实例化代码被注释,转换器未创建"
      },
      {
        "id": "6",
        "name": "点击\"确认导入\"按钮后,handleSubmit方法第491行判断moyuData.docs不存在"
      },
      {
        "id": "7",
        "name": "显示el-message警告提示:\"请选择需要导入的文件\""
      },
      {
        "id": "8",
        "name": "导入操作被中止,项目节点树不发生任何变化"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Import.vue第319行:格式识别条件 - (jsonText.value as any)?.info?._postman_id"
      },
      {
        "id": "2",
        "name": "Import.vue第320行:importTypeInfo.value.name = \"postman\""
      },
      {
        "id": "3",
        "name": "Import.vue第321行:formInfo.value.type = \"postman\""
      },
      {
        "id": "4",
        "name": "Import.vue第323行:转换器实例化被注释 - postmanTranslatorInstance = new PostmanTranslator()"
      },
      {
        "id": "5",
        "name": "Import.vue第336行:转换逻辑被注释 - formInfo.moyuData = postmanTranslatorInstance.convertPostmanData(jsonText)"
      },
      {
        "id": "6",
        "name": "openapi.ts转换器文件错误地声明为PostmanTranslator类,且内容为空,无实际转换实现"
      },
      {
        "id": "7",
        "name": "handleSubmit方法第491-493行:if (!formInfo.value.moyuData.docs) { message.warning(t(\"请选择需要导入的文件\")); return; }"
      },
      {
        "id": "8",
        "name": "formInfo.value.moyuData.docs为undefined或null,导致导入流程被中止"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "当前版本的Postman导入功能仅完成了格式识别部分,数据转换功能尚未实现"
      },
      {
        "id": "2",
        "name": "Import.vue第323和336行的转换逻辑被注释,导致无法将Postman格式转换为apiflow格式"
      },
      {
        "id": "3",
        "name": "Postman转换器文件应该独立创建(postman.ts),目前没有正确的转换器实现"
      },
      {
        "id": "4",
        "name": "Postman Collection结构:info包含集合元数据,item数组包含请求或文件夹,每个item可以嵌套子item"
      },
      {
        "id": "5",
        "name": "完整实现需要将Postman的item递归转换为apiflow的HttpNode结构,包括request对象的url,method,header,body等字段映射"
      },
      {
        "id": "6",
        "name": "Postman的folder(文件夹)应转换为apiflow的文件夹节点,保持层级关系"
      },
      {
        "id": "7",
        "name": "Postman的variables可以转换为apiflow的环境变量或项目变量"
      },
      {
        "id": "8",
        "name": "此测试用例反映当前实现状态,待转换功能实现后需要更新测试用例内容"
      }
    ]
  },
  {
    "purpose": "验证追加方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "Postman格式的数据转换功能已实现(当前未实现)"
      },
      {
        "id": "2",
        "name": "postmanTranslatorInstance.convertPostmanData()能够成功将Postman Collection转换为apiflow格式"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开Import.vue导入对话框"
      },
      {
        "id": "4",
        "name": "已上传Postman Collection JSON文件并成功识别格式"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在\"导入方式\"区域选择el-radio value为false的\"追加\"选项"
      },
      {
        "id": "2",
        "name": "场景1:不选择目标目录,直接点击\"确认导入\""
      },
      {
        "id": "3",
        "name": "观察转换后的节点是否添加到项目根目录"
      },
      {
        "id": "4",
        "name": "场景2:在el-tree中选择一个文件夹作为目标目录"
      },
      {
        "id": "5",
        "name": "点击\"确认导入\"按钮"
      },
      {
        "id": "6",
        "name": "观察转换后的节点是否添加到选中的文件夹下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "因转换功能未实现,当前版本无法执行追加导入操作"
      },
      {
        "id": "2",
        "name": "待转换功能实现后,追加导入行为应与apiflow格式保持一致"
      },
      {
        "id": "3",
        "name": "不选择目标目录时,Postman转换的根节点pid为null,位于项目根目录"
      },
      {
        "id": "4",
        "name": "选择目标目录时,Postman转换的根节点pid设置为选中文件夹的_id"
      },
      {
        "id": "5",
        "name": "Postman的每个request item应转换为一个独立的HTTP节点"
      },
      {
        "id": "6",
        "name": "Postman的folder item应转换为文件夹节点,保持嵌套层级关系"
      },
      {
        "id": "7",
        "name": "Postman Collection的名称(info.name)可以作为根文件夹或保持扁平结构"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "待实现:postmanTranslatorInstance.convertPostmanData()方法需要递归解析item数组"
      },
      {
        "id": "2",
        "name": "待实现:识别item类型 - 有request字段的是请求节点,有item数组的是文件夹节点"
      },
      {
        "id": "3",
        "name": "待实现:Postman的request.url对象转换为apiflow的url字符串"
      },
      {
        "id": "4",
        "name": "待实现:Postman的request.header数组转换为apiflow的headers数组"
      },
      {
        "id": "5",
        "name": "待实现:Postman的request.body(raw/formdata/urlencoded等)转换为apiflow的body对象"
      },
      {
        "id": "6",
        "name": "待实现:Postman的request.method转换为apiflow的method字段"
      },
      {
        "id": "7",
        "name": "pid处理逻辑复用Import.vue第498-506行:(!val.pid && mountedId) ? mountedId : val.pid"
      },
      {
        "id": "8",
        "name": "追加操作调用apiNodesCache.appendNodes()方法,与apiflow格式相同"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例为Postman转换功能实现后的预期行为描述"
      },
      {
        "id": "2",
        "name": "当前版本因转换逻辑未实现,无法执行此测试用例"
      },
      {
        "id": "3",
        "name": "Postman到apiflow的字段映射需要处理复杂的url对象结构(protocol,host数组,path数组,query参数)"
      },
      {
        "id": "4",
        "name": "建议参考注释代码第336行的转换调用:postmanTranslatorInstance.convertPostmanData(jsonText)"
      },
      {
        "id": "5",
        "name": "Postman的auth配置(apikey,bearer,basic等)需要映射到apiflow的认证headers"
      },
      {
        "id": "6",
        "name": "Postman的pre-request scripts和tests可以映射到apiflow的pre-request和post-request脚本"
      }
    ]
  },
  {
    "purpose": "验证覆盖方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "Postman格式的数据转换功能已实现(当前未实现)"
      },
      {
        "id": "2",
        "name": "postmanTranslatorInstance.convertPostmanData()能够成功转换Postman数据"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开Import.vue导入对话框"
      },
      {
        "id": "4",
        "name": "已上传Postman Collection JSON文件并成功识别格式"
      },
      {
        "id": "5",
        "name": "当前项目已存在一些节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在\"导入方式\"区域选择el-radio value为true的\"覆盖\"选项"
      },
      {
        "id": "2",
        "name": "验证formInfo.value.cover值变为true"
      },
      {
        "id": "3",
        "name": "场景1:不选择目标目录,直接点击\"确认导入\""
      },
      {
        "id": "4",
        "name": "在el-message-box确认对话框中点击\"确定\"按钮"
      },
      {
        "id": "5",
        "name": "观察项目原有节点是否被清空,Postman转换的节点是否完全替换"
      },
      {
        "id": "6",
        "name": "场景2:选择一个文件夹作为目标目录,点击\"确认导入\""
      },
      {
        "id": "7",
        "name": "确认覆盖操作"
      },
      {
        "id": "8",
        "name": "观察项目节点树的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "因转换功能未实现,当前版本无法执行覆盖导入操作"
      },
      {
        "id": "2",
        "name": "待转换功能实现后,覆盖导入行为应与apiflow格式保持一致"
      },
      {
        "id": "3",
        "name": "覆盖导入会清空项目所有原有节点,弹出确认对话框警告用户"
      },
      {
        "id": "4",
        "name": "不选择目标目录时,Postman转换的节点完全替换项目内容,保持原有层级关系"
      },
      {
        "id": "5",
        "name": "选择目标目录时,转换的根节点的pid被设置为选中文件夹的_id"
      },
      {
        "id": "6",
        "name": "Postman Collection中定义的完整请求集合被转换并导入到项目中"
      },
      {
        "id": "7",
        "name": "Postman的文件夹层级结构在转换后得到保持"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "待实现:转换逻辑需要正确处理Postman的递归item结构"
      },
      {
        "id": "2",
        "name": "Import.vue第478-485行:覆盖导入确认对话框 - ElMessageBox.confirm"
      },
      {
        "id": "3",
        "name": "Import.vue第508-513行:覆盖导入判断 - if (isStandalone.value && formInfo.value.cover)"
      },
      {
        "id": "4",
        "name": "覆盖操作调用apiNodesCache.replaceAllNodes()方法"
      },
      {
        "id": "5",
        "name": "replaceAllNodes会先清空IndexedDB中该projectId的所有httpNodeList记录"
      },
      {
        "id": "6",
        "name": "pid处理逻辑复用:(!val.pid && mountedId) ? mountedId : val.pid"
      },
      {
        "id": "7",
        "name": "导入后调用bannerStore.getDocBanner({ projectId })刷新文档统计"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例为Postman转换功能实现后的预期行为描述"
      },
      {
        "id": "2",
        "name": "当前版本因转换逻辑未实现,无法执行此测试用例"
      },
      {
        "id": "3",
        "name": "覆盖导入是破坏性操作,需要确认对话框防止误操作"
      },
      {
        "id": "4",
        "name": "Postman Collection可能非常庞大(数百个请求),转换过程需要考虑性能优化"
      },
      {
        "id": "5",
        "name": "Postman的environment变量应该作为单独的导入选项或合并到项目变量中"
      },
      {
        "id": "6",
        "name": "建议实现时参考postman-to-openapi等开源转换工具的解析逻辑"
      },
      {
        "id": "7",
        "name": "Postman v2.1格式与v2.0格式可能存在差异,转换器需要兼容多个版本"
      }
    ]
  }
],
}

export default node
