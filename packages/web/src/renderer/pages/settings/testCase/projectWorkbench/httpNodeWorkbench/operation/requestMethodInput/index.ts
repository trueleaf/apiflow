import { type ModelNode } from '../../../../types'

const node: ModelNode = {
  modelName: "requestMethodInput",
  description: "请求方法录入区域",
  children: [],
  atomicFunc: [
  {
    "purpose": "正确展示GET, POST, PUT, DEL, PATCH, HEAD, OPTIONS,选择或者点击空白区域下拉菜单消失",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点页签"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "点击请求方法下拉框"
      },
      {
        "id": "2",
        "name": "查看下拉选项列表"
      },
      {
        "id": "3",
        "name": "选择某个请求方法"
      },
      {
        "id": "4",
        "name": "点击下拉框外的空白区域"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "下拉框展示GET, POST, PUT, DEL, PATCH, HEAD, OPTIONS七个选项"
      },
      {
        "id": "2",
        "name": "各选项颜色与定义一致(GET绿色,POST黄色,PUT蓝色等)"
      },
      {
        "id": "3",
        "name": "选择后下拉框关闭,显示选中值"
      },
      {
        "id": "4",
        "name": "点击空白区域下拉菜单消失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "requestMethodEnum来自data/data.ts中的requestMethods"
      },
      {
        "id": "2",
        "name": "el-select组件处理下拉展示和关闭"
      },
      {
        "id": "3",
        "name": "data-testid=\"method-select\"用于测试定位"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "DEL对应value为DELETE"
      },
      {
        "id": "2",
        "name": "iconColor定义各方法颜色"
      }
    ]
  },
  {
    "purpose": "切换请求方法不会改变banner节点中的请求方法,也不会改变nav栏节点中的请求方法,只有保存后才会生效",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开已保存的httpNode节点"
      },
      {
        "id": "3",
        "name": "当前请求方法为GET"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在操作区切换请求方法为POST"
      },
      {
        "id": "2",
        "name": "观察banner中该节点的方法图标"
      },
      {
        "id": "3",
        "name": "观察nav页签中的方法图标"
      },
      {
        "id": "4",
        "name": "点击保存按钮"
      },
      {
        "id": "5",
        "name": "再次观察banner和nav的方法图标"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "切换后banner节点图标仍为GET"
      },
      {
        "id": "2",
        "name": "切换后nav页签图标仍为GET"
      },
      {
        "id": "3",
        "name": "页签出现未保存小圆点"
      },
      {
        "id": "4",
        "name": "保存后banner和nav图标变为POST"
      },
      {
        "id": "5",
        "name": "保存后未保存小圆点消失"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "requestMethod通过computed绑定httpNodeStore"
      },
      {
        "id": "2",
        "name": "saveHttpNode执行后更新banner和nav"
      },
      {
        "id": "3",
        "name": "未保存状态通过saved字段控制"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "编辑态与展示态分离设计"
      },
      {
        "id": "2",
        "name": "确保用户明确保存意图后才生效"
      }
    ]
  },
  {
    "purpose": "切换所有请求方法,点击发送请求,调用测试服务器/echo接口,返回method为选中的method",
    "precondition": [
      {
        "id": "1",
        "name": "已登录并打开任意项目工作区"
      },
      {
        "id": "2",
        "name": "已打开httpNode节点"
      },
      {
        "id": "3",
        "name": "测试服务器已启动"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "输入测试服务器/echo接口地址"
      },
      {
        "id": "2",
        "name": "依次切换为GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS"
      },
      {
        "id": "3",
        "name": "每次切换后点击发送请求"
      },
      {
        "id": "4",
        "name": "查看响应结果中的method字段"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "每次请求都成功返回"
      },
      {
        "id": "2",
        "name": "响应中method字段与选中的方法一致"
      },
      {
        "id": "3",
        "name": "GET返回method:\"GET\""
      },
      {
        "id": "4",
        "name": "POST返回method:\"POST\""
      },
      {
        "id": "5",
        "name": "其他方法类似"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "handleSendRequest调用sendRequest发送请求"
      },
      {
        "id": "2",
        "name": "httpNodeRequestStore.fullUrl包含完整URL"
      },
      {
        "id": "3",
        "name": "requestMethod传递给后端请求"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "/echo接口会回显请求的method"
      },
      {
        "id": "2",
        "name": "HEAD和OPTIONS可能返回特殊格式"
      }
    ]
  }
],
}

export default node
