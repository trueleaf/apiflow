import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "codeRepoImport",
  description: "通过代码仓库识别接口",
  children: [],
  atomicFunc: [
  {
    "purpose": "搜索go,java,nodejs,python等常见后端应用框架,模拟这些框架项目数据,使用大模型进行解析,需要完整展示所有数据",
    "precondition": [
      {
        "id": "1",
        "name": "【功能未实现】代码仓库导入功能当前版本尚未开发"
      },
      {
        "id": "2",
        "name": "Import.vue的importTypes数组不包含代码仓库导入选项"
      },
      {
        "id": "3",
        "name": "预期功能:用户提供代码仓库地址(Git URL或本地路径)"
      },
      {
        "id": "4",
        "name": "预期功能:系统自动识别后端框架类型(Go Gin/Echo,Java Spring,Node.js Express/Koa,Python Flask/Django等)"
      },
      {
        "id": "5",
        "name": "预期功能:通过AI大模型分析代码,提取路由定义和API端点信息"
      },
      {
        "id": "6",
        "name": "预期功能:自动生成对应的apiflow格式API节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "【待实现】在导入对话框中添加新的导入方式选项:带有GitBranch图标的\"代码仓库识别\""
      },
      {
        "id": "2",
        "name": "【待实现】点击\"代码仓库识别\"选项,切换currentImportType为\"repository\""
      },
      {
        "id": "3",
        "name": "【待实现】显示代码仓库配置表单:仓库地址(Git URL/本地路径),分支名称,认证信息(可选)"
      },
      {
        "id": "4",
        "name": "【待实现】用户输入仓库地址(如https://github.com/user/project.git)或选择本地项目文件夹"
      },
      {
        "id": "5",
        "name": "【待实现】点击\"开始分析\"按钮,系统克隆/读取代码仓库"
      },
      {
        "id": "6",
        "name": "【待实现】AI分析项目结构,识别框架类型(检测package.json,pom.xml,go.mod,requirements.txt等)"
      },
      {
        "id": "7",
        "name": "【待实现】AI扫描路由定义文件(如Go的router.go,Java的Controller类,Node.js的routes.js等)"
      },
      {
        "id": "8",
        "name": "【待实现】AI提取API端点信息:路径,HTTP方法,参数,中间件,注释文档等"
      },
      {
        "id": "9",
        "name": "【待实现】显示识别结果预览,包含框架类型,识别到的API数量,节点树结构"
      },
      {
        "id": "10",
        "name": "【待实现】用户确认识别结果,可以筛选需要导入的API"
      },
      {
        "id": "11",
        "name": "【待实现】选择导入方式(追加/覆盖)和目标目录"
      },
      {
        "id": "12",
        "name": "【待实现】点击\"确认导入\"按钮,将识别的API导入项目"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "【功能未实现】当前版本Import.vue不包含代码仓库导入功能"
      },
      {
        "id": "2",
        "name": "【预期行为】支持主流后端框架:Go (Gin/Echo/Beego),Java (Spring Boot/Spring MVC),Node.js (Express/Koa/Fastify),Python (Flask/Django/FastAPI)"
      },
      {
        "id": "3",
        "name": "【预期行为】AI能够识别RESTful路由定义:@GetMapping,router.GET,@app.route等注解和方法"
      },
      {
        "id": "4",
        "name": "【预期行为】提取完整的API信息:路径参数,查询参数,请求体,响应格式,权限要求等"
      },
      {
        "id": "5",
        "name": "【预期行为】保持代码中的文件夹结构:按Controller/Router文件组织,或按模块/包名组织"
      },
      {
        "id": "6",
        "name": "【预期行为】提取代码注释作为API文档(如Swagger注解,JSDoc注释等)"
      },
      {
        "id": "7",
        "name": "【预期行为】转换后的数据符合apiflow的HttpNode结构定义"
      },
      {
        "id": "8",
        "name": "【预期行为】支持增量更新:再次分析同一仓库时,识别新增/修改/删除的API"
      },
      {
        "id": "9",
        "name": "【预期行为】分析过程显示进度(克隆代码,识别框架,扫描文件,提取API等阶段)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "【待开发】Import.vue需要添加代码仓库导入的UI入口和表单"
      },
      {
        "id": "2",
        "name": "【待开发】需要集成Git操作(克隆仓库)或文件系统访问(读取本地项目)"
      },
      {
        "id": "3",
        "name": "【待开发】框架识别逻辑:通过依赖文件和项目结构判断框架类型"
      },
      {
        "id": "4",
        "name": "【待开发】AI prompt设计:针对不同框架的路由定义模式,提供识别规则"
      },
      {
        "id": "5",
        "name": "【待开发】代码解析:使用AST(抽象语法树)或正则表达式提取路由信息"
      },
      {
        "id": "6",
        "name": "【待开发】AI辅助理解:处理复杂路由逻辑(中间件,路由组,动态路由等)"
      },
      {
        "id": "7",
        "name": "【待开发】注释文档提取:解析Swagger/OpenAPI注解,JSDoc,Godoc等"
      },
      {
        "id": "8",
        "name": "【待开发】错误处理:仓库不可访问,框架不支持,代码解析失败等异常"
      },
      {
        "id": "9",
        "name": "【待开发】安全性:避免执行仓库中的恶意代码,沙箱化分析环境"
      },
      {
        "id": "10",
        "name": "导入逻辑复用:转换后调用现有的appendNodes/replaceAllNodes方法"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "代码仓库导入功能当前版本(截至编写时)尚未实现,此测试用例描述预期功能"
      },
      {
        "id": "2",
        "name": "实现建议:可以参考swagger-jsdoc,go-swagger等工具的代码分析方法"
      },
      {
        "id": "3",
        "name": "实现建议:对于复杂框架(如Spring),可以利用框架自带的元数据导出功能"
      },
      {
        "id": "4",
        "name": "实现建议:本地分析优先(避免频繁克隆代码),缓存分析结果"
      },
      {
        "id": "5",
        "name": "实现建议:支持配置文件(.apiflowrc)指定需要扫描的路径和排除规则"
      },
      {
        "id": "6",
        "name": "技术难点:不同框架的路由定义差异大,需要为每种框架编写专门的解析规则"
      },
      {
        "id": "7",
        "name": "技术难点:动态路由和中间件的识别(如权限校验,参数验证等)"
      },
      {
        "id": "8",
        "name": "技术难点:处理大型项目(数千个API)时的性能优化"
      },
      {
        "id": "9",
        "name": "用户价值:前后端协作场景,后端代码变更后自动同步到API文档"
      },
      {
        "id": "10",
        "name": "用户价值:新项目快速生成API文档,减少手动录入工作量"
      }
    ]
  },
  {
    "purpose": "验证追加方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "【功能未实现】代码仓库导入功能已开发完成(当前未实现)"
      },
      {
        "id": "2",
        "name": "已成功分析代码仓库,提取API端点信息并转换为apiflow格式"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开导入对话框,选择\"代码仓库识别\"导入方式"
      },
      {
        "id": "4",
        "name": "formInfo.value.moyuData.docs包含从代码仓库提取的API节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在\"导入方式\"区域选择\"追加\"选项(formInfo.value.cover = false)"
      },
      {
        "id": "2",
        "name": "场景1:不选择目标目录,直接点击\"确认导入\""
      },
      {
        "id": "3",
        "name": "观察从代码仓库提取的API节点是否追加到项目根目录"
      },
      {
        "id": "4",
        "name": "验证原有节点未被删除,代码仓库节点保持原有模块结构"
      },
      {
        "id": "5",
        "name": "场景2:在el-tree中选择一个文件夹作为目标目录"
      },
      {
        "id": "6",
        "name": "点击\"确认导入\"按钮"
      },
      {
        "id": "7",
        "name": "观察API节点是否追加到选中的文件夹下,保持代码中的Controller/模块层级"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "【预期行为】代码仓库提取的数据追加导入行为与apiflow格式完全一致"
      },
      {
        "id": "2",
        "name": "【预期行为】不选择目标目录时,提取的根节点pid为null,位于项目根目录"
      },
      {
        "id": "3",
        "name": "【预期行为】选择目标目录时,提取的根节点pid设置为选中文件夹的_id"
      },
      {
        "id": "4",
        "name": "【预期行为】代码中的模块/包结构映射为apiflow的文件夹层级"
      },
      {
        "id": "5",
        "name": "【预期行为】同一Controller/Router的API归入同一文件夹"
      },
      {
        "id": "6",
        "name": "【预期行为】原项目节点不受影响,代码仓库节点与手动创建的节点共存"
      },
      {
        "id": "7",
        "name": "【预期行为】导入成功后显示统计信息(识别到N个API,导入M个节点)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "代码仓库转换输出的数据结构必须符合HttpNode类型定义"
      },
      {
        "id": "2",
        "name": "pid处理逻辑复用Import.vue第498-506行:(!val.pid && mountedId) ? mountedId : val.pid"
      },
      {
        "id": "3",
        "name": "追加操作调用apiNodesCache.appendNodes()方法"
      },
      {
        "id": "4",
        "name": "提取时需要正确设置节点的type字段(folder用于模块,api用于端点)"
      },
      {
        "id": "5",
        "name": "提取时需要生成唯一的_id字段,避免与现有节点冲突"
      },
      {
        "id": "6",
        "name": "提取的API需要包含完整的url,method,params,headers等字段"
      },
      {
        "id": "7",
        "name": "代码注释转换为节点的description字段"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例为代码仓库导入功能实现后的预期行为描述"
      },
      {
        "id": "2",
        "name": "代码仓库分析结果可以缓存,再次导入时提示用户是否使用缓存"
      },
      {
        "id": "3",
        "name": "建议支持部分导入:用户可以在预览界面取消勾选不需要的API"
      }
    ]
  },
  {
    "purpose": "验证覆盖方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "【功能未实现】代码仓库导入功能已开发完成(当前未实现)"
      },
      {
        "id": "2",
        "name": "已成功分析代码仓库,提取API端点信息并转换为apiflow格式"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开导入对话框,选择\"代码仓库识别\"导入方式"
      },
      {
        "id": "4",
        "name": "formInfo.value.moyuData.docs包含从代码仓库提取的API节点数据"
      },
      {
        "id": "5",
        "name": "当前项目已存在一些节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在\"导入方式\"区域选择\"覆盖\"选项(formInfo.value.cover = true)"
      },
      {
        "id": "2",
        "name": "场景1:不选择目标目录,直接点击\"确认导入\""
      },
      {
        "id": "3",
        "name": "在el-message-box确认对话框中查看警告内容并点击\"确定\""
      },
      {
        "id": "4",
        "name": "观察项目原有节点是否被清空,代码仓库提取的API是否完全替换"
      },
      {
        "id": "5",
        "name": "场景2:选择一个文件夹作为目标目录,点击\"确认导入\""
      },
      {
        "id": "6",
        "name": "确认覆盖操作"
      },
      {
        "id": "7",
        "name": "观察代码仓库API节点的组织结构是否正确"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "【预期行为】代码仓库提取的数据覆盖导入行为与apiflow格式完全一致"
      },
      {
        "id": "2",
        "name": "【预期行为】覆盖导入前弹出确认对话框,警告数据丢失风险"
      },
      {
        "id": "3",
        "name": "【预期行为】确认后,项目原有所有节点被清空"
      },
      {
        "id": "4",
        "name": "【预期行为】代码仓库API完全替换项目内容,保持代码中的模块层级关系"
      },
      {
        "id": "5",
        "name": "【预期行为】选择目标目录时,提取的根节点的pid被设置为选中文件夹的_id"
      },
      {
        "id": "6",
        "name": "【预期行为】覆盖后项目结构完全反映代码仓库的API组织方式"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Import.vue第478-485行:覆盖导入确认对话框"
      },
      {
        "id": "2",
        "name": "Import.vue第508-513行:覆盖导入判断逻辑"
      },
      {
        "id": "3",
        "name": "覆盖操作调用apiNodesCache.replaceAllNodes()方法"
      },
      {
        "id": "4",
        "name": "代码仓库提取数据的完整性校验:确保所有必需字段都已填充"
      },
      {
        "id": "5",
        "name": "提取的文件夹节点和API节点的pid关系正确建立"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例为代码仓库导入功能实现后的预期行为描述"
      },
      {
        "id": "2",
        "name": "覆盖导入适用场景:初始化新项目,直接将后端代码的API结构同步到apiflow"
      },
      {
        "id": "3",
        "name": "建议提供\"同步\"功能:定期分析代码仓库,自动更新变更的API(增量覆盖)"
      },
      {
        "id": "4",
        "name": "覆盖导入是破坏性操作,确认对话框应显示识别到的API数量和模块结构预览"
      }
    ]
  }
],
}

export default node
