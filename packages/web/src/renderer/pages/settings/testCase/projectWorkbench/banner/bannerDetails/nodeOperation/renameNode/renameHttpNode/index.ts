import { type ModelNode } from '../../../../../../types'

const node: ModelNode = {
  modelName: "renameHttpNode",
  description: "重命名节点httpNode节点",
  children: [],
  atomicFunc: [
  {
    "purpose": "active 节点,点击节点右键,点击重命名,输入名称,回车或blur",
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
        "name": "httpNode节点当前未处于编辑状态(editNode.value为null)"
      },
      {
        "id": "4",
        "name": "httpNode节点的readonly字段为false(可编辑)"
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
        "name": "在弹出的SContextmenu右键菜单中找到\"重命名\"选项(hot-key提示:F2)"
      },
      {
        "id": "4",
        "name": "点击\"重命名\"菜单项"
      },
      {
        "id": "5",
        "name": "观察节点名称变为可编辑的输入框(.rename-ipt),输入框自动获得焦点"
      },
      {
        "id": "6",
        "name": "在输入框中输入新的节点名称,例如\"新的接口名称\""
      },
      {
        "id": "7",
        "name": "按下回车键或点击输入框外部区域触发blur事件"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击\"重命名\"后,节点名称立即变为可编辑的输入框"
      },
      {
        "id": "2",
        "name": "输入框(.rename-ipt)自动获得焦点,可以直接输入"
      },
      {
        "id": "3",
        "name": "输入框显示当前节点的原始名称"
      },
      {
        "id": "4",
        "name": "输入新名称后按回车或blur,输入框消失,节点名称更新为新名称"
      },
      {
        "id": "5",
        "name": "bannerStore中该节点的name字段更新为新名称"
      },
      {
        "id": "6",
        "name": "projectNavStore中该节点的label字段更新为新名称"
      },
      {
        "id": "7",
        "name": "httpNodeStore中的节点名称更新为新名称"
      },
      {
        "id": "8",
        "name": "离线模式下IndexedDB中的节点名称更新,在线模式下服务器数据更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "右键菜单中\"重命名\"选项条件显示(Banner.vue:241-242,v-show=\"currentOperationalNode && !currentOperationalNode.readonly\")"
      },
      {
        "id": "2",
        "name": "点击\"重命名\"触发handleRenameNode方法(Banner.vue:608-614)"
      },
      {
        "id": "3",
        "name": "handleRenameNode设置editNode.value = currentOperationalNode.value(Banner.vue:609)"
      },
      {
        "id": "4",
        "name": "setTimeout后调用document.querySelector(\".rename-ipt\").focus()使输入框获得焦点(Banner.vue:611)"
      },
      {
        "id": "5",
        "name": "enableDrag.value设置为false,禁用拖拽(Banner.vue:612)"
      },
      {
        "id": "6",
        "name": "httpNode节点渲染逻辑判断editNode?._id !== scope.data._id决定显示输入框还是文本(Banner.vue:41)"
      },
      {
        "id": "7",
        "name": "输入框绑定@blur和@keydown.stop.enter事件,都调用handleChangeNodeName(Banner.vue:54-56)"
      },
      {
        "id": "8",
        "name": "handleChangeNodeName调用renameNode.call(this, e, data)(Banner.vue:617)"
      },
      {
        "id": "9",
        "name": "renameNode函数检查iptValue.trim()是否为空(curd-node.ts:668-670)"
      },
      {
        "id": "10",
        "name": "renameNode函数设置isRename标志防止重复重命名(curd-node.ts:671)"
      },
      {
        "id": "11",
        "name": "bannerStore.changeBannerInfoById更新name字段(curd-node.ts:673-677)"
      },
      {
        "id": "12",
        "name": "projectNavStore.changeNavInfoById更新label字段(curd-node.ts:679-683)"
      },
      {
        "id": "13",
        "name": "httpNodeStore.changeHttpNodeName更新httpNode名称(curd-node.ts:685)"
      },
      {
        "id": "14",
        "name": "离线模式:调用apiNodesCache.updateNodeName(data._id, iptValue)(curd-node.ts:690)"
      },
      {
        "id": "15",
        "name": "在线模式:调用request.put(\"/api/project/change_doc_info\", params)(curd-node.ts:722)"
      },
      {
        "id": "16",
        "name": "重命名完成后editNode.value设置为null(Banner.vue:618)"
      },
      {
        "id": "17",
        "name": "enableDrag.value设置为true,恢复拖拽(Banner.vue:619)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "重命名功能通过editNode变量控制,editNode不为null时节点显示输入框"
      },
      {
        "id": "2",
        "name": "输入框自动获得焦点通过setTimeout延迟执行focus()实现"
      },
      {
        "id": "3",
        "name": "重命名期间禁用拖拽功能,避免冲突"
      },
      {
        "id": "4",
        "name": "重命名同时更新三个store:bannerStore,projectNavStore,httpNodeStore"
      },
      {
        "id": "5",
        "name": "重命名失败时会自动回滚所有前端状态到originValue(curd-node.ts:700-711)"
      },
      {
        "id": "6",
        "name": "readonly字段为true的节点不显示\"重命名\"菜单项"
      }
    ]
  },
  {
    "purpose": "active 节点,F2重命名,输入名称,回车或blur",
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
        "name": "httpNode节点当前处于active状态(currentOperationalNode.value为该节点)"
      },
      {
        "id": "4",
        "name": "httpNode节点的readonly字段为false(可编辑)"
      },
      {
        "id": "5",
        "name": "当前没有其他节点处于编辑状态(editNode.value为null)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中点击选中目标httpNode节点,使其处于active状态"
      },
      {
        "id": "2",
        "name": "观察节点添加.active-node类名高亮显示"
      },
      {
        "id": "3",
        "name": "按下键盘F2键"
      },
      {
        "id": "4",
        "name": "观察节点名称变为可编辑的输入框,输入框自动获得焦点"
      },
      {
        "id": "5",
        "name": "在输入框中输入新的节点名称"
      },
      {
        "id": "6",
        "name": "按下回车键或点击输入框外部区域触发blur事件"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "按下F2键后,active状态的httpNode节点名称立即变为可编辑的输入框"
      },
      {
        "id": "2",
        "name": "输入框自动获得焦点,可以直接输入"
      },
      {
        "id": "3",
        "name": "输入新名称后按回车或blur,输入框消失,节点名称更新为新名称"
      },
      {
        "id": "4",
        "name": "bannerStore,projectNavStore,httpNodeStore中的节点名称同步更新"
      },
      {
        "id": "5",
        "name": "离线模式下IndexedDB更新,在线模式下服务器数据更新"
      },
      {
        "id": "6",
        "name": "如果httpNode节点readonly为true,按F2键无任何反应"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "document的keydown事件监听器捕获F2键按下(Banner.vue:716-717)"
      },
      {
        "id": "2",
        "name": "检查e.code === \"F2\"且!currentOperationalNode.value?.readonly(Banner.vue:716)"
      },
      {
        "id": "3",
        "name": "条件满足时调用handleRenameNode()(Banner.vue:717)"
      },
      {
        "id": "4",
        "name": "handleRenameNode设置editNode.value = currentOperationalNode.value"
      },
      {
        "id": "5",
        "name": "F2快捷键只对active状态的节点生效,currentOperationalNode.value必须不为null"
      },
      {
        "id": "6",
        "name": "输入框显示和焦点逻辑与右键重命名完全相同"
      },
      {
        "id": "7",
        "name": "@keydown.stop.enter事件阻止事件冒泡并调用handleChangeNodeName"
      },
      {
        "id": "8",
        "name": "handleChangeNodeName内部调用renameNode函数执行重命名"
      },
      {
        "id": "9",
        "name": "重命名完成后editNode.value设置为null,enableDrag.value恢复为true"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "F2快捷键是全局document级别的keydown事件监听(Banner.vue:709)"
      },
      {
        "id": "2",
        "name": "F2快捷键必须在节点处于active状态时才能使用"
      },
      {
        "id": "3",
        "name": "readonly节点即使处于active状态也无法通过F2重命名"
      },
      {
        "id": "4",
        "name": "F2快捷键和右键菜单\"重命名\"最终都调用handleRenameNode方法"
      },
      {
        "id": "5",
        "name": "如果editNode.value不为null(已有节点在编辑),F2键会被阻止(Banner.vue:718-724检查!editNode.value)"
      }
    ]
  },
  {
    "purpose": "点击节点更多操作,点击重命名,输入名称,回车或blur",
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
        "name": "httpNode节点的readonly字段为false(可编辑)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域的文档树中找到目标httpNode节点"
      },
      {
        "id": "2",
        "name": "将鼠标移动到该httpNode节点上,观察右侧出现\"更多操作\"按钮"
      },
      {
        "id": "3",
        "name": "点击\"更多操作\"按钮(.more元素,包含MoreFilled图标)"
      },
      {
        "id": "4",
        "name": "在弹出的右键菜单中找到\"重命名\"选项(hot-key提示:F2)"
      },
      {
        "id": "5",
        "name": "点击\"重命名\"菜单项"
      },
      {
        "id": "6",
        "name": "观察节点名称变为可编辑的输入框,输入框自动获得焦点"
      },
      {
        "id": "7",
        "name": "在输入框中输入新的节点名称"
      },
      {
        "id": "8",
        "name": "按下回车键或点击输入框外部区域触发blur事件"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "鼠标悬停httpNode时,节点右侧显示\"更多操作\"按钮"
      },
      {
        "id": "2",
        "name": "点击\"更多操作\"按钮后显示右键菜单,菜单中包含\"重命名\"选项"
      },
      {
        "id": "3",
        "name": "点击\"重命名\"后,节点名称立即变为可编辑的输入框"
      },
      {
        "id": "4",
        "name": "输入框自动获得焦点,可以直接输入"
      },
      {
        "id": "5",
        "name": "输入新名称后按回车或blur,节点名称更新为新名称"
      },
      {
        "id": "6",
        "name": "bannerStore,projectNavStore,httpNodeStore中的节点名称同步更新"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "httpNode节点渲染包含.more按钮(Banner.vue:58-62)"
      },
      {
        "id": "2",
        "name": ".more按钮绑定@click.stop事件,调用handleShowContextmenu"
      },
      {
        "id": "3",
        "name": "handleShowContextmenu设置currentOperationalNode.value为当前httpNode"
      },
      {
        "id": "4",
        "name": "SContextmenu组件中\"重命名\"选项条件显示(v-show=\"currentOperationalNode && !currentOperationalNode.readonly\")"
      },
      {
        "id": "5",
        "name": "点击\"重命名\"触发handleRenameNode方法"
      },
      {
        "id": "6",
        "name": "handleRenameNode后续逻辑与右键重命名完全相同"
      },
      {
        "id": "7",
        "name": "renameNode函数执行重命名操作,更新所有相关store"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "更多操作按钮和右键菜单最终都调用同一个handleShowContextmenu方法"
      },
      {
        "id": "2",
        "name": "点击更多操作按钮的\"重命名\"和右键点击\"重命名\"效果完全相同"
      },
      {
        "id": "3",
        "name": "重命名功能的三种触发方式(右键菜单,F2快捷键,更多操作)最终都调用handleRenameNode方法"
      }
    ]
  },
  {
    "purpose": "节点名称未填写不允许重命名",
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
        "name": "httpNode节点当前处于重命名编辑状态(editNode.value不为null)"
      },
      {
        "id": "4",
        "name": "输入框(.rename-ipt)已获得焦点并可编辑"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "通过右键菜单,F2快捷键或更多操作按钮触发httpNode节点的重命名"
      },
      {
        "id": "2",
        "name": "观察节点名称变为可编辑的输入框"
      },
      {
        "id": "3",
        "name": "删除输入框中的所有文字,使其内容为空字符串或纯空格"
      },
      {
        "id": "4",
        "name": "观察输入框样式变化"
      },
      {
        "id": "5",
        "name": "尝试按下回车键或点击输入框外部区域触发blur事件"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "输入框内容为空或纯空格时,输入框自动添加.error类名"
      },
      {
        "id": "2",
        "name": ".error类名使输入框显示错误状态样式(如红色边框)"
      },
      {
        "id": "3",
        "name": "按下回车键或blur时,重命名操作被阻止,不执行任何更新"
      },
      {
        "id": "4",
        "name": "输入框继续保持编辑状态,不消失"
      },
      {
        "id": "5",
        "name": "bannerStore,projectNavStore,httpNodeStore中的节点名称保持原值不变"
      },
      {
        "id": "6",
        "name": "不向服务器或IndexedDB发送更新请求"
      },
      {
        "id": "7",
        "name": "用户必须输入非空内容或按Esc取消编辑"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "输入框绑定@input事件,调用handleWatchNodeInput方法(Banner.vue:55)"
      },
      {
        "id": "2",
        "name": "handleWatchNodeInput检查iptValue.trim() === \"\"(Banner.vue:624)"
      },
      {
        "id": "3",
        "name": "如果为空,调用classList.add(\"error\")添加错误类名(Banner.vue:625)"
      },
      {
        "id": "4",
        "name": "如果不为空,调用classList.remove(\"error\")移除错误类名(Banner.vue:627)"
      },
      {
        "id": "5",
        "name": "输入框包含.error类名时显示错误样式(通过CSS定义)"
      },
      {
        "id": "6",
        "name": "handleChangeNodeName调用renameNode函数"
      },
      {
        "id": "7",
        "name": "renameNode函数检查iptValue.trim() === \"\"(curd-node.ts:668)"
      },
      {
        "id": "8",
        "name": "如果为空,直接return不执行任何重命名操作(curd-node.ts:669)"
      },
      {
        "id": "9",
        "name": "renameNode函数在return前移除.error类名(curd-node.ts:667)"
      },
      {
        "id": "10",
        "name": "editNode.value在handleChangeNodeName中被设置为null(Banner.vue:618)"
      },
      {
        "id": "11",
        "name": "输入框消失,节点恢复显示原始名称(因为name字段未更新)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "空值验证分两层:输入时实时显示错误样式,提交时阻止执行"
      },
      {
        "id": "2",
        "name": "handleWatchNodeInput提供实时反馈,renameNode提供最终拦截"
      },
      {
        "id": "3",
        "name": "即使输入框为空触发blur,输入框也会消失(因为editNode.value被设置为null)"
      },
      {
        "id": "4",
        "name": "但节点名称不会更新,仍显示原始名称,达到\"不允许重命名\"的效果"
      },
      {
        "id": "5",
        "name": "placeholder提示文字为\"不能为空\"(Banner.vue:50)"
      }
    ]
  }
],
}

export default node
