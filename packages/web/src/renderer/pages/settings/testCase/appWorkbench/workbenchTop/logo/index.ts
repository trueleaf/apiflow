import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "logo",
  description: "logo",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击logo跳转主页面",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动并加载完成"
      },
      {
        "id": "2",
        "name": "当前不在主页面(可能在项目工作区或设置页面)"
      },
      {
        "id": "3",
        "name": "顶部Header.vue组件已渲染"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到顶部导航栏的Logo区域(Header.vue第4行)"
      },
      {
        "id": "2",
        "name": "点击Logo图标(img元素, 绑定@click=\"jumpToHome\")"
      },
      {
        "id": "3",
        "name": "观察页面跳转效果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "页面立即跳转到主页面(/home路由)"
      },
      {
        "id": "2",
        "name": "所有Tab的高亮状态被清除(activeTabId.value设为空字符串)"
      },
      {
        "id": "3",
        "name": "显示项目列表或主页内容"
      },
      {
        "id": "4",
        "name": "通过IPC事件apiflow.topBarToContent.navigate发送导航指令到内容区"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "jumpToHome方法被正确调用(Header.vue第251行)"
      },
      {
        "id": "2",
        "name": "activeTabId.value被设置为空字符串"
      },
      {
        "id": "3",
        "name": "syncActiveTabToContentView方法被执行, 同步Tab状态"
      },
      {
        "id": "4",
        "name": "IPC事件IPC_EVENTS.apiflow.topBarToContent.navigate被发送, 参数为\"/home\""
      },
      {
        "id": "5",
        "name": "内容区(contentView)接收到导航事件并执行路由跳转"
      },
      {
        "id": "6",
        "name": "浏览器地址栏显示/#/home"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Logo点击事件通过@click=\"jumpToHome\"绑定"
      },
      {
        "id": "2",
        "name": "jumpToHome通过IPC通信在topBarView和contentView之间传递导航指令"
      },
      {
        "id": "3",
        "name": "Logo图标来源: appSettingsStore.appLogo计算属性"
      },
      {
        "id": "4",
        "name": "Logo具有draggable=\"false\"属性防止拖拽"
      }
    ]
  },
  {
    "purpose": "设置页面更改应用图标后logo立马被更新, 刷新页面保持更新后的图标",
    "precondition": [
      {
        "id": "1",
        "name": "应用已启动"
      },
      {
        "id": "2",
        "name": "进入设置页面(通用设置或应用设置)"
      },
      {
        "id": "3",
        "name": "appSettingsStore已初始化"
      },
      {
        "id": "4",
        "name": "localStorage可用"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在设置页面找到应用图标更改功能"
      },
      {
        "id": "2",
        "name": "选择或上传新的图标文件"
      },
      {
        "id": "3",
        "name": "调用appSettingsStore.setAppLogo(newLogoPath)设置新图标"
      },
      {
        "id": "4",
        "name": "观察顶部Header的Logo是否立即更新"
      },
      {
        "id": "5",
        "name": "按F5刷新页面"
      },
      {
        "id": "6",
        "name": "等待页面重新加载完成"
      },
      {
        "id": "7",
        "name": "观察Logo是否仍然显示为新设置的图标"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "步骤3执行后, 顶部Logo立即显示为新图标, 无需刷新页面"
      },
      {
        "id": "2",
        "name": "Logo的src属性值变更为新图标路径"
      },
      {
        "id": "3",
        "name": "步骤5刷新后, Logo依然显示为新设置的图标"
      },
      {
        "id": "4",
        "name": "新图标路径被持久化保存到localStorage"
      },
      {
        "id": "5",
        "name": "关闭应用重新打开后, Logo仍显示为新图标"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "appSettingsStore.setAppLogo方法正确更新_appLogo响应式变量"
      },
      {
        "id": "2",
        "name": "appSettingsCache.setAppLogo方法被调用,将新图标路径写入localStorage[\"settings/app/logo\"]"
      },
      {
        "id": "3",
        "name": "appLogo计算属性(computed)立即响应变化,返回新图标路径"
      },
      {
        "id": "4",
        "name": "Header.vue中的img标签:src绑定自动更新(v-bind响应式)"
      },
      {
        "id": "5",
        "name": "localStorage[\"settings/app/logo\"]存储值为新图标路径"
      },
      {
        "id": "6",
        "name": "刷新页面后,appSettingsStore初始化时通过appSettingsCache.getAppLogo从localStorage读取图标路径"
      },
      {
        "id": "7",
        "name": "如果localStorage中无自定义图标,appLogo计算属性返回defaultLogoImg(src/renderer/assets/imgs/logo.png)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Logo响应式更新基于Vue 3的computed属性和v-bind机制"
      },
      {
        "id": "2",
        "name": "appLogo定义: computed(() => _appLogo.value || defaultLogoImg)"
      },
      {
        "id": "3",
        "name": "持久化存储键: cacheKey.settings.app.logo"
      },
      {
        "id": "4",
        "name": "setAppLogo方法会捕获localStorage写入错误并记录日志"
      },
      {
        "id": "5",
        "name": "默认Logo图标路径: src/renderer/assets/imgs/logo.png"
      },
      {
        "id": "6",
        "name": "Logo更新会通过IPC事件appSettingsChanged同步到contentView"
      }
    ]
  }
],
}

export default node
