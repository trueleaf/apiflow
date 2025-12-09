import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "layoutOperation",
  description: "布局操作",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击水平布局按钮,请求区域和响应区域左右排列",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "点击或新建一个HTTP请求节点进入编辑界面"
      },
      {
        "id": "3",
        "name": "当前布局状态为垂直布局(上下排列)"
      },
      {
        "id": "4",
        "name": "projectWorkbenchStore.layout值为\"vertical\""
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到HTTP节点参数编辑区域(Params.vue组件)顶部工具栏"
      },
      {
        "id": "2",
        "name": "找到并点击带有LayoutGrid图标的\"布局\"下拉按钮(data-testid=\"http-params-layout-dropdown\")"
      },
      {
        "id": "3",
        "name": "在弹出的el-dropdown-menu下拉菜单中选择\"左右布局\"选项"
      },
      {
        "id": "4",
        "name": "观察布局立即切换效果"
      },
      {
        "id": "5",
        "name": "拖动中间的垂直分隔条验证可左右调节响应区域宽度"
      },
      {
        "id": "6",
        "name": "双击垂直分隔条验证可重置响应区域宽度"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "布局立即从上下排列切换为左右排列,无需刷新页面"
      },
      {
        "id": "2",
        "name": "请求编辑区域(包含URL输入框,Params/Headers/Body等tabs)固定显示在左侧,占据剩余宽度"
      },
      {
        "id": "3",
        "name": "响应区域(Response组件)固定显示在右侧,初始宽度为500px或上次拖拽保存的宽度"
      },
      {
        "id": "4",
        "name": "两个区域之间显示垂直分隔条(.request-layout的border-right样式)"
      },
      {
        "id": "5",
        "name": "垂直分隔条可以左右拖拽,实时调整响应区域宽度,拖拽时显示宽度提示文字"
      },
      {
        "id": "6",
        "name": "响应区域宽度范围限制在500px-750px之间,超出范围时分隔条无法继续拖动"
      },
      {
        "id": "7",
        "name": "双击垂直分隔条后响应区域宽度重置为默认值"
      },
      {
        "id": "8",
        "name": "\"左右布局\"菜单项文字显示主题色高亮(theme-color类名)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "projectWorkbenchStore.layout响应式值为\"horizontal\""
      },
      {
        "id": "2",
        "name": "localStorage[\"projectWorkbench/layout\"]存储值为\"horizontal\""
      },
      {
        "id": "3",
        "name": "HttpNode.vue中.apidoc容器不包含.vertical类名"
      },
      {
        "id": "4",
        "name": "HttpNode.vue中.request-layout容器不包含.vertical类名"
      },
      {
        "id": "5",
        "name": "HttpNode.vue条件渲染ClResizeX组件(v-if=\"layout === 'horizontal'\"为true)"
      },
      {
        "id": "6",
        "name": "HttpNode.vue不渲染ClResizeY组件(v-if=\"layout === 'vertical'\"为false)"
      },
      {
        "id": "7",
        "name": "ClResizeX组件props包含:min=500, max=750, width=500, bar-left=true, name=\"response\""
      },
      {
        "id": "8",
        "name": "拖拽后的宽度值实时保存到localStorage[\"dragBar/response\"]"
      },
      {
        "id": "9",
        "name": ".apidoc容器CSS为display: flex(默认flex-direction: row)"
      },
      {
        "id": "10",
        "name": ".request-layout右侧边框样式为border-right: 1px solid var(--gray-400)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "布局切换通过handleChangeLayout函数调用projectWorkbenchStore.changeLayout方法实现"
      },
      {
        "id": "2",
        "name": "布局状态通过projectWorkbenchCache.setProjectWorkbenchLayout方法持久化到localStorage"
      },
      {
        "id": "3",
        "name": "响应区域宽度由ClResizeX组件管理,拖拽宽度自动记忆"
      },
      {
        "id": "4",
        "name": "重启应用或刷新页面后布局保持为水平布局"
      },
      {
        "id": "5",
        "name": "ClResizeX组件支持双击重置,实时宽度提示,记忆功能"
      }
    ]
  },
  {
    "purpose": "点击垂直布局按钮,请求区域和响应区域上下排列",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "点击或新建一个HTTP请求节点进入编辑界面"
      },
      {
        "id": "3",
        "name": "当前布局状态为水平布局(左右排列)"
      },
      {
        "id": "4",
        "name": "projectWorkbenchStore.layout值为\"horizontal\""
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到HTTP节点参数编辑区域(Params.vue组件)顶部工具栏"
      },
      {
        "id": "2",
        "name": "找到并点击带有LayoutGrid图标的\"布局\"下拉按钮(data-testid=\"http-params-layout-dropdown\")"
      },
      {
        "id": "3",
        "name": "在弹出的el-dropdown-menu下拉菜单中选择\"上下布局\"选项"
      },
      {
        "id": "4",
        "name": "观察布局立即切换效果"
      },
      {
        "id": "5",
        "name": "拖动中间的水平分隔条验证可上下调节响应区域高度"
      },
      {
        "id": "6",
        "name": "双击水平分隔条验证可重置响应区域高度"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "布局立即从左右排列切换为上下排列,无需刷新页面"
      },
      {
        "id": "2",
        "name": "请求编辑区域(包含URL输入框,Params/Headers/Body等tabs)显示在上方,自适应高度并支持滚动"
      },
      {
        "id": "3",
        "name": "响应区域(Response组件)显示在下方,初始高度为350px或上次拖拽保存的高度"
      },
      {
        "id": "4",
        "name": "两个区域之间显示水平分隔条(.y-bar的border-top样式)"
      },
      {
        "id": "5",
        "name": "水平分隔条可以上下拖拽,实时调整响应区域高度,拖拽时显示高度提示文字"
      },
      {
        "id": "6",
        "name": "响应区域高度范围限制在100px-750px之间(ClResizeY的min和max属性),超出范围时分隔条无法继续拖动"
      },
      {
        "id": "7",
        "name": "双击水平分隔条后响应区域高度重置为默认值350px"
      },
      {
        "id": "8",
        "name": "\"上下布局\"菜单项文字显示主题色高亮(theme-color类名)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "projectWorkbenchStore.layout响应式值为\"vertical\""
      },
      {
        "id": "2",
        "name": "localStorage[\"projectWorkbench/layout\"]存储值为\"vertical\""
      },
      {
        "id": "3",
        "name": "HttpNode.vue中.apidoc容器包含.vertical类名"
      },
      {
        "id": "4",
        "name": "HttpNode.vue中.request-layout容器包含.vertical类名"
      },
      {
        "id": "5",
        "name": "HttpNode.vue条件渲染ClResizeY组件(v-if=\"layout === 'vertical'\"为true)"
      },
      {
        "id": "6",
        "name": "HttpNode.vue不渲染ClResizeX组件(v-if=\"layout === 'horizontal'\"为false)"
      },
      {
        "id": "7",
        "name": "ClResizeY组件props包含:min=100, max=750, height=responseHeight, default-height=350, name=\"response-y\""
      },
      {
        "id": "8",
        "name": "拖拽触发heightChange事件,调用handleResponseHeightChange方法"
      },
      {
        "id": "9",
        "name": "projectWorkbenchStore.changeResponseHeight方法更新响应高度"
      },
      {
        "id": "10",
        "name": "appStateCache.setResponseHeight方法保存高度到localStorage[\"projectWorkbench/responseHeight\"]"
      },
      {
        "id": "11",
        "name": ".apidoc容器CSS包含flex-direction: column"
      },
      {
        "id": "12",
        "name": ".apidoc容器CSS包含overflow: hidden(防止整体滚动)"
      },
      {
        "id": "13",
        "name": ".request-layout的.vertical类样式包含flex: 1和overflow-y: auto(支持内部滚动)"
      },
      {
        "id": "14",
        "name": ".y-bar顶部边框样式为border-top: 1px solid var(--gray-400)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "布局切换通过handleChangeLayout函数调用projectWorkbenchStore.changeLayout方法实现"
      },
      {
        "id": "2",
        "name": "布局状态通过projectWorkbenchCache.setProjectWorkbenchLayout方法持久化到localStorage"
      },
      {
        "id": "3",
        "name": "响应区域高度由ClResizeY组件管理,拖拽高度通过projectWorkbenchStore和appStateCache持久化"
      },
      {
        "id": "4",
        "name": "垂直布局下请求区域支持overflow-y滚动,响应区域固定高度"
      },
      {
        "id": "5",
        "name": "重启应用或刷新页面后布局保持为垂直布局,响应区域高度也保持"
      },
      {
        "id": "6",
        "name": "ClResizeY组件支持双击重置,实时高度提示,拖拽事件监听(dragStart/dragEnd)"
      }
    ]
  },
  {
    "purpose": "切换布局后刷新页面,布局保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "点击或新建一个HTTP请求节点进入编辑界面"
      },
      {
        "id": "3",
        "name": "初始布局为水平布局"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击\"布局\"按钮,切换到\"上下布局\""
      },
      {
        "id": "2",
        "name": "验证布局已切换为垂直布局(请求区域在上,响应区域在下)"
      },
      {
        "id": "3",
        "name": "按F5或点击浏览器刷新按钮刷新页面"
      },
      {
        "id": "4",
        "name": "等待页面完全加载"
      },
      {
        "id": "5",
        "name": "观察布局状态"
      },
      {
        "id": "6",
        "name": "点击\"布局\"按钮,切换到\"左右布局\""
      },
      {
        "id": "7",
        "name": "验证布局已切换为水平布局(请求区域在左,响应区域在右)"
      },
      {
        "id": "8",
        "name": "按F5或点击浏览器刷新按钮再次刷新页面"
      },
      {
        "id": "9",
        "name": "等待页面完全加载"
      },
      {
        "id": "10",
        "name": "观察布局状态"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "步骤3刷新后,布局保持为垂直布局(上下排列)"
      },
      {
        "id": "2",
        "name": "步骤3刷新后,响应区域高度保持为上次拖拽的高度或默认350px"
      },
      {
        "id": "3",
        "name": "步骤8刷新后,布局保持为水平布局(左右排列)"
      },
      {
        "id": "4",
        "name": "步骤8刷新后,响应区域宽度保持为上次拖拽的宽度或默认500px"
      },
      {
        "id": "5",
        "name": "刷新后布局菜单中对应选项保持主题色高亮状态"
      },
      {
        "id": "6",
        "name": "页面刷新过程不会出现布局闪烁或错误的布局状态"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "垂直布局刷新后localStorage[\"projectWorkbench/layout\"]值仍为\"vertical\""
      },
      {
        "id": "2",
        "name": "水平布局刷新后localStorage[\"projectWorkbench/layout\"]值仍为\"horizontal\""
      },
      {
        "id": "3",
        "name": "projectWorkbenchStore.initLayout方法在应用启动时被正确调用"
      },
      {
        "id": "4",
        "name": "initLayout方法通过projectWorkbenchCache.getProjectWorkbenchLayout从localStorage读取布局状态"
      },
      {
        "id": "5",
        "name": "HttpNode.vue的computed: layout正确响应projectWorkbenchStore.layout值"
      },
      {
        "id": "6",
        "name": "垂直布局刷新后localStorage[\"projectWorkbench/responseHeight\"]保持高度值"
      },
      {
        "id": "7",
        "name": "水平布局刷新后localStorage[\"dragBar/response\"]保持宽度值"
      },
      {
        "id": "8",
        "name": "appStateCache.getResponseHeight方法在垂直布局初始化时正确读取高度"
      },
      {
        "id": "9",
        "name": "ClResizeX/ClResizeY组件的记忆功能正确恢复拖拽尺寸"
      },
      {
        "id": "10",
        "name": "projectWorkbenchCache.getProjectWorkbenchLayout在localStorage值异常时返回默认值\"horizontal\""
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "布局持久化依赖localStorage[\"projectWorkbench/layout\"]存储"
      },
      {
        "id": "2",
        "name": "应用启动时projectWorkbenchStore的setup中会调用initLayout初始化布局"
      },
      {
        "id": "3",
        "name": "projectWorkbenchCache提供容错处理:getProjectWorkbenchLayout方法会验证值合法性,非法时返回默认值\"horizontal\""
      },
      {
        "id": "4",
        "name": "响应区域尺寸也会持久化:垂直布局高度存储在\"projectWorkbench/responseHeight\",水平布局宽度存储在\"dragBar/response\""
      },
      {
        "id": "5",
        "name": "ClResizeX和ClResizeY组件都支持name属性,用于在localStorage中区分不同拖拽条的记忆数据"
      },
      {
        "id": "6",
        "name": "测试时应验证跨会话持久化:关闭应用重新打开,布局仍保持"
      }
    ]
  },
  {
    "purpose": "不同布局模式下响应区域的按钮显示正确(水平布局显示详情按钮,垂直布局不显示)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "点击或新建一个HTTP请求节点进入编辑界面"
      },
      {
        "id": "3",
        "name": "已发送过至少一次HTTP请求,响应区域有数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "确认当前布局为水平布局(左右排列)"
      },
      {
        "id": "2",
        "name": "观察响应区域顶部是否显示BaseInfoView组件(基本信息)"
      },
      {
        "id": "3",
        "name": "观察响应区域是否显示ResponseSummaryView组件(响应摘要:状态码,时长,大小,格式)"
      },
      {
        "id": "4",
        "name": "点击布局按钮,切换到垂直布局(上下排列)"
      },
      {
        "id": "5",
        "name": "观察响应区域顶部BaseInfoView组件是否隐藏"
      },
      {
        "id": "6",
        "name": "观察ResponseSummaryView组件是否隐藏"
      },
      {
        "id": "7",
        "name": "再次点击布局按钮,切换回水平布局"
      },
      {
        "id": "8",
        "name": "验证BaseInfoView和ResponseSummaryView组件重新显示"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "水平布局模式下,BaseInfoView组件在响应区域顶部显示"
      },
      {
        "id": "2",
        "name": "BaseInfoView显示请求地址,请求方式,维护人员,创建人员,更新日期,创建日期"
      },
      {
        "id": "3",
        "name": "ResponseSummaryView组件在BaseInfoView下方显示"
      },
      {
        "id": "4",
        "name": "ResponseSummaryView显示状态码(绿色<300/橙色300-400/红色≥400),时长(绿色<2s/橙色2-5s/红色≥5s),大小(绿色<10KB/橙色10-15KB/红色≥15KB),格式(橙色显示contentType)"
      },
      {
        "id": "5",
        "name": "垂直布局模式下,BaseInfoView组件通过v-show=\"layout === 'horizontal'\"条件隐藏,DOM存在但display:none"
      },
      {
        "id": "6",
        "name": "垂直布局模式下,ResponseSummaryView组件通过v-show=\"layout === 'horizontal'\"条件隐藏,DOM存在但display:none"
      },
      {
        "id": "7",
        "name": "垂直布局模式下,响应区域tabs直接显示,无基本信息和响应摘要"
      },
      {
        "id": "8",
        "name": "切换回水平布局后,两个组件立即重新显示,数据保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "ResponseView.vue第2行:<SBaseInfoView v-show=\"layout === 'horizontal'\"></SBaseInfoView>"
      },
      {
        "id": "2",
        "name": "ResponseView.vue第3行:<SResponseSummaryView v-show=\"layout === 'horizontal'\"></SResponseSummaryView>"
      },
      {
        "id": "3",
        "name": "ResponseView.vue第83行:layout = computed(() => projectWorkbenchStore.layout)"
      },
      {
        "id": "4",
        "name": "BaseInfoView组件高度固定:height: var(--apiflow-apidoc-request-view-height)"
      },
      {
        "id": "5",
        "name": "ResponseSummaryView组件高度固定:height: var(--apiflow-response-summary-height)"
      },
      {
        "id": "6",
        "name": "水平布局时,BaseInfoView的v-show=\"layout === 'horizontal'\"为true,组件可见"
      },
      {
        "id": "7",
        "name": "水平布局时,ResponseSummaryView的v-show=\"layout === 'horizontal'\"为true,组件可见"
      },
      {
        "id": "8",
        "name": "垂直布局时,BaseInfoView的v-show=\"layout === 'horizontal'\"为false,组件隐藏"
      },
      {
        "id": "9",
        "name": "垂直布局时,ResponseSummaryView的v-show=\"layout === 'horizontal'\"为false,组件隐藏"
      },
      {
        "id": "10",
        "name": "BaseInfoView显示数据来自httpNodeStore.httpNodeInfo和httpNodeRequestStore.fullUrl"
      },
      {
        "id": "11",
        "name": "ResponseSummaryView显示数据来自httpNodeResponseStore.responseInfo"
      },
      {
        "id": "12",
        "name": "响应摘要的颜色逻辑:状态码(<300绿色/300-400橙色/≥400红色),时长(<2s绿色/2-5s橙色/≥5s红色),大小(<10KB绿色/10-15KB橙色/≥15KB红色)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "BaseInfoView和ResponseSummaryView都使用v-show指令,不是v-if,因此DOM节点始终存在,只是切换display属性"
      },
      {
        "id": "2",
        "name": "这种设计避免了布局切换时重新渲染组件,提高性能"
      },
      {
        "id": "3",
        "name": "垂直布局隐藏这两个组件是为了节省垂直空间,因为垂直布局下请求和响应上下排列,空间更紧张"
      },
      {
        "id": "4",
        "name": "BaseInfoView显示的是接口的元数据信息,对测试接口功能来说是次要信息"
      },
      {
        "id": "5",
        "name": "ResponseSummaryView显示的是响应的快速概览信息(状态码,时长等),但详细信息仍可在tabs中查看"
      },
      {
        "id": "6",
        "name": "布局切换由projectWorkbenchStore.layout状态控制,通过computed响应式更新UI"
      }
    ]
  }
],
}

export default node
