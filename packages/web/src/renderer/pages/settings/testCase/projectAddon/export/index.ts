import { type ModelNode } from '../../types'

const node: ModelNode = {
  modelName: "export",
  description: "导出项目",
  children: [],
  atomicFunc: [
  {
    "purpose": "导出apiflow格式数据",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个HTTP或WebSocket节点"
      },
      {
        "id": "3",
        "name": "应用运行在离线模式(runtimeStore.networkMode === \"offline\")"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击项目工作区顶部导航栏中的\"导出\"按钮或菜单项"
      },
      {
        "id": "2",
        "name": "在导出弹窗中,点击选择\"JSON文档\"类型(moyu类型,显示应用logo图标)"
      },
      {
        "id": "3",
        "name": "(可选)开启\"选择导出\"配置,通过el-tree勾选需要导出的节点"
      },
      {
        "id": "4",
        "name": "观察统计信息:总数,文件夹数量,文档数量"
      },
      {
        "id": "5",
        "name": "点击\"确定导出\"按钮"
      },
      {
        "id": "6",
        "name": "等待导出完成,浏览器自动下载JSON文件"
      },
      {
        "id": "7",
        "name": "打开下载的JSON文件,验证数据格式和内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "导出弹窗正确显示,包含HTML,WORD,JSON文档,OpenAPI四种导出类型"
      },
      {
        "id": "2",
        "name": "选择JSON文档后,对应的.item元素添加.active类名,显示边框高亮"
      },
      {
        "id": "3",
        "name": "开启\"选择导出\"后,显示el-tree组件,展示当前项目的所有节点(folder和文档节点)"
      },
      {
        "id": "4",
        "name": "统计信息实时更新:总数=allCheckedNodes.length,文件夹数量=type为folder的节点数,文档数量=type不为folder的节点数"
      },
      {
        "id": "5",
        "name": "点击导出后,触发handleExportAsApiflow方法"
      },
      {
        "id": "6",
        "name": "从apiNodesCache.getNodesByProjectId获取所有项目节点"
      },
      {
        "id": "7",
        "name": "根据选中节点ID过滤需要导出的节点,如果未选择则导出全部节点"
      },
      {
        "id": "8",
        "name": "生成的JSON文件结构:{ type: \"apiflow\", info: { projectName }, docs: [所有选中节点的完整数据] }"
      },
      {
        "id": "9",
        "name": "文件名格式:{项目名称}.json,contentType为application/json"
      },
      {
        "id": "10",
        "name": "使用downloadStringAsText方法触发浏览器下载,无需服务器交互"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Export.vue第202-238行:handleExportAsApiflow方法实现"
      },
      {
        "id": "2",
        "name": "Export.vue第17-20行:JSON文档选项,selectedType === \"moyu\"时显示.active类"
      },
      {
        "id": "3",
        "name": "Export.vue第123行:isStandalone = computed(() => runtimeStore.networkMode === \"offline\")"
      },
      {
        "id": "4",
        "name": "Export.vue第204-211行:从apiNodesCache获取节点并根据selectedIds过滤"
      },
      {
        "id": "5",
        "name": "Export.vue第212-218行:result对象结构包含type,info,docs三个字段"
      },
      {
        "id": "6",
        "name": "Export.vue第219行:downloadStringAsText(JSON.stringify(result), `${projectName}.json`, \"application/json\")"
      },
      {
        "id": "7",
        "name": "Export.vue第360行:selectedType.value === \"moyu\"时调用handleExportAsApiflow方法"
      },
      {
        "id": "8",
        "name": "Export.vue第48-79行:el-tree组件配置,show-checkbox启用复选框,node-key=\"_id\""
      },
      {
        "id": "9",
        "name": "Export.vue第131-134行:handleCheckChange方法合并getCheckedNodes和getHalfCheckedNodes"
      },
      {
        "id": "10",
        "name": "Export.vue第38-45行:统计信息显示,使用allCheckedNodes.length和filter统计不同类型节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Apiflow格式导出仅支持离线模式,在线模式使用/api/project/export/json接口"
      },
      {
        "id": "2",
        "name": "导出的JSON包含节点的完整结构:_id,pid,sort,info,item等字段"
      },
      {
        "id": "3",
        "name": "docs数组包含所有选中的节点,包括folder和文档节点"
      },
      {
        "id": "4",
        "name": "downloadStringAsText在helper模块中定义,创建Blob并触发a标签下载"
      },
      {
        "id": "5",
        "name": "选择导出功能通过SConfig组件实现,支持启用/禁用切换"
      },
      {
        "id": "6",
        "name": "el-tree的半选中节点(文件夹部分子节点被选中)也会包含在导出中"
      }
    ]
  },
  {
    "purpose": "导出openapi格式数据",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个HTTP节点(OpenAPI导出仅支持HTTP类型)"
      },
      {
        "id": "3",
        "name": "应用运行在离线模式(runtimeStore.networkMode === \"offline\")"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击项目工作区顶部导航栏中的\"导出\"按钮或菜单项"
      },
      {
        "id": "2",
        "name": "在导出弹窗中,点击选择\"OpenAPI\"类型(显示FileJson图标)"
      },
      {
        "id": "3",
        "name": "(可选)开启\"选择导出\"配置,勾选需要导出的HTTP节点"
      },
      {
        "id": "4",
        "name": "点击\"确定导出\"按钮"
      },
      {
        "id": "5",
        "name": "等待OpenAPIConverter转换完成,浏览器自动下载JSON文件"
      },
      {
        "id": "6",
        "name": "打开下载的JSON文件,验证符合OpenAPI 3.0规范"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "导出弹窗正确显示OpenAPI类型选项,图标为FileJson(lucide-vue-next图标库)"
      },
      {
        "id": "2",
        "name": "选择OpenAPI后,对应的.item元素添加.active类名"
      },
      {
        "id": "3",
        "name": "点击导出后,触发handleExportAsOpenAPI方法"
      },
      {
        "id": "4",
        "name": "如果不是离线模式,显示警告提示:\"OpenAPI导出仅支持离线模式\""
      },
      {
        "id": "5",
        "name": "从apiNodesCache获取所有项目节点,过滤出选中的HTTP节点(类型断言为HttpNode[])"
      },
      {
        "id": "6",
        "name": "创建OpenAPIConverter实例,调用convertToOpenAPI方法转换数据"
      },
      {
        "id": "7",
        "name": "生成的JSON文件符合OpenAPI 3.0规范,包含openapi,info,paths,components等字段"
      },
      {
        "id": "8",
        "name": "文件名格式:{项目名称}.openapi.json,contentType为application/json"
      },
      {
        "id": "9",
        "name": "JSON格式化输出,使用JSON.stringify的第三个参数为2(两空格缩进)"
      },
      {
        "id": "10",
        "name": "使用downloadStringAsText方法触发浏览器下载"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Export.vue第326-349行:handleExportAsOpenAPI方法实现"
      },
      {
        "id": "2",
        "name": "Export.vue第21-24行:OpenAPI选项,selectedType === \"openapi\"时显示.active类"
      },
      {
        "id": "3",
        "name": "Export.vue第327-330行:非离线模式时显示警告并return"
      },
      {
        "id": "4",
        "name": "Export.vue第338行:类型断言as HttpNode[],因为OpenAPI仅支持HTTP节点"
      },
      {
        "id": "5",
        "name": "Export.vue第339行:创建OpenAPIConverter实例"
      },
      {
        "id": "6",
        "name": "Export.vue第340-343行:调用converter.convertToOpenAPI(projectName, selectedDocs)"
      },
      {
        "id": "7",
        "name": "Export.vue第344-348行:downloadStringAsText导出,文件名包含.openapi后缀"
      },
      {
        "id": "8",
        "name": "Export.vue第345行:JSON.stringify第二个参数为null,第三个参数为2(格式化输出)"
      },
      {
        "id": "9",
        "name": "Export.vue第365-366行:selectedType === \"openapi\"时调用handleExportAsOpenAPI"
      },
      {
        "id": "10",
        "name": "openapi-converter.ts:OpenAPIConverter类实现转换逻辑,遵循OpenAPI 3.0规范"
      },
      {
        "id": "11",
        "name": "Export.vue第114行:import { OpenAPIConverter } from \"./openapi-converter\""
      },
      {
        "id": "12",
        "name": "Export.vue第22行:FileJson图标来自lucide-vue-next库,size=70, stroke-width=1.5"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "OpenAPI导出仅支持离线模式,确保数据安全性和完整性"
      },
      {
        "id": "2",
        "name": "OpenAPIConverter将Apiflow的HttpNode数据结构转换为OpenAPI 3.0规范格式"
      },
      {
        "id": "3",
        "name": "OpenAPI规范包含:请求方法,路径,参数(query/path/header/body),响应结构等"
      },
      {
        "id": "4",
        "name": "WebSocket节点不会被包含在OpenAPI导出中,需要过滤"
      },
      {
        "id": "5",
        "name": "导出的OpenAPI JSON可以被Swagger,Postman等工具导入使用"
      },
      {
        "id": "6",
        "name": "convertToOpenAPI方法的第一个参数为projectName,用于生成OpenAPI的info.title字段"
      }
    ]
  },
  {
    "purpose": "导出postman格式数据",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个HTTP节点"
      },
      {
        "id": "3",
        "name": "应用运行在离线模式"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击项目工作区顶部导航栏中的\"导出\"按钮"
      },
      {
        "id": "2",
        "name": "在导出弹窗中,点击选择\"Postman\"类型(如果已实现)"
      },
      {
        "id": "3",
        "name": "(可选)开启\"选择导出\"配置,勾选需要导出的节点"
      },
      {
        "id": "4",
        "name": "点击\"确定导出\"按钮"
      },
      {
        "id": "5",
        "name": "等待转换完成,浏览器自动下载JSON文件"
      },
      {
        "id": "6",
        "name": "使用Postman导入功能,导入下载的JSON文件验证兼容性"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "导出弹窗显示Postman类型选项(当前版本未实现,需要添加)"
      },
      {
        "id": "2",
        "name": "点击导出后,触发handleExportAsPostman方法"
      },
      {
        "id": "3",
        "name": "从apiNodesCache获取所有项目节点,过滤出选中的HTTP节点"
      },
      {
        "id": "4",
        "name": "创建PostmanConverter实例(类似OpenAPIConverter),调用convertToPostman方法"
      },
      {
        "id": "5",
        "name": "生成的JSON文件符合Postman Collection v2.1规范"
      },
      {
        "id": "6",
        "name": "文件名格式:{项目名称}.postman_collection.json,contentType为application/json"
      },
      {
        "id": "7",
        "name": "JSON包含info,item,variable等字段,符合Postman格式"
      },
      {
        "id": "8",
        "name": "使用downloadStringAsText方法触发浏览器下载"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Export.vue需要添加Postman选项:selectedType类型联合添加\"postman\""
      },
      {
        "id": "2",
        "name": "Export.vue需要添加handleExportAsPostman方法(参考handleExportAsOpenAPI实现)"
      },
      {
        "id": "3",
        "name": "需要创建postman-converter.ts文件,实现PostmanConverter类"
      },
      {
        "id": "4",
        "name": "PostmanConverter.convertToPostman方法将HttpNode转换为Postman Collection格式"
      },
      {
        "id": "5",
        "name": "Postman Collection包含:info.name,info.schema,item数组等字段"
      },
      {
        "id": "6",
        "name": "item数组中每个元素包含:name,request(method,url,header,body),response等"
      },
      {
        "id": "7",
        "name": "handleExport方法的switch中添加postman分支调用handleExportAsPostman"
      },
      {
        "id": "8",
        "name": "导出功能仅支持离线模式,需要检查isStandalone.value"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Postman导出功能当前未实现,这是计划中的功能"
      },
      {
        "id": "2",
        "name": "实现方式可参考OpenAPI导出:创建转换器类,实现格式转换逻辑"
      },
      {
        "id": "3",
        "name": "Postman Collection v2.1规范文档:https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html"
      },
      {
        "id": "4",
        "name": "需要将Apiflow的HttpNode.item数据映射到Postman的request格式"
      },
      {
        "id": "5",
        "name": "Postman支持文件夹结构,需要处理folder节点转换为Postman的item.item嵌套结构"
      },
      {
        "id": "6",
        "name": "变量需要映射到Postman的variable数组,格式:{ key, value, type }"
      }
    ]
  }
],
}

export default node
