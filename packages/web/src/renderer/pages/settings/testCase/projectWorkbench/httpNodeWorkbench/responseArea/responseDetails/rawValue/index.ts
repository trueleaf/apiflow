import { type ModelNode } from '../../../../../types'

const node: ModelNode = {
  modelName: "rawValue",
  description: "原始值",
  children: [],
  atomicFunc: [
  {
    "purpose": "原始值需要正确返回",
    "precondition": [
      "已打开apiflow应用",
      "已创建项目并打开项目",
      "已创建HTTP节点",
      "已发送请求获得响应"
    ],
    "operationSteps": [
      "1. 在HTTP节点编辑器中发送请求",
      "2. 在响应区域查看\"原始值\"标签页",
      "3. 观察原始响应数据的显示内容",
      "4. 检查数据的完整性和准确性",
      "5. 验证原始值与其他格式化显示的一致性"
    ],
    "expectedResults": [
      "原始值标签页显示完整的未经处理的响应数据",
      "原始值与JSON/其他格式化显示的内容一致",
      "原始值包含所有响应体的字节数据",
      "原始值能正确显示二进制或非UTF-8编码的数据",
      "原始值支持复制和搜索功能"
    ],
    "checkpoints": [
      "验证原始值内容的完整性",
      "验证原始值数据与请求响应的准确性",
      "验证原始值与其他格式化视图的内容一致",
      "验证大型原始值的显示和性能",
      "验证原始值能正确处理特殊字符和编码",
      "验证原始值的复制功能可用"
    ],
    "notes": [
      "此测试验证原始响应数据的准确展示",
      "原始值是调试HTTP通信的重要工具",
      "应测试各种Content-Type的响应(JSON,HTML,XML,Binary等)",
      "应验证大文件和流式响应的原始值显示"
    ]
  }
],
}

export default node
