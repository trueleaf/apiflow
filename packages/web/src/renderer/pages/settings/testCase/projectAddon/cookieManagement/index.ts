import { type ModelNode } from '../../types'

const node: ModelNode = {
  modelName: "cookieManagement",
  description: "cookie管理",
  children: [],
  atomicFunc: [
    {
      "purpose": "打开Cookie管理页面,显示Cookie列表和操作按钮",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" }
      ],
      "operationSteps": [
        { "id": "1", "name": "点击工具栏中的更多操作按钮" },
        { "id": "2", "name": "点击Cookie管理选项" },
        { "id": "3", "name": "观察Cookie管理页面是否正常显示" }
      ],
      "expectedResults": [
        { "id": "1", "name": "Cookie管理页面正常打开" },
        { "id": "2", "name": "页面显示'Cookies 管理'标题" },
        { "id": "3", "name": "显示按名称搜索输入框" },
        { "id": "4", "name": "显示按域名筛选下拉框" },
        { "id": "5", "name": "显示新增Cookie按钮" },
        { "id": "6", "name": "显示批量删除按钮" }
      ],
      "checkpoints": [
        { "id": "1", "name": "Cookies.vue组件正确渲染" },
        { "id": "2", "name": "Cookie表格包含Name,Value,Domain,Path,Expires等列" }
      ],
      "notes": []
    },
    {
      "purpose": "新增Cookie成功,Cookie显示在列表中",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" },
        { "id": "2", "name": "打开Cookie管理页面" }
      ],
      "operationSteps": [
        { "id": "1", "name": "点击新增Cookie按钮" },
        { "id": "2", "name": "在弹窗中输入Cookie名称" },
        { "id": "3", "name": "输入Cookie值" },
        { "id": "4", "name": "可选填写域名和路径" },
        { "id": "5", "name": "点击保存按钮" }
      ],
      "expectedResults": [
        { "id": "1", "name": "弹窗关闭" },
        { "id": "2", "name": "新增的Cookie显示在列表中" },
        { "id": "3", "name": "显示成功提示消息" }
      ],
      "checkpoints": [
        { "id": "1", "name": "cookiesStore.addCookie方法被调用" },
        { "id": "2", "name": "Cookie的name和value被正确编码" }
      ],
      "notes": []
    },
    {
      "purpose": "编辑Cookie成功,Cookie值被更新",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" },
        { "id": "2", "name": "Cookie列表中至少存在一个Cookie" }
      ],
      "operationSteps": [
        { "id": "1", "name": "打开Cookie管理页面" },
        { "id": "2", "name": "找到需要编辑的Cookie" },
        { "id": "3", "name": "点击编辑按钮" },
        { "id": "4", "name": "修改Cookie值" },
        { "id": "5", "name": "点击保存按钮" }
      ],
      "expectedResults": [
        { "id": "1", "name": "弹窗关闭" },
        { "id": "2", "name": "Cookie列表中显示更新后的值" },
        { "id": "3", "name": "显示修改成功提示消息" }
      ],
      "checkpoints": [
        { "id": "1", "name": "cookiesStore.updateCookiesById方法被调用" }
      ],
      "notes": []
    },
    {
      "purpose": "删除Cookie成功,Cookie从列表中移除",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" },
        { "id": "2", "name": "Cookie列表中至少存在一个Cookie" }
      ],
      "operationSteps": [
        { "id": "1", "name": "打开Cookie管理页面" },
        { "id": "2", "name": "找到需要删除的Cookie" },
        { "id": "3", "name": "点击删除按钮" },
        { "id": "4", "name": "确认删除操作" }
      ],
      "expectedResults": [
        { "id": "1", "name": "Cookie从列表中消失" },
        { "id": "2", "name": "显示删除成功提示消息" }
      ],
      "checkpoints": [
        { "id": "1", "name": "cookiesStore.deleteCookiesById方法被调用" }
      ],
      "notes": []
    },
    {
      "purpose": "按名称搜索Cookie,列表显示匹配的Cookie",
      "precondition": [
        { "id": "1", "name": "已登录并打开任意项目工作区" },
        { "id": "2", "name": "Cookie列表中存在多个Cookie" }
      ],
      "operationSteps": [
        { "id": "1", "name": "打开Cookie管理页面" },
        { "id": "2", "name": "在按名称搜索输入框中输入关键字" },
        { "id": "3", "name": "观察Cookie列表变化" }
      ],
      "expectedResults": [
        { "id": "1", "name": "列表只显示名称匹配的Cookie" },
        { "id": "2", "name": "不匹配的Cookie被过滤掉" }
      ],
      "checkpoints": [
        { "id": "1", "name": "filteredCookies计算属性正确过滤" }
      ],
      "notes": []
    }
  ],
}

export default node
