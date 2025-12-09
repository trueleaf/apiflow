import { type ModelNode } from '../../../types'

const node: ModelNode = {
  modelName: "bannerOtherFeatures",
  description: "banner区域其他功能",
  children: [],
  atomicFunc: [
  {
    "purpose": "可左右拖拽banner,需要判断最大和最小宽度,双击需要还原为默认样式",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "banner区域已正常加载显示"
      },
      {
        "id": "3",
        "name": "SResizeX组件正常渲染"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "将鼠标移动到banner右侧边缘的拖拽条上"
      },
      {
        "id": "2",
        "name": "鼠标左键按下开始拖拽"
      },
      {
        "id": "3",
        "name": "向左或向右移动鼠标"
      },
      {
        "id": "4",
        "name": "观察banner宽度变化和最大最小限制"
      },
      {
        "id": "5",
        "name": "释放鼠标后,双击拖拽条"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽时显示实时宽度指示器"
      },
      {
        "id": "2",
        "name": "banner宽度随鼠标移动而变化"
      },
      {
        "id": "3",
        "name": "宽度不会小于最小值(min属性)"
      },
      {
        "id": "4",
        "name": "宽度不会大于最大值(max属性)"
      },
      {
        "id": "5",
        "name": "拖拽过程中isDragging为true,禁用文本选择"
      },
      {
        "id": "6",
        "name": "释放后宽度保存到localStorage"
      },
      {
        "id": "7",
        "name": "双击后宽度还原为默认值"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "SResizeX组件的handleResizeMousedown处理拖拽开始(ClResizeX.vue:88-93)"
      },
      {
        "id": "2",
        "name": "handleResizeMousemove判断min/max边界(ClResizeX.vue:67-71)"
      },
      {
        "id": "3",
        "name": "handleResetWidth处理双击还原(ClResizeX.vue:8)"
      },
      {
        "id": "4",
        "name": "localStorage保存宽度到dragBar/name键"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "拖拽时显示\"双击还原\"提示"
      },
      {
        "id": "2",
        "name": "宽度记忆功能可通过remember属性控制"
      }
    ]
  },
  {
    "purpose": "httpMockNode启动后,banner节点需要有呼吸小圆点效果",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "项目中存在至少一个httpMockNode节点"
      },
      {
        "id": "3",
        "name": "httpMockNode已配置Mock规则"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在httpMockNode详情页点击启动Mock服务"
      },
      {
        "id": "2",
        "name": "观察banner区域对应节点的变化"
      },
      {
        "id": "3",
        "name": "停止Mock服务"
      },
      {
        "id": "4",
        "name": "再次观察banner区域节点的变化"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "启动后节点显示呼吸动画小圆点"
      },
      {
        "id": "2",
        "name": "小圆点颜色为绿色表示运行中"
      },
      {
        "id": "3",
        "name": "呼吸动画使用CSS animation实现"
      },
      {
        "id": "4",
        "name": "停止后小圆点消失或变为灰色"
      },
      {
        "id": "5",
        "name": "包含运行中Mock的folder也显示指示器"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "Banner.vue模板中mock状态指示器渲染逻辑"
      },
      {
        "id": "2",
        "name": "foldersWithRunningMock计算包含运行中Mock的folder"
      },
      {
        "id": "3",
        "name": "state字段表示Mock运行状态(running/starting/stopping/error)"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "呼吸动画提示用户Mock正在运行"
      },
      {
        "id": "2",
        "name": "父folder也会显示指示器便于快速定位"
      }
    ]
  }
],
}

export default node
