import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "callHistory",
  description: "调用历史区域",
  children: [],
  atomicFunc: [
    {
      "purpose": "切换到调用历史Tab页,验证Tab切换功能和UI展示",
      "precondition": [
        {
          "id": "1",
          "name": "已打开项目工作区,进入项目编辑页面"
        },
        {
          "id": "2",
          "name": "Banner.vue组件已渲染,显示接口列表和调用历史两个Tab"
        },
        {
          "id": "3",
          "name": "当前默认显示接口列表Tab"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "观察banner区域顶部的Tab切换器"
        },
        {
          "id": "2",
          "name": "验证存在'接口列表'和'调用历史'两个Tab选项"
        },
        {
          "id": "3",
          "name": "点击'调用历史'Tab"
        },
        {
          "id": "4",
          "name": "观察Tab切换后的视图变化"
        },
        {
          "id": "5",
          "name": "再次点击'接口列表'Tab切换回去"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "Banner.vue第5-8行渲染CleanTabs组件,包含list和history两个TabPane"
        },
        {
          "id": "2",
          "name": "data-testid=\"banner-tabs\"可用于自动化测试定位Tab组件"
        },
        {
          "id": "3",
          "name": "点击'调用历史'Tab后,bannerViewMode变为'history'"
        },
        {
          "id": "4",
          "name": "SendHistory.vue组件渲染替代el-tree节点树"
        },
        {
          "id": "5",
          "name": "Tab状态持久化到appStateCache.setBannerViewMode()"
        },
        {
          "id": "6",
          "name": "切换回'接口列表'后,恢复显示el-tree节点树"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "Banner.vue第5行:CleanTabs v-model=\"bannerViewMode\""
        },
        {
          "id": "2",
          "name": "Banner.vue第6行:接口列表TabPane name=\"list\""
        },
        {
          "id": "3",
          "name": "Banner.vue第7行:调用历史TabPane name=\"history\""
        },
        {
          "id": "4",
          "name": "Banner.vue第217行:v-else-if=\"bannerViewMode === 'history'\"条件渲染SendHistory"
        },
        {
          "id": "5",
          "name": "Banner.vue第310-313行:bannerViewMode响应式变量和watch监听"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "Tab切换使用CleanTabs组件,提供简洁的卡片式Tab样式"
        },
        {
          "id": "2",
          "name": "bannerViewMode状态通过appStateCache持久化,页面刷新后保持上次选择"
        },
        {
          "id": "3",
          "name": "调用历史功能独立于接口列表,使用不同的数据源和组件"
        }
      ]
    },
    {
      "purpose": "调用历史搜索框功能验证,包括placeholder、清空按钮和防抖搜索",
      "precondition": [
        {
          "id": "1",
          "name": "已切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "SendHistory.vue组件已渲染"
        },
        {
          "id": "3",
          "name": "存在若干历史记录数据"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "观察调用历史区域的搜索框"
        },
        {
          "id": "2",
          "name": "验证搜索框placeholder文字"
        },
        {
          "id": "3",
          "name": "在搜索框中输入关键字"
        },
        {
          "id": "4",
          "name": "等待300ms防抖延迟"
        },
        {
          "id": "5",
          "name": "观察历史列表过滤结果"
        },
        {
          "id": "6",
          "name": "点击清空按钮"
        },
        {
          "id": "7",
          "name": "验证搜索框清空且列表恢复"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "搜索框placeholder显示'过滤历史记录'"
        },
        {
          "id": "2",
          "name": "搜索框左侧显示搜索图标(Search)"
        },
        {
          "id": "3",
          "name": "搜索框右侧显示清空历史记录图标(Delete)"
        },
        {
          "id": "4",
          "name": "输入内容后,300ms防抖后触发search方法"
        },
        {
          "id": "5",
          "name": "历史列表根据输入内容过滤显示匹配项"
        },
        {
          "id": "6",
          "name": "点击清空按钮(clearable)清除输入内容"
        },
        {
          "id": "7",
          "name": "搜索状态通过appStateCache.setHistoryFilterText()持久化"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "SendHistory.vue第6-19行:el-input搜索框配置"
        },
        {
          "id": "2",
          "name": "SendHistory.vue第8行:placeholder=\"t('过滤历史记录')\""
        },
        {
          "id": "3",
          "name": "SendHistory.vue第174-182行:handleSearchInput防抖300ms"
        },
        {
          "id": "4",
          "name": "SendHistory.vue第98行:searchValue初始化从appStateCache获取"
        },
        {
          "id": "5",
          "name": "SendHistory.vue第101-103行:watch searchValue持久化"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "防抖延迟300ms可以减少频繁的搜索请求,提升性能"
        },
        {
          "id": "2",
          "name": "搜索状态持久化让用户切换Tab后仍保留搜索条件"
        },
        {
          "id": "3",
          "name": "搜索功能调用sendHistoryStore.search()方法"
        }
      ]
    },
    {
      "purpose": "清空所有历史记录功能验证,包括确认弹窗和清空操作",
      "precondition": [
        {
          "id": "1",
          "name": "已切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "存在若干历史记录数据"
        },
        {
          "id": "3",
          "name": "SendHistory.vue组件已渲染"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "定位搜索框右侧的删除图标按钮"
        },
        {
          "id": "2",
          "name": "悬停在删除图标上,观察tooltip提示"
        },
        {
          "id": "3",
          "name": "点击删除图标"
        },
        {
          "id": "4",
          "name": "观察弹出的确认对话框"
        },
        {
          "id": "5",
          "name": "点击'取消'按钮"
        },
        {
          "id": "6",
          "name": "验证历史记录未被清空"
        },
        {
          "id": "7",
          "name": "再次点击删除图标,点击'确定'按钮"
        },
        {
          "id": "8",
          "name": "验证历史记录被清空"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "删除图标title显示'清空历史记录'"
        },
        {
          "id": "2",
          "name": "点击后弹出ElMessageBox确认对话框"
        },
        {
          "id": "3",
          "name": "对话框内容:'确定要清空所有历史记录吗？'"
        },
        {
          "id": "4",
          "name": "对话框类型为warning警告类型"
        },
        {
          "id": "5",
          "name": "点击取消后,历史记录保持不变"
        },
        {
          "id": "6",
          "name": "点击确定后,调用sendHistoryCache.clearSendHistory()清空缓存"
        },
        {
          "id": "7",
          "name": "调用sendHistoryStore.clearSendHistoryList()清空store"
        },
        {
          "id": "8",
          "name": "历史列表显示'暂无历史记录'空状态"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "SendHistory.vue第15-18行:删除图标配置"
        },
        {
          "id": "2",
          "name": "SendHistory.vue第184-201行:handleClearHistory方法"
        },
        {
          "id": "3",
          "name": "SendHistory.vue第186-195行:ElMessageBox.confirm确认框"
        },
        {
          "id": "4",
          "name": "SendHistory.vue第196行:sendHistoryCache.clearSendHistory()"
        },
        {
          "id": "5",
          "name": "SendHistory.vue第197行:sendHistoryStore.clearSendHistoryList()"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "清空操作是不可恢复的,因此需要确认对话框防止误操作"
        },
        {
          "id": "2",
          "name": "清空操作同时清理IndexedDB缓存和Pinia store"
        },
        {
          "id": "3",
          "name": "用户取消操作时,catch块不做处理"
        }
      ]
    },
    {
      "purpose": "历史记录列表展示验证,包括方法标签、名称、URL和时间",
      "precondition": [
        {
          "id": "1",
          "name": "已切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "存在HTTP类型和WebSocket类型的历史记录"
        },
        {
          "id": "3",
          "name": "历史记录包含不同请求方法(GET/POST/PUT/DELETE等)"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "观察历史记录列表项的结构"
        },
        {
          "id": "2",
          "name": "验证方法标签显示和颜色"
        },
        {
          "id": "3",
          "name": "验证节点名称和URL显示"
        },
        {
          "id": "4",
          "name": "验证时间格式化显示"
        },
        {
          "id": "5",
          "name": "观察不同方法类型的颜色区分"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "每条历史记录显示:方法标签、名称、URL、时间"
        },
        {
          "id": "2",
          "name": "HTTP请求显示方法名(GET/POST/PUT/DELETE/PATCH)"
        },
        {
          "id": "3",
          "name": "WebSocket显示协议名(WS/WSS)"
        },
        {
          "id": "4",
          "name": "GET方法显示绿色,POST显示黄色,PUT显示蓝色,DELETE显示红色"
        },
        {
          "id": "5",
          "name": "时间格式化:'刚刚'/'N分钟前'/'N小时前'/'N天前'"
        },
        {
          "id": "6",
          "name": "名称和URL支持文字溢出省略(text-overflow: ellipsis)"
        },
        {
          "id": "7",
          "name": "鼠标悬停显示完整名称和URL的title提示"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "SendHistory.vue第33-57行:历史列表项模板"
        },
        {
          "id": "2",
          "name": "SendHistory.vue第136-143行:getMethodLabel方法"
        },
        {
          "id": "3",
          "name": "SendHistory.vue第146-153行:getMethodClass方法"
        },
        {
          "id": "4",
          "name": "SendHistory.vue第156-172行:formatTime时间格式化"
        },
        {
          "id": "5",
          "name": "SendHistory.vue第359-364行:方法颜色样式定义"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "方法颜色与banner节点树中的方法颜色保持一致"
        },
        {
          "id": "2",
          "name": "时间格式化为人性化显示,便于用户理解"
        },
        {
          "id": "3",
          "name": "列表项使用flex布局,支持内容自适应"
        }
      ]
    },
    {
      "purpose": "点击历史记录项打开对应接口Tab页",
      "precondition": [
        {
          "id": "1",
          "name": "已切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "存在HTTP类型的历史记录"
        },
        {
          "id": "3",
          "name": "对应的接口节点在当前项目中存在(未被删除)"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "点击一条HTTP类型的历史记录"
        },
        {
          "id": "2",
          "name": "观察nav区域Tab变化"
        },
        {
          "id": "3",
          "name": "验证工作区显示对应接口内容"
        },
        {
          "id": "4",
          "name": "切换回调用历史Tab"
        },
        {
          "id": "5",
          "name": "点击一条WebSocket类型的历史记录"
        },
        {
          "id": "6",
          "name": "验证WebSocket工作区显示"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "点击HTTP历史项后,projectNavStore.addNav()添加http类型Tab"
        },
        {
          "id": "2",
          "name": "新Tab显示对应接口名称和方法图标"
        },
        {
          "id": "3",
          "name": "工作区切换到HTTP请求编辑界面"
        },
        {
          "id": "4",
          "name": "点击WebSocket历史项后,添加websocket类型Tab"
        },
        {
          "id": "5",
          "name": "Tab的saved属性为true,fixed属性为false"
        },
        {
          "id": "6",
          "name": "Tab的selected属性为true,表示当前选中"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "SendHistory.vue第238-273行:handleClickItem方法"
        },
        {
          "id": "2",
          "name": "SendHistory.vue第244-257行:HTTP类型添加nav逻辑"
        },
        {
          "id": "3",
          "name": "SendHistory.vue第258-272行:WebSocket类型添加nav逻辑"
        },
        {
          "id": "4",
          "name": "projectNavStore.addNav()方法处理Tab添加"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "点击历史项是一种快捷访问接口的方式"
        },
        {
          "id": "2",
          "name": "历史记录保存了nodeId,用于关联原始接口"
        },
        {
          "id": "3",
          "name": "已删除接口的历史记录点击无效(cursor: not-allowed)"
        }
      ]
    },
    {
      "purpose": "已删除接口的历史记录标记和处理",
      "precondition": [
        {
          "id": "1",
          "name": "已切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "存在若干历史记录"
        },
        {
          "id": "3",
          "name": "部分历史记录对应的接口已被删除"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "观察历史列表中已删除接口的显示"
        },
        {
          "id": "2",
          "name": "验证已删除标记的样式"
        },
        {
          "id": "3",
          "name": "尝试点击已删除的历史项"
        },
        {
          "id": "4",
          "name": "观察是否有清理已删除历史按钮"
        },
        {
          "id": "5",
          "name": "点击清理按钮"
        },
        {
          "id": "6",
          "name": "确认清理操作"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "已删除接口的历史记录显示'已删除'红色标签"
        },
        {
          "id": "2",
          "name": "已删除项透明度降低(opacity: 0.5)"
        },
        {
          "id": "3",
          "name": "已删除项鼠标样式为not-allowed"
        },
        {
          "id": "4",
          "name": "点击已删除项时handleClickItem直接return,不做任何操作"
        },
        {
          "id": "5",
          "name": "存在已删除记录时,显示'清理已删除接口历史'按钮"
        },
        {
          "id": "6",
          "name": "按钮显示已删除记录数量"
        },
        {
          "id": "7",
          "name": "点击清理按钮后弹出确认对话框"
        },
        {
          "id": "8",
          "name": "确认后批量删除已删除接口的历史记录"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "SendHistory.vue第38行:deleted-item样式类"
        },
        {
          "id": "2",
          "name": "SendHistory.vue第54行:已删除标签v-if=\"item.isDeleted\""
        },
        {
          "id": "3",
          "name": "SendHistory.vue第110-122行:existingNodeIds计算属性"
        },
        {
          "id": "4",
          "name": "SendHistory.vue第124-129行:sendHistoryListWithStatus计算属性"
        },
        {
          "id": "5",
          "name": "SendHistory.vue第21-29行:清理已删除按钮"
        },
        {
          "id": "6",
          "name": "SendHistory.vue第203-224行:handleCleanDeletedHistory方法"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "通过对比banner节点树判断接口是否已删除"
        },
        {
          "id": "2",
          "name": "使用Set数据结构提高查询性能"
        },
        {
          "id": "3",
          "name": "清理功能帮助用户保持历史记录整洁"
        }
      ]
    },
    {
      "purpose": "历史记录滚动加载更多功能验证",
      "precondition": [
        {
          "id": "1",
          "name": "已切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "存在超过一页的历史记录(需要滚动加载)"
        },
        {
          "id": "3",
          "name": "初始加载显示第一页数据"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "观察初始加载的历史记录数量"
        },
        {
          "id": "2",
          "name": "向下滚动历史列表"
        },
        {
          "id": "3",
          "name": "滚动到接近底部位置(距离底部<100px)"
        },
        {
          "id": "4",
          "name": "观察加载状态"
        },
        {
          "id": "5",
          "name": "等待新数据加载完成"
        },
        {
          "id": "6",
          "name": "继续滚动直到没有更多数据"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "初始加载第一批历史记录"
        },
        {
          "id": "2",
          "name": "滚动到底部100px范围内时触发loadMore"
        },
        {
          "id": "3",
          "name": "加载中显示loading状态和'加载中...'文字"
        },
        {
          "id": "4",
          "name": "新数据追加到列表底部"
        },
        {
          "id": "5",
          "name": "所有数据加载完成后显示'没有更多了'"
        },
        {
          "id": "6",
          "name": "loading状态期间不会重复触发加载"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "SendHistory.vue第33行:@scroll=\"handleScroll\"事件绑定"
        },
        {
          "id": "2",
          "name": "SendHistory.vue第227-235行:handleScroll方法"
        },
        {
          "id": "3",
          "name": "SendHistory.vue第232行:scrollHeight - scrollTop - clientHeight < 100判断"
        },
        {
          "id": "4",
          "name": "SendHistory.vue第60-63行:loading状态显示"
        },
        {
          "id": "5",
          "name": "SendHistory.vue第64-66行:没有更多数据提示"
        },
        {
          "id": "6",
          "name": "sendHistoryStore.loadMore()方法处理分页加载"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "无限滚动加载提升用户体验,避免一次加载过多数据"
        },
        {
          "id": "2",
          "name": "loading和hasMore状态控制是否触发加载"
        },
        {
          "id": "3",
          "name": "100px阈值保证用户滚动时有足够时间加载新数据"
        }
      ]
    },
    {
      "purpose": "暂无历史记录的空状态展示",
      "precondition": [
        {
          "id": "1",
          "name": "已切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "当前项目没有任何历史记录"
        },
        {
          "id": "3",
          "name": "或者搜索结果为空"
        }
      ],
      "operationSteps": [
        {
          "id": "1",
          "name": "切换到调用历史Tab"
        },
        {
          "id": "2",
          "name": "观察空状态展示"
        },
        {
          "id": "3",
          "name": "或在搜索框输入不存在的内容"
        },
        {
          "id": "4",
          "name": "观察搜索无结果时的展示"
        }
      ],
      "expectedResults": [
        {
          "id": "1",
          "name": "列表区域显示'暂无历史记录'提示文字"
        },
        {
          "id": "2",
          "name": "提示文字居中显示,颜色为次要文字色"
        },
        {
          "id": "3",
          "name": "搜索无结果时同样显示空状态"
        },
        {
          "id": "4",
          "name": "空状态使用empty样式类"
        }
      ],
      "checkpoints": [
        {
          "id": "1",
          "name": "SendHistory.vue第67-69行:空状态条件判断"
        },
        {
          "id": "2",
          "name": "v-if=\"!loading && sendHistoryListWithStatus.length === 0\""
        },
        {
          "id": "3",
          "name": "SendHistory.vue第411-415行:empty样式定义"
        }
      ],
      "notes": [
        {
          "id": "1",
          "name": "空状态提供友好的用户反馈"
        },
        {
          "id": "2",
          "name": "需要确保loading为false时才显示空状态"
        },
        {
          "id": "3",
          "name": "i18n翻译支持中英文显示"
        }
      ]
    }
  ],
}

export default node
