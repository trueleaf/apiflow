import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "search",
  description: "搜索",
  children: [],
  atomicFunc: [
  {
    "purpose": "搜索框默认UI样式验证,placeholder内容,筛选图标,focus后边框高亮,输入内容后出现清空按钮",
    "precondition": [
      {
        "id": "1",
        "name": "已打开任意项目工作区,进入项目编辑页面"
      },
      {
        "id": "2",
        "name": "Tool.vue组件已渲染在banner区域"
      },
      {
        "id": "3",
        "name": "当前处于在线模式(runtimeStore.networkMode !== \"offline\")"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察Tool.vue第33-35行的el-input搜索框,验证初始渲染状态"
      },
      {
        "id": "2",
        "name": "检查搜索框placeholder文字显示"
      },
      {
        "id": "3",
        "name": "检查搜索框右侧是否显示高级筛选按钮(data-testid=\"banner-filter-btn\")"
      },
      {
        "id": "4",
        "name": "点击搜索框,触发focus事件"
      },
      {
        "id": "5",
        "name": "观察搜索框边框样式变化"
      },
      {
        "id": "6",
        "name": "在搜索框中输入任意文字(如\"test\")"
      },
      {
        "id": "7",
        "name": "观察搜索框右侧是否出现清空按钮(el-input的clearable属性)"
      },
      {
        "id": "8",
        "name": "点击清空按钮"
      },
      {
        "id": "9",
        "name": "验证搜索框内容被清空"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "Tool.vue第34行el-input正确渲染,size=\"large\",class=\"doc-search\""
      },
      {
        "id": "2",
        "name": "placeholder显示为t(\"文档名称,文档url\"),中文环境下显示\"文档名称,文档url\""
      },
      {
        "id": "3",
        "name": "搜索框右侧显示高级筛选图标(icongaojishaixuan),带有el-badge红点提示(当有筛选条件时)"
      },
      {
        "id": "4",
        "name": "data-testid=\"banner-search-input\"属性正确设置,便于自动化测试定位"
      },
      {
        "id": "5",
        "name": "focus后搜索框边框显示主题色高亮(Element Plus默认focus样式)"
      },
      {
        "id": "6",
        "name": "输入内容后,搜索框右侧出现清空图标(叉号)"
      },
      {
        "id": "7",
        "name": "点击清空按钮后,formInfo.iptValue被清空为空字符串"
      },
      {
        "id": "8",
        "name": "清空后触发@change事件,调用handleFilterBanner方法"
      },
      {
        "id": "9",
        "name": "handleFilterBanner方法emit(\"filter\", formInfo),通知Banner.vue更新过滤状态"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue第34行:el-input配置 - v-model=\"formInfo.iptValue\", size=\"large\", clearable"
      },
      {
        "id": "2",
        "name": "Tool.vue第34行:placeholder使用i18n - :placeholder=\"t('文档名称,文档url')\""
      },
      {
        "id": "3",
        "name": "Tool.vue第36行:高级筛选条件判断 - v-if=\"!isStandalone\""
      },
      {
        "id": "4",
        "name": "Tool.vue第36行:el-badge红点显示 - :is-dot=\"hasFilterCondition\""
      },
      {
        "id": "5",
        "name": "Tool.vue第39行:高级筛选按钮 - data-testid=\"banner-filter-btn\""
      },
      {
        "id": "6",
        "name": "Tool.vue中formInfo响应式对象包含iptValue字段"
      },
      {
        "id": "7",
        "name": "el-input的clearable属性自动添加清空按钮功能"
      },
      {
        "id": "8",
        "name": "@change事件绑定handleFilterBanner方法"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "el-input的size=\"large\"使搜索框高度更大,便于用户操作"
      },
      {
        "id": "2",
        "name": "clearable属性是Element Plus内置功能,当输入内容时自动显示清空按钮"
      },
      {
        "id": "3",
        "name": "placeholder使用i18n国际化,支持中英文切换"
      },
      {
        "id": "4",
        "name": "高级筛选按钮仅在在线模式显示,离线模式隐藏该功能"
      },
      {
        "id": "5",
        "name": "data-testid属性便于Playwright等E2E测试工具定位元素"
      }
    ]
  },
  {
    "purpose": "搜索框默认UI样式验证,placeholder内容,筛选图标,focus后边框高亮",
    "precondition": [
      {
        "id": "1",
        "name": "已打开任意项目工作区,进入项目编辑页面"
      },
      {
        "id": "2",
        "name": "Tool.vue组件已渲染"
      },
      {
        "id": "3",
        "name": "搜索框未输入任何内容(formInfo.iptValue为空字符串)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "直接观察搜索框UI渲染状态,无需任何操作"
      },
      {
        "id": "2",
        "name": "验证placeholder文字内容"
      },
      {
        "id": "3",
        "name": "验证搜索框尺寸和样式"
      },
      {
        "id": "4",
        "name": "点击搜索框激活focus状态"
      },
      {
        "id": "5",
        "name": "观察边框颜色变化"
      },
      {
        "id": "6",
        "name": "点击页面其他区域,使搜索框失去焦点"
      },
      {
        "id": "7",
        "name": "观察边框恢复到默认状态"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "搜索框正确显示在banner区域顶部,位于项目名称和切换按钮下方"
      },
      {
        "id": "2",
        "name": "placeholder显示灰色文字提示:\"文档名称,文档url\""
      },
      {
        "id": "3",
        "name": "搜索框使用Element Plus的large尺寸,高度约40px"
      },
      {
        "id": "4",
        "name": "搜索框宽度自适应父容器,class=\"doc-search\"应用自定义样式"
      },
      {
        "id": "5",
        "name": "focus状态下边框显示主题色(通常为蓝色)高亮"
      },
      {
        "id": "6",
        "name": "失去焦点后边框恢复为默认的灰色边框"
      },
      {
        "id": "7",
        "name": "搜索框右侧始终显示高级筛选图标(在线模式下)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue第34行el-input渲染正确"
      },
      {
        "id": "2",
        "name": "placeholder文字使用i18n翻译"
      },
      {
        "id": "3",
        "name": "Element Plus el-input组件的focus伪类样式自动应用"
      },
      {
        "id": "4",
        "name": "CSS类名doc-search可能在Tool.vue的style标签中定义额外样式"
      },
      {
        "id": "5",
        "name": "搜索框父容器使用p-relative(position: relative)定位"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此用例与用例1部分重复,主要验证默认状态的UI展示"
      },
      {
        "id": "2",
        "name": "用例1侧重clearable功能,此用例侧重基础UI验证"
      },
      {
        "id": "3",
        "name": "focus高亮效果由Element Plus框架提供,无需额外代码"
      }
    ]
  },
  {
    "purpose": "搜索框输入内容后,可以匹配接口的url和名称,需要验证搜索算法对不对",
    "precondition": [
      {
        "id": "1",
        "name": "已打开项目工作区,项目中存在多个API节点"
      },
      {
        "id": "2",
        "name": "测试数据包含:名称为\"用户登录\"的HTTP节点(url: /api/user/login)"
      },
      {
        "id": "3",
        "name": "测试数据包含:名称为\"获取订单列表\"的HTTP节点(url: /api/order/list)"
      },
      {
        "id": "4",
        "name": "测试数据包含:名称为\"WebSocket连接\"的WebSocket节点(url.path: /ws/chat)"
      },
      {
        "id": "5",
        "name": "测试数据包含:名称为\"用户模块\"的folder节点(不含url)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在搜索框中输入\"login\""
      },
      {
        "id": "2",
        "name": "观察节点树过滤结果,验证是否显示\"用户登录\"节点"
      },
      {
        "id": "3",
        "name": "清空搜索框,输入\"用户\""
      },
      {
        "id": "4",
        "name": "观察节点树是否同时显示\"用户登录\"节点和\"用户模块\"文件夹"
      },
      {
        "id": "5",
        "name": "清空搜索框,输入\"order\""
      },
      {
        "id": "6",
        "name": "验证是否显示\"获取订单列表\"节点(URL匹配)"
      },
      {
        "id": "7",
        "name": "清空搜索框,输入\"ws\""
      },
      {
        "id": "8",
        "name": "验证WebSocket节点的URL path匹配逻辑"
      },
      {
        "id": "9",
        "name": "清空搜索框,输入不存在的内容\"xyz123\""
      },
      {
        "id": "10",
        "name": "验证无匹配结果时的显示状态"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入\"login\"后,仅显示URL包含\"login\"的节点(/api/user/login)"
      },
      {
        "id": "2",
        "name": "输入\"用户\"后,显示名称包含\"用户\"的所有节点(\"用户登录\"节点和\"用户模块\"文件夹)"
      },
      {
        "id": "3",
        "name": "输入\"order\"后,显示URL包含\"order\"的节点(/api/order/list)"
      },
      {
        "id": "4",
        "name": "搜索算法使用JavaScript的match方法进行匹配,支持正则表达式模式"
      },
      {
        "id": "5",
        "name": "HTTP节点匹配逻辑:bannerData.url?.match(filterInfo.iptValue)"
      },
      {
        "id": "6",
        "name": "WebSocket节点匹配逻辑:bannerData.url.path?.match(filterInfo.iptValue)"
      },
      {
        "id": "7",
        "name": "名称匹配逻辑:bannerData.name.match(filterInfo.iptValue)"
      },
      {
        "id": "8",
        "name": "匹配成功的节点显示,不匹配的节点被过滤隐藏"
      },
      {
        "id": "9",
        "name": "folder类型节点仅通过name匹配(type !== \"http\" && type !== \"websocket\"时返回false)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue第640行:filterNode方法实现过滤逻辑"
      },
      {
        "id": "2",
        "name": "Banner.vue第650-656行:URL匹配条件判断 - 区分http和websocket类型"
      },
      {
        "id": "3",
        "name": "Banner.vue第651-652行:HTTP节点URL匹配 - bannerData.url?.match(filterInfo.iptValue)"
      },
      {
        "id": "4",
        "name": "Banner.vue第653-654行:WebSocket节点URL匹配 - bannerData.url.path?.match(filterInfo.iptValue)"
      },
      {
        "id": "5",
        "name": "Banner.vue第657行:名称匹配 - bannerData.name.match(filterInfo.iptValue)"
      },
      {
        "id": "6",
        "name": "Banner.vue第660行:返回匹配结果 - (!!matchedUrl || !!matchedDocName) || !!matchedOthers"
      },
      {
        "id": "7",
        "name": "Tool.vue中handleFilterBanner方法触发emit(\"filter\", formInfo)"
      },
      {
        "id": "8",
        "name": "Banner.vue第633行:handleFilterNode方法调用docTree.filter(filterInfo)"
      },
      {
        "id": "9",
        "name": "el-tree的filter方法接收filterNode作为filter-node-method"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "搜索算法使用JavaScript原生match方法,支持字符串直接匹配"
      },
      {
        "id": "2",
        "name": "match方法区分大小写,如需不区分可以转换为小写后匹配"
      },
      {
        "id": "3",
        "name": "HTTP节点和WebSocket节点的URL结构不同,需分别处理"
      },
      {
        "id": "4",
        "name": "HTTP节点:url是字符串(如\"/api/user/login\")"
      },
      {
        "id": "5",
        "name": "WebSocket节点:url是对象,包含path字段(如{path: \"/ws/chat\"})"
      },
      {
        "id": "6",
        "name": "folder类型节点没有url字段,仅通过name匹配"
      },
      {
        "id": "7",
        "name": "匹配逻辑使用逻辑或运算符,只要name或url任一匹配即显示"
      }
    ]
  },
  {
    "purpose": "搜索框输入内容后,若无搜索结果,需要正确展示无搜索结果提示",
    "precondition": [
      {
        "id": "1",
        "name": "已打开项目工作区,项目中存在若干API节点"
      },
      {
        "id": "2",
        "name": "Banner.vue组件已正确渲染节点树"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在搜索框中输入一个不存在于任何节点名称和URL的字符串(如\"xyzabc123\")"
      },
      {
        "id": "2",
        "name": "观察el-tree节点树的显示状态"
      },
      {
        "id": "3",
        "name": "检查是否有任何节点显示"
      },
      {
        "id": "4",
        "name": "观察是否显示\"无搜索结果\"或空状态提示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "filterNode方法对所有节点返回false,el-tree不显示任何节点"
      },
      {
        "id": "2",
        "name": "el-tree组件显示空状态(Element Plus默认空状态或自定义empty slot)"
      },
      {
        "id": "3",
        "name": "Banner.vue中如果定义了el-tree的empty slot,显示自定义空状态提示"
      },
      {
        "id": "4",
        "name": "节点树区域显示为空白或显示\"暂无数据\"提示"
      },
      {
        "id": "5",
        "name": "清空搜索框后,所有节点恢复显示"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue第640-661行:filterNode方法返回false时节点被过滤"
      },
      {
        "id": "2",
        "name": "el-tree的empty slot可以自定义无数据提示"
      },
      {
        "id": "3",
        "name": "Banner.vue中el-tree可能包含empty模板插槽"
      },
      {
        "id": "4",
        "name": "无匹配结果时,docTree中所有节点的visible属性为false"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Element Plus el-tree组件在所有节点被过滤后显示空状态"
      },
      {
        "id": "2",
        "name": "可以通过el-tree的empty slot自定义无数据提示内容"
      },
      {
        "id": "3",
        "name": "建议在Banner.vue中添加友好的空状态提示,如\"未找到匹配的接口\""
      }
    ]
  },
  {
    "purpose": "搜索框输入内容后,如果存在节点名称匹配,需要在节点名称中高亮关键字,如果存在节点url匹配,需要在url中高亮关键字,匹配中的节点如果存在父元素,则递归展示所有父元素",
    "precondition": [
      {
        "id": "1",
        "name": "已打开项目工作区,存在嵌套的节点结构"
      },
      {
        "id": "2",
        "name": "测试数据:根目录下有\"用户模块\"文件夹,文件夹内有\"用户登录\"HTTP节点"
      },
      {
        "id": "3",
        "name": "\"用户登录\"节点的URL为/api/user/login"
      },
      {
        "id": "4",
        "name": "Banner.vue中SEmphasize组件已正确引入和使用"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在搜索框中输入\"登录\""
      },
      {
        "id": "2",
        "name": "观察\"用户登录\"节点的显示"
      },
      {
        "id": "3",
        "name": "检查\"用户登录\"文字中\"登录\"是否高亮显示"
      },
      {
        "id": "4",
        "name": "检查父级\"用户模块\"文件夹是否自动展开并显示"
      },
      {
        "id": "5",
        "name": "清空搜索框,输入\"login\""
      },
      {
        "id": "6",
        "name": "观察节点URL /api/user/login 中\"login\"是否高亮"
      },
      {
        "id": "7",
        "name": "验证父级文件夹是否依然显示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入\"登录\"后,\"用户登录\"节点显示,节点名称中\"登录\"二字高亮显示(不同颜色或背景色)"
      },
      {
        "id": "2",
        "name": "父级\"用户模块\"文件夹自动展开,显示在节点树中"
      },
      {
        "id": "3",
        "name": "SEmphasize组件处理高亮逻辑,接收value(完整文本)和keyword(关键字)props"
      },
      {
        "id": "4",
        "name": "Banner.vue第42行使用SEmphasize高亮节点名称:<SEmphasize :value=\"scope.data.name\" :keyword=\"filterString\">"
      },
      {
        "id": "5",
        "name": "Banner.vue第45行使用SEmphasize高亮URL:<SEmphasize :value=\"scope.data.url\" :keyword=\"filterString\">"
      },
      {
        "id": "6",
        "name": "输入\"login\"后,URL中\"login\"部分高亮显示"
      },
      {
        "id": "7",
        "name": "filterString.value在handleFilterNode方法中被设置为输入的关键字"
      },
      {
        "id": "8",
        "name": "匹配的节点及其所有祖先节点都显示在树中"
      },
      {
        "id": "9",
        "name": "showMoreNodeInfo.value被设置为true,显示更多节点信息"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue第631行:filterString响应式变量存储搜索关键字"
      },
      {
        "id": "2",
        "name": "Banner.vue第637行:filterString.value = filterInfo.iptValue 赋值"
      },
      {
        "id": "3",
        "name": "Banner.vue第42行:SEmphasize组件高亮节点名称"
      },
      {
        "id": "4",
        "name": "Banner.vue第45,74,124,145,171行:多处使用SEmphasize高亮URL"
      },
      {
        "id": "5",
        "name": "SEmphasize组件props包含:value(完整文本),keyword(搜索关键字),title(tooltip)"
      },
      {
        "id": "6",
        "name": "Banner.vue第659行:showMoreNodeInfo.value = true 显示更多信息"
      },
      {
        "id": "7",
        "name": "el-tree的filter方法自动处理父节点展开逻辑"
      },
      {
        "id": "8",
        "name": "Element Plus el-tree在过滤时自动显示匹配节点的所有祖先节点"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "SEmphasize是自定义组件,用于高亮显示文本中的关键字"
      },
      {
        "id": "2",
        "name": "SEmphasize组件可能使用正则替换或字符串分割方式实现高亮"
      },
      {
        "id": "3",
        "name": "el-tree的filter方法会自动展开包含匹配节点的父节点"
      },
      {
        "id": "4",
        "name": "父节点展开逻辑由Element Plus内部处理,无需手动实现"
      },
      {
        "id": "5",
        "name": "filterString用于在模板中传递给SEmphasize组件"
      },
      {
        "id": "6",
        "name": "showMoreNodeInfo控制是否显示节点的URL等额外信息"
      }
    ]
  },
  {
    "purpose": "离线模式不展示高级筛选",
    "precondition": [
      {
        "id": "1",
        "name": "应用运行在离线模式(runtimeStore.networkMode === \"offline\")"
      },
      {
        "id": "2",
        "name": "Tool.vue组件已渲染"
      },
      {
        "id": "3",
        "name": "isStandalone计算属性返回true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "切换应用到离线模式(standalone模式)"
      },
      {
        "id": "2",
        "name": "观察搜索框右侧区域"
      },
      {
        "id": "3",
        "name": "检查是否显示高级筛选按钮(带有筛选图标的按钮)"
      },
      {
        "id": "4",
        "name": "尝试查找data-testid=\"banner-filter-btn\"元素"
      },
      {
        "id": "5",
        "name": "切换到在线模式"
      },
      {
        "id": "6",
        "name": "再次观察搜索框右侧是否出现高级筛选按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "离线模式下,Tool.vue第36行的v-if=\"!isStandalone\"条件判断为false"
      },
      {
        "id": "2",
        "name": "el-badge和el-popover组件(高级筛选功能)不渲染"
      },
      {
        "id": "3",
        "name": "搜索框右侧仅显示el-input的clearable清空按钮,无筛选图标"
      },
      {
        "id": "4",
        "name": "data-testid=\"banner-filter-btn\"元素在DOM中不存在"
      },
      {
        "id": "5",
        "name": "切换到在线模式后,高级筛选按钮出现"
      },
      {
        "id": "6",
        "name": "在线模式下可以点击筛选按钮,弹出筛选面板"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue第36行:v-if=\"!isStandalone\"条件渲染高级筛选功能"
      },
      {
        "id": "2",
        "name": "Tool.vue中isStandalone计算属性定义:computed(() => runtimeStore.networkMode === \"offline\")"
      },
      {
        "id": "3",
        "name": "runtimeStore.networkMode值为\"offline\"时isStandalone为true"
      },
      {
        "id": "4",
        "name": "离线模式隐藏的功能包含:el-badge,el-popover,筛选按钮,筛选面板"
      },
      {
        "id": "5",
        "name": "筛选面板包含:操作人员,录入日期,最近多少条等筛选条件(第43-86行)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "离线模式(standalone)是Apiflow的本地纯IndexedDB模式,无后端服务器"
      },
      {
        "id": "2",
        "name": "高级筛选功能依赖服务器端数据(操作人员,录入日期等),离线模式不可用"
      },
      {
        "id": "3",
        "name": "基础搜索功能(按名称和URL搜索)在离线模式下依然可用"
      },
      {
        "id": "4",
        "name": "isStandalone计算属性统一控制离线/在线模式的功能差异"
      },
      {
        "id": "5",
        "name": "通过v-if条件渲染,离线模式下筛选相关DOM完全不渲染,提升性能"
      }
    ]
  }
],
}

export default node
