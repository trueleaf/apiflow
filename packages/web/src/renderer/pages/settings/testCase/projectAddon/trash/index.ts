import { type ModelNode } from '../../types'

const node: ModelNode = {
  modelName: "trash",
  description: "接口回收站",
  children: [],
  atomicFunc: [
    {
      "purpose": "打开回收站页面,显示回收站标题和搜索条件",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" }
      ],
      "operationSteps": [
        { "id": "1", "name": "点击工具栏中的更多操作按钮" },
        { "id": "2", "name": "点击回收站选项" },
        { "id": "3", "name": "观察回收站页面是否正常显示" }
      ],
      "expectedResults": [
        { "id": "1", "name": "回收站页面正常打开" },
        { "id": "2", "name": "页面显示'接口回收站'标题" },
        { "id": "3", "name": "显示日期范围筛选条件" },
        { "id": "4", "name": "显示接口名称和接口url搜索框" }
      ],
      "checkpoints": [
        { "id": "1", "name": "Recycler.vue组件正确渲染" },
        { "id": "2", "name": "日期范围选项包含:今天,昨天,近两天,近三天,近七天,自定义" }
      ],
      "notes": []
    },
    {
      "purpose": "删除接口后在回收站中显示被删除的接口",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" },
        { "id": "2", "name": "项目中至少存在一个HTTP接口" }
      ],
      "operationSteps": [
        { "id": "1", "name": "在导航树中右键点击某个接口" },
        { "id": "2", "name": "选择删除选项" },
        { "id": "3", "name": "确认删除" },
        { "id": "4", "name": "打开回收站页面" },
        { "id": "5", "name": "查看被删除的接口列表" }
      ],
      "expectedResults": [
        { "id": "1", "name": "接口从导航树中消失" },
        { "id": "2", "name": "回收站中显示刚删除的接口" },
        { "id": "3", "name": "显示删除人和删除时间" },
        { "id": "4", "name": "显示接口的请求方法和路径" }
      ],
      "checkpoints": [
        { "id": "1", "name": "deletedList包含被删除的接口" },
        { "id": "2", "name": "接口类型图标正确显示(GET/POST等)" }
      ],
      "notes": []
    },
    {
      "purpose": "恢复已删除的接口,接口重新出现在导航树中",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" },
        { "id": "2", "name": "回收站中存在已删除的接口" }
      ],
      "operationSteps": [
        { "id": "1", "name": "打开回收站页面" },
        { "id": "2", "name": "找到需要恢复的接口" },
        { "id": "3", "name": "点击恢复按钮" },
        { "id": "4", "name": "确认恢复操作" },
        { "id": "5", "name": "查看导航树中接口是否恢复" }
      ],
      "expectedResults": [
        { "id": "1", "name": "接口从回收站列表中消失" },
        { "id": "2", "name": "接口重新出现在导航树中" },
        { "id": "3", "name": "接口的所有信息保持不变" }
      ],
      "checkpoints": [
        { "id": "1", "name": "handleRestore方法正确执行" },
        { "id": "2", "name": "bannerStore.getDocBanner刷新导航树" }
      ],
      "notes": []
    }
  ],
}

export default node
