import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "projectToggle",
  description: "项目切换",
  children: [],
  atomicFunc: [
  {
    "purpose": "点击切换项目图标,弹出项目切换面板,点击项目名称可以切换项目,切换项目后顶部header区域需要添加一个切换项目的tab",
    "precondition": [
      {
        "id": "1",
        "name": "应用已登录,当前用户至少有2个可访问的项目"
      },
      {
        "id": "2",
        "name": "已打开项目A的工作区页面"
      },
      {
        "id": "3",
        "name": "Tool.vue组件已渲染在banner区域"
      },
      {
        "id": "4",
        "name": "projectList响应式数组包含用户的所有项目列表"
      },
      {
        "id": "5",
        "name": "startProjectList包含用户收藏的项目(如果有)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "观察Tool.vue第4-5行显示的当前项目名称"
      },
      {
        "id": "2",
        "name": "点击Tool.vue第9行的切换项目按钮(Switch图标,data-testid=\"banner-toggle-project-btn\")"
      },
      {
        "id": "3",
        "name": "观察el-popover弹出层是否显示"
      },
      {
        "id": "4",
        "name": "检查弹出层中是否显示\"收藏的项目\"标题(如果startProjectList.length > 0)"
      },
      {
        "id": "5",
        "name": "检查收藏项目列表的显示(每个项目显示projectName和owner.name)"
      },
      {
        "id": "6",
        "name": "检查\"项目列表\"标题下的所有项目显示"
      },
      {
        "id": "7",
        "name": "点击项目列表中的项目B(不同于当前项目A)"
      },
      {
        "id": "8",
        "name": "等待页面响应,观察是否触发handleChangeProject方法"
      },
      {
        "id": "9",
        "name": "验证Tool.vue emit(\"changeProject\", item)事件是否被触发"
      },
      {
        "id": "10",
        "name": "检查header区域顶部tabsStore是否新增了项目B的tab"
      },
      {
        "id": "11",
        "name": "验证页面是否跳转到项目B的工作区"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "Tool.vue第4行h2元素显示当前项目名称projectName,title属性用于完整显示"
      },
      {
        "id": "2",
        "name": "点击切换按钮后,toggleProjectVisible响应式变量变为true"
      },
      {
        "id": "3",
        "name": "Tool.vue第6-31行el-popover弹出层正确显示,placement=\"right\",width=\"500px\""
      },
      {
        "id": "4",
        "name": "弹出层包含SLoading组件,显示加载状态(:loading=\"projectLoading\")"
      },
      {
        "id": "5",
        "name": "如果startProjectList.length > 0,显示第16行h3标题:\"收藏的项目\""
      },
      {
        "id": "6",
        "name": "收藏项目列表区域(第17-22行)显示每个收藏项目的名称和创建者"
      },
      {
        "id": "7",
        "name": "第23行h3标题\"项目列表\"始终显示"
      },
      {
        "id": "8",
        "name": "项目列表区域(第24-29行)显示所有可访问项目"
      },
      {
        "id": "9",
        "name": "每个项目item包含:item-title(项目名)和item-content(创建者名,灰色文字)"
      },
      {
        "id": "10",
        "name": "点击项目B后,触发第25行@click=\"handleChangeProject(item)\""
      },
      {
        "id": "11",
        "name": "handleChangeProject方法调用emit(\"changeProject\", item)"
      },
      {
        "id": "12",
        "name": "Banner.vue接收changeProject事件,调用handleChangeProject方法"
      },
      {
        "id": "13",
        "name": "projectNavStore.addProjectNav方法创建新的项目tab"
      },
      {
        "id": "14",
        "name": "header区域顶部tabs新增一个项目B的tab,可以切换回项目A"
      },
      {
        "id": "15",
        "name": "router跳转到项目B的工作区页面(路由参数id更新为项目B的ID)"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Tool.vue第4行:当前项目名称显示 - <h2 :title=\"projectName\">{{ projectName }}</h2>"
      },
      {
        "id": "2",
        "name": "Tool.vue第6行:el-popover配置 - :visible=\"toggleProjectVisible\", placement=\"right\", width=\"500px\""
      },
      {
        "id": "3",
        "name": "Tool.vue第9行:切换按钮 - data-testid=\"banner-toggle-project-btn\", @click.stop=\"handleToggleProjectModel\""
      },
      {
        "id": "4",
        "name": "Tool.vue第15行:SLoading包裹项目列表,显示加载状态"
      },
      {
        "id": "5",
        "name": "Tool.vue第16行:收藏项目标题条件渲染 - v-if=\"startProjectList.length > 0\""
      },
      {
        "id": "6",
        "name": "Tool.vue第18行:收藏项目列表 - v-for=\"(item, index) in startProjectList\""
      },
      {
        "id": "7",
        "name": "Tool.vue第19行:项目名称显示 - {{ item.projectName }}"
      },
      {
        "id": "8",
        "name": "Tool.vue第20行:创建者名称显示 - {{ item.owner.name }}(灰色文字)"
      },
      {
        "id": "9",
        "name": "Tool.vue第25行:项目列表 - v-for=\"(item, index) in projectList\",@click=\"handleChangeProject(item)\""
      },
      {
        "id": "10",
        "name": "Tool.vue中handleChangeProject方法emit(\"changeProject\", item)事件"
      },
      {
        "id": "11",
        "name": "Banner.vue接收@changeProject事件,调用handleChangeProject处理项目切换"
      },
      {
        "id": "12",
        "name": "projectNavStore.addProjectNav方法用于添加新的项目tab"
      },
      {
        "id": "13",
        "name": "router.push方法跳转到新项目的工作区页面"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "el-popover的transition=\"none\"禁用过渡动画,提升响应速度"
      },
      {
        "id": "2",
        "name": "@click.stop阻止事件冒泡,避免触发其他点击事件"
      },
      {
        "id": "3",
        "name": "startProjectList是收藏项目列表,通过用户收藏操作添加"
      },
      {
        "id": "4",
        "name": "projectList是用户所有可访问的项目,包含个人项目和共享项目"
      },
      {
        "id": "5",
        "name": "项目切换后创建新tab而不是替换当前tab,方便用户在多个项目间快速切换"
      },
      {
        "id": "6",
        "name": "toggleProjectVisible控制弹出层显示隐藏,点击外部区域自动关闭"
      },
      {
        "id": "7",
        "name": "projectLoading控制加载状态,从服务器获取项目列表时显示加载动画"
      }
    ]
  }
],
}

export default node
