import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "tools",
  description: "工具栏",
  children: [],
  atomicFunc: [
  {
    "purpose": "工具栏默认按顺序展示:新增目录,新增httpNode,刷新,折叠全部,回收站,导入文档,变量图标,更多操作",
    "precondition": [
      {
        "id": "1",
        "name": "首次打开项目工作区,localStorage中无工具栏配置缓存"
      },
      {
        "id": "2",
        "name": "Tool.vue组件已渲染"
      },
      {
        "id": "3",
        "name": "operations.ts中originOperaions定义了所有默认工具"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "打开项目工作区页面"
      },
      {
        "id": "2",
        "name": "观察Tool.vue第91-110行的工具栏区域渲染"
      },
      {
        "id": "3",
        "name": "从左到右依次检查工具栏图标的显示顺序"
      },
      {
        "id": "4",
        "name": "验证每个图标的tooltip提示文字"
      },
      {
        "id": "5",
        "name": "检查工具栏最右侧是否显示\"更多操作\"按钮(MoreFilled图标)"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "Tool.vue第232-258行initCacheOperation方法初始化工具栏"
      },
      {
        "id": "2",
        "name": "无缓存时,使用operations.ts中originOperaions的默认配置"
      },
      {
        "id": "3",
        "name": "第257行:pinOperations.value = availableOperations.filter((v) => v.pin),筛选pin为true的工具"
      },
      {
        "id": "4",
        "name": "默认固定工具(pin: true)按operations.ts顺序显示:新增文件夹,新增文件,刷新banner,Cookie管理,回收站"
      },
      {
        "id": "5",
        "name": "operations.ts第3-7行:新增文件夹(#iconxinzengwenjian)"
      },
      {
        "id": "6",
        "name": "operations.ts第10-14行:新增文件(#iconwenjian)"
      },
      {
        "id": "7",
        "name": "operations.ts第17-22行:刷新banner(#iconshuaxin)"
      },
      {
        "id": "8",
        "name": "operations.ts第25-29行:Cookie管理(#iconCookies)"
      },
      {
        "id": "9",
        "name": "operations.ts第32-36行:回收站(#iconhuishouzhan)"
      },
      {
        "id": "10",
        "name": "未固定工具(pin: false)不显示在工具栏:项目分享,导出文档,导入文档,全局变量"
      },
      {
        "id": "11",
        "name": "Tool.vue第114行:更多操作按钮显示在工具栏最右侧(data-testid=\"banner-tool-more-btn\")"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts第1行:originOperaions数组定义所有工具"
      },
      {
        "id": "2",
        "name": "Tool.vue第93行:SDraggable组件v-model=\"pinOperations\"渲染固定工具"
      },
      {
        "id": "3",
        "name": "Tool.vue第224-225行:operations和pinOperations响应式数组"
      },
      {
        "id": "4",
        "name": "Tool.vue第232行:initCacheOperation方法初始化工具配置"
      },
      {
        "id": "5",
        "name": "Tool.vue第233行:getProjectWorkbenchPinToolbarOperations从localStorage读取缓存"
      },
      {
        "id": "6",
        "name": "Tool.vue第257行:无缓存时使用默认pin值筛选"
      },
      {
        "id": "7",
        "name": "每个工具的pin属性控制是否默认固定"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "工具栏配置使用localStorage持久化,key为projectWorkbench/pinToolbarOperations"
      },
      {
        "id": "2",
        "name": "operations.ts中pin: true的工具默认显示在工具栏"
      },
      {
        "id": "3",
        "name": "SDraggable组件提供拖拽功能,item-key=\"name\"标识每个工具"
      },
      {
        "id": "4",
        "name": "operations.ts中的viewOnly: true表示该工具不可在离线模式使用"
      },
      {
        "id": "5",
        "name": "icon字段支持两种格式:svg sprite(以#开头)和lucide-vue-next图标名称"
      }
    ]
  },
  {
    "purpose": "工具栏图标可以自由拖拽交换顺序,刷新页面后顺序保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "已打开项目工作区,工具栏显示默认工具"
      },
      {
        "id": "2",
        "name": "pinOperations数组包含多个固定工具"
      },
      {
        "id": "3",
        "name": "SDraggable组件已正确渲染"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "鼠标按住工具栏中的\"新增文件夹\"图标"
      },
      {
        "id": "2",
        "name": "拖拽该图标到\"回收站\"图标右侧"
      },
      {
        "id": "3",
        "name": "松开鼠标,观察图标位置变化"
      },
      {
        "id": "4",
        "name": "验证pinOperations数组顺序是否更新"
      },
      {
        "id": "5",
        "name": "检查localStorage中是否保存了新顺序"
      },
      {
        "id": "6",
        "name": "按F5刷新页面"
      },
      {
        "id": "7",
        "name": "等待页面重新加载"
      },
      {
        "id": "8",
        "name": "观察工具栏图标顺序是否与拖拽后一致"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "SDraggable组件支持拖拽排序,animation=\"150\"提供150ms过渡动画"
      },
      {
        "id": "2",
        "name": "拖拽过程中显示拖拽预览效果"
      },
      {
        "id": "3",
        "name": "松开鼠标后,pinOperations数组顺序自动更新"
      },
      {
        "id": "4",
        "name": "Tool.vue第260-264行watch监听pinOperations变化"
      },
      {
        "id": "5",
        "name": "第261行:projectWorkbenchCache.setProjectWorkbenchPinToolbarOperations(v)保存到localStorage"
      },
      {
        "id": "6",
        "name": "deep: true深度监听,数组元素顺序变化也会触发保存"
      },
      {
        "id": "7",
        "name": "刷新页面后,initCacheOperation方法从localStorage读取缓存配置"
      },
      {
        "id": "8",
        "name": "Tool.vue第241-254行:localPinToolbarOperations.length > 0时使用缓存顺序"
      },
      {
        "id": "9",
        "name": "工具栏图标顺序与拖拽后保持一致"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue第93行:SDraggable组件 - v-model=\"pinOperations\", animation=\"150\", group=\"operation\""
      },
      {
        "id": "2",
        "name": "Tool.vue第260行:watch(pinOperations, ...)监听数组变化"
      },
      {
        "id": "3",
        "name": "Tool.vue第261行:setProjectWorkbenchPinToolbarOperations保存配置"
      },
      {
        "id": "4",
        "name": "Tool.vue第233行:getProjectWorkbenchPinToolbarOperations读取缓存"
      },
      {
        "id": "5",
        "name": "SDraggable的v-model双向绑定,拖拽自动更新数组顺序"
      },
      {
        "id": "6",
        "name": "localStorage key: projectWorkbench/pinToolbarOperations"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "vuedraggable库基于Sortable.js,提供Vue组件封装"
      },
      {
        "id": "2",
        "name": "animation属性控制拖拽动画时长,单位毫秒"
      },
      {
        "id": "3",
        "name": "group属性用于多个draggable组件间拖拽,相同group可互相拖拽"
      },
      {
        "id": "4",
        "name": "watch deep选项监听数组内部变化,包括顺序调整"
      },
      {
        "id": "5",
        "name": "拖拽排序是用户自定义工具栏的核心功能"
      }
    ]
  },
  {
    "purpose": "点击更多操作按钮展示更多操作,显示完整的工具列表,工具列表可以自由拖拽交换顺序,刷新页面后顺序保持不变",
    "precondition": [
      {
        "id": "1",
        "name": "已打开项目工作区"
      },
      {
        "id": "2",
        "name": "Tool.vue第114行更多操作按钮已渲染"
      },
      {
        "id": "3",
        "name": "operations数组包含所有工具(包括未固定的)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击工具栏最右侧的\"更多操作\"按钮(MoreFilled图标,data-testid=\"banner-tool-more-btn\")"
      },
      {
        "id": "2",
        "name": "观察el-popover弹出层是否显示"
      },
      {
        "id": "3",
        "name": "检查弹出层顶部标题是否显示\"快捷操作\""
      },
      {
        "id": "4",
        "name": "检查弹出层右上角是否显示关闭按钮(Close图标)"
      },
      {
        "id": "5",
        "name": "观察弹出层中显示的工具列表"
      },
      {
        "id": "6",
        "name": "验证每个工具是否显示:图标,名称,快捷键,固定按钮"
      },
      {
        "id": "7",
        "name": "拖拽\"导入文档\"工具到\"导出文档\"上方"
      },
      {
        "id": "8",
        "name": "观察工具顺序变化"
      },
      {
        "id": "9",
        "name": "刷新页面,再次打开更多操作面板"
      },
      {
        "id": "10",
        "name": "验证工具顺序是否保持"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击更多操作按钮后,visible.value变为true"
      },
      {
        "id": "2",
        "name": "Tool.vue第112-153行el-popover弹出层显示"
      },
      {
        "id": "3",
        "name": "popper-class=\"tool-panel\",placement=\"right\",width=\"320\""
      },
      {
        "id": "4",
        "name": "第120行显示标题:\"快捷操作\"(使用i18n)"
      },
      {
        "id": "5",
        "name": "第121-125行显示关闭按钮,点击后visible设为false"
      },
      {
        "id": "6",
        "name": "第126行SDraggable组件v-model=\"operations\"显示所有工具"
      },
      {
        "id": "7",
        "name": "每个工具item包含:图标(第130-141行),名称(第142行),快捷键(第143-148行),固定按钮(第149行)"
      },
      {
        "id": "8",
        "name": "固定按钮class=\"pin iconfont iconpin\",已固定时添加active类"
      },
      {
        "id": "9",
        "name": "operations数组包含所有工具,无论是否固定"
      },
      {
        "id": "10",
        "name": "拖拽后operations数组顺序更新,但不会保存(仅pinOperations保存)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue第114行:更多操作按钮 - @click.stop=\"visible = !visible\""
      },
      {
        "id": "2",
        "name": "Tool.vue第112行:el-popover配置 - :visible=\"visible\", placement=\"right\", width=\"320\""
      },
      {
        "id": "3",
        "name": "Tool.vue第226行:visible响应式变量控制弹出层显示"
      },
      {
        "id": "4",
        "name": "Tool.vue第126行:SDraggable - v-model=\"operations\", group=\"operation2\""
      },
      {
        "id": "5",
        "name": "Tool.vue第128-151行:每个工具的完整UI(图标,名称,快捷键,固定按钮)"
      },
      {
        "id": "6",
        "name": "Tool.vue第149行:固定按钮 - @click.stop=\"togglePin(element)\""
      },
      {
        "id": "7",
        "name": "operations和pinOperations是两个独立数组,operations拖拽不触发watch保存"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "更多操作面板显示所有工具,包括未固定的工具"
      },
      {
        "id": "2",
        "name": "operations数组顺序可以拖拽,但不会持久化保存"
      },
      {
        "id": "3",
        "name": "仅pinOperations数组的顺序和内容会保存到localStorage"
      },
      {
        "id": "4",
        "name": "@click.stop阻止事件冒泡,避免触发handleHidePopover关闭弹窗"
      },
      {
        "id": "5",
        "name": "group=\"operation2\"与工具栏的group=\"operation\"不同,避免互相拖拽"
      }
    ]
  },
  {
    "purpose": "更多操作中的工具列表可以固定,点击固定后展示在工具栏,点击取消固定后从工具栏移除",
    "precondition": [
      {
        "id": "1",
        "name": "已打开更多操作面板"
      },
      {
        "id": "2",
        "name": "operations数组包含未固定的工具(如\"导入文档\",pin: false)"
      },
      {
        "id": "3",
        "name": "pinOperations数组包含已固定的工具"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在更多操作面板中找到\"导入文档\"工具(pin: false,未固定)"
      },
      {
        "id": "2",
        "name": "观察该工具右侧的固定按钮(iconpin图标),验证无active类"
      },
      {
        "id": "3",
        "name": "点击\"导入文档\"工具的固定按钮"
      },
      {
        "id": "4",
        "name": "观察固定按钮是否变为激活状态(添加active类)"
      },
      {
        "id": "5",
        "name": "观察工具栏是否出现\"导入文档\"图标"
      },
      {
        "id": "6",
        "name": "在更多操作面板中找到已固定的\"回收站\"工具"
      },
      {
        "id": "7",
        "name": "点击\"回收站\"的固定按钮(取消固定)"
      },
      {
        "id": "8",
        "name": "观察工具栏是否移除\"回收站\"图标"
      },
      {
        "id": "9",
        "name": "刷新页面,验证固定状态是否保持"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击固定按钮触发Tool.vue第149行@click.stop=\"togglePin(element)\""
      },
      {
        "id": "2",
        "name": "Tool.vue第267-270行togglePin方法执行"
      },
      {
        "id": "3",
        "name": "第268行:element.pin = !element.pin 切换pin状态"
      },
      {
        "id": "4",
        "name": "第269行:pinOperations.value = operations.value.filter((v) => v.pin)重新筛选固定工具"
      },
      {
        "id": "5",
        "name": "点击\"导入文档\"固定按钮后,pin从false变为true"
      },
      {
        "id": "6",
        "name": "pinOperations数组新增\"导入文档\"元素"
      },
      {
        "id": "7",
        "name": "工具栏(第93行SDraggable)自动显示新增的\"导入文档\"图标"
      },
      {
        "id": "8",
        "name": "固定按钮添加active类,图标样式变化(通常颜色高亮)"
      },
      {
        "id": "9",
        "name": "点击\"回收站\"取消固定后,pin从true变为false"
      },
      {
        "id": "10",
        "name": "pinOperations数组移除\"回收站\"元素"
      },
      {
        "id": "11",
        "name": "工具栏自动移除\"回收站\"图标"
      },
      {
        "id": "12",
        "name": "watch监听pinOperations变化,自动保存到localStorage"
      },
      {
        "id": "13",
        "name": "刷新页面后,固定状态从localStorage恢复"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue第149行:固定按钮 - class=\"pin iconfont iconpin\" :class=\"{ active: element.pin }\""
      },
      {
        "id": "2",
        "name": "Tool.vue第149行:@click.stop=\"togglePin(element)\"阻止冒泡并调用togglePin"
      },
      {
        "id": "3",
        "name": "Tool.vue第267行:togglePin方法定义"
      },
      {
        "id": "4",
        "name": "Tool.vue第268行:切换pin状态 - element.pin = !element.pin"
      },
      {
        "id": "5",
        "name": "Tool.vue第269行:重新筛选 - pinOperations.value = operations.value.filter((v) => v.pin)"
      },
      {
        "id": "6",
        "name": "Tool.vue第260行:watch监听pinOperations,deep: true"
      },
      {
        "id": "7",
        "name": "pin状态变化触发watch回调,保存到localStorage"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "togglePin方法修改element.pin,同时重新筛选pinOperations"
      },
      {
        "id": "2",
        "name": "pinOperations是computed结果,通过filter动态生成"
      },
      {
        "id": "3",
        "name": "active类名使固定按钮高亮,通常显示为不同颜色或填充"
      },
      {
        "id": "4",
        "name": "@click.stop防止点击固定按钮时触发工具本身的点击事件"
      },
      {
        "id": "5",
        "name": "operations和pinOperations共享同一批对象,修改pin会同步反映"
      }
    ]
  },
  {
    "purpose": "更多操作面板打开时候,点击关闭或者空白区域可以关闭面板",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "更多操作面板处于打开状态(visible.value为true)"
      },
      {
        "id": "3",
        "name": "el-popover组件已挂载并显示"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "定位到工具栏区域的更多操作按钮(data-testid=\"banner-tool-more-btn\")"
      },
      {
        "id": "2",
        "name": "点击更多操作按钮展开el-popover面板"
      },
      {
        "id": "3",
        "name": "验证面板已打开并展示所有工具列表"
      },
      {
        "id": "4",
        "name": "点击面板右上角的关闭按钮(带有Close图标的div.toolbar-close)"
      },
      {
        "id": "5",
        "name": "观察面板关闭效果"
      },
      {
        "id": "6",
        "name": "再次点击更多操作按钮展开面板"
      },
      {
        "id": "7",
        "name": "点击面板外部的空白区域(例如banner其他区域或节点树区域)"
      },
      {
        "id": "8",
        "name": "观察面板关闭效果"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击关闭按钮后,el-popover面板立即关闭"
      },
      {
        "id": "2",
        "name": "关闭按钮点击时,visible.value被设置为false"
      },
      {
        "id": "3",
        "name": "点击外部空白区域后,el-popover面板自动关闭"
      },
      {
        "id": "4",
        "name": "点击外部区域时,handleHidePopover方法被触发"
      },
      {
        "id": "5",
        "name": "handleHidePopover方法执行时,visible.value和toggleProjectVisible.value都被设置为false"
      },
      {
        "id": "6",
        "name": "面板关闭后,可以再次点击更多操作按钮重新打开"
      },
      {
        "id": "7",
        "name": "面板关闭动画流畅,无闪烁或卡顿"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "关闭按钮位置在Tool.vue第121-125行"
      },
      {
        "id": "2",
        "name": "关闭按钮点击事件:@click=\"visible = false\""
      },
      {
        "id": "3",
        "name": "handleHidePopover方法定义在Tool.vue第272-275行"
      },
      {
        "id": "4",
        "name": "handleHidePopover方法逻辑:visible.value = false和toggleProjectVisible.value = false"
      },
      {
        "id": "5",
        "name": "onMounted钩子(第276-279行)中绑定document.documentElement的click事件监听"
      },
      {
        "id": "6",
        "name": "onUnmounted钩子(第280-282行)中移除事件监听"
      },
      {
        "id": "7",
        "name": "el-popover组件的v-model绑定visible响应式变量"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "面板关闭有两种触发方式:点击关闭按钮和点击外部区域"
      },
      {
        "id": "2",
        "name": "关闭按钮使用@click=\"visible = false\"直接设置状态"
      },
      {
        "id": "3",
        "name": "点击外部区域通过全局document事件监听实现,在组件挂载时添加监听,卸载时移除"
      },
      {
        "id": "4",
        "name": "handleHidePopover方法同时关闭visible和toggleProjectVisible两个弹窗状态"
      },
      {
        "id": "5",
        "name": "el-popover组件的v-model双向绑定机制与visible变量同步,visible变化时面板自动显示/隐藏"
      }
    ]
  },
  {
    "purpose": "点击新增目录按钮,弹出目录新增面板,可以新增目录,新增目录后,新增目录面板关闭,新增目录展示在节点树中,位置排序在根目录下最后一个目录节点下方",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
      },
      {
        "id": "3",
        "name": "新增目录按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "4",
        "name": "operations.ts中\"新增文件夹\"操作配置:op为\"addRootFolder\",pin默认为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"新增文件夹\"按钮(icon为\"#iconxinzengwenjian\")"
      },
      {
        "id": "2",
        "name": "点击\"新增文件夹\"按钮"
      },
      {
        "id": "3",
        "name": "观察SAddFolderDialog对话框弹出"
      },
      {
        "id": "4",
        "name": "在对话框中输入新目录名称(例如:\"测试目录\")"
      },
      {
        "id": "5",
        "name": "点击对话框的确认按钮保存目录"
      },
      {
        "id": "6",
        "name": "等待handleAddFileAndFolderCb回调执行"
      },
      {
        "id": "7",
        "name": "观察对话框自动关闭"
      },
      {
        "id": "8",
        "name": "观察新目录出现在banner左侧节点树中"
      },
      {
        "id": "9",
        "name": "验证新目录的位置排序在根目录下最后一个目录节点下方"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"addRootFolder\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"addRootFolder\"(Tool.vue第287-289行)"
      },
      {
        "id": "3",
        "name": "addFolderDialogVisible.value被设置为true"
      },
      {
        "id": "4",
        "name": "SAddFolderDialog组件条件渲染(v-if=\"addFolderDialogVisible\"为true)"
      },
      {
        "id": "5",
        "name": "对话框显示在页面中央,包含目录名称输入框和确认/取消按钮"
      },
      {
        "id": "6",
        "name": "保存成功后触发@success事件,调用handleAddFileAndFolderCb方法"
      },
      {
        "id": "7",
        "name": "handleAddFileAndFolderCb方法(Tool.vue第216-218行)调用addFileAndFolderCb函数处理新目录数据"
      },
      {
        "id": "8",
        "name": "addFolderDialogVisible.value自动设置为false,对话框关闭"
      },
      {
        "id": "9",
        "name": "新目录节点添加到bannerStore的banner数组中"
      },
      {
        "id": "10",
        "name": "新目录在el-tree中渲染,显示在根目录下最后一个目录节点下方"
      },
      {
        "id": "11",
        "name": "新目录节点包含默认图标和用户输入的名称"
      },
      {
        "id": "12",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"新增文件夹\"配置:{ name: \"新增文件夹\", icon: \"#iconxinzengwenjian\", op: \"addRootFolder\", pin: true }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中addRootFolder分支在Tool.vue第287-289行"
      },
      {
        "id": "3",
        "name": "addFolderDialogVisible响应式变量定义在Tool.vue第228行"
      },
      {
        "id": "4",
        "name": "SAddFolderDialog组件引用在Tool.vue第158-159行"
      },
      {
        "id": "5",
        "name": "SAddFolderDialog组件导入在Tool.vue第174行"
      },
      {
        "id": "6",
        "name": "handleAddFileAndFolderCb回调定义在Tool.vue第216-218行"
      },
      {
        "id": "7",
        "name": "addFileAndFolderCb函数导入自\"../composables/curd-node\"(Tool.vue第176行)"
      },
      {
        "id": "8",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "新增目录操作通过handleEmit方法的switch语句路由到addRootFolder分支"
      },
      {
        "id": "2",
        "name": "SAddFolderDialog是一个对话框组件,通过v-model=\"addFolderDialogVisible\"控制显示/隐藏"
      },
      {
        "id": "3",
        "name": "对话框保存成功后触发@success事件,传递新目录数据给handleAddFileAndFolderCb回调"
      },
      {
        "id": "4",
        "name": "handleAddFileAndFolderCb内部调用addFileAndFolderCb函数,该函数位于composables/curd-node中,负责将新节点添加到banner树结构"
      },
      {
        "id": "5",
        "name": "新目录的排序位置由addFileAndFolderCb函数内部逻辑决定,按照根目录下最后一个目录节点下方的规则排序"
      },
      {
        "id": "6",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  },
  {
    "purpose": "点击新增接口按钮,弹出接口新增面板,可以新增接口,新增接口后,新增接口面板关闭,新增接口展示在节点树中,位置排序在根接最下方(需要在httpNode,websocketNode,httpMockNode,websocketMock下)",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
      },
      {
        "id": "3",
        "name": "新增接口按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "4",
        "name": "operations.ts中\"新增文件\"操作配置:op为\"addRootFile\",pin默认为true"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"新增文件\"按钮(icon为\"#iconwenjian\")"
      },
      {
        "id": "2",
        "name": "点击\"新增文件\"按钮"
      },
      {
        "id": "3",
        "name": "观察SAddFileDialog对话框弹出"
      },
      {
        "id": "4",
        "name": "在对话框中选择接口类型(httpNode,websocketNode,httpMockNode或websocketMock)"
      },
      {
        "id": "5",
        "name": "输入新接口名称(例如:\"测试接口\")"
      },
      {
        "id": "6",
        "name": "点击对话框的确认按钮保存接口"
      },
      {
        "id": "7",
        "name": "等待handleAddFileAndFolderCb回调执行"
      },
      {
        "id": "8",
        "name": "观察对话框自动关闭"
      },
      {
        "id": "9",
        "name": "观察新接口出现在banner左侧节点树中"
      },
      {
        "id": "10",
        "name": "验证新接口的位置排序在根目录下对应类型节点的最下方"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"addRootFile\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"addRootFile\"(Tool.vue第290-292行)"
      },
      {
        "id": "3",
        "name": "addFileDialogVisible.value被设置为true"
      },
      {
        "id": "4",
        "name": "SAddFileDialog组件条件渲染(v-if=\"addFileDialogVisible\"为true)"
      },
      {
        "id": "5",
        "name": "对话框显示在页面中央,包含接口类型选择器,名称输入框和确认/取消按钮"
      },
      {
        "id": "6",
        "name": "接口类型选择器支持httpNode,websocketNode,httpMockNode,websocketMock四种类型"
      },
      {
        "id": "7",
        "name": "保存成功后触发@success事件,调用handleAddFileAndFolderCb方法"
      },
      {
        "id": "8",
        "name": "handleAddFileAndFolderCb方法(Tool.vue第216-218行)调用addFileAndFolderCb函数处理新接口数据"
      },
      {
        "id": "9",
        "name": "addFileDialogVisible.value自动设置为false,对话框关闭"
      },
      {
        "id": "10",
        "name": "新接口节点添加到bannerStore的banner数组中"
      },
      {
        "id": "11",
        "name": "新接口在el-tree中渲染,显示在根目录下对应类型节点的最下方"
      },
      {
        "id": "12",
        "name": "新接口节点包含对应类型的默认图标,用户输入的名称和类型标识"
      },
      {
        "id": "13",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"新增文件\"配置:{ name: \"新增文件\", icon: \"#iconwenjian\", op: \"addRootFile\", pin: true }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中addRootFile分支在Tool.vue第290-292行"
      },
      {
        "id": "3",
        "name": "addFileDialogVisible响应式变量定义在Tool.vue第227行"
      },
      {
        "id": "4",
        "name": "SAddFileDialog组件引用在Tool.vue第156-157行"
      },
      {
        "id": "5",
        "name": "SAddFileDialog组件导入在Tool.vue第173行"
      },
      {
        "id": "6",
        "name": "handleAddFileAndFolderCb回调定义在Tool.vue第216-218行"
      },
      {
        "id": "7",
        "name": "addFileAndFolderCb函数导入自\"../composables/curd-node\"(Tool.vue第176行)"
      },
      {
        "id": "8",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "新增接口操作通过handleEmit方法的switch语句路由到addRootFile分支"
      },
      {
        "id": "2",
        "name": "SAddFileDialog是一个对话框组件,通过v-model=\"addFileDialogVisible\"控制显示/隐藏"
      },
      {
        "id": "3",
        "name": "对话框支持四种接口类型选择:httpNode(HTTP接口),websocketNode(WebSocket接口),httpMockNode(HTTP Mock),websocketMock(WebSocket Mock)"
      },
      {
        "id": "4",
        "name": "对话框保存成功后触发@success事件,传递新接口数据(包含类型和名称)给handleAddFileAndFolderCb回调"
      },
      {
        "id": "5",
        "name": "handleAddFileAndFolderCb内部调用addFileAndFolderCb函数,该函数位于composables/curd-node中,负责将新节点添加到banner树结构"
      },
      {
        "id": "6",
        "name": "新接口的排序位置由addFileAndFolderCb函数内部逻辑决定,按照根目录下对应类型节点最下方的规则排序"
      },
      {
        "id": "7",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  },
  {
    "purpose": "点击刷新按钮,刷新当前banner数据",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已加载完成,节点树已渲染"
      },
      {
        "id": "3",
        "name": "刷新按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "4",
        "name": "operations.ts中\"刷新banner\"操作配置:op为\"freshBanner\",pin默认为true,viewOnly为true(预览模式展示)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"刷新banner\"按钮(icon为\"#iconshuaxin\")"
      },
      {
        "id": "2",
        "name": "点击\"刷新banner\"按钮"
      },
      {
        "id": "3",
        "name": "观察Tool.vue组件触发fresh事件"
      },
      {
        "id": "4",
        "name": "观察Banner.vue父组件接收fresh事件并执行刷新逻辑"
      },
      {
        "id": "5",
        "name": "等待banner数据从远程或本地重新加载"
      },
      {
        "id": "6",
        "name": "观察节点树重新渲染,显示最新的banner数据"
      },
      {
        "id": "7",
        "name": "验证节点树展开状态和滚动位置保持或恢复"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"freshBanner\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"freshBanner\"(Tool.vue第293-295行)"
      },
      {
        "id": "3",
        "name": "emits(\"fresh\")触发,向父组件Banner.vue发送fresh事件"
      },
      {
        "id": "4",
        "name": "Banner.vue接收到@fresh事件,执行绑定的刷新处理方法"
      },
      {
        "id": "5",
        "name": "刷新方法从bannerStore或API重新获取最新的banner节点数据"
      },
      {
        "id": "6",
        "name": "bannerStore.banner数组被更新为最新数据"
      },
      {
        "id": "7",
        "name": "el-tree组件响应式重新渲染,显示更新后的节点树"
      },
      {
        "id": "8",
        "name": "如果有新增或删除的节点,节点树立即反映这些变化"
      },
      {
        "id": "9",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"刷新banner\"配置:{ name: \"刷新banner\", icon: \"#iconshuaxin\", op: \"freshBanner\", pin: true, viewOnly: true }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中freshBanner分支在Tool.vue第293-295行"
      },
      {
        "id": "3",
        "name": "emits定义在Tool.vue第213行:defineEmits([\"fresh\", \"filter\", \"changeProject\"])"
      },
      {
        "id": "4",
        "name": "Banner.vue中应该有@fresh事件监听绑定到Tool.vue组件上"
      },
      {
        "id": "5",
        "name": "viewOnly属性为true表示该按钮在预览模式下也会展示"
      },
      {
        "id": "6",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "刷新banner操作通过事件触发机制实现,Tool.vue发出fresh事件,Banner.vue接收并处理"
      },
      {
        "id": "2",
        "name": "emits(\"fresh\")不传递参数,父组件接收到事件后自行执行刷新逻辑"
      },
      {
        "id": "3",
        "name": "viewOnly属性为true表示该操作在预览模式(只读模式)下也可以使用"
      },
      {
        "id": "4",
        "name": "刷新操作不会弹出对话框,而是直接执行数据重新加载"
      },
      {
        "id": "5",
        "name": "Banner.vue的刷新方法应该调用bannerStore的相关action重新获取数据"
      },
      {
        "id": "6",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  },
  {
    "purpose": "点击回收站图标,展示回收站页面",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "回收站按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "3",
        "name": "operations.ts中\"回收站\"操作配置:op为\"recycler\",pin默认为true"
      },
      {
        "id": "4",
        "name": "projectNavStore已初始化,支持标签页管理"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"回收站\"按钮(icon为\"#iconhuishouzhan\")"
      },
      {
        "id": "2",
        "name": "点击\"回收站\"按钮"
      },
      {
        "id": "3",
        "name": "观察handleEmit方法执行recycler分支"
      },
      {
        "id": "4",
        "name": "观察projectNavStore.addNav方法被调用,创建回收站标签页"
      },
      {
        "id": "5",
        "name": "观察主内容区域切换到回收站页面"
      },
      {
        "id": "6",
        "name": "验证标签栏显示\"回收站\"标签"
      },
      {
        "id": "7",
        "name": "验证回收站页面显示已删除的节点列表"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"recycler\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"recycler\"(Tool.vue第341-355行)"
      },
      {
        "id": "3",
        "name": "projectNavStore.addNav方法被调用,传入回收站标签页配置对象"
      },
      {
        "id": "4",
        "name": "标签页配置包含:_id为\"recycler\",projectId为当前项目ID,tabType为\"recycler\",label为国际化文本t(\"回收站\")"
      },
      {
        "id": "5",
        "name": "标签页配置的head对象包含icon为空字符串和color为空字符串"
      },
      {
        "id": "6",
        "name": "标签页配置的saved为true(表示已保存状态),fixed为true(表示固定标签),selected为true(表示选中状态)"
      },
      {
        "id": "7",
        "name": "projectNavStore将新标签页添加到导航栏tabs数组中"
      },
      {
        "id": "8",
        "name": "主内容区域路由切换到回收站组件,显示回收站页面"
      },
      {
        "id": "9",
        "name": "标签栏显示\"回收站\"标签,且该标签处于选中状态"
      },
      {
        "id": "10",
        "name": "回收站页面展示当前项目下所有被删除的节点(文件夹和接口)"
      },
      {
        "id": "11",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"回收站\"配置:{ name: \"回收站\", icon: \"#iconhuishouzhan\", op: \"recycler\", shortcut: [\"Ctrl\", \"Alt\", \"R\"], pin: true }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中recycler分支在Tool.vue第341-355行"
      },
      {
        "id": "3",
        "name": "projectNavStore导入在Tool.vue第180行:import { useProjectNav } from \"@/store/projectWorkbench/projectNavStore\""
      },
      {
        "id": "4",
        "name": "projectNavStore实例化在Tool.vue第206行:const projectNavStore = useProjectNav()"
      },
      {
        "id": "5",
        "name": "projectId获取在Tool.vue第284行:const projectId = router.currentRoute.value.query.id as string"
      },
      {
        "id": "6",
        "name": "addNav方法传入的对象包含7个属性:_id,projectId,tabType,label,head,saved,fixed,selected"
      },
      {
        "id": "7",
        "name": "t函数来自useI18n composable(Tool.vue第207行)"
      },
      {
        "id": "8",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "回收站操作通过projectNavStore.addNav创建新的标签页实现页面切换"
      },
      {
        "id": "2",
        "name": "addNav方法会检查是否已存在相同_id的标签页,如果存在则激活该标签页,不存在则创建新标签页"
      },
      {
        "id": "3",
        "name": "tabType为\"recycler\"标识标签页类型,用于路由匹配和组件渲染"
      },
      {
        "id": "4",
        "name": "fixed为true表示该标签页为固定标签,不能被用户关闭"
      },
      {
        "id": "5",
        "name": "selected为true表示创建后立即选中该标签页,主内容区域切换到回收站页面"
      },
      {
        "id": "6",
        "name": "回收站支持快捷键Ctrl+Alt+R快速打开"
      },
      {
        "id": "7",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  },
  {
    "purpose": "点击导入文档图标,展示导入文档页面",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "导入文档按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "3",
        "name": "operations.ts中\"导入文档\"操作配置:op为\"importDoc\",pin默认为false(不固定在工具栏)"
      },
      {
        "id": "4",
        "name": "projectNavStore已初始化,支持标签页管理"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"导入文档\"按钮(icon为\"arrowDownToLine\",lucide图标)"
      },
      {
        "id": "2",
        "name": "点击\"导入文档\"按钮"
      },
      {
        "id": "3",
        "name": "观察handleEmit方法执行importDoc分支"
      },
      {
        "id": "4",
        "name": "观察projectNavStore.addNav方法被调用,创建导入文档标签页"
      },
      {
        "id": "5",
        "name": "观察主内容区域切换到导入文档页面"
      },
      {
        "id": "6",
        "name": "验证标签栏显示\"导入文档\"标签"
      },
      {
        "id": "7",
        "name": "验证导入文档页面显示导入选项和文件上传区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"importDoc\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"importDoc\"(Tool.vue第326-340行)"
      },
      {
        "id": "3",
        "name": "projectNavStore.addNav方法被调用,传入导入文档标签页配置对象"
      },
      {
        "id": "4",
        "name": "标签页配置包含:_id为\"importDoc\",projectId为当前项目ID,tabType为\"importDoc\",label为国际化文本t(\"导入文档\")"
      },
      {
        "id": "5",
        "name": "标签页配置的head对象包含icon为空字符串和color为空字符串"
      },
      {
        "id": "6",
        "name": "标签页配置的saved为true(表示已保存状态),fixed为true(表示固定标签),selected为true(表示选中状态)"
      },
      {
        "id": "7",
        "name": "projectNavStore将新标签页添加到导航栏tabs数组中"
      },
      {
        "id": "8",
        "name": "主内容区域路由切换到导入文档组件,显示导入文档页面"
      },
      {
        "id": "9",
        "name": "标签栏显示\"导入文档\"标签,且该标签处于选中状态"
      },
      {
        "id": "10",
        "name": "导入文档页面展示支持的导入格式(如OpenAPI,Postman,Apifox等)和文件上传区域"
      },
      {
        "id": "11",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"导入文档\"配置:{ name: \"导入文档\", icon: \"arrowDownToLine\", op: \"importDoc\", shortcut: [\"Ctrl\", \"I\"], pin: false }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中importDoc分支在Tool.vue第326-340行"
      },
      {
        "id": "3",
        "name": "ArrowDownToLine图标来自lucide-vue-next库(Tool.vue第167行导入)"
      },
      {
        "id": "4",
        "name": "工具栏渲染时,arrowDownToLine图标通过v-else-if条件渲染(Tool.vue第133-135行)"
      },
      {
        "id": "5",
        "name": "projectNavStore导入在Tool.vue第180行:import { useProjectNav } from \"@/store/projectWorkbench/projectNavStore\""
      },
      {
        "id": "6",
        "name": "projectId获取在Tool.vue第284行:const projectId = router.currentRoute.value.query.id as string"
      },
      {
        "id": "7",
        "name": "addNav方法传入的对象包含7个属性:_id,projectId,tabType,label,head,saved,fixed,selected"
      },
      {
        "id": "8",
        "name": "导入文档支持快捷键Ctrl+I快速打开"
      },
      {
        "id": "9",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "导入文档操作通过projectNavStore.addNav创建新的标签页实现页面切换"
      },
      {
        "id": "2",
        "name": "icon为\"arrowDownToLine\"使用lucide-vue-next图标库,不是iconfont的#icon格式"
      },
      {
        "id": "3",
        "name": "pin默认为false表示该按钮默认不固定在工具栏,需要在更多操作面板中找到"
      },
      {
        "id": "4",
        "name": "tabType为\"importDoc\"标识标签页类型,用于路由匹配和组件渲染"
      },
      {
        "id": "5",
        "name": "fixed为true表示该标签页为固定标签,不能被用户关闭"
      },
      {
        "id": "6",
        "name": "selected为true表示创建后立即选中该标签页,主内容区域切换到导入文档页面"
      },
      {
        "id": "7",
        "name": "导入文档页面支持多种格式导入,如OpenAPI,Postman,Swagger,Apifox等"
      },
      {
        "id": "8",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  },
  {
    "purpose": "点击导出文档图标,展示导出文档页面",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "导出文档按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "3",
        "name": "operations.ts中\"导出文档\"操作配置:op为\"exportDoc\",pin默认为false(不固定在工具栏)"
      },
      {
        "id": "4",
        "name": "projectNavStore已初始化,支持标签页管理"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"导出文档\"按钮(icon为\"arrowUpToLine\",lucide图标)"
      },
      {
        "id": "2",
        "name": "点击\"导出文档\"按钮"
      },
      {
        "id": "3",
        "name": "观察handleEmit方法执行exportDoc分支"
      },
      {
        "id": "4",
        "name": "观察projectNavStore.addNav方法被调用,创建导出文档标签页"
      },
      {
        "id": "5",
        "name": "观察主内容区域切换到导出文档页面"
      },
      {
        "id": "6",
        "name": "验证标签栏显示\"导出文档\"标签"
      },
      {
        "id": "7",
        "name": "验证导出文档页面显示导出选项和格式选择区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"exportDoc\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"exportDoc\"(Tool.vue第311-325行)"
      },
      {
        "id": "3",
        "name": "projectNavStore.addNav方法被调用,传入导出文档标签页配置对象"
      },
      {
        "id": "4",
        "name": "标签页配置包含:_id为\"exportDoc\",projectId为当前项目ID,tabType为\"exportDoc\",label为国际化文本t(\"导出文档\")"
      },
      {
        "id": "5",
        "name": "标签页配置的head对象包含icon为空字符串和color为空字符串"
      },
      {
        "id": "6",
        "name": "标签页配置的saved为true(表示已保存状态),fixed为true(表示固定标签),selected为true(表示选中状态)"
      },
      {
        "id": "7",
        "name": "projectNavStore将新标签页添加到导航栏tabs数组中"
      },
      {
        "id": "8",
        "name": "主内容区域路由切换到导出文档组件,显示导出文档页面"
      },
      {
        "id": "9",
        "name": "标签栏显示\"导出文档\"标签,且该标签处于选中状态"
      },
      {
        "id": "10",
        "name": "导出文档页面展示支持的导出格式(如OpenAPI,Markdown,HTML等)和导出选项"
      },
      {
        "id": "11",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"导出文档\"配置:{ name: \"导出文档\", icon: \"arrowUpToLine\", op: \"exportDoc\", shortcut: [\"Ctrl\", \"E\"], pin: false }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中exportDoc分支在Tool.vue第311-325行"
      },
      {
        "id": "3",
        "name": "ArrowUpToLine图标来自lucide-vue-next库(Tool.vue第167行导入)"
      },
      {
        "id": "4",
        "name": "工具栏渲染时,arrowUpToLine图标通过v-else-if条件渲染(Tool.vue第136-138行)"
      },
      {
        "id": "5",
        "name": "projectNavStore导入在Tool.vue第180行:import { useProjectNav } from \"@/store/projectWorkbench/projectNavStore\""
      },
      {
        "id": "6",
        "name": "projectId获取在Tool.vue第284行:const projectId = router.currentRoute.value.query.id as string"
      },
      {
        "id": "7",
        "name": "addNav方法传入的对象包含7个属性:_id,projectId,tabType,label,head,saved,fixed,selected"
      },
      {
        "id": "8",
        "name": "导出文档支持快捷键Ctrl+E快速打开"
      },
      {
        "id": "9",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "导出文档操作通过projectNavStore.addNav创建新的标签页实现页面切换"
      },
      {
        "id": "2",
        "name": "icon为\"arrowUpToLine\"使用lucide-vue-next图标库,不是iconfont的#icon格式"
      },
      {
        "id": "3",
        "name": "pin默认为false表示该按钮默认不固定在工具栏,需要在更多操作面板中找到"
      },
      {
        "id": "4",
        "name": "tabType为\"exportDoc\"标识标签页类型,用于路由匹配和组件渲染"
      },
      {
        "id": "5",
        "name": "fixed为true表示该标签页为固定标签,不能被用户关闭"
      },
      {
        "id": "6",
        "name": "selected为true表示创建后立即选中该标签页,主内容区域切换到导出文档页面"
      },
      {
        "id": "7",
        "name": "导出文档页面支持多种格式导出,如OpenAPI,Markdown,HTML,Word等"
      },
      {
        "id": "8",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  },
  {
    "purpose": "点击Cookie图标,展示Cookie页面",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "Cookie管理按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "3",
        "name": "operations.ts中\"Cookie管理\"操作配置:op为\"cookies\",pin默认为true"
      },
      {
        "id": "4",
        "name": "projectNavStore已初始化,支持标签页管理"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"Cookie管理\"按钮(icon为\"#iconCookies\")"
      },
      {
        "id": "2",
        "name": "点击\"Cookie管理\"按钮"
      },
      {
        "id": "3",
        "name": "观察handleEmit方法执行cookies分支"
      },
      {
        "id": "4",
        "name": "观察projectNavStore.addNav方法被调用,创建Cookies标签页"
      },
      {
        "id": "5",
        "name": "观察主内容区域切换到Cookies管理页面"
      },
      {
        "id": "6",
        "name": "验证标签栏显示\"Cookies\"标签"
      },
      {
        "id": "7",
        "name": "验证Cookies页面显示当前项目的Cookie列表和管理操作"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"cookies\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"cookies\"(Tool.vue第401-415行)"
      },
      {
        "id": "3",
        "name": "projectNavStore.addNav方法被调用,传入Cookies标签页配置对象"
      },
      {
        "id": "4",
        "name": "标签页配置包含:_id为\"cookies\",projectId为当前项目ID,tabType为\"cookies\",label为国际化文本t(\"Cookies\")"
      },
      {
        "id": "5",
        "name": "标签页配置的head对象包含icon为空字符串和color为空字符串"
      },
      {
        "id": "6",
        "name": "标签页配置的saved为true(表示已保存状态),fixed为true(表示固定标签),selected为true(表示选中状态)"
      },
      {
        "id": "7",
        "name": "projectNavStore将新标签页添加到导航栏tabs数组中"
      },
      {
        "id": "8",
        "name": "主内容区域路由切换到Cookies管理组件,显示Cookies页面"
      },
      {
        "id": "9",
        "name": "标签栏显示\"Cookies\"标签,且该标签处于选中状态"
      },
      {
        "id": "10",
        "name": "Cookies页面展示当前项目的所有Cookie记录,包含域名,路径,名称,值,过期时间等字段"
      },
      {
        "id": "11",
        "name": "Cookies页面支持添加,编辑,删除Cookie操作"
      },
      {
        "id": "12",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"Cookie管理\"配置:{ name: \"Cookie管理\", icon: \"#iconCookies\", op: \"cookies\", shortcut: [\"Ctrl\", \"Alt\", \"C\"], pin: true }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中cookies分支在Tool.vue第401-415行"
      },
      {
        "id": "3",
        "name": "projectNavStore导入在Tool.vue第180行:import { useProjectNav } from \"@/store/projectWorkbench/projectNavStore\""
      },
      {
        "id": "4",
        "name": "projectNavStore实例化在Tool.vue第206行:const projectNavStore = useProjectNav()"
      },
      {
        "id": "5",
        "name": "projectId获取在Tool.vue第284行:const projectId = router.currentRoute.value.query.id as string"
      },
      {
        "id": "6",
        "name": "addNav方法传入的对象包含7个属性:_id,projectId,tabType,label,head,saved,fixed,selected"
      },
      {
        "id": "7",
        "name": "t函数来自useI18n composable(Tool.vue第207行)"
      },
      {
        "id": "8",
        "name": "Cookies支持快捷键Ctrl+Alt+C快速打开"
      },
      {
        "id": "9",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "Cookie管理操作通过projectNavStore.addNav创建新的标签页实现页面切换"
      },
      {
        "id": "2",
        "name": "tabType为\"cookies\"标识标签页类型,用于路由匹配和组件渲染"
      },
      {
        "id": "3",
        "name": "fixed为true表示该标签页为固定标签,不能被用户关闭"
      },
      {
        "id": "4",
        "name": "selected为true表示创建后立即选中该标签页,主内容区域切换到Cookies页面"
      },
      {
        "id": "5",
        "name": "Cookies数据存储在cookiesStore中,与项目关联"
      },
      {
        "id": "6",
        "name": "Cookies在HTTP请求时会自动添加到请求头中,支持域名和路径匹配"
      },
      {
        "id": "7",
        "name": "Cookies管理支持快捷键Ctrl+Alt+C快速打开"
      },
      {
        "id": "8",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  },
  {
    "purpose": "点击变量图标,展示变量页面",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "变量管理按钮在工具栏中可见(可能在固定栏或更多操作面板中)"
      },
      {
        "id": "3",
        "name": "operations.ts中\"全局变量\"操作配置:op为\"variable\",pin默认为false,viewOnly为true(预览模式展示)"
      },
      {
        "id": "4",
        "name": "projectNavStore已初始化,支持标签页管理"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在工具栏区域找到\"全局变量\"按钮(icon为\"variable\",lucide图标)"
      },
      {
        "id": "2",
        "name": "点击\"全局变量\"按钮"
      },
      {
        "id": "3",
        "name": "观察handleEmit方法执行variable分支"
      },
      {
        "id": "4",
        "name": "观察projectNavStore.addNav方法被调用,创建变量标签页"
      },
      {
        "id": "5",
        "name": "观察主内容区域切换到变量管理页面"
      },
      {
        "id": "6",
        "name": "验证标签栏显示\"变量\"标签"
      },
      {
        "id": "7",
        "name": "验证变量页面显示全局变量,环境变量,本地变量等分类和管理操作"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "点击按钮后,handleEmit方法被调用,参数为\"variable\""
      },
      {
        "id": "2",
        "name": "handleEmit中switch匹配到case \"variable\"(Tool.vue第386-400行)"
      },
      {
        "id": "3",
        "name": "projectNavStore.addNav方法被调用,传入变量标签页配置对象"
      },
      {
        "id": "4",
        "name": "标签页配置包含:_id为\"variable\",projectId为当前项目ID,tabType为\"variable\",label为国际化文本t(\"变量\")"
      },
      {
        "id": "5",
        "name": "标签页配置的head对象包含icon为空字符串和color为空字符串"
      },
      {
        "id": "6",
        "name": "标签页配置的saved为true(表示已保存状态),fixed为true(表示固定标签),selected为true(表示选中状态)"
      },
      {
        "id": "7",
        "name": "projectNavStore将新标签页添加到导航栏tabs数组中"
      },
      {
        "id": "8",
        "name": "主内容区域路由切换到变量管理组件,显示变量页面"
      },
      {
        "id": "9",
        "name": "标签栏显示\"变量\"标签,且该标签处于选中状态"
      },
      {
        "id": "10",
        "name": "变量页面展示不同作用域的变量列表:全局变量,环境变量,本地变量,会话变量"
      },
      {
        "id": "11",
        "name": "变量页面支持添加,编辑,删除变量操作,支持变量名称和值的输入"
      },
      {
        "id": "12",
        "name": "变量页面支持变量作用域切换,不同作用域的变量独立管理"
      },
      {
        "id": "13",
        "name": "如果点击更多操作面板中的按钮,面板在执行操作后自动关闭(visible.value = false,Tool.vue第419行)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "operations.ts中\"全局变量\"配置:{ name: \"全局变量\", icon: \"variable\", op: \"variable\", pin: false, viewOnly: true }"
      },
      {
        "id": "2",
        "name": "handleEmit方法中variable分支在Tool.vue第386-400行"
      },
      {
        "id": "3",
        "name": "Variable图标来自lucide-vue-next库(Tool.vue第167行导入)"
      },
      {
        "id": "4",
        "name": "工具栏渲染时,variable图标通过v-if条件渲染(Tool.vue第130-132行)"
      },
      {
        "id": "5",
        "name": "projectNavStore导入在Tool.vue第180行:import { useProjectNav } from \"@/store/projectWorkbench/projectNavStore\""
      },
      {
        "id": "6",
        "name": "projectNavStore实例化在Tool.vue第206行:const projectNavStore = useProjectNav()"
      },
      {
        "id": "7",
        "name": "projectId获取在Tool.vue第284行:const projectId = router.currentRoute.value.query.id as string"
      },
      {
        "id": "8",
        "name": "addNav方法传入的对象包含7个属性:_id,projectId,tabType,label,head,saved,fixed,selected"
      },
      {
        "id": "9",
        "name": "t函数来自useI18n composable(Tool.vue第207行)"
      },
      {
        "id": "10",
        "name": "viewOnly属性为true表示该按钮在预览模式下也会展示"
      },
      {
        "id": "11",
        "name": "handleEmit方法末尾执行visible.value = false(Tool.vue第419行)关闭更多操作面板"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "变量管理操作通过projectNavStore.addNav创建新的标签页实现页面切换"
      },
      {
        "id": "2",
        "name": "icon为\"variable\"使用lucide-vue-next图标库,不是iconfont的#icon格式"
      },
      {
        "id": "3",
        "name": "pin默认为false表示该按钮默认不固定在工具栏,需要在更多操作面板中找到"
      },
      {
        "id": "4",
        "name": "viewOnly属性为true表示该操作在预览模式(只读模式)下也可以使用"
      },
      {
        "id": "5",
        "name": "tabType为\"variable\"标识标签页类型,用于路由匹配和组件渲染"
      },
      {
        "id": "6",
        "name": "fixed为true表示该标签页为固定标签,不能被用户关闭"
      },
      {
        "id": "7",
        "name": "selected为true表示创建后立即选中该标签页,主内容区域切换到变量页面"
      },
      {
        "id": "8",
        "name": "变量数据存储在variablesStore中,支持全局,环境,本地,会话四种作用域"
      },
      {
        "id": "9",
        "name": "变量在HTTP请求时通过{{ variableName }}语法引用,支持嵌套和动态替换"
      },
      {
        "id": "10",
        "name": "如果从更多操作面板点击,handleEmit方法末尾的visible.value = false会自动关闭面板"
      }
    ]
  }
],
}

export default node
