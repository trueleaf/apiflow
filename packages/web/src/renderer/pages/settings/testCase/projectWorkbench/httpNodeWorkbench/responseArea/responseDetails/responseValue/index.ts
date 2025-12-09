import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "responseValue",
  description: "返回值",
  children: [],
  atomicFunc: [
  {
    "purpose": "返回值类型为json格式,正确展示json数据,json返回区域距离底部有合理的距离",
    "precondition": [
      {
        "id": "1",
        "name": "已打开apiflow应用"
      },
      {
        "id": "2",
        "name": "已创建项目并打开项目"
      },
      {
        "id": "3",
        "name": "已创建HTTP节点"
      },
      {
        "id": "4",
        "name": "已发送请求到返回JSON数据的API端点(如https://jsonplaceholder.typicode.com/posts/1)"
      }
    ],
    "operationSteps": [
      {
        "id": "1",
        "name": "在HTTP节点编辑器中发送请求到返回JSON格式的API"
      },
      {
        "id": "2",
        "name": "查看响应区域中的返回值标签页"
      },
      {
        "id": "3",
        "name": "观察JSON数据的显示格式,缩进和高亮情况"
      },
      {
        "id": "4",
        "name": "检查JSON树形结构的展开/折叠功能"
      },
      {
        "id": "5",
        "name": "验证返回值区域与窗口底部的距离"
      }
    ],
    "expectedResults": [
      {
        "id": "1",
        "name": "JSON数据正确显示,包括所有字段和嵌套结构"
      },
      {
        "id": "2",
        "name": "JSON语法高亮正确应用,不同类型的值有不同的颜色"
      },
      {
        "id": "3",
        "name": "JSON树形结构可以正确展开和折叠"
      },
      {
        "id": "4",
        "name": "返回值区域与窗口底部保持合理的内边距,内容不会被遮挡"
      },
      {
        "id": "5",
        "name": "大型JSON对象能正确显示,不会出现截断或显示错误"
      }
    ],
    "checkpoints": [
      {
        "id": "1",
        "name": "验证JSON格式的完整性和正确性"
      },
      {
        "id": "2",
        "name": "验证嵌套对象和数组的展示"
      },
      {
        "id": "3",
        "name": "验证JSON值的数据类型颜色编码正确(字符串,数字,布尔值等)"
      },
      {
        "id": "4",
        "name": "验证返回值区域能容纳完整内容并可滚动"
      },
      {
        "id": "5",
        "name": "验证在不同窗口大小下JSON显示没有问题"
      }
    ],
    "notes": [
      {
        "id": "1",
        "name": "此测试关键验证JSON渲染引擎的正确性"
      },
      {
        "id": "2",
        "name": "需要测试包含深度嵌套的复杂JSON结构"
      },
      {
        "id": "3",
        "name": "应该测试包含各种数据类型的JSON(null, boolean, number, string, array, object)"
      }
    ]
  }
],
}

export default node
