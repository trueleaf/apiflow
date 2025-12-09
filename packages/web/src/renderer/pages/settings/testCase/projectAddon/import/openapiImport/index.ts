import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "openapi3.0类型数据导入",
  description: "openapi3.0类型数据导入",
  children: [],
  atomicFunc: [
  {
    "purpose": "导入完整的openapi3.0类型数据(所有节点的所有可能的数据情况),需要完整展示所有数据",
    "precondition": [
      {
        "id": "1",
        "name": "已在任意项目中点击顶部工具栏\"导入\"按钮打开Import.vue导入对话框"
      },
      {
        "id": "2",
        "name": "准备一个符合OpenAPI 3.0规范的JSON文件,包含openapi字段(如\"openapi\": \"3.0.0\")"
      },
      {
        "id": "3",
        "name": "OpenAPI文件包含完整的API定义:paths,components,servers等"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击\"上传文件\"区域的el-upload拖拽上传组件"
      },
      {
        "id": "2",
        "name": "选择准备好的OpenAPI 3.0 JSON文件"
      },
      {
        "id": "3",
        "name": "触发handleBeforeUpload方法,文件内容被读取并解析为JSON对象"
      },
      {
        "id": "4",
        "name": "观察Import.vue第307-310行的格式识别逻辑执行"
      },
      {
        "id": "5",
        "name": "观察importTypeInfo显示区域是否正确显示\"格式: openapi\"和版本号"
      },
      {
        "id": "6",
        "name": "查看formInfo.value.type是否被设置为\"openapi\""
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
        "name": "文件上传后,Import.vue能够正确识别OpenAPI 3.0格式(检测jsonText.openapi字段)"
      },
      {
        "id": "2",
        "name": "importTypeInfo.value.name被设置为\"openapi\""
      },
      {
        "id": "3",
        "name": "importTypeInfo.value.version被设置为文件中的openapi版本号(如\"3.0.0\")"
      },
      {
        "id": "4",
        "name": "formInfo.value.type被设置为\"openapi\""
      },
      {
        "id": "5",
        "name": "但formInfo.value.moyuData.docs保持为空(因为第311行转换代码被注释)"
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
        "name": "Import.vue第307行:格式识别条件 - (jsonText.value as OpenAPIV3.Document).openapi"
      },
      {
        "id": "2",
        "name": "Import.vue第308行:importTypeInfo.value.name = \"openapi\""
      },
      {
        "id": "3",
        "name": "Import.vue第309行:importTypeInfo.value.version = (jsonText.value as OpenAPIV3.Document).openapi"
      },
      {
        "id": "4",
        "name": "Import.vue第310行:formInfo.value.type = \"openapi\""
      },
      {
        "id": "5",
        "name": "Import.vue第311行:转换逻辑被注释 - formInfo.value.moyuData.docs = openApiTranslatorInstance.getDocsInfo()"
      },
      {
        "id": "6",
        "name": "openapi.ts转换器文件仅包含空的PostmanTranslator类,无实际转换实现"
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
        "name": "当前版本的OpenAPI 3.0导入功能仅完成了格式识别部分,数据转换功能尚未实现"
      },
      {
        "id": "2",
        "name": "Import.vue第311行的转换逻辑openApiTranslatorInstance.getDocsInfo()被注释,导致无法将OpenAPI格式转换为apiflow格式"
      },
      {
        "id": "3",
        "name": "openapi.ts转换器文件(应为OpenAPITranslator类)内容为空,需要实现convertToMoyuDocs方法"
      },
      {
        "id": "4",
        "name": "OpenAPI规范定义:paths对象包含所有端点,每个端点可有get/post/put/delete等操作方法"
      },
      {
        "id": "5",
        "name": "完整实现需要将OpenAPI的paths转换为apiflow的HttpNode结构,包括URL,method,parameters,requestBody,responses等字段映射"
      },
      {
        "id": "6",
        "name": "OpenAPI的tags可以映射为apiflow的文件夹结构,servers可以映射为环境变量"
      },
      {
        "id": "7",
        "name": "此测试用例反映当前实现状态,待转换功能实现后需要更新测试用例内容"
      }
    ]
  },
  {
    "purpose": "验证追加方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "OpenAPI 3.0格式的数据转换功能已实现(当前未实现)"
      },
      {
        "id": "2",
        "name": "formInfo.value.moyuData.docs能够成功从OpenAPI数据转换得到"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开Import.vue导入对话框"
      },
      {
        "id": "4",
        "name": "已上传OpenAPI 3.0 JSON文件并成功识别格式"
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
        "name": "不选择目标目录时,OpenAPI转换的根节点pid为null,位于项目根目录"
      },
      {
        "id": "4",
        "name": "选择目标目录时,OpenAPI转换的根节点pid设置为选中文件夹的_id"
      },
      {
        "id": "5",
        "name": "OpenAPI的每个path+method组合应转换为一个独立的HTTP节点"
      },
      {
        "id": "6",
        "name": "OpenAPI的tags应转换为文件夹结构,带相同tag的节点归入同一文件夹"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "待实现:openApiTranslatorInstance.getDocsInfo()方法需要解析OpenAPI的paths对象"
      },
      {
        "id": "2",
        "name": "待实现:每个path的每个operation(get/post/put等)转换为一个HttpNode"
      },
      {
        "id": "3",
        "name": "待实现:OpenAPI的parameters转换为apiflow的params数组"
      },
      {
        "id": "4",
        "name": "待实现:OpenAPI的requestBody转换为apiflow的body对象"
      },
      {
        "id": "5",
        "name": "待实现:OpenAPI的responses转换为apiflow的response示例数据"
      },
      {
        "id": "6",
        "name": "pid处理逻辑复用Import.vue第498-506行:(!val.pid && mountedId) ? mountedId : val.pid"
      },
      {
        "id": "7",
        "name": "追加操作调用apiNodesCache.appendNodes()方法,与apiflow格式相同"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例为OpenAPI转换功能实现后的预期行为描述"
      },
      {
        "id": "2",
        "name": "当前版本因转换逻辑未实现,无法执行此测试用例"
      },
      {
        "id": "3",
        "name": "OpenAPI到apiflow的字段映射关系需要在转换器中定义"
      },
      {
        "id": "4",
        "name": "建议参考注释代码第341行的转换调用:convertToMoyuDocs(jsonText, { folderNamedType: openapiFolderNamedType })"
      },
      {
        "id": "5",
        "name": "openapiFolderNamedType可能控制文件夹命名规则(按tags或按paths)"
      }
    ]
  },
  {
    "purpose": "验证覆盖方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "OpenAPI 3.0格式的数据转换功能已实现(当前未实现)"
      },
      {
        "id": "2",
        "name": "formInfo.value.moyuData.docs能够成功从OpenAPI数据转换得到"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开Import.vue导入对话框"
      },
      {
        "id": "4",
        "name": "已上传OpenAPI 3.0 JSON文件并成功识别格式"
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
        "name": "观察项目原有节点是否被清空,OpenAPI转换的节点是否完全替换"
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
        "name": "不选择目标目录时,OpenAPI转换的节点完全替换项目内容,保持原有层级关系"
      },
      {
        "id": "5",
        "name": "选择目标目录时,转换的根节点的pid被设置为选中文件夹的_id"
      },
      {
        "id": "6",
        "name": "OpenAPI文件中定义的完整API结构被转换并导入到项目中"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "待实现:转换逻辑需要正确处理OpenAPI的嵌套结构"
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
        "name": "此测试用例为OpenAPI转换功能实现后的预期行为描述"
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
        "name": "OpenAPI规范支持多个servers定义,可能需要让用户选择导入哪个server的配置"
      },
      {
        "id": "5",
        "name": "OpenAPI的components/schemas可以转换为apiflow的全局数据模型或环境变量"
      },
      {
        "id": "6",
        "name": "建议实现时参考swagger-to-postman等开源转换工具的字段映射方案"
      }
    ]
  }
],
}

export default node
