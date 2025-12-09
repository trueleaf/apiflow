import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "deleteMixedNodes",
  description: "删除混合节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "按住ctrl鼠标左键批量选择httpNode,websocketNode,httpMockNode,websocketMockNode,folder节点,鼠标右键批量删除",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在多种类型的节点:httpNode,websocketNode,httpMockNode,websocketMockNode,folder"
      },
      {
        "id": "3",
        "name": "bannerStore.banner数组中包含多种类型的节点数据"
      },
      {
        "id": "4",
        "name": "至少存在2个不同类型的节点可供批量选择"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到不同类型的节点"
      },
      {
        "id": "2",
        "name": "按住键盘上的Ctrl键不放"
      },
      {
        "id": "3",
        "name": "按住Ctrl键的同时,依次鼠标左键点击一个httpNode节点(显示GET/POST等方法标签)"
      },
      {
        "id": "4",
        "name": "继续按住Ctrl键,点击一个websocketNode节点(显示WS/WSS图标)"
      },
      {
        "id": "5",
        "name": "继续按住Ctrl键,点击一个httpMockNode节点(显示\"mock\"图标)"
      },
      {
        "id": "6",
        "name": "继续按住Ctrl键,点击一个websocketMockNode节点(显示Radio图标)"
      },
      {
        "id": "7",
        "name": "继续按住Ctrl键,点击一个folder节点(显示文件夹图标)"
      },
      {
        "id": "8",
        "name": "观察所有被选中的节点都添加.select-node类名高亮显示"
      },
      {
        "id": "9",
        "name": "释放Ctrl键,在任意一个已选中的节点上点击鼠标右键"
      },
      {
        "id": "10",
        "name": "在弹出的批量操作右键菜单中找到\"批量删除\"选项"
      },
      {
        "id": "11",
        "name": "点击\"批量删除\"菜单项"
      },
      {
        "id": "12",
        "name": "在弹出的ElMessageBox确认对话框中查看提示文字:确定批量删除 [总数量] 个节点?"
      },
      {
        "id": "13",
        "name": "点击\"确定\"按钮确认批量删除"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按住Ctrl键点击不同类型的节点时,所有节点都能被正确选中并高亮显示"
      },
      {
        "id": "2",
        "name": "selectNodes.value数组包含所有选中的混合类型节点对象"
      },
      {
        "id": "3",
        "name": "右键点击任意已选中节点后显示批量操作菜单"
      },
      {
        "id": "4",
        "name": "批量操作菜单包含\"批量剪切\",\"批量复制\",\"批量删除\"选项"
      },
      {
        "id": "5",
        "name": "点击\"批量删除\"后确认对话框显示总删除数量(如果包含folder,数量包含folder的所有子节点)"
      },
      {
        "id": "6",
        "name": "点击\"确定\"后所有选中的不同类型节点同时从banner文档树中移除"
      },
      {
        "id": "7",
        "name": "如果选中的folder包含子节点,子节点也同时被删除"
      },
      {
        "id": "8",
        "name": "所有被删除的非folder类型节点的nav项从projectNavStore中批量删除"
      },
      {
        "id": "9",
        "name": "离线模式下所有节点数据从IndexedDB批量删除,在线模式下通过一次API请求批量删除"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "pressCtrl变量跟踪Ctrl键按下状态"
      },
      {
        "id": "2",
        "name": "handleClickNode方法处理所有类型节点的点击,判断pressCtrl.value"
      },
      {
        "id": "3",
        "name": "selectNodes.value数组可以包含不同type字段值的节点(http,websocket,httpMock,websocketMock,folder)"
      },
      {
        "id": "4",
        "name": "批量操作菜单条件渲染(v-if=\"showContextmenu && selectNodes.length > 1\")"
      },
      {
        "id": "5",
        "name": "\"批量删除\"菜单项绑定handleDeleteNodes点击事件"
      },
      {
        "id": "6",
        "name": "deleteNode函数接收混合类型的selectNodes.value数组(curd-node.ts:33)"
      },
      {
        "id": "7",
        "name": "selectNodes.forEach遍历所有节点,对folder类型节点递归收集子节点(curd-node.ts:39-48)"
      },
      {
        "id": "8",
        "name": "deleteIds数组包含所有选中节点及folder的所有子节点的_id"
      },
      {
        "id": "9",
        "name": "ElMessageBox.confirm显示确认对话框,deleteTip根据selectNodes.length > 1显示批量删除文字"
      },
      {
        "id": "10",
        "name": "删除操作通过单次apiNodesCache.deleteNodes(deleteIds)或API请求批量执行"
      },
      {
        "id": "11",
        "name": "forEachForest遍历selectNodes过滤出非folder类型节点收集到delNodeIds(curd-node.ts:101-105)"
      },
      {
        "id": "12",
        "name": "projectNavStore.deleteNavByIds批量删除所有非folder类型节点的nav项"
      },
      {
        "id": "13",
        "name": "bannerStore.splice对每个选中节点执行移除操作(curd-node.ts:77-98)"
      },
      {
        "id": "14",
        "name": "触发eventEmitter.emit(\"apidoc/deleteDocs\")事件"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "混合节点批量删除复用与单一类型节点相同的deleteNode函数"
      },
      {
        "id": "2",
        "name": "deleteNode函数通过node.type === \"folder\"判断区分处理(curd-node.ts:41)"
      },
      {
        "id": "3",
        "name": "混合删除时deleteIds可能包含httpNode,websocketNode,httpMockNode,websocketMockNode,folder及folder子节点的_id"
      },
      {
        "id": "4",
        "name": "Delete键盘快捷键也可以触发混合节点批量删除"
      },
      {
        "id": "5",
        "name": "确认对话框显示的数量为deleteIds.length,可能远大于selectNodes.length(因为包含folder子节点)"
      },
      {
        "id": "6",
        "name": "批量删除通过一次数据库操作或API请求完成,保证原子性"
      }
    ]
  }
],
}

export default node
