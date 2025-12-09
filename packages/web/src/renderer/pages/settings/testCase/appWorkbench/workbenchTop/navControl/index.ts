import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "navControl",
  description: "导航控制",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击刷新按钮,关闭并重启项目",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动(Electron应用)"
      },
      {
        "id": "2",
        "name": "已打开一个或多个项目Tab或设置Tab"
      },
      {
        "id": "3",
        "name": "顶部Header导航栏已渲染"
      },
      {
        "id": "4",
        "name": "IPC通信正常工作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到顶部Header导航栏的刷新按钮(RefreshRight图标)"
      },
      {
        "id": "2",
        "name": "点击刷新按钮(data-testid=\"header-refresh-btn\")"
      },
      {
        "id": "3",
        "name": "观察应用的行为"
      },
      {
        "id": "4",
        "name": "等待应用重启完成"
      },
      {
        "id": "5",
        "name": "验证之前打开的Tab和状态是否保持"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "打包模式(生产环境):应用完全关闭并自动重启"
      },
      {
        "id": "2",
        "name": "开发模式:topBarView和contentView执行reloadIgnoringCache,清除缓存并刷新页面"
      },
      {
        "id": "3",
        "name": "应用重启后,之前打开的Tab列表从localStorage恢复"
      },
      {
        "id": "4",
        "name": "之前高亮的Tab保持高亮状态(如果存在)"
      },
      {
        "id": "5",
        "name": "用户数据,项目数据,设置等持久化数据保持不变"
      },
      {
        "id": "6",
        "name": "刷新操作不会导致数据丢失或损坏"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第143-153行定义refreshApp方法和按钮"
      },
      {
        "id": "2",
        "name": "refreshApp方法调用window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.refreshApp)"
      },
      {
        "id": "3",
        "name": "主进程监听IPC事件:ipcMain.on(IPC_EVENTS.apiflow.rendererToMain.refreshApp, ...)(ipcMessage/index.ts第375-394行)"
      },
      {
        "id": "4",
        "name": "打包模式判断:app.isPackaged === true"
      },
      {
        "id": "5",
        "name": "打包模式执行:app.relaunch()重启应用 + app.exit()退出当前实例"
      },
      {
        "id": "6",
        "name": "开发模式执行:topBarView.webContents.reloadIgnoringCache() + contentView.webContents.reloadIgnoringCache()"
      },
      {
        "id": "7",
        "name": "reloadIgnoringCache清除HTTP缓存并刷新页面,相当于硬刷新(Ctrl+Shift+R)"
      },
      {
        "id": "8",
        "name": "Tab列表通过appWorkbenchCache.getAppWorkbenchHeaderTabs()从localStorage恢复"
      },
      {
        "id": "9",
        "name": "高亮Tab通过appWorkbenchCache.getAppWorkbenchHeaderActiveTab()恢复"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "刷新功能区分开发和生产环境,提供不同的刷新策略"
      },
      {
        "id": "2",
        "name": "生产环境使用app.relaunch确保完全重启,适用于更新后的重载场景"
      },
      {
        "id": "3",
        "name": "开发环境使用reloadIgnoringCache提高开发效率,避免完全重启Electron"
      },
      {
        "id": "4",
        "name": "IPC事件名称:IPC_EVENTS.apiflow.rendererToMain.refreshApp"
      },
      {
        "id": "5",
        "name": "刷新按钮title提示文字:t(\"刷新主应用\")"
      }
    ]
  },
  {
    "purpose": "初始状态,项目A切换项目B,然后换到项目C,然后切换到项目A,然后切换到设置,点击后退按钮切换到项目A,再点击后退切换到项目C,再点击后退按钮切换到B,再点击后退按钮切换到A.点击前进需要恢复之前逻辑",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "已创建项目A,项目B,项目C"
      },
      {
        "id": "3",
        "name": "当前在主页面(初始状态)"
      },
      {
        "id": "4",
        "name": "Vue Router正常工作"
      },
      {
        "id": "5",
        "name": "前进/后退按钮已渲染在Header导航栏"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "初始状态:在主页面"
      },
      {
        "id": "2",
        "name": "点击项目A的编辑按钮,进入项目A工作区"
      },
      {
        "id": "3",
        "name": "点击项目B的编辑按钮或通过项目切换功能切换到项目B"
      },
      {
        "id": "4",
        "name": "切换到项目C"
      },
      {
        "id": "5",
        "name": "切换回项目A"
      },
      {
        "id": "6",
        "name": "点击设置按钮,进入设置页面"
      },
      {
        "id": "7",
        "name": "点击Header的后退按钮(Back图标,data-testid=\"header-back-btn\")"
      },
      {
        "id": "8",
        "name": "观察页面变化,应回到项目A"
      },
      {
        "id": "9",
        "name": "再次点击后退按钮"
      },
      {
        "id": "10",
        "name": "观察页面变化,应回到项目C"
      },
      {
        "id": "11",
        "name": "再次点击后退按钮"
      },
      {
        "id": "12",
        "name": "观察页面变化,应回到项目B"
      },
      {
        "id": "13",
        "name": "再次点击后退按钮"
      },
      {
        "id": "14",
        "name": "观察页面变化,应回到项目A"
      },
      {
        "id": "15",
        "name": "点击Header的前进按钮(Right图标,data-testid=\"header-forward-btn\")"
      },
      {
        "id": "16",
        "name": "观察页面变化,应前进到项目B"
      },
      {
        "id": "17",
        "name": "继续点击前进按钮,验证是否按C->A->设置的顺序前进"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "后退按钮点击后,页面按导航历史栈的逆序依次回退:设置->A->C->B->A"
      },
      {
        "id": "2",
        "name": "每次后退,内容区域切换到对应的页面,对应Tab被高亮"
      },
      {
        "id": "3",
        "name": "后退到项目页面时,项目工作区正确加载对应项目的数据"
      },
      {
        "id": "4",
        "name": "前进按钮点击后,页面按导航历史栈的正序依次前进:A->B->C->A->设置"
      },
      {
        "id": "5",
        "name": "前进和后退操作不会创建新的历史记录,仅在已有历史栈中移动"
      },
      {
        "id": "6",
        "name": "如果历史栈为空或已到达栈底,后退按钮跳转到主页面(/)"
      },
      {
        "id": "7",
        "name": "导航历史栈由Vue Router管理,支持完整的SPA路由历史"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第143-153行定义goBack和goForward方法及按钮"
      },
      {
        "id": "2",
        "name": "goBack调用window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.goBack)"
      },
      {
        "id": "3",
        "name": "goForward调用window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.goForward)"
      },
      {
        "id": "4",
        "name": "主进程转发IPC事件到contentView:contentView.webContents.send(IPC_EVENTS.apiflow.rendererToMain.goBack)"
      },
      {
        "id": "5",
        "name": "App.vue监听IPC事件:window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.rendererToMain.goBack, handleGoBack)"
      },
      {
        "id": "6",
        "name": "handleGoBack方法(App.vue第78-89行):window.history.length > 1 ? router.back() : router.push(\"/\")"
      },
      {
        "id": "7",
        "name": "handleGoForward方法(App.vue):router.forward()"
      },
      {
        "id": "8",
        "name": "Vue Router的router.back()和router.forward()操作浏览器历史栈"
      },
      {
        "id": "9",
        "name": "导航历史栈包含完整的路由路径,如/project/:projectId,/settings等"
      },
      {
        "id": "10",
        "name": "每次项目切换通过router.push()或router.replace()添加历史记录"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "前进/后退功能依赖Vue Router的历史管理,与浏览器的前进后退机制类似"
      },
      {
        "id": "2",
        "name": "IPC通信架构:topBarView发送事件 -> 主进程转发 -> contentView接收并执行router操作"
      },
      {
        "id": "3",
        "name": "历史栈为空时后退到根路径(/)作为安全后备"
      },
      {
        "id": "4",
        "name": "window.history.length用于判断是否有可回退的历史记录"
      },
      {
        "id": "5",
        "name": "导航控制按钮的title提示:t(\"后退\")和t(\"前进\")"
      },
      {
        "id": "6",
        "name": "项目切换,设置打开等操作都会自动添加到路由历史栈"
      }
    ]
  }
],
}

export default node
