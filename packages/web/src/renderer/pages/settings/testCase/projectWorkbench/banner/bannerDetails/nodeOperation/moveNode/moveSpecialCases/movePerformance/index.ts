import { type ModelNode } from '../../../../../../../types'

const node: ModelNode = {
  modelName: "movePerformance",
  description: "移动性能与体验",
  children: [],
  atomicFunc: [
  {
    "purpose": "大量节点场景下的拖拽性能测试",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开包含大量节点(100+)的项目工作区"
      },
      {
        "id": "2",
        "name": "el-tree组件的draggable属性为true"
      },
      {
        "id": "3",
        "name": "节点分布在多个层级的folder中"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在banner区域找到任意节点"
      },
      {
        "id": "2",
        "name": "鼠标左键按住该节点开始拖拽"
      },
      {
        "id": "3",
        "name": "快速移动鼠标在不同层级节点间滑动"
      },
      {
        "id": "4",
        "name": "观察拖拽过程中的UI响应"
      },
      {
        "id": "5",
        "name": "释放鼠标完成拖拽"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "拖拽过程中UI保持流畅,无明显卡顿"
      },
      {
        "id": "2",
        "name": "放置指示器实时响应鼠标位置"
      },
      {
        "id": "3",
        "name": "拖拽释放后数据更新及时"
      },
      {
        "id": "4",
        "name": "el-tree渲染性能满足交互需求"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "el-tree使用虚拟滚动优化大量数据渲染"
      },
      {
        "id": "2",
        "name": "handleCheckNodeCouldDrop函数执行效率高"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "建议项目节点数量控制在合理范围内"
      },
      {
        "id": "2",
        "name": "过多节点可考虑分拆为多个项目"
      }
    ]
  }
],
}

export default node
