import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "deleteHttpMockNode",
  description: "删除httpMockNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键httpMockNode节点删除",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少一个httpMockNode节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含待删除的httpMockNode节点数据"
      },
      {
        "id": "4",
        "name": "httpMockNode节点可能处于任意状态(未运行,running,starting,stopping,error)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标httpMockNode节点(图标显示\"mock\")"
      },
      {
        "id": "2",
        "name": "鼠标右键点击该httpMockNode节点"
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
        "name": "点击\"确定\"后httpMockNode节点立即从banner文档树中移除,不再显示"
      },
      {
        "id": "5",
        "name": "如果httpMockNode处于running状态,删除时会自动停止mock"
      },
      {
        "id": "6",
        "name": "如果节点当前处于active状态,删除后编辑区域清空或切换到其他节点"
      },
      {
        "id": "7",
        "name": "httpMockNode对应的nav项从projectNavStore中删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleShowContextmenu方法正确处理httpMockNode的右键点击事件"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.value被设置为当前右键点击的httpMockNode节点"
      },
      {
        "id": "3",
        "name": "httpMockNode节点的type字段值为\"httpMock\""
      },
      {
        "id": "4",
        "name": "showContextmenu.value设置为true"
      },
      {
        "id": "5",
        "name": "SContextmenu组件条件渲染"
      },
      {
        "id": "6",
        "name": "\"删除\"菜单项条件显示(v-show=\"currentOperationalNode\")"
      },
      {
        "id": "7",
        "name": "点击\"删除\"触发handleDeleteNodes方法"
      },
      {
        "id": "8",
        "name": "deleteNode函数收集deleteIds数组,包含httpMockNode的_id"
      },
      {
        "id": "9",
        "name": "ElMessageBox.confirm显示确认对话框"
      },
      {
        "id": "10",
        "name": "离线模式:调用apiNodesCache.deleteNodes(deleteIds)删除IndexedDB中的httpMockNode数据"
      },
      {
        "id": "11",
        "name": "在线模式:调用request.delete(\"/api/project/doc\", params)删除服务器httpMockNode数据"
      },
      {
        "id": "12",
        "name": "bannerStore.splice方法从banner数组中移除httpMockNode节点"
      },
      {
        "id": "13",
        "name": "projectNavStore.deleteNavByIds删除httpMockNode的nav项"
      },
      {
        "id": "14",
        "name": "触发eventEmitter.emit(\"apidoc/deleteDocs\")事件"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "httpMockNode节点在树中显示.mock-icon图标,内容为\"mock\"文字(Banner.vue:65-69)"
      },
      {
        "id": "2",
        "name": "httpMockNode可能包含.mock-status状态指示器,显示running/starting/stopping/error状态(Banner.vue:88-109)"
      },
      {
        "id": "3",
        "name": "deleteNode函数对httpMockNode和httpNode的处理逻辑相同,都是非folder类型"
      },
      {
        "id": "4",
        "name": "删除httpMockNode时不会递归删除子节点(httpMockNode不是folder类型)"
      },
      {
        "id": "5",
        "name": "httpMockNode节点渲染在Banner.vue:65-115,包含state,port等特有字段"
      }
    ]
  },
  {
    "purpose": "鼠标移动到httpMockNode节点,点击更多操作删除节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少一个httpMockNode节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含待删除的httpMockNode节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标httpMockNode节点(图标显示\"mock\")"
      },
      {
        "id": "2",
        "name": "将鼠标移动到该httpMockNode节点上(触发@mouseenter.stop=\"handleNodeHover\"事件)"
      },
      {
        "id": "3",
        "name": "观察节点右侧出现\"更多操作\"按钮(.more元素,包含MoreFilled图标)"
      },
      {
        "id": "4",
        "name": "点击\"更多操作\"按钮"
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
        "name": "鼠标悬停httpMockNode时,节点右侧显示\"更多操作\"按钮"
      },
      {
        "id": "2",
        "name": "如果httpMockNode处于running状态,节点会显示状态指示器(绿色圆点)"
      },
      {
        "id": "3",
        "name": "点击\"更多操作\"按钮后显示右键菜单,菜单内容与右键节点相同"
      },
      {
        "id": "4",
        "name": "菜单中包含\"删除\"选项,显示快捷键提示\"Delete\""
      },
      {
        "id": "5",
        "name": "点击\"删除\"后弹出确认对话框"
      },
      {
        "id": "6",
        "name": "点击\"确定\"后httpMockNode节点立即从banner文档树中移除"
      },
      {
        "id": "7",
        "name": "离线模式下IndexedDB中的httpMockNode数据被删除,在线模式下服务器数据被删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "httpMockNode节点渲染包含.more按钮(Banner.vue:110-114)"
      },
      {
        "id": "2",
        "name": ".more按钮绑定@click.stop事件,阻止冒泡并调用handleShowContextmenu"
      },
      {
        "id": "3",
        "name": "handleShowContextmenu($event, scope.data)接收httpMockNode数据作为参数"
      },
      {
        "id": "4",
        "name": "currentOperationalNode.value被设置为点击的httpMockNode节点"
      },
      {
        "id": "5",
        "name": "showContextmenu.value设置为true"
      },
      {
        "id": "6",
        "name": "SContextmenu组件根据showContextmenu和selectNodes.length条件渲染"
      },
      {
        "id": "7",
        "name": "点击\"删除\"触发handleDeleteNodes方法"
      },
      {
        "id": "8",
        "name": "deleteNode函数执行删除逻辑,包含确认对话框"
      },
      {
        "id": "9",
        "name": "bannerStore.splice从数组中移除httpMockNode数据"
      },
      {
        "id": "10",
        "name": "projectNavStore.deleteNavByIds删除httpMockNode的nav项"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "httpMockNode的更多操作按钮位于节点右侧,布局包含Mock状态指示器(如果有状态)"
      },
      {
        "id": "2",
        "name": "点击更多操作按钮和右键httpMockNode最终都调用同一个handleShowContextmenu方法"
      },
      {
        "id": "3",
        "name": "更多操作按钮使用@click.stop阻止事件冒泡,避免触发节点点击事件"
      },
      {
        "id": "4",
        "name": "删除操作的后续流程与右键删除完全相同,复用deleteNode函数"
      }
    ]
  },
  {
    "purpose": "按住ctrl鼠标左键批量选择httpMockNode节点,鼠标右键批量删除",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少2个httpMockNode节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含多个待删除的httpMockNode节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到多个目标httpMockNode节点"
      },
      {
        "id": "2",
        "name": "按住键盘上的Ctrl键不放"
      },
      {
        "id": "3",
        "name": "按住Ctrl键的同时,依次鼠标左键点击多个httpMockNode节点"
      },
      {
        "id": "4",
        "name": "观察每个httpMockNode被选中后添加.select-node类名高亮显示"
      },
      {
        "id": "5",
        "name": "释放Ctrl键,在任意一个已选中的httpMockNode上点击鼠标右键"
      },
      {
        "id": "6",
        "name": "在弹出的批量操作右键菜单中找到\"批量删除\"选项"
      },
      {
        "id": "7",
        "name": "点击\"批量删除\"菜单项"
      },
      {
        "id": "8",
        "name": "在弹出的ElMessageBox确认对话框中查看提示文字:确定批量删除 [数量] 个节点?"
      },
      {
        "id": "9",
        "name": "点击\"确定\"按钮确认批量删除"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按住Ctrl键点击httpMockNode时,节点添加.select-node类名高亮显示"
      },
      {
        "id": "2",
        "name": "selectNodes.value数组包含所有选中的httpMockNode对象"
      },
      {
        "id": "3",
        "name": "右键点击已选中httpMockNode后显示批量操作菜单"
      },
      {
        "id": "4",
        "name": "点击\"批量删除\"后确认对话框显示总删除数量"
      },
      {
        "id": "5",
        "name": "点击\"确定\"后所有选中的httpMockNode同时从banner文档树中移除"
      },
      {
        "id": "6",
        "name": "如果批量删除的httpMockNode中有running状态的节点,对应的Mock服务器会被停止"
      },
      {
        "id": "7",
        "name": "所有被删除httpMockNode的nav项从projectNavStore中批量删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pressCtrl变量跟踪Ctrl键按下状态"
      },
      {
        "id": "2",
        "name": "handleClickNode方法处理httpMockNode点击,判断pressCtrl.value"
      },
      {
        "id": "3",
        "name": "pressCtrl.value为true时,使用e.stopPropagation()阻止冒泡"
      },
      {
        "id": "4",
        "name": "检查httpMockNode是否已在selectNodes.value数组中"
      },
      {
        "id": "5",
        "name": "批量操作菜单条件渲染(v-if=\"showContextmenu && selectNodes.length > 1\")"
      },
      {
        "id": "6",
        "name": "\"批量删除\"菜单项绑定handleDeleteNodes点击事件"
      },
      {
        "id": "7",
        "name": "deleteNode函数接收selectNodes.value数组,遍历收集所有httpMockNode的_id到deleteIds"
      },
      {
        "id": "8",
        "name": "删除操作通过单次apiNodesCache.deleteNodes或API请求批量执行"
      },
      {
        "id": "9",
        "name": "projectNavStore.deleteNavByIds一次性删除所有选中httpMockNode的nav项"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量选择httpMockNode的逻辑与其他节点类型完全相同"
      },
      {
        "id": "2",
        "name": "批量删除httpMockNode时deleteIds数组包含所有选中节点的_id"
      },
      {
        "id": "3",
        "name": "Delete键盘快捷键也可以触发httpMockNode批量删除"
      },
      {
        "id": "4",
        "name": "批量删除可能包含不同状态的httpMockNode节点(running,stopped等)"
      }
    ]
  }
],
}

export default node
