import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "folderNode",
  description: "folder节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "鼠标右键空白区域添加folder节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标右键banner树的空白区域"
      },
      {
        "id": "2",
        "name": "点击右键菜单中的\"新建文件夹\"选项"
      },
      {
        "id": "3",
        "name": "在SAddFolderDialog对话框中输入文件夹名称"
      },
      {
        "id": "4",
        "name": "点击确定按钮"
      },
      {
        "id": "5",
        "name": "观察新folder节点出现在根目录下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "handleWrapContextmenu方法被触发,currentOperationalNode.value为null"
      },
      {
        "id": "2",
        "name": "右键菜单显示\"新建文件夹\"选项(v-show=\"!currentOperationalNode || currentOperationalNode?.type === 'folder'\")"
      },
      {
        "id": "3",
        "name": "点击\"新建文件夹\"后,handleOpenAddFolderDialog方法被调用(Banner.vue第499-501行)"
      },
      {
        "id": "4",
        "name": "addFolderDialogVisible.value被设置为true"
      },
      {
        "id": "5",
        "name": "SAddFolderDialog组件渲染,pid为空(在根目录添加)"
      },
      {
        "id": "6",
        "name": "新folder节点添加到根目录最下方"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "\"新建文件夹\"菜单项绑定:@click=\"handleOpenAddFolderDialog\"(Banner.vue第225-226行)"
      },
      {
        "id": "2",
        "name": "handleOpenAddFolderDialog方法在Banner.vue第499-501行"
      },
      {
        "id": "3",
        "name": "SAddFolderDialog组件引用在Banner.vue第257-258行"
      },
      {
        "id": "4",
        "name": "SAddFolderDialog的pid属性为currentOperationalNode?._id(空白区域时为undefined)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder节点用于组织和分组其他节点,可以包含接口节点和子folder节点"
      },
      {
        "id": "2",
        "name": "新建文件夹不需要选择类型,只需输入名称"
      }
    ]
  },
  {
    "purpose": "鼠标右键目录添加folder节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "节点树中存在至少一个folder节点"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标右键某个folder节点"
      },
      {
        "id": "2",
        "name": "点击\"新建文件夹\"选项"
      },
      {
        "id": "3",
        "name": "输入文件夹名称"
      },
      {
        "id": "4",
        "name": "点击确定"
      },
      {
        "id": "5",
        "name": "观察新folder节点出现在父folder节点下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "currentOperationalNode.value为父folder节点数据"
      },
      {
        "id": "2",
        "name": "SAddFolderDialog的pid为父folder的_id"
      },
      {
        "id": "3",
        "name": "新folder节点添加到父folder的children数组中"
      },
      {
        "id": "4",
        "name": "父folder节点自动展开,显示新添加的子folder"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleOpenAddFolderDialog方法不检查文件数量限制(folder不计入限制)"
      },
      {
        "id": "2",
        "name": "addFileAndFolderCb根据pid将folder添加到指定父节点下"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "folder可以嵌套,支持多层级结构"
      }
    ]
  },
  {
    "purpose": "在folder节点上,点击新增按钮添加folder节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "节点树中存在folder节点"
      },
      {
        "id": "3",
        "name": "folder节点有\"更多操作\"按钮"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标悬停在folder节点上"
      },
      {
        "id": "2",
        "name": "点击folder节点的\"更多操作\"按钮(data-testid=\"banner-node-more-btn\")"
      },
      {
        "id": "3",
        "name": "在弹出的右键菜单中点击\"新建文件夹\""
      },
      {
        "id": "4",
        "name": "输入文件夹名称"
      },
      {
        "id": "5",
        "name": "点击确定"
      },
      {
        "id": "6",
        "name": "观察新folder节点出现在该folder下"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "\"更多操作\"按钮点击触发handleShowContextmenu方法(@click.stop绑定)"
      },
      {
        "id": "2",
        "name": "currentOperationalNode.value为folder节点数据"
      },
      {
        "id": "3",
        "name": "右键菜单显示,\"新建文件夹\"选项可见"
      },
      {
        "id": "4",
        "name": "新folder添加到父folder的children中"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "\"更多操作\"按钮在Banner.vue第58-62行(folder类型)或第133-137行"
      },
      {
        "id": "2",
        "name": "按钮绑定:@click.stop=\"handleShowContextmenu($event, scope.data)\""
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "通过\"更多操作\"按钮和右键点击节点效果相同"
      }
    ]
  },
  {
    "purpose": "点击新增按钮添加folder节点",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击工具栏\"新增文件夹\"按钮"
      },
      {
        "id": "2",
        "name": "输入文件夹名称"
      },
      {
        "id": "3",
        "name": "点击确定"
      },
      {
        "id": "4",
        "name": "观察新folder节点出现在根目录"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "handleEmit(\"addRootFolder\")触发(Tool.vue第287-289行)"
      },
      {
        "id": "2",
        "name": "addFolderDialogVisible.value被设置为true"
      },
      {
        "id": "3",
        "name": "SAddFolderDialog的pid为空,新folder添加到根目录"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "\"新增文件夹\"按钮在Tool.vue中,icon为\"#iconxinzengwenjian\",op为\"addRootFolder\""
      },
      {
        "id": "2",
        "name": "handleEmit中addRootFolder分支在Tool.vue第287-289行"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "通过工具栏按钮添加folder到根目录"
      }
    ]
  }
],
}

export default node
