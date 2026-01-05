import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "quickIcons",
  description: "其他快捷图标功能",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击新增项目按钮可以新增项目",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "当前在主页面或任意页面"
      },
      {
        "id": "3",
        "name": "Header导航栏已渲染"
      },
      {
        "id": "4",
        "name": "IPC通信正常工作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到顶部Header导航栏Tab列表左侧的新增项目按钮(+按钮)"
      },
      {
        "id": "2",
        "name": "点击+按钮(data-testid=\"header-add-project-btn\",button.add-tab-btn)"
      },
      {
        "id": "3",
        "name": "观察是否弹出新建项目对话框"
      },
      {
        "id": "4",
        "name": "填写项目名称,选择网络模式等必要信息"
      },
      {
        "id": "5",
        "name": "点击确认按钮创建项目"
      },
      {
        "id": "6",
        "name": "观察Tab列表和内容区域的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击+按钮后,新建项目对话框在内容区域弹出"
      },
      {
        "id": "2",
        "name": "对话框包含项目名称输入框,网络模式选择等配置项"
      },
      {
        "id": "3",
        "name": "项目创建成功后,对话框关闭"
      },
      {
        "id": "4",
        "name": "Tab列表新增一个项目Tab,显示新项目名称和Folder图标"
      },
      {
        "id": "5",
        "name": "新项目Tab被自动高亮(激活状态)"
      },
      {
        "id": "6",
        "name": "内容区域自动切换到新项目的工作区界面"
      },
      {
        "id": "7",
        "name": "新项目Tab插入到正确位置(同网络模式的最后一个项目Tab之后)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第26行定义+按钮:button.add-tab-btn, @click=\"handleAddProject\""
      },
      {
        "id": "2",
        "name": "handleAddProject方法(Header.vue第275行)发送IPC事件到contentView"
      },
      {
        "id": "3",
        "name": "调用window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.createProject)"
      },
      {
        "id": "4",
        "name": "App.vue监听IPC事件:window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.createProject, ...)"
      },
      {
        "id": "5",
        "name": "监听处理中设置dialogVisible.value = true,显示新建项目对话框"
      },
      {
        "id": "6",
        "name": "项目创建成功后触发projectCreated事件,Header监听该事件并新增Tab"
      },
      {
        "id": "7",
        "name": "Tab新增逻辑与之前的projectCreated处理一致(splice插入)"
      },
      {
        "id": "8",
        "name": "+按钮title提示文字:t(\"新建项目\")"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "新增项目按钮位于Tab列表左侧,独立于Tab项"
      },
      {
        "id": "2",
        "name": "IPC通信路径:topBarView -> mainProcess -> contentView"
      },
      {
        "id": "3",
        "name": "新建项目对话框在contentView中渲染,topBarView仅负责触发"
      },
      {
        "id": "4",
        "name": "项目创建流程涉及数据库操作(在线模式)或IndexedDB操作(离线模式)"
      }
    ]
  },
  {
    "purpose": "点击AI助理按钮,弹出AI助理弹窗,如果是第一次弹窗,弹窗位置再AI助理按钮下方,如果不是第一次弹窗,弹窗位置在上次拖拽后位置处,多次点击不会关闭AI助理",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "已配置AI助理相关设置(可选)"
      },
      {
        "id": "3",
        "name": "Header导航栏已渲染"
      },
      {
        "id": "4",
        "name": "agentViewStore正常工作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "场景1:第一次打开AI助理"
      },
      {
        "id": "2",
        "name": "定位到顶部Header的AI助理按钮(Bot图标,data-testid=\"header-ai-btn\")"
      },
      {
        "id": "3",
        "name": "点击AI助理按钮"
      },
      {
        "id": "4",
        "name": "观察AI助理弹窗的位置(应在按钮下方)"
      },
      {
        "id": "5",
        "name": "拖动AI助理弹窗到新位置"
      },
      {
        "id": "6",
        "name": "关闭AI助理弹窗"
      },
      {
        "id": "7",
        "name": "场景2:再次打开AI助理"
      },
      {
        "id": "8",
        "name": "再次点击AI助理按钮"
      },
      {
        "id": "9",
        "name": "观察AI助理弹窗的位置(应在上次拖拽后的位置)"
      },
      {
        "id": "10",
        "name": "场景3:多次点击按钮,观察弹窗是否关闭"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "场景1:点击AI助理按钮后,AI助理弹窗显示"
      },
      {
        "id": "2",
        "name": "第一次打开时,弹窗初始位置锚定在AI助理按钮下方(按钮的x, y, width, height信息传递)"
      },
      {
        "id": "3",
        "name": "AI助理弹窗支持拖拽移动"
      },
      {
        "id": "4",
        "name": "弹窗位置被记录并持久化保存"
      },
      {
        "id": "5",
        "name": "场景2:再次打开时,弹窗位置恢复为上次拖拽后保存的位置"
      },
      {
        "id": "6",
        "name": "场景3:多次点击AI助理按钮不会关闭已打开的弹窗,弹窗保持显示状态"
      },
      {
        "id": "7",
        "name": "AI助理弹窗包含聊天界面,输入框等功能组件"
      },
      {
        "id": "8",
        "name": "支持键盘快捷键Ctrl+L打开AI助理"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第30-32行定义AI助理按钮:button.ai-trigger-btn, ref=\"aiButtonRef\", @click=\"handleShowAiDialog\""
      },
      {
        "id": "2",
        "name": "handleShowAiDialog方法(Header.vue第276-288行)获取按钮位置信息"
      },
      {
        "id": "3",
        "name": "使用aiButtonRef.value.getBoundingClientRect()获取按钮的DOMRect(x, y, width, height)"
      },
      {
        "id": "4",
        "name": "构造AnchorRect对象:{x: rect.left, y: rect.top, width: rect.width, height: rect.height}"
      },
      {
        "id": "5",
        "name": "发送IPC事件:window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.showAiDialog, { position })"
      },
      {
        "id": "6",
        "name": "App.vue监听事件并调用agentViewStore.showAgentViewDialog(payload?.position)"
      },
      {
        "id": "7",
        "name": "agentViewStore负责管理AI助理弹窗的显示/隐藏状态和位置记忆"
      },
      {
        "id": "8",
        "name": "弹窗位置通过localStorage或类似机制持久化保存"
      },
      {
        "id": "9",
        "name": "showCopilotDialog方法判断是否传入position参数,决定使用锚点位置还是记忆位置"
      },
      {
        "id": "10",
        "name": "多次点击不关闭通过只调用show方法实现,不toggle状态"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "AI助理按钮title提示:t(\"AI助手 Ctrl+L\"),支持快捷键"
      },
      {
        "id": "2",
        "name": "AnchorRect类型用于传递锚点位置信息"
      },
      {
        "id": "3",
        "name": "getBoundingClientRect()返回元素相对视口的位置和尺寸"
      },
      {
        "id": "4",
        "name": "AI助理弹窗是可拖拽对话框组件,支持位置记忆功能"
      },
      {
        "id": "5",
        "name": "agentViewStore是专门管理AI助理状态的Pinia store"
      }
    ]
  },
  {
    "purpose": "点击设置按钮,新增一个设置tab,并且内容区域展示为设置页面",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "Header导航栏已渲染"
      },
      {
        "id": "3",
        "name": "当前不在设置页面或设置Tab未打开"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到顶部Header右侧的设置图标按钮(齿轮图标,data-testid=\"header-settings-btn\")"
      },
      {
        "id": "2",
        "name": "点击设置按钮"
      },
      {
        "id": "3",
        "name": "观察Tab列表是否新增设置Tab"
      },
      {
        "id": "4",
        "name": "观察设置Tab是否被高亮(激活状态)"
      },
      {
        "id": "5",
        "name": "观察内容区域是否切换到设置页面"
      },
      {
        "id": "6",
        "name": "再次点击设置按钮(测试已存在Tab的情况)"
      },
      {
        "id": "7",
        "name": "观察是否新增重复的设置Tab"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击设置按钮后,Tab列表新增一个设置Tab"
      },
      {
        "id": "2",
        "name": "设置Tab显示\"设置\"文字和Settings图标(齿轮图标)"
      },
      {
        "id": "3",
        "name": "设置Tab被自动高亮(激活状态),其他Tab失去高亮"
      },
      {
        "id": "4",
        "name": "设置Tab插入到Tab列表末尾(在所有项目Tab之后)"
      },
      {
        "id": "5",
        "name": "内容区域立即切换到设置页面,显示设置页面内容"
      },
      {
        "id": "6",
        "name": "设置Tab的id格式为\"settings-{networkMode}\"(如\"settings-online\"或\"settings-offline\")"
      },
      {
        "id": "7",
        "name": "再次点击设置按钮时,不新增重复Tab,仅高亮已有的设置Tab"
      },
      {
        "id": "8",
        "name": "在线模式和离线模式各有独立的设置Tab"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第38-40行定义设置按钮:el-icon.icon, data-testid=\"header-settings-btn\", @click=\"jumpToSettings\""
      },
      {
        "id": "2",
        "name": "jumpToSettings方法(Header.vue第257-270行)处理设置Tab逻辑"
      },
      {
        "id": "3",
        "name": "构造settingsTabId:`settings-${networkMode.value}`(区分在线/离线)"
      },
      {
        "id": "4",
        "name": "使用tabs.value.find(t => t.id === settingsTabId)检查设置Tab是否已存在"
      },
      {
        "id": "5",
        "name": "Tab不存在时,使用tabs.value.push()在末尾添加新Tab"
      },
      {
        "id": "6",
        "name": "新Tab结构:{id: settingsTabId, title: t(\"设置\"), type: 'settings', network: networkMode.value}"
      },
      {
        "id": "7",
        "name": "Tab添加后调用syncTabsToContentView()同步到contentView"
      },
      {
        "id": "8",
        "name": "调用switchTab(settingsTabId)高亮设置Tab"
      },
      {
        "id": "9",
        "name": "switchTab内部发送导航事件到contentView,触发路由切换到/settings"
      },
      {
        "id": "10",
        "name": "设置按钮title提示文字:t(\"设置\")"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "设置Tab使用网络模式区分,在线和离线模式各有独立的设置Tab"
      },
      {
        "id": "2",
        "name": "设置Tab的type字段为'settings',用于渲染Settings图标和识别Tab类型"
      },
      {
        "id": "3",
        "name": "设置Tab始终插入到Tab列表末尾,通过push方法实现"
      },
      {
        "id": "4",
        "name": "重复点击设置按钮不会创建多个设置Tab,通过existingTab判断实现"
      },
      {
        "id": "5",
        "name": "内容区域的设置页面路由路径为/settings"
      }
    ]
  },
  {
    "purpose": "点击多语言图标,下方展示简体中文,繁体中文,英语,日本语选项,点击内容区域关闭语言切换弹窗",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "Header导航栏已渲染"
      },
      {
        "id": "3",
        "name": "多语言功能已正确配置(vue-i18n)"
      },
      {
        "id": "4",
        "name": "runtimeStore正常工作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到顶部Header右侧的语言切换按钮(iconyuyan图标,data-testid=\"header-language-btn\")"
      },
      {
        "id": "2",
        "name": "观察按钮显示的当前语言标识(如\"中\",\"繁\",\"EN\",\"JP\")"
      },
      {
        "id": "3",
        "name": "点击语言切换按钮"
      },
      {
        "id": "4",
        "name": "观察是否在按钮下方弹出语言选择菜单"
      },
      {
        "id": "5",
        "name": "检查菜单中的语言选项(应包含:简体中文,繁体中文,English,日本語)"
      },
      {
        "id": "6",
        "name": "点击某个语言选项(如English)"
      },
      {
        "id": "7",
        "name": "观察应用界面的语言是否切换"
      },
      {
        "id": "8",
        "name": "观察语言按钮的标识是否更新(如变为\"EN\")"
      },
      {
        "id": "9",
        "name": "再次点击语言按钮,点击内容区域任意位置"
      },
      {
        "id": "10",
        "name": "观察语言菜单是否关闭"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "语言按钮显示当前语言的简写标识:zh-cn=\"中\", zh-tw=\"繁\", en=\"EN\", ja=\"JP\""
      },
      {
        "id": "2",
        "name": "点击按钮后,语言选择菜单在按钮正下方弹出"
      },
      {
        "id": "3",
        "name": "菜单包含4个语言选项:简体中文,繁体中文,English,日本語"
      },
      {
        "id": "4",
        "name": "当前选中的语言选项在菜单中高亮显示或有特殊标记"
      },
      {
        "id": "5",
        "name": "点击语言选项后,应用界面的所有文字立即切换为对应语言,无需刷新页面"
      },
      {
        "id": "6",
        "name": "语言按钮的标识文字更新为新选择的语言(如\"EN\")"
      },
      {
        "id": "7",
        "name": "语言切换后,新语言设置被持久化保存到localStorage"
      },
      {
        "id": "8",
        "name": "点击内容区域(contentView)任意位置后,语言菜单自动关闭"
      },
      {
        "id": "9",
        "name": "刷新页面或重启应用后,语言保持为最后选择的语言"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第41-44行定义语言按钮:.icon, ref=\"languageButtonRef\", data-testid=\"header-language-btn\", @click=\"handleChangeLanguage\""
      },
      {
        "id": "2",
        "name": "currentLanguageDisplay计算属性(Header.vue第160-168行)映射语言代码到显示文字"
      },
      {
        "id": "3",
        "name": "languageMap对象:{\"zh-cn\": \"中\", \"zh-tw\": \"繁\", \"en\": \"EN\", \"ja\": \"JP\"}"
      },
      {
        "id": "4",
        "name": "handleChangeLanguage方法(Header.vue第170-186行)获取按钮位置并发送IPC事件"
      },
      {
        "id": "5",
        "name": "使用languageButtonRef.value.getBoundingClientRect()获取按钮位置"
      },
      {
        "id": "6",
        "name": "发送IPC事件:IPC_EVENTS.apiflow.topBarToContent.showLanguageMenu, {position, currentLanguage}"
      },
      {
        "id": "7",
        "name": "App.vue监听showLanguageMenu事件,显示语言选择菜单组件"
      },
      {
        "id": "8",
        "name": "语言选择菜单监听click outside事件,点击外部区域时关闭"
      },
      {
        "id": "9",
        "name": "选择语言后调用handleLanguageSelect(App.vue第105-111行)"
      },
      {
        "id": "10",
        "name": "runtimeStore.setLanguage(language)保存语言设置"
      },
      {
        "id": "11",
        "name": "changeLanguage(language)切换vue-i18n的当前语言"
      },
      {
        "id": "12",
        "name": "发送IPC事件通知topBarView语言已变更:IPC_EVENTS.apiflow.contentToTopBar.languageChanged"
      },
      {
        "id": "13",
        "name": "runtimeCache.setLanguage方法将语言保存到localStorage[\"runtime/language\"]"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "语言切换基于vue-i18n库,支持全局i18n文本的响应式更新"
      },
      {
        "id": "2",
        "name": "支持的语言类型:type Language = \"zh-cn\" | \"zh-tw\" | \"en\" | \"ja\""
      },
      {
        "id": "3",
        "name": "语言按钮显示简写,便于在狭小空间中显示"
      },
      {
        "id": "4",
        "name": "语言菜单是独立组件,支持键盘导航和无障碍访问"
      },
      {
        "id": "5",
        "name": "语言切换通过IPC事件在topBarView和contentView之间同步"
      }
    ]
  },
  {
    "purpose": "点击网络切换按钮可以切换联网模式和单机模式",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "Header导航栏已渲染"
      },
      {
        "id": "3",
        "name": "runtimeStore正常工作"
      },
      {
        "id": "4",
        "name": "当前处于某一网络模式(在线或离线)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察当前网络模式按钮的图标和文字(iconwifi/iconwifi-off-line)"
      },
      {
        "id": "2",
        "name": "记录当前显示的Tab列表"
      },
      {
        "id": "3",
        "name": "点击网络模式切换按钮(data-testid=\"header-network-toggle\")"
      },
      {
        "id": "4",
        "name": "观察按钮图标和文字是否变化"
      },
      {
        "id": "5",
        "name": "观察Tab列表是否变化(应只显示新模式的Tab)"
      },
      {
        "id": "6",
        "name": "观察内容区域是否有变化"
      },
      {
        "id": "7",
        "name": "再次点击网络模式按钮,切换回原模式"
      },
      {
        "id": "8",
        "name": "观察Tab列表是否恢复为原来的Tab"
      },
      {
        "id": "9",
        "name": "刷新页面,验证网络模式是否保持"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "在线模式:按钮显示wifi图标(iconwifi)和文字\"联网模式\""
      },
      {
        "id": "2",
        "name": "离线模式:按钮显示wifi-off图标(iconwifi-off-line)和文字\"离线模式\""
      },
      {
        "id": "3",
        "name": "点击按钮后,网络模式立即切换(online ↔ offline)"
      },
      {
        "id": "4",
        "name": "按钮图标和文字同步更新为对应模式"
      },
      {
        "id": "5",
        "name": "Tab列表过滤显示:仅显示当前网络模式的Tab,隐藏其他模式的Tab"
      },
      {
        "id": "6",
        "name": "如果当前高亮的Tab不属于新模式,自动切换到新模式的第一个Tab或主页面"
      },
      {
        "id": "7",
        "name": "网络模式切换后,新模式设置被持久化保存到localStorage"
      },
      {
        "id": "8",
        "name": "切换模式不会删除Tab数据,仅影响显示过滤"
      },
      {
        "id": "9",
        "name": "刷新页面后,网络模式保持为最后选择的模式"
      },
      {
        "id": "10",
        "name": "在线模式支持与服务器同步,离线模式使用IndexedDB本地存储"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第45-54行定义网络切换按钮:el-icon, class=\"network-btn icon\", data-testid=\"header-network-toggle\", @click=\"toggleNetworkMode\""
      },
      {
        "id": "2",
        "name": "networkMode响应式变量(Header.vue第84行):ref<RuntimeNetworkMode>(...)"
      },
      {
        "id": "3",
        "name": "图标条件渲染::class=\"networkMode === 'online' ? 'iconwifi' : 'iconwifi-off-line'\""
      },
      {
        "id": "4",
        "name": "文字条件渲染:{{ networkMode === 'online' ? t(\"联网模式\") : t(\"离线模式\") }}"
      },
      {
        "id": "5",
        "name": "toggleNetworkMode方法(Header.vue第271-274行)切换网络模式"
      },
      {
        "id": "6",
        "name": "计算新模式:const newMode = networkMode.value === 'online' ? 'offline' : 'online'"
      },
      {
        "id": "7",
        "name": "发送IPC事件:window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, newMode)"
      },
      {
        "id": "8",
        "name": "App.vue监听networkModeChanged事件,调用runtimeStore.setNetworkMode(mode)"
      },
      {
        "id": "9",
        "name": "runtimeStore.setNetworkMode保存到runtimeCache,写入localStorage[\"runtime/networkMode\"]"
      },
      {
        "id": "10",
        "name": "Header监听networkModeChanged事件(Header.vue第362-364行),更新networkMode.value"
      },
      {
        "id": "11",
        "name": "draggableTabs计算属性自动过滤:computed(() => tabs.value.filter(tab => tab.network === networkMode.value))"
      },
      {
        "id": "12",
        "name": "Tab的network字段('online' | 'offline')用于分组和过滤"
      },
      {
        "id": "13",
        "name": "网络模式初始化:networkMode.value = runtimeCache.getNetworkMode(),默认为'online'"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "网络模式类型:type RuntimeNetworkMode = 'online' | 'offline'"
      },
      {
        "id": "2",
        "name": "在线模式连接后端服务器,支持团队协作和云端同步"
      },
      {
        "id": "3",
        "name": "离线模式使用IndexedDB本地存储,支持完全离线工作"
      },
      {
        "id": "4",
        "name": "Tab按network字段分组,每个模式维护独立的Tab列表"
      },
      {
        "id": "5",
        "name": "网络模式切换不会丢失任何Tab数据,切换回来时Tab完整恢复"
      },
      {
        "id": "6",
        "name": "按钮title提示根据当前模式动态变化"
      }
    ]
  }
],
}

export default node
