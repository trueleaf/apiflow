import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "requestInfo",
  description: "请求信息",
  children: [],
  atomicFunc: [
  {
    "purpose": "请求信息区域基本信息,请求头,请求body正确展示,请求信息区域距离底部有合理的距离",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已发送包含请求头和Body数据的请求(如POST请求)"
    ],
    "operationSteps": [
      "1. 在HTTP节点编辑器中发送POST或PUT请求",
      "2. 在响应区域查看\"请求信息\"标签页",
      "3. 观察基本信息部分(方法,URL,协议)",
      "4. 检查请求头部分的显示和展示方式",
      "5. 查看请求Body部分的格式和内容",
      "6. 验证请求信息区域与底部的距离"
    ],
    "expectedResults": [
      "基本信息正确显示:HTTP方法,完整URL,协议版本",
      "请求头正确显示,包括所有自定义头和系统头",
      "请求Body正确显示,格式化正确(JSON/FormData/URLEncoded)",
      "不同的Body类型显示格式正确",
      "请求信息区域与窗口底部保持合理距离,内容完整可见"
    ],
    "checkpoints": [
      "验证HTTP方法,URL,协议版本正确显示",
      "验证请求头列表的完整性",
      "验证请求头值正确,包括特殊字符",
      "验证Body内容完整,没有被截断",
      "验证Body的格式化正确(缩进,高亮)",
      "验证请求信息可以正常滚动"
    ],
    "notes": [
      "此测试验证HTTP请求信息的完整记录和展示",
      "需要测试包含各种Body类型的请求(JSON,FormData,URLEncoded,Raw)",
      "应验证自定义请求头正确传输并显示",
      "应检查大型Body的显示(性能,截断)"
    ]
  }
],
}

export default node
