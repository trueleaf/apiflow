import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "deleteHttpNode",
  description: "删除httpNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键httpNode节点删除",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少一个httpNode节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含待删除的httpNode节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标httpNode节点"
      },
      {
        "id": "2",
        "name": "鼠标右键点击该httpNode节点"
      },
      {
        "id": "3",
        "name": "在弹出的SContextmenu右键菜单中找到\"删除\"选项(hot-key提示:Delete)"
      },
      {
        "id": "4",
        "name": "点击\"删除\"菜单项"
      },
      {
        "id": "5",
        "name": "在弹出的ElMessageBox确认对话框中查看提示文字:确定删除 [节点名称] 节点"
      },
      {
        "id": "6",
        "name": "点击\"确定\"按钮确认删除"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击右键后立即显示右键菜单,菜单中包含\"删除\"选项且显示快捷键提示\"Delete\""
      },
      {
        "id": "2",
        "name": "点击\"删除\"后弹出确认对话框,对话框类型为warning,标题为\"提示\""
      },
      {
        "id": "3",
        "name": "确认对话框中显示文字:确定删除 [节点名称] 节点"
      },
      {
        "id": "4",
        "name": "点击\"确定\"后节点立即从banner文档树中移除,不再显示"
      },
      {
        "id": "5",
        "name": "如果删除的节点当前处于active状态,删除后编辑区域清空或切换到其他节点"
      },
      {
        "id": "6",
        "name": "如果该节点在projectNavStore的nav列表中,对应的nav项也被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleShowContextmenu方法(Banner.vue:339-362)正确处理右键点击事件"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.value被设置为当前右键点击的httpNode节点"
      },
      {
        "id": "3",
        "name": "showContextmenu.value设置为true,contextmenuLeft和contextmenuTop设置为鼠标位置"
      },
      {
        "id": "4",
        "name": "SContextmenu组件条件渲染(Banner.vue:221,v-if=\"showContextmenu && selectNodes.length <= 1\")"
      },
      {
        "id": "5",
        "name": "\"删除\"菜单项条件显示(Banner.vue:243,v-show=\"currentOperationalNode\")"
      },
      {
        "id": "6",
        "name": "点击\"删除\"触发handleDeleteNodes方法(Banner.vue:526-527)"
      },
      {
        "id": "7",
        "name": "handleDeleteNodes内部调用deleteNode函数,传入selectNodes.value数组"
      },
      {
        "id": "8",
        "name": "deleteNode函数(curd-node.ts:33-133)收集deleteIds数组,包含节点_id"
      },
      {
        "id": "9",
        "name": "ElMessageBox.confirm显示确认对话框(curd-node.ts:121-132)"
      },
      {
        "id": "10",
        "name": "离线模式:调用apiNodesCache.deleteNodes(deleteIds)删除IndexedDB中的节点数据"
      },
      {
        "id": "11",
        "name": "在线模式:调用request.delete(\"/api/project/doc\", params)删除服务器节点数据"
      },
      {
        "id": "12",
        "name": "bannerStore.splice方法从banner数组中移除节点(curd-node.ts:81-84)"
      },
      {
        "id": "13",
        "name": "projectNavStore.deleteNavByIds删除nav项(curd-node.ts:107-111)"
      },
      {
        "id": "14",
        "name": "触发eventEmitter.emit(\"apidoc/deleteDocs\")事件(curd-node.ts:112)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "右键菜单通过@node-contextmenu事件绑定到el-tree组件"
      },
      {
        "id": "2",
        "name": "deleteNode函数支持单个或多个节点删除,通过selectNodes数组参数传入"
      },
      {
        "id": "3",
        "name": "删除操作需要用户确认,使用ElMessageBox.confirm组件"
      },
      {
        "id": "4",
        "name": "删除httpNode时不会递归删除子节点(因为httpNode不是folder类型)"
      },
      {
        "id": "5",
        "name": "projectNavStore.deleteNavByIds只删除非folder类型节点的nav项(curd-node.ts:102-105)"
      }
    ]
  },
  {
    "purpose": "鼠标移动到httpNode节点,点击更多操作删除节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少一个httpNode节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含待删除的httpNode节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标httpNode节点"
      },
      {
        "id": "2",
        "name": "将鼠标移动到该httpNode节点上(触发@mouseenter.stop=\"handleNodeHover\"事件)"
      },
      {
        "id": "3",
        "name": "观察节点右侧出现\"更多操作\"按钮(.more元素,包含MoreFilled图标)"
      },
      {
        "id": "4",
        "name": "点击\"更多操作\"按钮(data-testid=\"banner-node-more-btn\")"
      },
      {
        "id": "5",
        "name": "在弹出的右键菜单中找到\"删除\"选项"
      },
      {
        "id": "6",
        "name": "点击\"删除\"菜单项"
      },
      {
        "id": "7",
        "name": "在弹出的ElMessageBox确认对话框中点击\"确定\"按钮"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "鼠标悬停节点时,节点右侧显示\"更多操作\"按钮,按钮包含MoreFilled图标"
      },
      {
        "id": "2",
        "name": "点击\"更多操作\"按钮后显示右键菜单,菜单内容与右键节点相同"
      },
      {
        "id": "3",
        "name": "菜单中包含\"删除\"选项,显示快捷键提示\"Delete\""
      },
      {
        "id": "4",
        "name": "点击\"删除\"后弹出确认对话框,对话框类型为warning"
      },
      {
        "id": "5",
        "name": "点击\"确定\"后节点立即从banner文档树中移除"
      },
      {
        "id": "6",
        "name": "节点对应的nav项从projectNavStore中删除"
      },
      {
        "id": "7",
        "name": "离线模式下IndexedDB中的节点数据被删除,在线模式下服务器数据被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "httpNode节点渲染包含.more按钮(Banner.vue:58-62)"
      },
      {
        "id": "2",
        "name": ".more按钮绑定@click.stop事件,阻止冒泡并调用handleShowContextmenu"
      },
      {
        "id": "3",
        "name": "handleShowContextmenu($event, scope.data)接收节点数据作为参数"
      },
      {
        "id": "4",
        "name": "currentOperationalNode.value被设置为点击的httpNode节点"
      },
      {
        "id": "5",
        "name": "showContextmenu.value设置为true"
      },
      {
        "id": "6",
        "name": "contextmenuLeft和contextmenuTop设置为$event.clientX和$event.clientY"
      },
      {
        "id": "7",
        "name": "SContextmenu组件根据showContextmenu和selectNodes.length条件渲染"
      },
      {
        "id": "8",
        "name": "点击\"删除\"触发handleDeleteNodes方法"
      },
      {
        "id": "9",
        "name": "deleteNode函数执行删除逻辑,包含确认对话框"
      },
      {
        "id": "10",
        "name": "bannerStore.splice从数组中移除节点数据"
      },
      {
        "id": "11",
        "name": "projectNavStore.deleteNavByIds删除nav项"
      },
      {
        "id": "12",
        "name": "触发apidoc/deleteDocs事件"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "更多操作按钮通过@mouseenter事件触发显示,鼠标悬停时可见"
      },
      {
        "id": "2",
        "name": "点击更多操作按钮和右键节点最终都调用同一个handleShowContextmenu方法"
      },
      {
        "id": "3",
        "name": "更多操作按钮使用@click.stop阻止事件冒泡,避免触发节点点击事件"
      },
      {
        "id": "4",
        "name": "data-testid=\"banner-node-more-btn\"可用于E2E测试定位按钮元素"
      },
      {
        "id": "5",
        "name": "删除操作的后续流程与右键删除完全相同,复用deleteNode函数"
      }
    ]
  },
  {
    "purpose": "按住ctrl鼠标左键批量选择httpNode节点,鼠标右键批量删除",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少2个httpNode节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含多个待删除的httpNode节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到多个目标httpNode节点"
      },
      {
        "id": "2",
        "name": "按住键盘上的Ctrl键不放"
      },
      {
        "id": "3",
        "name": "按住Ctrl键的同时,依次鼠标左键点击第一个httpNode节点"
      },
      {
        "id": "4",
        "name": "观察第一个节点被选中,节点添加.select-node类名高亮显示"
      },
      {
        "id": "5",
        "name": "继续按住Ctrl键,鼠标左键点击第二个httpNode节点"
      },
      {
        "id": "6",
        "name": "观察第二个节点也被选中,两个节点同时高亮显示"
      },
      {
        "id": "7",
        "name": "继续按住Ctrl键,可以点击更多httpNode节点进行多选"
      },
      {
        "id": "8",
        "name": "释放Ctrl键,在任意一个已选中的节点上点击鼠标右键"
      },
      {
        "id": "9",
        "name": "在弹出的批量操作右键菜单中找到\"批量删除\"选项(hot-key:Delete)"
      },
      {
        "id": "10",
        "name": "点击\"批量删除\"菜单项"
      },
      {
        "id": "11",
        "name": "在弹出的ElMessageBox确认对话框中查看提示文字:确定批量删除 [数量] 个节点?"
      },
      {
        "id": "12",
        "name": "点击\"确定\"按钮确认批量删除"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按住Ctrl键点击节点时,事件冒泡被阻止(e.stopPropagation),不触发文件夹展开"
      },
      {
        "id": "2",
        "name": "每次按住Ctrl键点击节点后,节点添加.select-node类名,背景色变化表示选中状态"
      },
      {
        "id": "3",
        "name": "selectNodes.value数组包含所有选中的节点对象,数组长度等于选中节点数量"
      },
      {
        "id": "4",
        "name": "再次按住Ctrl键点击已选中的节点,该节点被取消选中,从selectNodes数组中移除"
      },
      {
        "id": "5",
        "name": "右键点击已选中节点后显示批量操作菜单(v-if=\"showContextmenu && selectNodes.length > 1\")"
      },
      {
        "id": "6",
        "name": "批量操作菜单包含\"批量剪切\",\"批量复制\",\"批量删除\"三个选项"
      },
      {
        "id": "7",
        "name": "点击\"批量删除\"后确认对话框显示总删除数量(包括所有选中节点)"
      },
      {
        "id": "8",
        "name": "点击\"确定\"后所有选中的节点同时从banner文档树中移除"
      },
      {
        "id": "9",
        "name": "所有被删除节点的nav项从projectNavStore中批量删除"
      },
      {
        "id": "10",
        "name": "离线模式下所有节点数据从IndexedDB批量删除,在线模式下通过一次API请求批量删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pressCtrl变量(Banner.vue:387)跟踪Ctrl键按下状态"
      },
      {
        "id": "2",
        "name": "document keydown事件监听器(Banner.vue:710)检测Ctrl键按下,设置pressCtrl.value = true"
      },
      {
        "id": "3",
        "name": "handleClickNode方法(Banner.vue:391-411)处理节点点击,判断pressCtrl.value"
      },
      {
        "id": "4",
        "name": "pressCtrl.value为true时,使用e.stopPropagation()阻止冒泡(Banner.vue:396)"
      },
      {
        "id": "5",
        "name": "检查节点是否已在selectNodes.value数组中(Banner.vue:397)"
      },
      {
        "id": "6",
        "name": "如果已存在则splice移除(取消选中),否则push添加(选中)(Banner.vue:399-406)"
      },
      {
        "id": "7",
        "name": "selectNodes数组包含projectId字段(ApidocBannerWithProjectId类型)"
      },
      {
        "id": "8",
        "name": "批量操作菜单条件渲染(Banner.vue:247,v-if=\"showContextmenu && selectNodes.length > 1\")"
      },
      {
        "id": "9",
        "name": "\"批量删除\"菜单项绑定handleDeleteNodes点击事件(Banner.vue:251)"
      },
      {
        "id": "10",
        "name": "deleteNode函数接收selectNodes.value数组,遍历收集所有_id到deleteIds(curd-node.ts:39-48)"
      },
      {
        "id": "11",
        "name": "确认对话框文字判断selectNodes.length > 1显示批量删除提示(curd-node.ts:49)"
      },
      {
        "id": "12",
        "name": "删除操作通过单次apiNodesCache.deleteNodes或API请求批量执行"
      },
      {
        "id": "13",
        "name": "selectNodes数组每个节点调用bannerStore.splice移除(curd-node.ts:77-98)"
      },
      {
        "id": "14",
        "name": "projectNavStore.deleteNavByIds一次性删除所有选中节点的nav项(curd-node.ts:107-111)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量选择功能依赖pressCtrl变量和document级别的keydown/keyup事件监听"
      },
      {
        "id": "2",
        "name": "Ctrl键按下时点击节点会阻止事件冒泡,避免触发文件夹展开/收起"
      },
      {
        "id": "3",
        "name": "再次点击已选中节点会取消选中,实现toggle效果"
      },
      {
        "id": "4",
        "name": "批量删除时deleteIds数组包含所有选中节点的_id,不包含子节点(httpNode没有子节点)"
      },
      {
        "id": "5",
        "name": "批量删除确认对话框显示的数量为deleteIds.length,不是selectNodes.length"
      },
      {
        "id": "6",
        "name": "Delete键盘快捷键(Banner.vue:715)也可以触发批量删除,无需点击菜单"
      }
    ]
  }
],
}

export default node
