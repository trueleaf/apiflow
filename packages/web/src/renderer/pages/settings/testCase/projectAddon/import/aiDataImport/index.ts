import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "ai识别数据类型进行导入",
  description: "ai识别数据类型进行导入",
  children: [],
  atomicFunc: [
  {
    "purpose": "搜索afx支持的所有导入类型,模拟这些数据,通过大模型对其进行转换,需要完整展示所有数据",
    "precondition": [
      {
        "id": "1",
        "name": "【功能未实现】AI导入功能当前版本尚未开发"
      },
      {
        "id": "2",
        "name": "Import.vue的importTypes数组仅包含file,url,paste三种导入方式,无AI选项"
      },
      {
        "id": "3",
        "name": "预期功能:用户上传任意格式的API文档数据(JSON/YAML/文本等)"
      },
      {
        "id": "4",
        "name": "预期功能:通过AI大模型自动识别数据格式和结构"
      },
      {
        "id": "5",
        "name": "预期功能:AI将识别出的数据转换为apiflow格式"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "【待实现】在导入对话框中添加新的导入方式选项:带有Sparkles图标的\"AI智能识别\""
      },
      {
        "id": "2",
        "name": "【待实现】点击\"AI智能识别\"选项,切换currentImportType为\"ai\""
      },
      {
        "id": "3",
        "name": "【待实现】显示文件上传区域或文本粘贴区域,支持多种格式输入"
      },
      {
        "id": "4",
        "name": "【待实现】用户上传/粘贴未知格式的API文档数据(如非标准JSON,自定义格式等)"
      },
      {
        "id": "5",
        "name": "【待实现】点击\"开始识别\"按钮,调用AI服务进行格式识别"
      },
      {
        "id": "6",
        "name": "【待实现】AI分析数据结构,识别可能的格式类型(OpenAPI/Postman/Swagger/自定义等)"
      },
      {
        "id": "7",
        "name": "【待实现】AI提取API端点,方法,参数,响应等信息"
      },
      {
        "id": "8",
        "name": "【待实现】显示识别结果预览,包含转换后的节点树结构"
      },
      {
        "id": "9",
        "name": "【待实现】用户确认识别结果,选择导入方式(追加/覆盖)"
      },
      {
        "id": "10",
        "name": "【待实现】点击\"确认导入\"按钮,将AI转换的数据导入项目"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "【功能未实现】当前版本Import.vue不包含AI导入功能"
      },
      {
        "id": "2",
        "name": "【预期行为】AI能够识别apiflow,OpenAPI,Postman,Swagger等标准格式"
      },
      {
        "id": "3",
        "name": "【预期行为】AI能够处理非标准格式或格式混合的文档数据"
      },
      {
        "id": "4",
        "name": "【预期行为】AI提取的API信息包括:URL,HTTP方法,请求头,请求体,响应示例等"
      },
      {
        "id": "5",
        "name": "【预期行为】AI识别结果以可视化方式展示,用户可以编辑修正"
      },
      {
        "id": "6",
        "name": "【预期行为】转换后的数据符合apiflow的HttpNode结构定义"
      },
      {
        "id": "7",
        "name": "【预期行为】导入过程支持进度显示和错误提示"
      },
      {
        "id": "8",
        "name": "【预期行为】AI识别失败时提供降级方案(手动选择格式或编辑数据)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "【待开发】Import.vue需要添加AI导入的UI入口和交互流程"
      },
      {
        "id": "2",
        "name": "【待开发】需要集成AI服务(如通过aiStore调用AI API)"
      },
      {
        "id": "3",
        "name": "【待开发】AI prompt设计:明确输入输出格式,提供API文档示例作为few-shot"
      },
      {
        "id": "4",
        "name": "【待开发】AI响应解析:将AI返回的结构化数据转换为HttpNode数组"
      },
      {
        "id": "5",
        "name": "【待开发】错误处理:AI服务不可用,识别失败,数据格式错误等异常情况"
      },
      {
        "id": "6",
        "name": "【待开发】识别结果预览组件:以树形结构展示AI提取的API节点"
      },
      {
        "id": "7",
        "name": "【待开发】用户编辑功能:允许用户修正AI识别的错误或遗漏"
      },
      {
        "id": "8",
        "name": "导入逻辑复用:AI转换后调用现有的appendNodes/replaceAllNodes方法"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "AI识别导入功能当前版本(截至编写时)尚未实现,此测试用例描述预期功能"
      },
      {
        "id": "2",
        "name": "实现建议:可以参考aiStore(src/renderer/store/aiStore)的AI调用方式"
      },
      {
        "id": "3",
        "name": "实现建议:AI prompt可以包含apiflow,OpenAPI,Postman格式的schema定义作为参考"
      },
      {
        "id": "4",
        "name": "实现建议:支持增量识别(用户可以分批上传,AI逐步识别)"
      },
      {
        "id": "5",
        "name": "实现建议:AI识别历史记录保存,便于用户回溯和复用"
      },
      {
        "id": "6",
        "name": "技术难点:AI输出的稳定性和准确性,需要充分测试各种格式的文档"
      },
      {
        "id": "7",
        "name": "技术难点:处理大文档时的性能优化(分块处理,流式输出等)"
      },
      {
        "id": "8",
        "name": "用户价值:降低导入门槛,支持非标准格式的API文档快速导入"
      }
    ]
  },
  {
    "purpose": "验证追加方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "【功能未实现】AI识别导入功能已开发完成(当前未实现)"
      },
      {
        "id": "2",
        "name": "AI能够成功识别并转换API文档数据为apiflow格式"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开导入对话框,选择\"AI智能识别\"导入方式"
      },
      {
        "id": "4",
        "name": "AI已完成数据识别,formInfo.value.moyuData.docs包含转换后的节点数据"
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
        "name": "观察AI转换的节点是否追加到项目根目录"
      },
      {
        "id": "4",
        "name": "验证原有节点未被删除,新节点排在同级节点最后"
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
        "name": "观察AI转换的节点是否追加到选中的文件夹下"
      },
      {
        "id": "8",
        "name": "验证AI识别的层级关系是否正确保持"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "【预期行为】AI转换的数据追加导入行为与apiflow格式完全一致"
      },
      {
        "id": "2",
        "name": "【预期行为】不选择目标目录时,AI转换的根节点pid为null,位于项目根目录"
      },
      {
        "id": "3",
        "name": "【预期行为】选择目标目录时,AI转换的根节点pid设置为选中文件夹的_id"
      },
      {
        "id": "4",
        "name": "【预期行为】AI识别的文件夹和请求节点的嵌套关系正确保持"
      },
      {
        "id": "5",
        "name": "【预期行为】原项目节点不受影响,新旧节点共存"
      },
      {
        "id": "6",
        "name": "【预期行为】导入成功后显示成功提示,bannerStore刷新文档统计"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "AI转换输出的数据结构必须符合HttpNode类型定义"
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
        "name": "AI转换时需要正确设置节点的type字段(folder或api)"
      },
      {
        "id": "5",
        "name": "AI转换时需要生成唯一的_id字段(可以使用nanoid)"
      },
      {
        "id": "6",
        "name": "AI转换时需要设置合理的sort字段以控制节点排序"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例为AI导入功能实现后的预期行为描述"
      },
      {
        "id": "2",
        "name": "AI转换后的数据导入流程完全复用现有的导入逻辑,无需额外开发"
      },
      {
        "id": "3",
        "name": "AI识别的准确性直接影响导入质量,建议提供人工校验环节"
      }
    ]
  },
  {
    "purpose": "验证覆盖方式选择目标目录和不选择目标目录情况",
    "precondition": [
      {
        "id": "1",
        "name": "【功能未实现】AI识别导入功能已开发完成(当前未实现)"
      },
      {
        "id": "2",
        "name": "AI能够成功识别并转换API文档数据为apiflow格式"
      },
      {
        "id": "3",
        "name": "已在任意项目中打开导入对话框,选择\"AI智能识别\"导入方式"
      },
      {
        "id": "4",
        "name": "AI已完成数据识别,formInfo.value.moyuData.docs包含转换后的节点数据"
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
        "name": "观察项目原有节点是否被清空,AI转换的节点是否完全替换"
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
        "name": "观察AI转换节点的pid关系是否正确"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "【预期行为】AI转换的数据覆盖导入行为与apiflow格式完全一致"
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
        "name": "【预期行为】AI转换的节点完全替换项目内容,保持原有层级关系"
      },
      {
        "id": "5",
        "name": "【预期行为】选择目标目录时,AI转换的根节点的pid被设置为选中文件夹的_id"
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
        "name": "AI转换数据的完整性校验:确保所有必需字段都已填充"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试用例为AI导入功能实现后的预期行为描述"
      },
      {
        "id": "2",
        "name": "AI识别大量API时需要考虑性能,建议显示识别进度"
      },
      {
        "id": "3",
        "name": "覆盖导入是破坏性操作,建议在确认对话框中显示AI识别的节点数量"
      }
    ]
  }
],
}

export default node
