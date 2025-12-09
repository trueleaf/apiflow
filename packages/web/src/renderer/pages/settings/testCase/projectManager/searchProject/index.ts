import { type ModelNode } from '../../types'

const node: ModelNode = {
  modelName: "searchProject",
  description: "搜索项目",
  children: [],
  atomicFunc: [
  {
    "purpose": "没有搜索结果需要展示暂无搜索结果提示",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载,存在至少一个项目"
      },
      {
        "id": "3",
        "name": "简单搜索模式已激活(未点击高级搜索按钮)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到首页顶部的搜索输入框(data-testid=\"home-project-search-input\")"
      },
      {
        "id": "2",
        "name": "在搜索框中输入一个不存在的项目名称,例如:\"不存在的项目xyz123\""
      },
      {
        "id": "3",
        "name": "等待300ms防抖延迟"
      },
      {
        "id": "4",
        "name": "观察项目列表区域的变化"
      },
      {
        "id": "5",
        "name": "检查是否显示空状态提示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入后,projectName.value更新为\"不存在的项目xyz123\""
      },
      {
        "id": "2",
        "name": "300ms后debounceSearch方法执行"
      },
      {
        "id": "3",
        "name": "projectList computed重新计算,filter结果为空数组"
      },
      {
        "id": "4",
        "name": "starProjects computed也为空数组(收藏的项目也不匹配)"
      },
      {
        "id": "5",
        "name": "\"收藏的项目\"区域不显示(v-show=\"starProjects.length > 0\"为false)"
      },
      {
        "id": "6",
        "name": "\"全部项目\"区域显示el-empty组件"
      },
      {
        "id": "7",
        "name": "el-empty组件显示描述文字:\"暂无项目,点击上方按钮创建第一个项目\""
      },
      {
        "id": "8",
        "name": "el-empty组件显示默认的空状态图标"
      },
      {
        "id": "9",
        "name": "项目卡片列表不显示任何卡片"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "搜索输入框绑定:v-model=\"projectName\"(ProjectManager.vue 行4)"
      },
      {
        "id": "2",
        "name": "输入事件绑定:@input=\"debounceSearch\" @change=\"debounceSearch\"(行6-7)"
      },
      {
        "id": "3",
        "name": "debounceSearch使用lodash的debounce,延迟300ms(行512-517)"
      },
      {
        "id": "4",
        "name": "projectList computed过滤逻辑:val.projectName.match(new RegExp(projectName.value, \"gi\"))(行287-298)"
      },
      {
        "id": "5",
        "name": "正则匹配不区分大小写(\"gi\"标志)"
      },
      {
        "id": "6",
        "name": "匹配失败时filter返回空数组"
      },
      {
        "id": "7",
        "name": "isEmptyState computed计算:projectList.length === 0 && !projectLoading(行315)"
      },
      {
        "id": "8",
        "name": "空状态容器条件渲染:v-if=\"isEmptyState && !isFold\"(行114-116)"
      },
      {
        "id": "9",
        "name": "el-empty组件显示,description属性绑定i18n文本"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "简单搜索只搜索项目名称(projectName字段)"
      },
      {
        "id": "2",
        "name": "搜索支持正则表达式,不区分大小写"
      },
      {
        "id": "3",
        "name": "防抖延迟300ms,避免用户输入时频繁触发计算"
      },
      {
        "id": "4",
        "name": "空状态提示文案可能不太准确(实际是搜索无结果,但提示\"创建第一个项目\")"
      },
      {
        "id": "5",
        "name": "清空搜索框后,项目列表恢复显示所有项目"
      }
    ]
  },
  {
    "purpose": "搜索限制条件展示以下内容:\n                        1. 基础信息:项目名称,文档名称,请求URL,创建者(单机模式不需要),维护者(单机模式不需要),请求方法,备注\n                        2. 节点类型:目录,http节点,websocket节点,httpMock节点,websocketMock节点\n                        3. 请求参数:Query参数,Path参数,请求头参数,Body参数,返回参数,前置脚本,后置脚本,websocket消息内容\n                        4. 更新日期:不限制,最近三天,最近一周,最近一个月,最近三个月,自定义(选择自定义后出现日期范围选择)\n                      ",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "项目列表已加载"
      },
      {
        "id": "3",
        "name": "AdvancedSearchPanel.vue组件已注册并可用"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击搜索框右侧的\"高级搜索\"按钮(Tools图标,data-testid=\"home-advanced-search-btn\")"
      },
      {
        "id": "2",
        "name": "观察高级搜索面板是否展开显示"
      },
      {
        "id": "3",
        "name": "逐一检查\"基础信息\"区域的所有复选框选项"
      },
      {
        "id": "4",
        "name": "逐一检查\"节点类型\"区域的所有复选框选项"
      },
      {
        "id": "5",
        "name": "逐一检查\"请求参数\"区域的所有复选框选项"
      },
      {
        "id": "6",
        "name": "检查\"更新日期\"区域的所有单选按钮选项"
      },
      {
        "id": "7",
        "name": "选择\"自定义\"单选按钮,观察日期选择器是否显示"
      },
      {
        "id": "8",
        "name": "在离线模式下检查\"创建者\"和\"维护者\"选项是否隐藏"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击高级搜索按钮后,showAdvancedSearch.value变为true"
      },
      {
        "id": "2",
        "name": "高级搜索面板(AdvancedSearchPanel组件)正确渲染并显示"
      },
      {
        "id": "3",
        "name": "基础信息区域显示7个复选框:项目名称,文档名称,请求URL,创建者,维护者,请求方法,备注"
      },
      {
        "id": "4",
        "name": "离线模式下,\"创建者\"和\"维护者\"复选框隐藏(v-if=\"!isStandalone\")"
      },
      {
        "id": "5",
        "name": "节点类型区域显示4个复选框:目录,HTTP节点,WebSocket节点,HTTP Mock节点"
      },
      {
        "id": "6",
        "name": "请求参数区域显示8个复选框:Query参数,Path参数,请求头,Body,返回参数,前置脚本,后置脚本,WebSocket消息"
      },
      {
        "id": "7",
        "name": "更新日期区域显示6个单选按钮:不限制,最近3天,最近1周,最近1月,最近3月,自定义"
      },
      {
        "id": "8",
        "name": "选择\"自定义\"后,显示el-date-picker日期范围选择器"
      },
      {
        "id": "9",
        "name": "日期选择器类型为daterange,可以选择开始日期和结束日期"
      },
      {
        "id": "10",
        "name": "面板底部显示\"重置\"和\"搜索\"两个按钮"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "AdvancedSearchPanel组件路径:pages/home/projectManager/advancedSearch/AdvancedSearchPanel.vue(行1-179)"
      },
      {
        "id": "2",
        "name": "toggleAdvancedSearch方法切换showAdvancedSearch状态(ProjectManager.vue 行567-569)"
      },
      {
        "id": "3",
        "name": "searchConditions.value.searchScope包含所有搜索范围字段(行522-545)"
      },
      {
        "id": "4",
        "name": "searchScope字段:projectName, docName, url, creator, maintainer, method, remark(基础信息)"
      },
      {
        "id": "5",
        "name": "searchScope字段:folder, http, websocket, httpMock(节点类型)"
      },
      {
        "id": "6",
        "name": "searchScope字段:query, path, headers, body, response, preScript, afterScript, wsMessage(请求参数)"
      },
      {
        "id": "7",
        "name": "searchConditions.value.dateRange包含:type, customStart, customEnd"
      },
      {
        "id": "8",
        "name": "dateRange.type可选值:\"unlimited\" | \"recent3days\" | \"recent1week\" | \"recent1month\" | \"recent3months\" | \"custom\""
      },
      {
        "id": "9",
        "name": "创建者和维护者checkbox条件渲染:v-if=\"!isStandalone\"(AdvancedSearchPanel.vue 行14-20)"
      },
      {
        "id": "10",
        "name": "自定义日期选择器条件渲染:v-if=\"dateRange.type === 'custom'\"(行67-72)"
      },
      {
        "id": "11",
        "name": "AdvancedSearchConditions类型定义:types/advancedSearch.ts(行4-32)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "高级搜索面板使用el-card组件包裹,带有阴影效果"
      },
      {
        "id": "2",
        "name": "搜索范围使用el-checkbox-group和el-checkbox实现"
      },
      {
        "id": "3",
        "name": "更新日期使用el-radio-group和el-radio实现"
      },
      {
        "id": "4",
        "name": "所有复选框默认勾选状态由searchConditions.value.searchScope初始值决定"
      },
      {
        "id": "5",
        "name": "重置按钮调用handleReset方法,恢复所有条件为默认值"
      },
      {
        "id": "6",
        "name": "搜索按钮触发高级搜索执行,调用useAdvancedSearch composable的performAdvancedSearch方法"
      }
    ]
  },
  {
    "purpose": "模拟数据验证每个搜索限制条件都生效",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于离线模式"
      },
      {
        "id": "2",
        "name": "已创建测试项目和测试节点,包含各种类型和数据"
      },
      {
        "id": "3",
        "name": "测试数据包含:不同类型节点(http,websocket,httpMock,folder)"
      },
      {
        "id": "4",
        "name": "测试数据包含:不同请求方法(GET,POST,PUT,DELETE)"
      },
      {
        "id": "5",
        "name": "测试数据包含:不同更新时间(3天内,1周内,1月内,3月内)"
      },
      {
        "id": "6",
        "name": "测试数据包含:不同字段内容(URL,请求参数,脚本等)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击高级搜索按钮,展开搜索面板"
      },
      {
        "id": "2",
        "name": "测试基础信息搜索:只勾选\"项目名称\",输入关键词,验证只匹配项目名称"
      },
      {
        "id": "3",
        "name": "测试基础信息搜索:只勾选\"文档名称\",输入关键词,验证只匹配节点名称"
      },
      {
        "id": "4",
        "name": "测试基础信息搜索:只勾选\"请求URL\",输入关键词,验证只匹配URL字段"
      },
      {
        "id": "5",
        "name": "测试基础信息搜索:只勾选\"请求方法\",输入\"POST\",验证只返回POST方法的节点"
      },
      {
        "id": "6",
        "name": "测试节点类型搜索:只勾选\"HTTP节点\",验证只返回type=\"http\"的节点"
      },
      {
        "id": "7",
        "name": "测试节点类型搜索:只勾选\"WebSocket节点\",验证只返回type=\"websocket\"的节点"
      },
      {
        "id": "8",
        "name": "测试节点类型搜索:只勾选\"目录\",验证只返回type=\"folder\"的节点"
      },
      {
        "id": "9",
        "name": "测试请求参数搜索:只勾选\"Query参数\",输入关键词,验证只匹配query字段"
      },
      {
        "id": "10",
        "name": "测试请求参数搜索:只勾选\"Body参数\",输入关键词,验证只匹配body字段"
      },
      {
        "id": "11",
        "name": "测试请求参数搜索:只勾选\"前置脚本\",输入关键词,验证只匹配preRequestScript字段"
      },
      {
        "id": "12",
        "name": "测试更新日期搜索:选择\"最近3天\",验证只返回3天内更新的节点"
      },
      {
        "id": "13",
        "name": "测试更新日期搜索:选择\"最近1周\",验证只返回1周内更新的节点"
      },
      {
        "id": "14",
        "name": "测试更新日期搜索:选择\"自定义\",指定日期范围,验证只返回范围内的节点"
      },
      {
        "id": "15",
        "name": "测试组合条件:勾选多个搜索范围,验证OR逻辑(匹配任一字段即返回)"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "每个搜索条件都能正确过滤节点"
      },
      {
        "id": "2",
        "name": "只勾选项目名称时,节点名称,URL等字段包含关键词的节点不返回"
      },
      {
        "id": "3",
        "name": "节点类型过滤准确,只返回指定类型的节点"
      },
      {
        "id": "4",
        "name": "请求方法过滤准确,只返回指定方法的HTTP节点"
      },
      {
        "id": "5",
        "name": "请求参数搜索能深入到节点内部的各个字段(query,path,headers,body等)"
      },
      {
        "id": "6",
        "name": "日期范围搜索准确,基于节点的updatedAt字段"
      },
      {
        "id": "7",
        "name": "最近3天:过滤条件为now - 3 * 24 * 60 * 60 * 1000 <= updatedAt"
      },
      {
        "id": "8",
        "name": "最近1周:过滤条件为now - 7 * 24 * 60 * 60 * 1000 <= updatedAt"
      },
      {
        "id": "9",
        "name": "最近1月:过滤条件为now - 30 * 24 * 60 * 60 * 1000 <= updatedAt"
      },
      {
        "id": "10",
        "name": "最近3月:过滤条件为now - 90 * 24 * 60 * 60 * 1000 <= updatedAt"
      },
      {
        "id": "11",
        "name": "自定义日期:customStart <= updatedAt <= customEnd"
      },
      {
        "id": "12",
        "name": "组合条件时,搜索范围使用OR逻辑,节点类型和日期范围使用AND逻辑"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "useAdvancedSearch composable路径:composables/useAdvancedSearch.ts(行1-325)"
      },
      {
        "id": "2",
        "name": "performAdvancedSearch方法执行搜索(行295-324)"
      },
      {
        "id": "3",
        "name": "checkNodeType方法验证节点类型(行11-30)"
      },
      {
        "id": "4",
        "name": "checkDateRange方法验证日期范围(行32-57)"
      },
      {
        "id": "5",
        "name": "matchBasicInfo方法匹配基础信息字段(行76-112)"
      },
      {
        "id": "6",
        "name": "matchRequestParams方法匹配请求参数字段(行114-241)"
      },
      {
        "id": "7",
        "name": "matchNodesInBatches方法分批处理节点,批大小为50(行274-293)"
      },
      {
        "id": "8",
        "name": "关键词匹配使用String.includes(),不区分大小写(toLowerCase())"
      },
      {
        "id": "9",
        "name": "节点类型检查:conditions.searchScope[nodeType]为true时才匹配"
      },
      {
        "id": "10",
        "name": "日期计算:new Date(node.updatedAt).getTime()转换为时间戳"
      },
      {
        "id": "11",
        "name": "matchBasicInfo返回matchedFields数组,记录匹配的字段名"
      },
      {
        "id": "12",
        "name": "matchRequestParams深入检查params,query,path,headers,body等字段"
      },
      {
        "id": "13",
        "name": "搜索结果按updatedAt倒序排序"
      },
      {
        "id": "14",
        "name": "每个项目最多显示10个结果(可通过\"查看更多\"展开)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "高级搜索使用防抖,延迟300ms执行"
      },
      {
        "id": "2",
        "name": "搜索在主线程执行,分批处理避免阻塞UI"
      },
      {
        "id": "3",
        "name": "搜索结果包含:projectId, projectName, nodeId, nodeName, nodeType, matchedFields, matches"
      },
      {
        "id": "4",
        "name": "matchedFields记录匹配的字段名,用于UI高亮显示"
      },
      {
        "id": "5",
        "name": "matches数组最多保存前3个匹配内容,用于搜索结果预览"
      },
      {
        "id": "6",
        "name": "搜索性能优化:使用内存缓存,分批处理,提前终止"
      }
    ]
  },
  {
    "purpose": "搜索结果区域UI显示正确todo 补充",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动,处于/home首页"
      },
      {
        "id": "2",
        "name": "已执行高级搜索,返回了多个匹配结果"
      },
      {
        "id": "3",
        "name": "搜索结果包含多个项目的多个节点"
      },
      {
        "id": "4",
        "name": "SearchResults.vue组件已正确渲染"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察搜索结果区域的整体布局"
      },
      {
        "id": "2",
        "name": "检查搜索结果是否按项目分组显示"
      },
      {
        "id": "3",
        "name": "检查每个项目组的标题和匹配数量显示"
      },
      {
        "id": "4",
        "name": "检查单个搜索结果项的UI元素"
      },
      {
        "id": "5",
        "name": "验证节点类型图标是否正确显示"
      },
      {
        "id": "6",
        "name": "验证匹配内容高亮显示是否正确"
      },
      {
        "id": "7",
        "name": "点击搜索结果项,验证是否跳转到对应节点"
      },
      {
        "id": "8",
        "name": "如果单个项目结果超过10个,检查\"查看更多\"按钮是否显示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "搜索结果区域使用el-card组件包裹,显示在高级搜索面板下方"
      },
      {
        "id": "2",
        "name": "结果按项目分组,每个项目显示一个分组标题"
      },
      {
        "id": "3",
        "name": "分组标题格式:\"<项目名称> (共<总数>个结果)\""
      },
      {
        "id": "4",
        "name": "每个项目默认显示前10个结果,超过10个显示\"查看更多\"按钮"
      },
      {
        "id": "5",
        "name": "单个搜索结果项包含:节点图标,节点类型标签,节点名称,请求方法标签(HTTP节点),项目标签,匹配字段列表,前3个匹配内容"
      },
      {
        "id": "6",
        "name": "节点图标:FileText(HTTP),Globe(WebSocket),Server(Mock),Folder(目录)"
      },
      {
        "id": "7",
        "name": "节点类型标签:使用el-tag组件,显示\"HTTP\",\"WebSocket\",\"Mock\",\"目录\""
      },
      {
        "id": "8",
        "name": "HTTP节点显示请求方法标签,颜色区分:GET(蓝色),POST(绿色),PUT(橙色),DELETE(红色),PATCH(紫色)"
      },
      {
        "id": "9",
        "name": "项目标签显示项目名称,使用灰色el-tag"
      },
      {
        "id": "10",
        "name": "匹配字段列表显示所有匹配的字段名,用逗号分隔"
      },
      {
        "id": "11",
        "name": "匹配内容使用ClEmphasize组件高亮显示关键词,背景色为黄色"
      },
      {
        "id": "12",
        "name": "点击结果项后,跳转到/v1/apidoc/doc-edit,携带projectId,projectName,nodeId参数"
      },
      {
        "id": "13",
        "name": "如果搜索无结果,显示el-empty组件,提示\"暂无搜索结果\""
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "SearchResults.vue组件路径:pages/home/projectManager/advancedSearch/SearchResults.vue(行1-122)"
      },
      {
        "id": "2",
        "name": "SearchResultItem.vue组件路径:pages/home/projectManager/advancedSearch/SearchResultItem.vue(行1-196)"
      },
      {
        "id": "3",
        "name": "ClEmphasize组件路径:components/common/emphasize/ClEmphasize.vue"
      },
      {
        "id": "4",
        "name": "搜索结果数据结构:SearchResultItem类型(projectId, projectName, nodeId, nodeName, nodeType, matchedFields, matches)"
      },
      {
        "id": "5",
        "name": "结果分组逻辑:按projectId分组,Map<projectId, SearchResultItem[]>"
      },
      {
        "id": "6",
        "name": "空状态条件:v-if=\"!loading && results.length === 0\"(SearchResults.vue 行9-15)"
      },
      {
        "id": "7",
        "name": "结果项循环:v-for=\"item in displayedResults\"(行22-37)"
      },
      {
        "id": "8",
        "name": "\"查看更多\"按钮条件:v-if=\"!showAll && results.length > 10\""
      },
      {
        "id": "9",
        "name": "节点图标条件渲染:根据item.nodeType选择FileText/Globe/Server/Folder图标"
      },
      {
        "id": "10",
        "name": "请求方法标签条件:v-if=\"item.nodeType === 'http' && item.method\""
      },
      {
        "id": "11",
        "name": "方法标签颜色映射:GET->primary, POST->success, PUT->warning, DELETE->danger, PATCH->info"
      },
      {
        "id": "12",
        "name": "匹配内容循环:v-for=\"(match, index) in item.matches.slice(0, 3)\""
      },
      {
        "id": "13",
        "name": "ClEmphasize组件props:{ content: match, keyword: searchKeyword, highlightBackground: true }"
      },
      {
        "id": "14",
        "name": "点击事件:@click=\"handleJumpToNode(item)\"(ProjectManager.vue 行605-615)"
      },
      {
        "id": "15",
        "name": "handleJumpToNode调用router.push,传入{ path, query: { id, name, mode, nodeId } }"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "搜索结果UI设计考虑了可读性和信息密度的平衡"
      },
      {
        "id": "2",
        "name": "高亮组件ClEmphasize支持不区分大小写的关键词匹配"
      },
      {
        "id": "3",
        "name": "请求方法标签的颜色遵循行业标准(RESTful API颜色约定)"
      },
      {
        "id": "4",
        "name": "匹配内容最多显示3个,避免结果项过长"
      },
      {
        "id": "5",
        "name": "\"查看更多\"按钮点击后展开显示所有结果,按钮文案变为\"收起\""
      },
      {
        "id": "6",
        "name": "结果项支持键盘导航和回车键跳转(accessibility优化)"
      }
    ]
  }
],
}

export default node
