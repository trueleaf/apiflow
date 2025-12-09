import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "deleteFolder",
  description: "删除folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键folder节点删除",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含待删除的folder节点数据"
      },
      {
        "id": "4",
        "name": "folder节点可能包含子节点(httpNode,websocketNode,httpMockNode,websocketMockNode,子folder)或为空文件夹"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标folder节点(图标显示文件夹图标)"
      },
      {
        "id": "2",
        "name": "鼠标右键点击该folder节点"
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
        "name": "在弹出的ElMessageBox确认对话框中查看提示文字"
      },
      {
        "id": "6",
        "name": "如果folder包含子节点,确认对话框显示删除数量包含所有子节点"
      },
      {
        "id": "7",
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
        "name": "如果folder为空,确认对话框显示:确定删除 [folder名称] 节点"
      },
      {
        "id": "4",
        "name": "如果folder包含子节点,确认对话框显示:确定删除 [folder名称] 节点(删除数量包含folder本身及所有子节点)"
      },
      {
        "id": "5",
        "name": "点击\"确定\"后folder节点立即从banner文档树中移除"
      },
      {
        "id": "6",
        "name": "folder的所有子节点(包括嵌套的子文件夹及其内容)同时被删除"
      },
      {
        "id": "7",
        "name": "所有被删除的非folder类型子节点的nav项从projectNavStore中删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleShowContextmenu方法正确处理folder的右键点击事件"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.value被设置为当前右键点击的folder节点"
      },
      {
        "id": "3",
        "name": "folder节点的type字段值为\"folder\""
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
        "name": "deleteNode函数收集deleteIds数组,包含folder的_id及所有子节点_id(curd-node.ts:40-47)"
      },
      {
        "id": "9",
        "name": "forEachForest递归遍历folder.children,收集所有子节点_id(curd-node.ts:42-46)"
      },
      {
        "id": "10",
        "name": "ElMessageBox.confirm显示确认对话框,deleteTip包含总删除数量deleteIds.length"
      },
      {
        "id": "11",
        "name": "离线模式:调用apiNodesCache.deleteNodes(deleteIds)删除IndexedDB中的folder及所有子节点数据"
      },
      {
        "id": "12",
        "name": "在线模式:调用request.delete(\"/api/project/doc\", params)批量删除服务器数据"
      },
      {
        "id": "13",
        "name": "bannerStore.splice方法从banner数组中移除folder节点"
      },
      {
        "id": "14",
        "name": "projectNavStore.deleteNavByIds删除所有非folder类型子节点的nav项(curd-node.ts:101-111)"
      },
      {
        "id": "15",
        "name": "触发eventEmitter.emit(\"apidoc/deleteDocs\")事件"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder节点在树中显示.folder-icon文件夹图标(Banner.vue:118)"
      },
      {
        "id": "2",
        "name": "删除folder时会递归删除所有子节点,包括嵌套的子文件夹及其所有内容"
      },
      {
        "id": "3",
        "name": "forEachForest函数遍历children树形结构,确保收集所有后代节点(curd-node.ts:42-46)"
      },
      {
        "id": "4",
        "name": "删除folder时只删除非folder类型子节点的nav项,folder本身不在nav中"
      },
      {
        "id": "5",
        "name": "确认对话框显示的删除数量为deleteIds.length,不是selectNodes.length"
      }
    ]
  },
  {
    "purpose": "鼠标移动到folder节点,点击更多操作删除节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少一个folder节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含待删除的folder节点数据"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标folder节点(图标显示文件夹图标)"
      },
      {
        "id": "2",
        "name": "将鼠标移动到该folder节点上(触发@mouseenter.stop=\"handleNodeHover\"事件)"
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
        "name": "鼠标悬停folder时,节点右侧显示\"更多操作\"按钮"
      },
      {
        "id": "2",
        "name": "如果folder包含正在运行的Mock接口,节点会显示.folder-mock-indicator指示器(Banner.vue:128-131)"
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
        "name": "点击\"确定\"后folder节点及其所有子节点立即从banner文档树中移除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "folder节点渲染包含.more按钮(Banner.vue:132-136)"
      },
      {
        "id": "2",
        "name": ".more按钮绑定@click.stop事件,调用handleShowContextmenu"
      },
      {
        "id": "3",
        "name": "handleShowContextmenu接收folder数据作为参数"
      },
      {
        "id": "4",
        "name": "currentOperationalNode.value被设置为点击的folder节点"
      },
      {
        "id": "5",
        "name": "showContextmenu.value设置为true"
      },
      {
        "id": "6",
        "name": "SContextmenu组件根据showContextmenu条件渲染"
      },
      {
        "id": "7",
        "name": "点击\"删除\"触发handleDeleteNodes方法"
      },
      {
        "id": "8",
        "name": "deleteNode函数执行删除逻辑,递归收集folder所有子节点_id"
      },
      {
        "id": "9",
        "name": "bannerStore.splice从数组中移除folder数据"
      },
      {
        "id": "10",
        "name": "projectNavStore.deleteNavByIds删除所有非folder类型子节点的nav项"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder的更多操作按钮位于节点右侧"
      },
      {
        "id": "2",
        "name": "点击更多操作按钮和右键folder都调用handleShowContextmenu方法"
      },
      {
        "id": "3",
        "name": "更多操作按钮使用@click.stop阻止事件冒泡"
      },
      {
        "id": "4",
        "name": "删除操作复用deleteNode函数,自动处理子节点递归删除"
      }
    ]
  },
  {
    "purpose": "按住ctrl鼠标左键批量选择folder节点,鼠标右键批量删除",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中已存在至少2个folder节点"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含多个待删除的folder节点数据"
      },
      {
        "id": "4",
        "name": "多个folder可能包含不同数量的子节点或为空文件夹"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到多个目标folder节点"
      },
      {
        "id": "2",
        "name": "按住键盘上的Ctrl键不放"
      },
      {
        "id": "3",
        "name": "按住Ctrl键的同时,依次鼠标左键点击多个folder节点"
      },
      {
        "id": "4",
        "name": "观察每个folder被选中后添加.select-node类名高亮显示"
      },
      {
        "id": "5",
        "name": "释放Ctrl键,在任意一个已选中的folder上点击鼠标右键"
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
        "name": "在弹出的ElMessageBox确认对话框中查看提示文字:确定批量删除 [总数量] 个节点?"
      },
      {
        "id": "9",
        "name": "注意总数量包含所有选中的folder及其所有子节点"
      },
      {
        "id": "10",
        "name": "点击\"确定\"按钮确认批量删除"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按住Ctrl键点击folder时,节点添加.select-node类名高亮显示"
      },
      {
        "id": "2",
        "name": "selectNodes.value数组包含所有选中的folder对象"
      },
      {
        "id": "3",
        "name": "右键点击已选中folder后显示批量操作菜单"
      },
      {
        "id": "4",
        "name": "点击\"批量删除\"后确认对话框显示总删除数量(所有folder + 所有子节点)"
      },
      {
        "id": "5",
        "name": "点击\"确定\"后所有选中的folder及其所有子节点同时从banner文档树中移除"
      },
      {
        "id": "6",
        "name": "所有被删除的非folder类型节点的nav项从projectNavStore中批量删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pressCtrl变量跟踪Ctrl键按下状态"
      },
      {
        "id": "2",
        "name": "handleClickNode方法处理folder点击,判断pressCtrl.value"
      },
      {
        "id": "3",
        "name": "pressCtrl.value为true时,使用e.stopPropagation()阻止冒泡,不触发folder展开/收起"
      },
      {
        "id": "4",
        "name": "检查folder是否已在selectNodes.value数组中"
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
        "name": "deleteNode函数接收selectNodes.value数组,遍历每个folder收集所有_id到deleteIds"
      },
      {
        "id": "8",
        "name": "对每个folder调用forEachForest递归收集子节点_id(curd-node.ts:40-47)"
      },
      {
        "id": "9",
        "name": "deleteIds数组去重,避免重复删除(curd-node.ts:43-44检查!deleteIds.find)"
      },
      {
        "id": "10",
        "name": "删除操作通过单次apiNodesCache.deleteNodes或API请求批量执行"
      },
      {
        "id": "11",
        "name": "projectNavStore.deleteNavByIds一次性删除所有非folder类型节点的nav项"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "批量选择folder的逻辑与其他节点类型完全相同"
      },
      {
        "id": "2",
        "name": "批量删除folder时deleteIds数组包含所有选中folder及其所有后代节点的_id"
      },
      {
        "id": "3",
        "name": "如果多个folder之间存在父子关系,deleteIds会去重,避免重复删除"
      },
      {
        "id": "4",
        "name": "Delete键盘快捷键也可以触发folder批量删除"
      },
      {
        "id": "5",
        "name": "确认对话框显示的数量可能远大于选中的folder数量(因为包含所有子节点)"
      }
    ]
  }
],
}

export default node
