import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "windowControl",
  description: "窗口控制",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击最小化图标应用最小化",
    "precondition": [
      {
        "id": "1",
        "name": "Electron应用已启动"
      },
      {
        "id": "2",
        "name": "窗口处于正常显示状态(非最小化)"
      },
      {
        "id": "3",
        "name": "Header导航栏窗口控制区域已渲染"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到Header右上角的窗口控制区域(.window-control)"
      },
      {
        "id": "2",
        "name": "找到最小化按钮(iconjianhao图标,data-testid=\"header-minimize-btn\")"
      },
      {
        "id": "3",
        "name": "点击最小化按钮"
      },
      {
        "id": "4",
        "name": "观察窗口变化"
      },
      {
        "id": "5",
        "name": "在任务栏或Dock中找到应用图标,点击恢复窗口"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击最小化按钮后,应用窗口立即最小化到任务栏(Windows)或Dock(macOS)"
      },
      {
        "id": "2",
        "name": "窗口从屏幕上消失,但应用进程继续运行"
      },
      {
        "id": "3",
        "name": "应用图标在任务栏/Dock中保持显示"
      },
      {
        "id": "4",
        "name": "点击任务栏/Dock图标后,窗口恢复到最小化前的状态(大小和位置)"
      },
      {
        "id": "5",
        "name": "窗口恢复后,之前打开的Tab,内容,状态等完全保持不变"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第56-61行定义窗口控制区域,包含最小化,最大化,关闭按钮"
      },
      {
        "id": "2",
        "name": "最小化按钮:i.iconfont.iconjianhao, id=\"minimize\", data-testid=\"header-minimize-btn\", @click=\"minimize\""
      },
      {
        "id": "3",
        "name": "minimize方法(Header.vue第122行):window.electronAPI?.windowManager.minimizeWindow()"
      },
      {
        "id": "4",
        "name": "Preload暴露minimizeWindow方法(preload.ts第20-47行)"
      },
      {
        "id": "5",
        "name": "minimizeWindow通过ipcRenderer.send发送IPC_EVENTS.window.rendererToMain.minimize事件"
      },
      {
        "id": "6",
        "name": "主进程监听minimize事件(ipcMessage/index.ts第154-170行)"
      },
      {
        "id": "7",
        "name": "调用mainWindow.minimize()执行Electron窗口最小化"
      },
      {
        "id": "8",
        "name": "BrowserWindow的minimize()方法是Electron API,跨平台兼容"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "最小化按钮title提示:t(\"最小化\")"
      },
      {
        "id": "2",
        "name": "窗口控制通过IPC通信:rendererProcess -> mainProcess -> Electron API"
      },
      {
        "id": "3",
        "name": "最小化不会终止应用进程,所有状态和数据保持在内存中"
      },
      {
        "id": "4",
        "name": "Electron的minimize()在Windows,macOS,Linux上行为一致"
      }
    ]
  },
  {
    "purpose": "点击窗口模式图标从最大化改变为窗口模式并且图标变为最大化图标,点击最大化图标,窗口最大化并且图标变为窗口模式图标",
    "precondition": [
      {
        "id": "1",
        "name": "Electron应用已启动"
      },
      {
        "id": "2",
        "name": "Header导航栏窗口控制区域已渲染"
      },
      {
        "id": "3",
        "name": "isMaximized响应式变量正常工作"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "场景1:窗口当前处于最大化状态"
      },
      {
        "id": "2",
        "name": "观察窗口控制区域显示的是iconminiScreen图标(窗口模式图标)"
      },
      {
        "id": "3",
        "name": "点击iconminiScreen按钮(data-testid=\"header-unmaximize-btn\")"
      },
      {
        "id": "4",
        "name": "观察窗口大小变化和图标变化"
      },
      {
        "id": "5",
        "name": "场景2:窗口当前处于窗口模式"
      },
      {
        "id": "6",
        "name": "观察窗口控制区域显示的是iconmaxScreen图标(最大化图标)"
      },
      {
        "id": "7",
        "name": "点击iconmaxScreen按钮(data-testid=\"header-maximize-btn\")"
      },
      {
        "id": "8",
        "name": "观察窗口大小变化和图标变化"
      },
      {
        "id": "9",
        "name": "重复场景1和场景2,验证图标切换逻辑"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "场景1:点击窗口模式按钮后,窗口从最大化状态恢复为窗口模式(unmaximize)"
      },
      {
        "id": "2",
        "name": "窗口大小恢复为最大化前的尺寸和位置"
      },
      {
        "id": "3",
        "name": "窗口控制区域的图标从iconminiScreen切换为iconmaxScreen(最大化图标)"
      },
      {
        "id": "4",
        "name": "isMaximized.value变为false"
      },
      {
        "id": "5",
        "name": "场景2:点击最大化按钮后,窗口填充整个屏幕(最大化)"
      },
      {
        "id": "6",
        "name": "窗口标题栏保留可见,任务栏/Dock保持可见(非全屏模式)"
      },
      {
        "id": "7",
        "name": "窗口控制区域的图标从iconmaxScreen切换为iconminiScreen(窗口模式图标)"
      },
      {
        "id": "8",
        "name": "isMaximized.value变为true"
      },
      {
        "id": "9",
        "name": "图标切换通过v-if条件渲染实现,同一时刻只显示一个图标"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第56-61行根据isMaximized条件渲染不同按钮"
      },
      {
        "id": "2",
        "name": "v-if=\"!isMaximized\"渲染最大化按钮:i.iconfont.iconmaxScreen, id=\"maximize\", data-testid=\"header-maximize-btn\", @click=\"maximize\""
      },
      {
        "id": "3",
        "name": "v-if=\"isMaximized\"渲染窗口模式按钮:i.iconfont.iconminiScreen, id=\"unmaximize\", data-testid=\"header-unmaximize-btn\", @click=\"unmaximize\""
      },
      {
        "id": "4",
        "name": "isMaximized响应式变量(Header.vue):ref<boolean>(false)"
      },
      {
        "id": "5",
        "name": "maximize方法(Header.vue第122行):window.electronAPI?.windowManager.maximizeWindow()"
      },
      {
        "id": "6",
        "name": "unmaximize方法(Header.vue第122行):window.electronAPI?.windowManager.unMaximizeWindow()"
      },
      {
        "id": "7",
        "name": "Preload暴露maximizeWindow和unMaximizeWindow方法(preload.ts第20-47行)"
      },
      {
        "id": "8",
        "name": "主进程监听maximize和unmaximize事件(ipcMessage/index.ts第154-170行)"
      },
      {
        "id": "9",
        "name": "调用mainWindow.maximize()或mainWindow.unmaximize()执行窗口状态切换"
      },
      {
        "id": "10",
        "name": "handleWindowResize方法(Header.vue第127行)监听窗口状态变化"
      },
      {
        "id": "11",
        "name": "window.electronAPI?.windowManager.onWindowResize(handleWindowResize)注册监听"
      },
      {
        "id": "12",
        "name": "handleWindowResize接收WindowState对象:{isMaximized: boolean},更新isMaximized.value"
      },
      {
        "id": "13",
        "name": "主进程在窗口resize事件时通过IPC发送WindowState到renderer"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "最大化和窗口模式按钮互斥显示,通过v-if=\"!isMaximized\"和v-if=\"isMaximized\"控制"
      },
      {
        "id": "2",
        "name": "isMaximized状态通过IPC事件同步,确保UI与实际窗口状态一致"
      },
      {
        "id": "3",
        "name": "windowManager.getWindowState()用于初始化窗口状态(Header.vue第290-295行)"
      },
      {
        "id": "4",
        "name": "最大化不是全屏,保留窗口边框和系统任务栏"
      },
      {
        "id": "5",
        "name": "Electron的maximize/unmaximize在跨平台上行为一致"
      },
      {
        "id": "6",
        "name": "按钮title提示:t(\"最大化\")和t(\"取消最大化\")"
      }
    ]
  },
  {
    "purpose": "点击关闭按钮关闭应用",
    "precondition": [
      {
        "id": "1",
        "name": "Electron应用已启动"
      },
      {
        "id": "2",
        "name": "Header导航栏窗口控制区域已渲染"
      },
      {
        "id": "3",
        "name": "应用有未保存的数据(可选,测试关闭前保存提示)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到Header右上角窗口控制区域最右侧的关闭按钮(iconguanbi图标,data-testid=\"header-close-btn\")"
      },
      {
        "id": "2",
        "name": "点击关闭按钮"
      },
      {
        "id": "3",
        "name": "如果有未保存数据,观察是否弹出确认对话框"
      },
      {
        "id": "4",
        "name": "确认关闭操作"
      },
      {
        "id": "5",
        "name": "观察应用窗口和进程是否完全终止"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击关闭按钮后,应用窗口立即关闭"
      },
      {
        "id": "2",
        "name": "如果有未保存的数据,可能弹出确认对话框询问是否保存(取决于应用配置)"
      },
      {
        "id": "3",
        "name": "确认关闭后,应用窗口从屏幕消失"
      },
      {
        "id": "4",
        "name": "Electron主进程终止,应用完全退出"
      },
      {
        "id": "5",
        "name": "应用图标从任务栏/Dock中移除(如果没有后台常驻)"
      },
      {
        "id": "6",
        "name": "关闭前,应用自动保存必要的状态数据到localStorage/IndexedDB"
      },
      {
        "id": "7",
        "name": "下次启动应用时,之前的Tab列表,设置等状态被恢复"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Header.vue第56-61行定义关闭按钮:i.iconfont.iconguanbi.close, id=\"close\", data-testid=\"header-close-btn\", @click=\"close\""
      },
      {
        "id": "2",
        "name": "close方法(Header.vue第122行):window.electronAPI?.windowManager.closeWindow()"
      },
      {
        "id": "3",
        "name": "Preload暴露closeWindow方法(preload.ts第20-47行)"
      },
      {
        "id": "4",
        "name": "closeWindow通过ipcRenderer.send发送IPC_EVENTS.window.rendererToMain.close事件"
      },
      {
        "id": "5",
        "name": "主进程监听close事件(ipcMessage/index.ts第154-170行)"
      },
      {
        "id": "6",
        "name": "调用mainWindow.close()执行窗口关闭"
      },
      {
        "id": "7",
        "name": "BrowserWindow的close()触发窗口关闭流程"
      },
      {
        "id": "8",
        "name": "关闭前可能触发before-unload或close事件,执行清理逻辑"
      },
      {
        "id": "9",
        "name": "Tab列表通过appWorkbenchCache自动保存到localStorage"
      },
      {
        "id": "10",
        "name": "用户设置,项目数据等通过各自的cache机制持久化"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "关闭按钮title提示:t(\"关闭\")"
      },
      {
        "id": "2",
        "name": "关闭按钮使用.close类名,通常有红色背景等视觉强调"
      },
      {
        "id": "3",
        "name": "Electron窗口关闭会触发应用退出,除非有多窗口或后台常驻配置"
      },
      {
        "id": "4",
        "name": "关闭前的数据保存由各模块的beforeunload或窗口close事件处理"
      },
      {
        "id": "5",
        "name": "可以通过mainWindow.on(\"close\", ...)监听关闭事件,实现自定义关闭逻辑"
      }
    ]
  }
],
}

export default node
