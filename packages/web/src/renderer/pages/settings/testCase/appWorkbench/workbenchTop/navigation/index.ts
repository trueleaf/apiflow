import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "navigation",
  description: "导航",
  children: [],
  atomicFunc: [
  {
    "purpose": "项目tab显示项目图标,设置tab显示设置图标",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "已打开至少一个项目Tab"
      },
      {
        "id": "3",
        "name": "已打开至少一个设置Tab"
      },
      {
        "id": "4",
        "name": "Header.vue组件已渲染"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察顶部导航栏的Tab列表"
      },
      {
        "id": "2",
        "name": "找到类型为project的Tab项"
      },
      {
        "id": "3",
        "name": "观察项目Tab的图标显示"
      },
      {
        "id": "4",
        "name": "找到类型为settings的Tab项"
      },
      {
        "id": "5",
        "name": "观察设置Tab的图标显示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "所有类型为project的Tab显示Folder图标(文件夹图标)"
      },
      {
        "id": "2",
        "name": "所有类型为settings的Tab显示Settings图标(齿轮图标)"
      },
      {
        "id": "3",
        "name": "图标显示在Tab标题的左侧"
      },
      {
        "id": "4",
        "name": "图标来自lucide-vue-next图标库"
      },
      {
        "id": "5",
        "name": "图标具有tab-icon类名"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第14-24行使用draggable组件渲染Tab列表"
      },
      {
        "id": "2",
        "name": "项目Tab通过v-if=\"tab.type === 'project'\"条件渲染Folder组件"
      },
      {
        "id": "3",
        "name": "设置Tab通过v-if=\"tab.type === 'settings'\"条件渲染Settings组件"
      },
      {
        "id": "4",
        "name": "Tab数据结构AppWorkbenchHeaderTab包含type字段('project' | 'settings')"
      },
      {
        "id": "5",
        "name": "每个Tab项的template中按顺序渲染: 图标 -> 标题 -> 关闭按钮"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Tab图标通过Vue条件渲染实现,不同type显示不同图标组件"
      },
      {
        "id": "2",
        "name": "Folder和Settings组件来自lucide-vue-next库"
      },
      {
        "id": "3",
        "name": "Tab类型定义:export type AppWorkbenchHeaderTab.type = 'project' | 'settings'"
      },
      {
        "id": "4",
        "name": "Tab图标CSS类名为.tab-icon,用于统一样式控制"
      }
    ]
  },
  {
    "purpose": "新建项目,打开设置会新增tab,点击编辑按钮并且不存在对应项目tab时候会新增tab",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "当前在主页面或其他页面"
      },
      {
        "id": "3",
        "name": "没有打开目标项目或设置的Tab"
      },
      {
        "id": "4",
        "name": "tabs响应式数组可用"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "场景1: 点击顶部导航栏的\"新建项目\"按钮(+按钮)"
      },
      {
        "id": "2",
        "name": "填写项目信息并确认创建"
      },
      {
        "id": "3",
        "name": "观察Tab列表变化"
      },
      {
        "id": "4",
        "name": "场景2: 点击顶部导航栏的设置图标按钮(齿轮图标)"
      },
      {
        "id": "5",
        "name": "观察Tab列表变化"
      },
      {
        "id": "6",
        "name": "场景3:在项目列表页点击某个项目的\"编辑\"按钮"
      },
      {
        "id": "7",
        "name": "观察Tab列表变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "场景1:项目创建成功后,Tab列表自动新增一个项目Tab"
      },
      {
        "id": "2",
        "name": "新项目Tab显示项目名称和Folder图标,且被自动高亮(激活状态)"
      },
      {
        "id": "3",
        "name": "新项目Tab插入到正确的位置(项目Tab按网络模式分组,在同模式最后一个项目之后)"
      },
      {
        "id": "4",
        "name": "场景2:点击设置按钮后,Tab列表新增一个设置Tab"
      },
      {
        "id": "5",
        "name": "设置Tab显示\"设置\"文字和Settings图标,且被自动高亮"
      },
      {
        "id": "6",
        "name": "设置Tab插入到Tab列表末尾(设置Tab始终在项目Tab之后)"
      },
      {
        "id": "7",
        "name": "场景3:点击编辑按钮后,如果该项目Tab不存在,则新增项目Tab并高亮"
      },
      {
        "id": "8",
        "name": "如果该项目Tab已存在,则不新增,仅高亮已有Tab"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "新建项目: 监听IPC_EVENTS.apiflow.topBarToContent.projectCreated事件(Header.vue第302-309行)"
      },
      {
        "id": "2",
        "name": "事件处理中调用getProjectTabInsertIndex()计算插入位置"
      },
      {
        "id": "3",
        "name": "使用tabs.value.splice(insertIndex, 0, newTab)在指定位置插入Tab"
      },
      {
        "id": "4",
        "name": "新Tab结构包含:{id: projectId, title: projectName, type: 'project', network: networkMode}"
      },
      {
        "id": "5",
        "name": "插入后调用syncTabsToContentView()同步Tab状态到contentView"
      },
      {
        "id": "6",
        "name": "设置activeTabId.value为新Tab的id,实现自动高亮"
      },
      {
        "id": "7",
        "name": "打开设置: jumpToSettings方法(Header.vue第257-270行)中检查settings Tab是否存在"
      },
      {
        "id": "8",
        "name": "如果不存在,使用tabs.value.push()在末尾添加设置Tab"
      },
      {
        "id": "9",
        "name": "设置Tab的id格式为: `settings-${networkMode.value}` (区分在线/离线模式)"
      },
      {
        "id": "10",
        "name": "编辑项目:通过switchTab检查Tab是否存在,不存在则触发创建逻辑"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Tab新增逻辑分为两种:项目Tab通过splice插入,设置Tab通过push追加"
      },
      {
        "id": "2",
        "name": "getProjectTabInsertIndex方法确保项目Tab始终在同网络模式的项目Tab组内"
      },
      {
        "id": "3",
        "name": "每个Tab有唯一id:项目Tab使用projectId,设置Tab使用\"settings-{networkMode}\""
      },
      {
        "id": "4",
        "name": "Tab新增后立即调用syncTabsToContentView和syncActiveTabToContentView同步状态"
      },
      {
        "id": "5",
        "name": "Tab按网络模式分组管理(online/offline), 切换网络模式会过滤显示对应Tab"
      }
    ]
  },
  {
    "purpose": "点击编辑项目,项目内切换项目或点击设置,如果tab已存在则高亮当前tab,如果tab不存在则新增tab并高亮当前tab",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "已打开一个或多个项目Tab和设置Tab"
      },
      {
        "id": "3",
        "name": "当前有一个Tab处于激活(高亮)状态"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "场景1:点击已打开项目Tab对应的编辑按钮"
      },
      {
        "id": "2",
        "name": "观察Tab是否新增以及高亮状态变化"
      },
      {
        "id": "3",
        "name": "场景2:点击未打开项目Tab对应的编辑按钮"
      },
      {
        "id": "4",
        "name": "观察Tab是否新增以及高亮状态变化"
      },
      {
        "id": "5",
        "name": "场景3:在项目内通过项目切换功能切换到已打开Tab的项目"
      },
      {
        "id": "6",
        "name": "观察Tab变化"
      },
      {
        "id": "7",
        "name": "场景4:在项目内切换到未打开Tab的项目"
      },
      {
        "id": "8",
        "name": "观察Tab变化"
      },
      {
        "id": "9",
        "name": "场景5:点击已打开的设置Tab对应的设置按钮"
      },
      {
        "id": "10",
        "name": "观察Tab变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "场景1:不新增Tab,已有的项目Tab被高亮,原高亮Tab失去高亮状态"
      },
      {
        "id": "2",
        "name": "内容区域切换到对应项目的工作区"
      },
      {
        "id": "3",
        "name": "场景2:新增一个项目Tab并自动高亮,内容区域显示该项目工作区"
      },
      {
        "id": "4",
        "name": "场景3:不新增Tab,已有的目标项目Tab被高亮"
      },
      {
        "id": "5",
        "name": "场景4:新增目标项目Tab并自动高亮"
      },
      {
        "id": "6",
        "name": "场景5:不新增Tab,已有的设置Tab被高亮,内容区域切换到设置页面"
      },
      {
        "id": "7",
        "name": "所有高亮切换都伴随内容区域的对应页面切换"
      },
      {
        "id": "8",
        "name": "Tab高亮状态通过.active类名实现视觉反馈"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "switchTab方法(Header.vue第231-235行)负责切换Tab高亮状态"
      },
      {
        "id": "2",
        "name": "switchTab中更新activeTabId.value为目标Tab的id"
      },
      {
        "id": "3",
        "name": "调用syncActiveTabToContentView同步激活状态到contentView"
      },
      {
        "id": "4",
        "name": "调用scrollToActiveTab确保激活的Tab在可视区域内"
      },
      {
        "id": "5",
        "name": "Tab的active类名通过计算属性绑定::class=\"['tab-item', { active: tab.id === activeTabId }]\""
      },
      {
        "id": "6",
        "name": "编辑按钮点击后,先查找tabs.value.find(t => t.id === projectId)检查Tab是否存在"
      },
      {
        "id": "7",
        "name": "Tab存在时直接调用switchTab(tabId)高亮"
      },
      {
        "id": "8",
        "name": "Tab不存在时先创建Tab(splice或push), 再调用switchTab高亮新Tab"
      },
      {
        "id": "9",
        "name": "项目切换通过IPC事件apiflow.topBarToContent.projectChanged触发"
      },
      {
        "id": "10",
        "name": "设置Tab通过jumpToSettings方法处理,使用existingTab变量检查是否已存在"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Tab高亮状态由activeTabId响应式变量控制,任意时刻只有一个Tab处于高亮状态"
      },
      {
        "id": "2",
        "name": "switchTab方法是Tab高亮的统一入口,确保状态同步"
      },
      {
        "id": "3",
        "name": "Tab的存在性检查通过Array.find方法实现"
      },
      {
        "id": "4",
        "name": "内容区域的页面切换通过IPC事件通信实现,topBarView发送事件,contentView响应"
      },
      {
        "id": "5",
        "name": "scrollToActiveTab使用scrollIntoView API确保激活Tab可见"
      }
    ]
  },
  {
    "purpose": "tab存在默认排序,项目在前,其他在后",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "打开了多个项目Tab和设置Tab的混合场景"
      },
      {
        "id": "3",
        "name": "可能存在在线模式和离线模式的Tab混合"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "创建或打开3个项目Tab(项目A,B,C)"
      },
      {
        "id": "2",
        "name": "打开一个设置Tab"
      },
      {
        "id": "3",
        "name": "再创建一个新项目Tab(项目D)"
      },
      {
        "id": "4",
        "name": "观察Tab列表的排列顺序"
      },
      {
        "id": "5",
        "name": "切换网络模式(从在线切换到离线或相反)"
      },
      {
        "id": "6",
        "name": "观察Tab排序是否保持规则"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "所有项目Tab(A,B,C,D)排列在前面"
      },
      {
        "id": "2",
        "name": "设置Tab排列在所有项目Tab之后"
      },
      {
        "id": "3",
        "name": "项目Tab内部按照创建或打开的时间顺序排列"
      },
      {
        "id": "4",
        "name": "新创建的项目Tab插入到同网络模式的最后一个项目Tab之后,设置Tab之前"
      },
      {
        "id": "5",
        "name": "切换网络模式后,只显示当前网络模式的Tab,但排序规则依然保持"
      },
      {
        "id": "6",
        "name": "Tab排序规则:[在线项目Tab组] + [离线项目Tab组] + [在线设置Tab] + [离线设置Tab]"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "getProjectTabInsertIndex方法(Header.vue第102-114行)计算项目Tab插入位置"
      },
      {
        "id": "2",
        "name": "该方法首先过滤当前网络模式的Tab:currentNetworkTabs = tabs.value.filter(tab => tab.network === networkMode.value)"
      },
      {
        "id": "3",
        "name": "使用reduce方法找到同模式下最后一个项目Tab的索引:lastProjectIndex"
      },
      {
        "id": "4",
        "name": "项目Tab插入到lastProjectIndex + 1位置,确保在设置Tab之前"
      },
      {
        "id": "5",
        "name": "设置Tab通过tabs.value.push()追加到数组末尾,天然排在最后"
      },
      {
        "id": "6",
        "name": "Tab按network字段('online' | 'offline')分组"
      },
      {
        "id": "7",
        "name": "draggable组件的v-model绑定draggableTabs计算属性,过滤显示当前网络模式的Tab"
      },
      {
        "id": "8",
        "name": "draggableTabs = computed(() => tabs.value.filter(tab => tab.network === networkMode.value))"
      },
      {
        "id": "9",
        "name": "Tab的network字段在创建时自动设置为当前networkMode.value"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Tab排序规则由getProjectTabInsertIndex方法强制保证,不依赖用户操作"
      },
      {
        "id": "2",
        "name": "项目Tab和设置Tab的分离通过type字段('project' | 'settings')区分"
      },
      {
        "id": "3",
        "name": "Tab的网络模式分组机制支持在线/离线场景的独立管理"
      },
      {
        "id": "4",
        "name": "切换网络模式时,Tab数组不变,仅通过计算属性过滤显示"
      },
      {
        "id": "5",
        "name": "Tab排序规则确保用户界面的一致性和可预测性"
      }
    ]
  },
  {
    "purpose": "可以拖拽tab和可以关闭tab,若高亮当前tab,关闭后,当前tab高亮左侧最近一个tab,并且内容区域切换为当前tab所对应的内容",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "已打开至少3个Tab(便于测试拖拽和关闭逻辑)"
      },
      {
        "id": "3",
        "name": "当前有一个Tab处于高亮状态"
      },
      {
        "id": "4",
        "name": "draggable组件已正确加载(vue.draggable.next库)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "测试拖拽:鼠标左键按住Tab A"
      },
      {
        "id": "2",
        "name": "拖动到Tab B和Tab C之间的位置"
      },
      {
        "id": "3",
        "name": "释放鼠标,观察Tab A的位置变化"
      },
      {
        "id": "4",
        "name": "测试关闭非高亮Tab:点击Tab B的关闭按钮(x图标)"
      },
      {
        "id": "5",
        "name": "观察Tab B是否被移除,其他Tab的高亮状态是否保持"
      },
      {
        "id": "6",
        "name": "测试关闭高亮Tab:将Tab C设为高亮状态"
      },
      {
        "id": "7",
        "name": "点击Tab C的关闭按钮"
      },
      {
        "id": "8",
        "name": "观察Tab C被关闭后,哪个Tab自动获得高亮"
      },
      {
        "id": "9",
        "name": "观察内容区域是否切换到新高亮Tab对应的内容"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽:Tab A成功移动到Tab B和Tab C之间,Tab顺序变为:...Tab B - Tab A - Tab C..."
      },
      {
        "id": "2",
        "name": "拖拽过程中显示拖拽占位符(ghost-class样式)"
      },
      {
        "id": "3",
        "name": "拖拽结束后Tab列表顺序更新,并同步到localStorage和contentView"
      },
      {
        "id": "4",
        "name": "关闭非高亮Tab:Tab B从列表中移除,当前高亮Tab保持不变"
      },
      {
        "id": "5",
        "name": "关闭高亮Tab:Tab C被移除,自动高亮左侧最近的Tab(如果左侧无Tab则高亮右侧第一个Tab)"
      },
      {
        "id": "6",
        "name": "如果关闭高亮Tab后无其他同网络模式Tab,自动跳转到主页面(/home)"
      },
      {
        "id": "7",
        "name": "内容区域立即切换到新高亮Tab对应的页面内容"
      },
      {
        "id": "8",
        "name": "关闭按钮支持事件冒泡阻止(@click.stop),点击关闭按钮不会触发Tab切换"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "draggable组件配置(Header.vue第14-24行):v-model=\"draggableTabs\", animation=\"150\", ghost-class=\"sortable-ghost\""
      },
      {
        "id": "2",
        "name": "draggableTabs是计算属性,过滤当前网络模式的Tab"
      },
      {
        "id": "3",
        "name": "拖拽结束后自动触发tabs.value更新,调用syncTabsToContentView同步"
      },
      {
        "id": "4",
        "name": "deleteTab方法(Header.vue第211-230行)处理Tab关闭逻辑"
      },
      {
        "id": "5",
        "name": "deleteTab首先检查要关闭的Tab是否为当前高亮Tab:wasActive = activeTabId.value === tabId"
      },
      {
        "id": "6",
        "name": "使用filter方法移除目标Tab:tabs.value = tabs.value.filter(t => t.id !== tabId)"
      },
      {
        "id": "7",
        "name": "过滤当前网络模式的Tab:currentNetworkTabs = tabs.value.filter(tab => tab.network === networkMode.value)"
      },
      {
        "id": "8",
        "name": "如果没有同模式Tab剩余,调用jumpToHome()跳转主页"
      },
      {
        "id": "9",
        "name": "如果关闭的是高亮Tab,找到关闭位置index,从该位置向右查找同模式Tab"
      },
      {
        "id": "10",
        "name": "如果右侧无Tab,则选择同模式Tab数组的最后一个Tab"
      },
      {
        "id": "11",
        "name": "调用switchTab(newActiveTabId)切换到新的高亮Tab"
      },
      {
        "id": "12",
        "name": "关闭按钮使用@click.stop阻止事件冒泡,避免触发Tab的@click事件"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Tab拖拽功能基于vue.draggable.next库(Vue 3版本的draggable)"
      },
      {
        "id": "2",
        "name": "draggable通过v-model双向绑定,拖拽操作自动更新绑定的数组"
      },
      {
        "id": "3",
        "name": "ghost-class=\"sortable-ghost\"定义拖拽占位符的CSS类名"
      },
      {
        "id": "4",
        "name": "Tab关闭逻辑考虑了网络模式分组,关闭后只在同模式Tab中选择新的激活Tab"
      },
      {
        "id": "5",
        "name": "关闭高亮Tab的新激活逻辑:优先选择右侧Tab,无右侧Tab则选择最后一个同模式Tab"
      },
      {
        "id": "6",
        "name": "syncTabsToContentView确保Tab列表在topBarView和contentView之间保持同步"
      }
    ]
  },
  {
    "purpose": "更新项目名称后,tab页签名称更新,删除项目后,tab页签关闭",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "已打开一个或多个项目Tab"
      },
      {
        "id": "3",
        "name": "项目名称可修改(在项目设置或项目列表中)"
      },
      {
        "id": "4",
        "name": "IPC通信正常工作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "场景1:打开项目A的Tab"
      },
      {
        "id": "2",
        "name": "在项目设置或项目列表中将项目A重命名为\"新项目名称\""
      },
      {
        "id": "3",
        "name": "保存修改"
      },
      {
        "id": "4",
        "name": "观察顶部Tab列表中项目A的Tab标题是否更新"
      },
      {
        "id": "5",
        "name": "场景2:打开项目B的Tab"
      },
      {
        "id": "6",
        "name": "在项目列表中删除项目B"
      },
      {
        "id": "7",
        "name": "确认删除操作"
      },
      {
        "id": "8",
        "name": "观察顶部Tab列表中项目B的Tab是否被移除"
      },
      {
        "id": "9",
        "name": "如果项目B的Tab是高亮状态,观察是否自动切换到其他Tab"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "场景1:项目A重命名后,其Tab标题立即更新为\"新项目名称\",无需刷新页面"
      },
      {
        "id": "2",
        "name": "Tab的图标(Folder)保持不变,仅标题文字更新"
      },
      {
        "id": "3",
        "name": "Tab的id(projectId)保持不变,不影响高亮状态和内容区域"
      },
      {
        "id": "4",
        "name": "场景2:项目B删除后,其Tab立即从Tab列表中移除"
      },
      {
        "id": "5",
        "name": "如果删除的项目Tab是高亮状态,自动切换到相邻Tab或主页面"
      },
      {
        "id": "6",
        "name": "内容区域自动切换到新的高亮Tab对应的内容或主页面"
      },
      {
        "id": "7",
        "name": "删除操作同步到contentView,contentView也执行相应的清理逻辑"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "项目重命名:监听IPC_EVENTS.apiflow.topBarToContent.projectRenamed事件(Header.vue第330-336行)"
      },
      {
        "id": "2",
        "name": "事件payload包含{projectId: string, projectName: string}"
      },
      {
        "id": "3",
        "name": "通过tabs.value.findIndex(t => t.id === data.projectId)查找目标Tab"
      },
      {
        "id": "4",
        "name": "找到后更新tabs.value[index].title = data.projectName"
      },
      {
        "id": "5",
        "name": "调用syncTabsToContentView同步Tab列表到contentView"
      },
      {
        "id": "6",
        "name": "项目删除:监听IPC_EVENTS.apiflow.topBarToContent.projectDeleted事件(Header.vue第338-344行)"
      },
      {
        "id": "7",
        "name": "事件payload包含{projectId: string}"
      },
      {
        "id": "8",
        "name": "调用deleteTab(data.projectId)方法移除对应的Tab"
      },
      {
        "id": "9",
        "name": "deleteTab方法会自动处理高亮Tab的切换逻辑(如前述)"
      },
      {
        "id": "10",
        "name": "Tab标题通过{{ tab.title }}模板语法绑定,响应式更新"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Tab名称更新基于Vue 3的响应式系统,修改tabs数组元素的title属性会自动触发UI更新"
      },
      {
        "id": "2",
        "name": "项目重命名和删除事件由contentView触发,topBarView监听并响应"
      },
      {
        "id": "3",
        "name": "IPC事件确保topBarView和contentView的数据同步"
      },
      {
        "id": "4",
        "name": "项目删除时,除了移除Tab,还会触发相关的数据清理(如缓存,历史记录等)"
      },
      {
        "id": "5",
        "name": "syncTabsToContentView方法确保Tab列表在两个WebContentsView之间保持一致"
      }
    ]
  }
],
}

export default node
